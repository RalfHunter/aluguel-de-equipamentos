import request from 'supertest';
import app from '../../app.js';
import jwt from 'jsonwebtoken';
import Equipamento from '../../models/Equipamento.js';
import Usuario from '../../models/Usuario.js';
import mongoose from 'mongoose';
import EquipamentoService from '../../services/EquipamentoService.js';
import { CustomError } from '../../utils/helpers/index.js';
import EquipamentoController from '../../controllers/EquipamentoController.js';
//import path from 'path';

// const filePath = path.resolve('Uploads/equipamentos/foto.jpg');

// mock do método privado do controller para processar imagem
jest.spyOn(EquipamentoController.prototype, '_processarImagemParaFoto').mockImplementation(() => ({
  url: 'http://localhost/uploads/equipamentos/foto.jpg',
  largura: 100,
  altura: 100,
  tamanhoMb: 0.1,
}));

// mocks dos modelos e service
jest.mock('../../models/Equipamento.js');
jest.mock('../../models/Usuario.js');
jest.mock('../../services/EquipamentoService.js');

// mocks para o middleware authMiddleware
jest.mock('../../middlewares/authMiddleware.js', () => {
  const mongoose = require('mongoose');
  const jwt = require('jsonwebtoken');

  const userObjectId = new mongoose.Types.ObjectId().toString();
  const adminObjectId = new mongoose.Types.ObjectId().toString();

  const secret = process.env.JWT_SECRET_ACCESS_TOKEN || 'secret';

  const tokenAdmin = jwt.sign({ id: adminObjectId }, secret);
  const tokenUser = jwt.sign({ id: userObjectId }, secret);

  global.__TOKEN_ADMIN__ = tokenAdmin;
  global.__TOKEN_USER__ = tokenUser;
  global.__ADMIN_ID__ = adminObjectId;
  global.__USER_ID__ = userObjectId;

  return (req, res, next) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({ message: 'Token não informado!' });
    }

    if (token === tokenAdmin) {
      req.user_id = adminObjectId;
      return next();
    }

    if (token === tokenUser) {
      req.user_id = userObjectId;
      return next();
    }
    return res.status(401).json({ message: 'Token inválido!' });
  };
});

const tokenAdmin = global.__TOKEN_ADMIN__;
const tokenUser = global.__TOKEN_USER__;
const adminObjectId = global.__ADMIN_ID__;
const userObjectId = global.__USER_ID__;

// mock pra retornar usuário pelo id
const mockUsuario = (tipo) => {
  const id = tipo === 'admin' ? adminObjectId : userObjectId;
  const token = tipo === 'admin' ? tokenAdmin : tokenUser;
  const mockUser = {
    _id: id,
    tipoUsuario: tipo,
    refreshToken: token,
    accessToken: token,
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({
      _id: id,
      tipoUsuario: tipo,
      refreshToken: token,
      accessToken: token,
    }),
  };
  Usuario.findById.mockReturnValue(mockUser);
};

