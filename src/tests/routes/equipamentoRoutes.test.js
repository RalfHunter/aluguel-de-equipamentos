import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import "../../../src/routes/equipamentoRoutes.js"

dotenv.config();
const PORT = process.env.APP_PORT || 5011
let app = `http://localhost:${PORT}`;
let tokenAdmin;
let tokenUser;
let tokenOutroUser;

describe('Rotas de Equipamentos - Integração', () => {
  // Array para armazenar IDs dos equipamentos criados durante os testes
  const equipamentosCriados = [];

  beforeAll(async () => {
    // await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/test', {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

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

    // await mongoose.disconnect();
  }, 30000);

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
    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('POST /equipamentos', () => {
    it('deve retornar 500 com dados obrigatórios ausentes', async () => {
      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Erro interno do servidor/i);
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
    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiValorDiaria: '80' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/aprovar', () => {
    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/reprovar', () => {
    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/status', () => {
    it('deve retornar 404 para ID inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/equipamentos/${id}/status`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'ativo' });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });


  describe('POST /equipamentos/:id/foto', () => {
    it('deve retornar 500 sem fotos', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/equipamentos/${id}/foto`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data');

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Erro interno do servidor/i);
    });
  });

  describe('GET /equipamentos/:id/foto/:fotoId', () => {
    it('deve retornar 404 para equipamento inexistente', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const fotoId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/equipamentos/${id}/foto/${fotoId}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Equipamento não encontrado./i);
    });
  });
});
