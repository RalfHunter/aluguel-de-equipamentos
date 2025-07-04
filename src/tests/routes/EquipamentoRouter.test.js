import request from 'supertest';
import app from '../../app.js';
import jwt from 'jsonwebtoken';
import Equipamento from '../../models/Equipamento.js';
import Usuario from '../../models/Usuario.js';
import mongoose from 'mongoose';

// Mock dos modelos e serviços para isolar testes
jest.mock('../../models/Equipamento.js');
jest.mock('../../models/Usuario.js');

// Tokens simulados
const tokenAdmin = jwt.sign({ id: 'adminId' }, process.env.JWT_SECRET_ACCESS_TOKEN || 'secret');
const tokenUser = jwt.sign({ id: 'userId' }, process.env.JWT_SECRET_ACCESS_TOKEN || 'secret');

// Helper para mockar usuário admin/comum
const mockUsuario = (tipo) => {
  //simulações
  const mockUser = {
    _id: tipo + 'Id',
    tipoUsuario: tipo,
    refreshToken: tokenUser, 
    accessToken: tokenAdmin, 
    select: jest.fn().mockReturnThis(), 
    exec: jest.fn().mockResolvedValue({
      _id: tipo + 'Id',
      tipoUsuario: tipo,
      refreshToken: tokenUser,
      accessToken: tokenAdmin,
    }), 
  };
  Usuario.findById.mockReturnValue(mockUser);
};

