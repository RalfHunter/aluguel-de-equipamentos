import request from 'supertest';
import app from '../../app.js';
import jwt from 'jsonwebtoken';
import Equipamento from '../../models/Equipamento.js';
import Usuario from '../../models/Usuario.js';
import mongoose from 'mongoose';
import EquipamentoService from '../../services/EquipamentoService.js';
import { CustomError } from '../../utils/helpers/index.js';
import EquipamentoController from '../../controllers/EquipamentoController.js';
import path from 'path';

// const filePath = path.resolve('uploads/equipamentos/foto.jpg');

// Mock do método privado do controller para processar imagem
jest.spyOn(EquipamentoController.prototype, '_processarImagemParaFoto').mockImplementation(() => ({
  url: 'http://localhost/uploads/equipamentos/foto.jpg',
  largura: 100,
  altura: 100,
  tamanhoMb: 0.1,
}));

// Mocks dos modelos e service
jest.mock('../../models/Equipamento.js');
jest.mock('../../models/Usuario.js');
jest.mock('../../services/EquipamentoService.js');

jest.mock('../../config/multerConfig.js', () => ({
  __esModule: true,
  default: {
    array: () => (req, res, next) => {
      req.files = [{
        originalname: 'foto.jpg',
        mimetype: 'image/jpeg',
        path: 'uploads/equipamentos/foto.jpg',
        size: 1024,
        filename: 'foto.jpg',
      }];
      req.body = req.body || {};
      next();
    }
  }
}));

const tokenAdmin = jwt.sign({ id: 'adminId' }, process.env.JWT_SECRET_ACCESS_TOKEN || 'secret');
const tokenUser = jwt.sign({ id: 'userId' }, process.env.JWT_SECRET_ACCESS_TOKEN || 'secret');

const mockUsuario = (tipo) => {
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
  const validId = new mongoose.Types.ObjectId().toString();
  const invalidId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
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
    beforeEach(() => {
      jest.spyOn(EquipamentoController.prototype, '_processarImagemParaFoto').mockImplementation(() => ({
        url: 'http://localhost/uploads/equipamentos/foto.jpg', // URL válida
        largura: 100,
        altura: 100,
        tamanhoMb: 0.1,
      }));
    });

    it('Cria equipamento com fotos e dados válidos', async () => {
      mockUsuario('comum');

      const equipamentoCriado = {
        _id: validId,
        equiNome: 'Parafusadeira',
        equiDescricao: 'Descrição da parafusadeira',
        equiValorDiaria: 70,
        equiQuantidadeDisponivel: 3,
        equiCategoria: 'Parafusadeira',
        equiFotos: [{ url: 'http://localhost/uploads/equipamentos/foto.jpg', largura: 100, altura: 100, tamanhoMb: 0.1 }],
        equiStatus: 'pendente',
        equiUsuario: 'userId',
      };

      EquipamentoService.prototype.criar.mockResolvedValue(equipamentoCriado);

      const res = await request(app)
        .post('/equipamentos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .field('equiNome', 'Parafusadeira')
        .field('equiDescricao', 'Descrição da parafusadeira')
        .field('equiValorDiaria', 70) // Número
        .field('equiQuantidadeDisponivel', 3) // Número
        .field('equiCategoria', 'Parafusadeira')
        .attach('files', Buffer.from('fake image content'), 'foto.jpg');

      console.log('Resposta do teste:', res.statusCode, res.body);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.equiNome).toBe('Parafusadeira');
      expect(EquipamentoService.prototype.criar).toHaveBeenCalled();
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
  });
});                                                                                            