describe('Rotas Equipamentos - Integração', () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const invalidId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.mock('../../models/Equipamento.js');
    jest.mock('../../models/Usuario.js');
    jest.mock('../../services/EquipamentoService.js');
    jest.spyOn(EquipamentoController.prototype, '_processarImagemParaFoto').mockImplementation(() => ({
      url: 'http://localhost/uploads/equipamentos/foto.jpg',
      largura: 100,
      altura: 100,
      tamanhoMb: 0.1,
    }));
  });

  describe('GET /equipamentos', () => {
    it('Retorna lista de equipamentos para usuário comum com filtro válido', async () => {
      mockUsuario('comum');

      EquipamentoService.prototype.listar.mockResolvedValue({
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

      EquipamentoService.prototype.listar.mockImplementation(async (filtros) => {
        if (filtros.status === 'pendente') {
          return {
            docs: [],
            totalDocs: 0,
            page: 1,
            totalPages: 0,
          };
        }
        return {
          docs: [{ equiNome: 'Furadeira' }],
          totalDocs: 1,
          page: 1,
          totalPages: 1,
        };
      });

      const res = await request(app)
        .get('/equipamentos?status=pendente')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.docs).toHaveLength(0);
    });

    it('Retorna lista padrão de equipamentos mesmo sem filtros', async () => {
      mockUsuario('comum');

      EquipamentoService.prototype.listar.mockResolvedValue({
        docs: [
          { equiNome: 'Martelo' },
          { equiNome: 'Chave de fenda' }
        ],
        totalDocs: 2,
        page: 1,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.docs).toHaveLength(2);
      expect(res.body.data.docs[0].equiNome).toBe('Martelo');
    });
  });

  describe('GET /equipamentos/:id', () => {
    it('Retorna equipamento válido por ID', async () => {
      mockUsuario('comum');

      EquipamentoService.prototype.listarPorId.mockResolvedValue({
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

      EquipamentoService.prototype.listarPorId.mockResolvedValue(null);

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
        equiFotos: [{
          url: 'http://localhost/uploads/equipamentos/foto.jpg',
          largura: 100,
          altura: 100,
          tamanhoMb: 0.1,
        }],
        equiStatus: 'pendente',
        equiUsuario: userObjectId,
      };

      EquipamentoService.prototype.criar.mockResolvedValue(equipamentoCriado);

      jest.mock('../../config/multerConfig.js', () => ({
        __esModule: true,
        default: {
          array: () => (req, res, next) => {
            req.files = [{
              originalname: 'foto.jpg',
              mimetype: 'image/jpeg',
              path: 'Uploads/equipamentos/foto.jpg',
              size: 102400,
              filename: 'foto.jpg',
            }];
            req.body = {
              equiNome: 'Parafusadeira',
              equiDescricao: 'Descrição da parafusadeira',
              equiValorDiaria: '70',
              equiQuantidadeDisponivel: '3',
              equiCategoria: 'Parafusadeira',
            };
            next();
          }
        }
      }), { virtual: true });

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW')
        .field('equiNome', 'Parafusadeira')
        .field('equiDescricao', 'Descrição da parafusadeira')
        .field('equiValorDiaria', '70')
        .field('equiQuantidadeDisponivel', '3')
        .field('equiCategoria', 'Parafusadeira')
        .attach('files', Buffer.from('fake image content'), 'foto.jpg');

      expect(res.statusCode).toBe(201);
      expect(res.body.data.equipamento.equiNome).toBe('Parafusadeira');
      expect(EquipamentoService.prototype.criar).toHaveBeenCalled();
    });

    it('Retorna 400 se dados obrigatórios estiverem ausentes (validação falhar)', async () => {
      mockUsuario('comum');

      //reesetar todos os mocks para evitar interferência
      EquipamentoService.prototype.criar.mockImplementation(() => {
        throw new Error('Não deveria chegar aqui devido à validação');
      });

      jest.mock('../../config/multerConfig.js', () => ({
        __esModule: true,
        default: {
          array: () => (req, res, next) => {
            req.files = [{
              originalname: 'foto.jpg',
              mimetype: 'image/jpeg',
              path: 'Uploads/equipamentos/foto.jpg',
              size: 102400,
              filename: 'foto.jpg',
            }];
            req.body = {};
            next();
          }
        }
      }), { virtual: true });

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW')
        .attach('files', Buffer.from('fake image content'), 'foto.jpg');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/obrigatórios|validação/i);
    });
  });

  describe('PATCH /equipamentos/:id', () => {
    it('Atualiza equipamento com dados válidos', async () => {
      mockUsuario('comum');

      EquipamentoService.prototype.atualizar.mockResolvedValue({
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

      EquipamentoService.prototype.atualizar.mockImplementation(() => {
        throw new CustomError({
          statusCode: 404,
          customMessage: 'Equipamento não encontrado',
        });
      });

      const res = await request(app)
        .patch(`/equipamentos/${invalidId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ equiValorDiaria: 80 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/aprovar', () => {
    it('Admin aprova equipamento com sucesso', async () => {
      mockUsuario('admin');

      EquipamentoService.prototype.aprovar.mockResolvedValue({
        _id: validId,
        equiStatus: 'ativo',
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

      EquipamentoService.prototype.aprovar.mockImplementation(() => {
        throw new CustomError({
          statusCode: 404,
          customMessage: 'Equipamento não encontrado',
        });
      });

      const res = await request(app)
        .patch(`/equipamentos/${invalidId}/aprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });
  });

  describe('PATCH /equipamentos/:id/reprovar', () => {
    it('Admin reprova (exclui) equipamento com sucesso', async () => {
      mockUsuario('admin');

      EquipamentoService.prototype.reprovar.mockResolvedValue({
        id: validId,
        mensagem: 'Equipamento excluído com sucesso.',
      });

      const res = await request(app)
        .patch(`/equipamentos/${validId}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/reprovado|excluído/i);
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

      EquipamentoService.prototype.reprovar.mockImplementation(() => {
        throw new CustomError({
          statusCode: 404,
          customMessage: 'Equipamento não encontrado',
        });
      });

      const res = await request(app)
        .patch(`/equipamentos/${invalidId}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/não encontrado/i);
    });

    it('Retorna 403 ao tentar reprovar equipamento que já foi aprovado', async () => {
      mockUsuario('admin');

      EquipamentoService.prototype.reprovar.mockImplementation(() => {
        throw new CustomError({
          statusCode: 403,
          customMessage: 'Apenas equipamentos pendentes podem ser reprovados.',
        });
      });

      const res = await request(app)
        .patch(`/equipamentos/${validId}/reprovar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/pendentes/i);
    });
  });

  describe('Autenticação - Token', () => {
    it('Retorna 401 ao tentar acessar rota sem token', async () => {
      const res = await request(app)
        .get('/equipamentos');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/não autorizado|token/i);
    });
  });
});