describe('Rotas Equipamentos - Integração', () => {
  const validId = new mongoose.Types.ObjectId().toString(); // ID válido no formato ObjectId
  const invalidId = new mongoose.Types.ObjectId().toString(); // Outro ID para simular não encontrado

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /equipamentos', () => {
    it('Retorna lista de equipamentos para usuário comum com filtro válido', async () => {
      mockUsuario('comum');

      Equipamento.paginate.mockResolvedValue({
        docs: [{ equiNome: 'Furadeira' }],
        totalDocs: 1,
        page: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/equipamentos?categoria=Furadeira&status=ativo&minValor=10&maxValor=100&page=1&limit=5')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.docs).toHaveLength(1);
      expect(res.body.data.docs[0].equiNome).toBe('Furadeira');
    });

    it('Retorna erro 403 para usuário comum ao filtrar status pendente', async () => {
      mockUsuario('comum');

      Equipamento.paginate.mockResolvedValue(null); 
      const res = await request(app)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/restrito a administradores/i);
    });

    it('Permite admin filtrar status pendente', async () => {
      mockUsuario('admin');

      Equipamento.paginate.mockResolvedValue({
        docs: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
      });

      const res = await request(app)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.docs).toHaveLength(0);
    });
  });

  describe('GET /equipamentos/:id', () => {
    it('Retorna equipamento válido por ID', async () => {
      mockUsuario('comum');

      Equipamento.findById.mockResolvedValue({
        _id: validId,
        equiNome: 'Furadeira',
        equiDescricao: 'Descrição da furadeira',
        equiStatus: 'ativo',
      });

      const res = await request(app)
        .get(`/equipamentos/${validId}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.equiNome).toBe('Furadeira');
    });

    it('Retorna 404 se equipamento não existir', async () => {
      mockUsuario('comum');

      Equipamento.findById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/equipamentos/${invalidId}`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('POST /equipamentos', () => {
    it('Cria equipamento com fotos e dados válidos', async () => {
      mockUsuario('comum');

      const equipamentoCriado = {
        _id: validId,
        equiNome: 'Parafusadeira',
        equiDescricao: 'Descrição da parafusadeira',
        equiValorDiaria: 70,
        equiQuantidadeDisponivel: 3,
        equiCategoria: 'Parafusadeira',
        equiFotos: [{ url: 'uploads/equipamentos/foto.jpg', largura: 100, altura: 100, tamanhoMb: 0.1 }],
        equiStatus: 'pendente',
      };

      Equipamento.prototype.save = jest.fn().mockResolvedValue(equipamentoCriado);

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .field('equiNome', 'Parafusadeira')
        .field('equiDescricao', 'Descrição da parafusadeira')
        .field('equiValorDiaria', '70')
        .field('equiQuantidadeDisponivel', '3')
        .field('equiCategoria', 'Parafusadeira')
        .attach('files', Buffer.from('fake image content'), 'foto.jpg');

      expect(res.statusCode).toBe(201);
      expect(res.body.data.equiNome).toBe('Parafusadeira');
      expect(Equipamento.prototype.save).toHaveBeenCalled();
    });

    it('Retorna 400 se faltar foto', async () => {
      mockUsuario('comum');

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .field('equiNome', 'Parafusadeira')
        .field('equiDescricao', 'Descrição da parafusadeira')
        .field('equiValorDiaria', '70')
        .field('equiQuantidadeDisponivel', '3')
        .field('equiCategoria', 'Parafusadeira');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/foto/i);
    });
  });

  describe('PATCH /equipamentos/:id', () => {
    it('Atualiza equipamento com dados válidos', async () => {
      mockUsuario('comum');

      Equipamento.findByIdAndUpdate.mockResolvedValue({
        _id: validId,
        equiNome: 'Parafusadeira Atualizada',
        equiValorDiaria: 80,
        equiQuantidadeDisponivel: 4,
      });

      const res = await request(app)
        .patch(`/equipamentos/${validId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiValorDiaria: 80, equiQuantidadeDisponivel: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.equiNome).toBe('Parafusadeira Atualizada');
    });

    it('Retorna 404 se equipamento não existir para atualizar', async () => {
      mockUsuario('comum');

      Equipamento.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/equipamentos/${invalidId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiValorDiaria: 80 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /equipamentos/:id/aprovar', () => {
    it('Admin aprova equipamento com sucesso', async () => {
      mockUsuario('admin');

      Equipamento.findById.mockResolvedValue({
        _id: validId,
        equiStatus: 'pendente',
        save: jest.fn().mockResolvedValue({ _id: validId, equiStatus: 'ativo' }),
      });

      const res = await request(app)
        .patch(`/equipamentos/${validId}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/aprovado/i);
    });

    it('Usuário comum recebe 403 ao tentar aprovar', async () => {
      mockUsuario('comum');

      const res = await request(app)
        .patch(`/equipamentos/${validId}/aprovar`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(403);
    });

    it('Retorna 404 se equipamento não existir para aprovar', async () => {
      mockUsuario('admin');

      Equipamento.findById.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/equipamentos/${invalidId}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /equipamentos/:id/reprovar', () => {
  it('Admin reprova (exclui) equipamento com sucesso', async () => {
    mockUsuario('admin');

    Equipamento.findByIdAndDelete.mockResolvedValue({
      _id: validId,
    });

    const res = await request(app)
      .patch(`/equipamentos/${validId}/reprovar`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/reprovado/i);
  });

  it('Usuário comum recebe 403 ao tentar reprovar', async () => {
    mockUsuario('comum');

    const res = await request(app)
      .patch(`/equipamentos/${validId}/reprovar`)
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.statusCode).toBe(403);
  });

  it('Retorna 404 se equipamento não existir para reprovar', async () => {
    mockUsuario('admin');

    Equipamento.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/equipamentos/${invalidId}/reprovar`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(404);
  });
});

  describe('POST /equipamentos/:id/foto', () => {
    it('Adiciona foto ao equipamento', async () => {
      mockUsuario('comum');

      Equipamento.findById.mockResolvedValue({
        _id: validId,
        equiFotos: [],
        save: jest.fn().mockResolvedValue({
          _id: validId,
          equiFotos: [{ url: 'Uploads/equipamentos/foto.jpg', largura: 100, altura: 100, tamanhoMb: 0.1 }],
        }),
      });

      const res = await request(app)
        .post(`/equipamentos/${validId}/foto`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .attach('files', Buffer.from('fake image content'), 'foto.jpg');

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/foto adicionada/i);
    });

    it('Retorna 404 se equipamento não existir', async () => {
      mockUsuario('comum');

      Equipamento.findById.mockResolvedValue(null);

      const res = await request(app)
        .post(`/equipamentos/${invalidId}/foto`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .attach('files', Buffer.from('fake image content'), 'foto.jpg');

      expect(res.statusCode).toBe(404);
    });

    it('Retorna 400 se não enviar foto', async () => {
      mockUsuario('comum');

      Equipamento.findById.mockResolvedValue({
        _id: validId,
        equiFotos: [],
        save: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app)
        .post(`/equipamentos/${validId}/foto`)
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(400);
    });
  });
});