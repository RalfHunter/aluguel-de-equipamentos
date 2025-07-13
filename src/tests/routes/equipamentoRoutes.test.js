import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import "../../../src/routes/equipamentoRoutes.js"

dotenv.config();

let app = 'http://localhost:5011';
let tokenAdmin;
let tokenUser;
let tokenOutroUser;

describe('Rotas de Equipamentos - Integração', () => {
  // Array para armazenar IDs dos equipamentos criados durante os testes
  const equipamentosCriados = [];
  let fotoTestePath;

  beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Criar diretórios se não existirem
    const uploadsDir = path.resolve('uploads/equipamentos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Criar imagem de teste usando Sharp
    fotoTestePath = path.resolve('uploads/equipamentos/foto1.jpg');
    try {
      await sharp({
        create: {
          width: 1200,
          height: 800,
          channels: 3,
          background: { r: 255, g: 100, b: 50 }
        }
      })
      .jpeg({ quality: 100 })
      .toFile(fotoTestePath);
      
      console.log('Imagem de teste criada:', fotoTestePath);
    } catch (error) {
      console.error('Erro ao criar imagem de teste:', error);
    }

    // Login admin
    let adminLoginRes = await request(app)
      .post('/login')
      .send({ email: 'dev@gmail.com', senha: 'Dev@1234' });

    if (!adminLoginRes.body?.data?.user?.accessToken) {
      await request(app).post('/usuarios').send({
        email: 'dev@gmail.com',
        senha: 'Dev@1234',
        nome: 'Administrador',
        role: 'admin',
      });

      adminLoginRes = await request(app)
        .post('/login')
        .send({ email: 'dev@gmail.com', senha: 'Dev@1234' });
    }
    tokenAdmin = adminLoginRes.body?.data?.user?.accessToken;

    // Login usuário comum
    let userLoginRes = await request(app)
      .post('/login')
      .send({ email: 'usuario@gmail.com', senha: 'Usuario@1234' });

    if (!userLoginRes.body?.data?.user?.accessToken) {
      await request(app).post('/usuarios').send({
        email: 'usuario@gmail.com',
        senha: 'Usuario@1234',
        nome: 'Usuário Comum',
        role: 'user',
      });

      userLoginRes = await request(app)
        .post('/login')
        .send({ email: 'usuario@gmail.com', senha: 'Usuario@1234' });
    }
    tokenUser = userLoginRes.body?.data?.user?.accessToken;

    // Login outro usuário
    let outroUserLoginRes = await request(app)
      .post('/login')
      .send({ email: 'moderador@gmail.com', senha: 'Moderador@1234' });

    if (!outroUserLoginRes.body?.data?.user?.accessToken) {
      await request(app).post('/usuarios').send({
        email: 'moderador@gmail.com',
        senha: 'Moderador@1234',
        nome: 'Moderador',
        role: 'user',
      });

      outroUserLoginRes = await request(app)
        .post('/login')
        .send({ email: 'moderador@gmail.com', senha: 'Moderador@1234' });
    }
    tokenOutroUser = outroUserLoginRes.body?.data?.user?.accessToken;
  }, 20000);

  afterAll(async () => {
    // Limpar todos os equipamentos criados durante os testes
    if (equipamentosCriados.length > 0) {
      console.log(`Limpando ${equipamentosCriados.length} equipamentos criados durante os testes...`);
      
      for (const equipamentoId of equipamentosCriados) {
        try {
          await request(app)
            .delete(`/equipamentos/${equipamentoId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
        } catch (error) {
          console.log(`Erro ao deletar equipamento ${equipamentoId}:`, error.message);
        }
      }
    }

    // Limpar imagem de teste
    if (fotoTestePath && fs.existsSync(fotoTestePath)) {
      try {
        fs.unlinkSync(fotoTestePath);
        console.log('Imagem de teste removida');
      } catch (error) {
        console.error('Erro ao remover imagem de teste:', error);
      }
    }
    
    await mongoose.disconnect();
  }, 30000);

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

    const res = await request(app)
      .post('/equipamentos')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .field('equiNome', dados.equiNome)
      .field('equiDescricao', dados.equiDescricao)
      .field('equiValorDiaria', dados.equiValorDiaria)
      .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
      .field('equiCategoria', dados.equiCategoria)
      .attach('files', fotoTestePath);

    if (res.status !== 201) {
      return null;
    }
    
    const equipamento = res.body.data.equipamento;
    // Adicionar ID à lista para limpeza posterior
    if (equipamento && equipamento._id) {
      equipamentosCriados.push(equipamento._id);
    }
    
    return equipamento;
  };

  describe('GET /equipamentos', () => {
    it('deve listar equipamentos para usuário comum com filtro válido', async () => {
      const res = await request(app)
        .get('/equipamentos?categoria=Parafusadeira&status=ativo&minValor=10&maxValor=100&page=1&limit=5')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.docs)).toBe(true);
    });

    it('deve retornar erro 403 para usuário comum ao filtrar status pendente', async () => {
      const res = await request(app)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Tipo de erro desconhecido./i);

    });

    it('deve permitir admin filtrar status pendente', async () => {
      const res = await request(app)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('deve listar equipamentos sem filtros', async () => {
      const res = await request(app)
        .get('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.docs)).toBe(true);
    });

    it('deve retornar erro 498 sem token', async () => {
      const res = await request(app).get('/equipamentos');

      expect(res.status).toBe(498);
      expect(res.body.message).toMatch(/Erro operacional./i);
    });
  });

  describe('GET /equipamentos/:id', () => {
    it('deve retornar equipamento por ID válido', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const res = await request(app)
        .get(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(equipamento._id);
      expect(res.body.data.equiNome).toMatch(/Parafusadeira/);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 498 sem token', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const res = await request(app).get(`/equipamentos/${equipamento._id}`);

      expect(res.status).toBe(498);
      expect(res.body.message).toMatch(/Erro operacional./i);
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

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data')
        .field('equiNome', dados.equiNome)
        .field('equiDescricao', dados.equiDescricao)
        .field('equiValorDiaria', dados.equiValorDiaria)
        .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
        .field('equiCategoria', dados.equiCategoria)
        .attach('files', fotoTestePath);

      expect(res.status).toBe(201);
      expect(res.body.data.equipamento).toHaveProperty('_id');
      expect(res.body.data.equipamento.equiNome).toBe(dados.equiNome);
      expect(res.body.data.equipamento.equiStatus).toBe('pendente');
      
      // Adicionar à lista para limpeza posterior
      if (res.body.data.equipamento._id) {
        equipamentosCriados.push(res.body.data.equipamento._id);
      }
    });

    it('deve retornar 500 com dados obrigatórios ausentes', async () => {
      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Erro interno do servidor/i);
    });

    it('deve retornar 400 com categoria inválida', async () => {
      const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
      const dados = {
        equiNome: `Parafusadeira ${unique}`,
        equiDescricao: 'Descrição da parafusadeira',
        equiValorDiaria: '70',
        equiQuantidadeDisponivel: '3',
        equiCategoria: 'Invalida',
      };

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data')
        .field('equiNome', dados.equiNome)
        .field('equiDescricao', dados.equiDescricao)
        .field('equiValorDiaria', dados.equiValorDiaria)
        .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
        .field('equiCategoria', dados.equiCategoria)
        .attach('files', fotoTestePath);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Erro de validação/i);
    });

    it('deve retornar 400 sem foto', async () => {
      const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
      const dados = {
        equiNome: `Parafusadeira ${unique}`,
        equiDescricao: 'Descrição da parafusadeira',
        equiValorDiaria: '70',
        equiQuantidadeDisponivel: '3',
        equiCategoria: 'Parafusadeira',
      };

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data')
        .field('equiNome', dados.equiNome)
        .field('equiDescricao', dados.equiDescricao)
        .field('equiValorDiaria', dados.equiValorDiaria)
        .field('equiQuantidadeDisponivel', dados.equiQuantidadeDisponivel)
        .field('equiCategoria', dados.equiCategoria);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Erro de validação/i);
    });

    it('deve retornar 498 sem token', async () => {
      const res = await request(app)
        .post('/equipamentos')
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(498);
      expect(res.body.message).toMatch(/Erro operacional./i);
    });
  });

  describe('PATCH /equipamentos/:id', () => {
    it('deve atualizar equipamento com dados válidos', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const dadosAtualizados = {
        equiValorDiaria: 80,
        equiQuantidadeDisponivel: 5,
      };

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body.data.equiValorDiaria).toBe(80);
      expect(res.body.data.equiQuantidadeDisponivel).toBe(5);
    });

    it('deve retornar 403 para equipamento pendente', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const dadosAtualizados = {
        equiValorDiaria: 80,
      };

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(dadosAtualizados);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pendente/i);
    });

    it('deve retornar 403 para usuário não dono', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenOutroUser}`)
        .send({ equiValorDiaria: 80 });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/não encontrado|permissão/i);
    });

    it('deve retornar 400 para campos não permitidos', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiNome: 'Parafusadeira Nova' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validação|inválido/i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiValorDiaria: '80' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 498 sem token', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}`)
        .send({ equiValorDiaria: '80' });

      expect(res.status).toBe(498);
      expect(res.body.message).toMatch(/Erro operacional./i);
    });
  });

  describe('PATCH /equipamentos/:id/aprovar', () => {
    it('deve aprovar equipamento como admin', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.data.equiStatus).toBe('ativo');
      expect(res.body.message).toMatch(/aprovado/i);
    });

    it('deve retornar 403 para usuário comum', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Recurso não encontrado em Permissão./i);

    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 403 para equipamento já aprovado', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pendentes/i);
    }, 10000);
  });

  describe('PATCH /equipamentos/:id/reprovar', () => {
    it('deve reprovar equipamento como admin', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reprovado|excluído/i);
    });

    it('deve retornar 403 para usuário comum', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Recurso não encontrado em Permissão./i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 403 para equipamento já aprovado', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pendentes/i);
    }, 10000);
  });

  describe('PATCH /equipamentos/:id/status', () => {
    it('deve atualizar o status para inativo como dono', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
      expect(res.body.data.equiStatus).toBe('inativo');
    });

    it('deve atualizar o status para ativo como dono', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'inativo' });

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'ativo' });

      expect(res.status).toBe(200);
      expect(res.body.data.equiStatus).toBe('ativo');
    }, 10000);

    it('deve retornar 400 com status inválido', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      await request(app)
        .patch(`/equipamentos/${equipamento._id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'desconhecido' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Erro de validação/i);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'ativo' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('deve retornar 498 sem token', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/status`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(498);
      expect(res.body.message).toMatch(/Erro operacional./i);
    });

    it('deve retornar 403 para equipamento pendente', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      const res = await request(app)
        .patch(`/equipamentos/${equipamento._id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pendente/i);
    });
  });


  describe('POST /equipamentos/:id/foto', () => {

    it('deve retornar 500 sem fotos', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      equipamentosCriados.push(equipamento._id);

      const res = await request(app)
        .post(`/equipamentos/${equipamento._id}/foto`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Erro interno do servidor/i);
    });

    it('deve retornar 403 para usuário não dono', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const userLoginRes = await request(app)
        .post('/login')
        .send({ email: 'moderador@gmail.com', senha: 'Moderador@1234' });

      const tokenOutroUser = userLoginRes.body?.data?.user?.accessToken;
      expect(tokenOutroUser).toBeTruthy();

      // console.log(userLoginRes.body);

      const res = await request(app)
        .post(`/equipamentos/${equipamento._id}/foto`)
        .set('Authorization', `Bearer ${tokenOutroUser}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('files', fotoTestePath);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Recurso não encontrado em Permissão./i);
    });
  });

  describe('GET /equipamentos/:id/foto/:fotoId', () => {
    it('deve retornar foto específica como dono', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      expect(equipamento.equiFotos).toHaveLength(1);

      const fotoId = equipamento.equiFotos[0]._id;
      const res = await request(app)
        .get(`/equipamentos/${equipamento._id}/foto/${fotoId}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\/(jpeg|png)/);
    }, 10000);

    // it('deve retornar foto específica como admin', async () => {
    //   const equipamento = await criarEquipamentoValido(tokenUser);
    //   expect(equipamento).not.toBeNull();
    //   expect(equipamento).toHaveProperty('_id');
    //   expect(equipamento.equiFotos).toHaveLength(1);

    //   await request(app)
    //     .patch(`/equipamentos/${equipamento._id}/aprovar`)
    //     .set('Authorization', `Bearer ${tokenAdmin}`);

    //   const fotoId = equipamento.equiFotos[0]._id;
    //   const res = await request(app)
    //     .get(`/equipamentos/${equipamento._id}/foto/${fotoId}`)
    //     .set('Authorization', `Bearer ${tokenAdmin}`);

    //   expect(res.status).toBe(200);
    //   expect(res.headers['content-type']).toMatch(/image\/(jpeg|png)/);
    // }, 10000);

    it('deve retornar 404 para foto inexistente', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');

      const fotoId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/equipamentos/${equipamento._id}/foto/${fotoId}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/foto.*não encontrada/i);
    });

    it('deve retornar 404 para equipamento inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const fotoId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/equipamentos/${id}/foto/${fotoId}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Equipamento não encontrado./i);
    });

    it('deve retornar 498 sem token', async () => {
      const equipamento = await criarEquipamentoValido(tokenUser);
      expect(equipamento).not.toBeNull();
      expect(equipamento).toHaveProperty('_id');
      expect(equipamento.equiFotos).toHaveLength(1);

      const fotoId = equipamento.equiFotos[0]._id;
      const res = await request(app)
        .get(`/equipamentos/${equipamento._id}/foto/${fotoId}`);

      expect(res.status).toBe(498);
      expect(res.body.message).toMatch(/Erro operacional./i);
    });
  });
});