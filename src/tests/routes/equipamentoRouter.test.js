import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import app from '../../app.js';
import '../../routes/equipamentoRoutes.js'; 

dotenv.config();

const PORT = process.env.PORT || 5011;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let tokenAdmin;
let tokenUser;

jest.setTimeout(30000);

describe('Rotas de Equipamentos - Integração', () => {
  beforeAll(async () => {
    // conecta ao MongoDB
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (err) {
      console.error('Erro ao conectar ao MongoDB:', err);
      throw err;
    }

    // Inicia o servidor
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));

    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const adminEmail = `admin${unique}@teste.com`;
    const userEmail = `user${unique}@teste.com`;

    try {
      await request(BASE_URL)
        .post('/usuarios')
        .send({
          nome: 'Admin Teste',
          email: adminEmail,
          senha: 'Senha@123',
          tipoUsuario: 'admin',
          ativo: true,
        });
    } catch (err) {}

    // faz login como admin
    const adminLoginRes = await request(BASE_URL)
      .post('/login')
      .send({ email: adminEmail, senha: 'Senha@123' });
    tokenAdmin = adminLoginRes.body?.data?.user?.accessToken;
    expect(tokenAdmin).toBeTruthy();

    // criando usuário comum para testes
    try {
      await request(BASE_URL)
        .post('/usuarios')
        .send({
          nome: 'User Teste',
          email: userEmail,
          senha: 'Senha@123',
          tipoUsuario: 'comum',
          ativo: true,
        });
    } catch (err) {}

    //faz login como usuário comum
    const userLoginRes = await request(BASE_URL)
      .post('/login')
      .send({ email: userEmail, senha: 'Senha@123' });
    tokenUser = userLoginRes.body?.data?.user?.accessToken;
    expect(tokenUser).toBeTruthy();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // equipamento válido
  const criarEquipamentoValido = async (token, override = {}) => {
    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const dados = {
      equiNome: `Parafusadeira ${unique}`,
      equiDescricao: 'Descrição da parafusadeira',
      equiValorDiaria: '70',
      equiQuantidadeDisponivel: '3',
      equiCategoria: 'Parafusadeira',
      ...override,
    };

    const res = await request(BASE_URL)
      .post('/equipamentos')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('equiNome', dados.equiNome)
      .field('equiDescricao', dados.equiDescricao)
      .field('equiValorDiaria', dados.equiValorDiaria)
      .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
      .field('equiCategoria', dados.equiCategoria);

    // Aguarda persistência
    await new Promise((r) => setTimeout(r, 150));
    return res.body.data;
  };

  describe('GET /equipamentos', () => {
    it('deve listar equipamentos para usuário comum com filtro válido', async () => {
      const res = await request(BASE_URL)
        .get('/equipamentos?categoria=Parafusadeira&status=ativo&minValor=10&maxValor=100&page=1&limit=5')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.docs || res.body.data)).toBe(true);
    });

    it('deve retornar erro 403 para usuário comum ao filtrar status pendente', async () => {
      const res = await request(BASE_URL)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/restrito a administradores/i);
    });

    it('deve permitir admin filtrar status pendente', async () => {
      const res = await request(BASE_URL)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('deve listar equipamentos sem filtros', async () => {
      const res = await request(BASE_URL)
        .get('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.docs || res.body.data)).toBe(true);
    });

    it('deve retornar erro 401 sem token', async () => {
      const res = await request(BASE_URL).get('/equipamentos');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/não autorizado|token/i);
    });
  });

  describe('GET /equipamentos/:id', () => {
    it('deve retornar equipamento por ID válido', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const res = await request(BASE_URL)
        .get(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(equipamento._id);
      expect(res.body.data.equiNome).toMatch(/Parafusadeira/);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(BASE_URL)
        .get(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('POST /equipamentos', () => {
    it('deve criar equipamento com dados válidos', async () => {
      const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
      const dados = {
        equiNome: `Parafusadeira ${unique}`,
        equiDescricao: 'Descrição da parafusadeira',
        equiValorDiaria: '70',
        equiQuantidadeDisponivel: '3',
        equiCategoria: 'Parafusadeira',
      };

      const res = await request(BASE_URL)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data')
        .field('equiNome', dados.equiNome)
        .field('equiDescricao', dados.equiDescricao)
        .field('equiValorDiaria', dados.equiValorDiaria)
        .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
        .field('equiCategoria', dados.equiCategoria);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.equiNome).toBe(dados.equiNome);
    });

    it('deve retornar 400 com dados obrigatórios ausentes', async () => {
      const res = await request(BASE_URL)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/obrigatórios|validação/i);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(BASE_URL)
        .post('/equipamentos')
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/não autorizado|token/i);
    });
  });

  describe('PATCH /equipamentos/:id', () => {
    it('deve atualizar equipamento com dados válidos', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const dadosAtualizados = {
        equiNome: `${equipamento.equiNome} Atualizado`,
        equiValorDiaria: '80',
      };

      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body.data.equiNome).toBe(dadosAtualizados.equiNome);
      expect(res.body.data.equiValorDiaria).toBe(80);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(BASE_URL)
        .patch(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiNome: 'Parafusadeira' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 401 sem token', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}`)
        .send({ equiNome: 'Parafusadeira' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/não autorizado|token/i);
    });
  });

  describe('PATCH /equipamentos/:id/aprovar', () => {
    it('deve aprovar equipamento como admin', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/aprovado/i);
    });

    it('deve retornar 403 para usuário comum', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/restrito a administradores/i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(BASE_URL)
        .patch(`/equipamentos/${id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/reprovar', () => {
    it('deve reprovar equipamento como admin', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reprovado|excluído/i);
    });

    it('deve retornar 403 para usuário comum', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/restrito a administradores/i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(BASE_URL)
        .patch(`/equipamentos/${id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 403 para equipamento já aprovado', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).toHaveProperty('_id');

      // Aprovar primeiro
      await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      // Tentar reprovar
      const res = await request(BASE_URL)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pendentes/i);
    });
  });
});
