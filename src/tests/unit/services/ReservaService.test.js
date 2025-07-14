import { beforeEach, describe, expect, jest } from '@jest/globals';
import ReservaService from '../../../services/ReservaService.js';
import ReservaRepository from '../../../repositories/ReservaRepository.js';
import Equipamento from '../../../models/Equipamento.js';
import Usuario from '../../../models/Usuario.js';
import mongoose from 'mongoose';
import request from "supertest";
import { CustomError } from '../../../utils/helpers/index.js';

const PORT = process.env.APP_PORT || 5011;
let app = `http://localhost:${PORT}`

jest.mock('../../../repositories/ReservaRepository.js', () => {
  return jest.fn().mockImplementation(() => ({
    listar: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    buscarPorID: jest.fn(),
    findReservasSobrepostas: jest.fn(),
    findReservasAtrasadas: jest.fn(),
    findReservasParaMarcarAtrasada: jest.fn(),
    marcarReservasComoAtrasadas: jest.fn(),
  }));
});

jest.mock('../../../models/Equipamento.js', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../../models/Usuario.js', () => ({
  findById: jest.fn(),
}));

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  const mockObjectId = jest.fn().mockImplementation((id) => {
    const obj = {
      toString: () => id,
      equals: (other) => id === other.toString(),
      ...new actualMongoose.Types.ObjectId(id),
    };
    return obj;
  });
  mockObjectId.isValid = jest.fn();
  return {
    ...actualMongoose,
    Types: {
      ObjectId: mockObjectId,
    },
  };
});

describe('ReservaService', () => {
  let reservaService;
  let repositoryMock;
  let req;
  let token;
  let usuarioId;
  let equipamentoId;
  let reservaId;

  beforeAll(async () => {
    try {
      const loginRes = await request(app)
        .post('/login')
        .send({ email: 'dev@gmail.com', senha: 'Dev@1234' });

      token = loginRes.body?.data?.user?.accessToken;
      usuarioId = loginRes.body?.data?.user?._id;
      expect(token).toBeTruthy();
      expect(usuarioId).toBeTruthy();

      const equipamentoRes = await request(app)
        .get('/equipamentos')
        .set('Authorization', `Bearer ${token}`);
      equipamentoId = equipamentoRes.body?.data?.docs[0]?._id;
      expect(equipamentoId).toBeTruthy();

      const reservaRes = await request(app)
        .get('/reservas')
        .set('Authorization', `Bearer ${token}`);
      reservaId = reservaRes.body?.data?.dados?.docs[0]?._id;
      expect(reservaId).toBeTruthy();
    } catch (error) {
      console.error('Erro ao configurar beforeAll:', error);
      throw new Error('Falha ao obter IDs para os testes');
    }
  });

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    repositoryMock = new ReservaRepository();
    reservaService = new ReservaService();
    reservaService.repository = repositoryMock;
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
  });

  // Função auxiliar para criar dados de teste
  const criarReservaData = (overrides = {}) => ({
    dataInicial: new Date('2026-08-22T05:00:00.000Z'),
    dataFinal: new Date('2026-08-23T05:00:00.000Z'),
    quantidadeEquipamento: 2,
    valorEquipamento: 200,
    enderecoEquipamento: 'Rua Exemplo, 123',
    statusReserva: 'pendente',
    equipamentos: equipamentoId,
    usuarios: usuarioId,
    ...overrides,
  });

  describe('listar', () => {
    it('deve listar todas as reservas', async () => {
        const usuarioMock = {
        _id: usuarioId,
        grupos: [{ nivelPermissao: 0 }],
      };

      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(usuarioMock),
      });

      const mockData = [
        {
          _id: reservaId,
          dataInicial: new Date('2026-06-01T05:01:45.884Z'),
          dataFinal: new Date('2026-06-05T05:01:45.884Z'),
          quantidadeEquipamento: 2,
          valorEquipamento: 200,
          enderecoEquipamento: 'Rua Exemplo, 123',
          statusReserva: 'confirmada',
          equipamentos: equipamentoId,
          usuarios: usuarioId,
        },
      ];
      repositoryMock.listar.mockResolvedValue(mockData);

       req.user_id = usuarioId;

      const result = await reservaService.listar(req);

      expect(repositoryMock.listar).toHaveBeenCalledWith(req);
      expect(result).toEqual(mockData);
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      Usuario.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      req.user_id = usuarioId;

      await expect(reservaService.listar(req)).rejects.toThrow(
        new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'usuarios',
          customMessage: 'Usuário não encontrado.',
        })
      );
    });

    it('deve lançar erro se dataFinalAtrasada for inválida', async () => {
      const invalidData = criarReservaData({
        dataFinalAtrasada: 'data-invalida',
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'datas',
          customMessage: 'As datas fornecidas são inválidas.',
        })
      );
    });

    it('deve lançar erro se usuarioId for inválido', async () => {
      const invalidData = criarReservaData({
        usuarios: 'usuario-invalido',
        equipamentos: equipamentoId, 
      });

      mongoose.Types.ObjectId.isValid.mockImplementation((id) => id !== 'usuario-invalido');

      Equipamento.findById.mockResolvedValue({
        _id: equipamentoId,
        equiStatus: 'ativo',
        equiQuantidadeDisponivel: 10,
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'usuarios',
          customMessage: 'ID de usuário inválido: usuario-invalido',
        })
      );
    });
  });

  describe('criar', () => {
    it('deve criar uma reserva válida', async () => {
      const validReservaData = criarReservaData();
      const mockEquipamento = {
        _id: equipamentoId,
        equiQuantidadeDisponivel: 5,
        equiStatus: "ativo",
      };
      const mockUsuario = {
        _id: usuarioId,
        ativo: true,
      };
      Equipamento.findById.mockResolvedValue(mockEquipamento);
      Usuario.findById.mockResolvedValue(mockUsuario);
      repositoryMock.findReservasSobrepostas.mockResolvedValue([]);
      repositoryMock.findReservasAtrasadas.mockResolvedValue([]);
      repositoryMock.criar.mockResolvedValue(validReservaData);

      const result = await reservaService.criar(validReservaData);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(equipamentoId);
      expect(Equipamento.findById).toHaveBeenCalledWith(expect.objectContaining({
        toString: expect.any(Function),
        equals: expect.any(Function),
      }));
      expect(Usuario.findById).toHaveBeenCalledWith(expect.objectContaining({
        toString: expect.any(Function),
        equals: expect.any(Function),
      }));
      expect(repositoryMock.findReservasSobrepostas).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
          equals: expect.any(Function),
        }),
        validReservaData.dataInicial,
        validReservaData.dataFinal
      );
      expect(repositoryMock.criar).toHaveBeenCalledWith(validReservaData);
      expect(result).toEqual(validReservaData);
    }, 10000);

    it('deve criar uma reserva com data no formato ISO do MongoDB', async () => {
      const isoReservaData = criarReservaData({
        dataInicial: new Date('2026-06-22T05:01:45.884Z'),
        dataFinal: new Date('2026-06-23T05:01:45.884Z'),
      });
      const mockEquipamento = {
        _id: equipamentoId,
        equiQuantidadeDisponivel: 5,
        equiStatus: 'ativo',
      };
      const mockUsuario = {
        _id: usuarioId,
        ativo: true,
      };
      Equipamento.findById.mockResolvedValue(mockEquipamento);
      Equipamento.findByIdAndUpdate.mockResolvedValue(mockEquipamento);
      Usuario.findById.mockResolvedValue(mockUsuario);
      repositoryMock.findReservasAtrasadas.mockResolvedValue([]);
      repositoryMock.findReservasSobrepostas.mockResolvedValue([]);
      repositoryMock.criar.mockResolvedValue(isoReservaData);

      const result = await reservaService.criar(isoReservaData);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(equipamentoId);
      expect(Equipamento.findById).toHaveBeenCalledWith(expect.objectContaining({
        toString: expect.any(Function),
        equals: expect.any(Function),
      }));
      expect(Usuario.findById).toHaveBeenCalledWith(expect.objectContaining({
        toString: expect.any(Function),
        equals: expect.any(Function),
      }));
      expect(Equipamento.findByIdAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
          equals: expect.any(Function),
        }),
        { $inc: { equiQuantidadeDisponivel: -isoReservaData.quantidadeEquipamento } }
      );
      expect(repositoryMock.findReservasAtrasadas).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
          equals: expect.any(Function),
        }),
        expect.any(Date)
      );
      expect(repositoryMock.findReservasSobrepostas).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
          equals: expect.any(Function),
        }),
        isoReservaData.dataInicial,
        isoReservaData.dataFinal
      );
      expect(repositoryMock.criar).toHaveBeenCalledWith(isoReservaData);
      expect(result).toEqual(isoReservaData);
    });

    it('deve lançar erro se dataInicial for maior a dataFinal', async () => {
      const invalidData = criarReservaData({
        dataInicial: new Date('2026-06-05T05:01:45.884Z'),
        dataFinal: new Date('2026-06-05T05:01:45.884Z'),
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'dataInicial',
          details: [],
          customMessage: 'A data inicial deve ser anterior à data final.',
        })
      );
    });

    it('deve lançar erro se dataFinalAtrasada for menor ou igual a dataFinal', async () => {
      const invalidData = criarReservaData({
        dataFinalAtrasada: new Date('2025-09-05T05:00:00.000Z'),
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'dataFinalAtrasada',
          details: [],
          customMessage: 'A data final atrasada deve ser posterior à data final.',
        })
      );
    });

    it('deve lançar erro se dataInicial for no passado', async () => {
      const invalidData = criarReservaData({
        dataInicial: new Date('2024-01-01T05:01:45.884Z'),
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'dataInicial',
          details: [],
          customMessage: 'A data inicial não pode ser no passado.',
        })
      );
    });

    it('deve lançar erro se quantidadeEquipamento for menor ou igual a zero', async () => {
      const invalidData = criarReservaData({
        quantidadeEquipamento: 0,
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'quantidadeEquipamento',
          details: [],
          customMessage: 'A quantidade de equipamento deve ser um número inteiro positivo.',
        })
      );
    });

    it('deve lançar erro se equipamentos não for especificado', async () => {
      const invalidData = criarReservaData({
        equipamentos: null,
      });

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'equipamentos',
          details: [],
          customMessage: 'O campo equipamentos é obrigatório.',
        })
      );
    });

    it('deve lançar erro se equipamentoId for inválido', async () => {
      const invalidData = criarReservaData({
        equipamentos: 'invalid-id',
      });
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(reservaService.criar(invalidData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'equipamentos',
          details: [],
          customMessage: `ID de equipamento inválido: ${invalidData.equipamentos}`,
        })
      );
    });

    it('deve lançar erro se equipamento não for encontrado', async () => {
      const validReservaData = criarReservaData();
      Equipamento.findById.mockResolvedValue(null);

      await expect(reservaService.criar(validReservaData)).rejects.toThrow(
        new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'equipamentos',
          details: [],
          customMessage: 'Equipamento não encontrado.',
        })
      );
    });

    it('deve lançar erro se quantidade solicitada excede a disponível', async () => {
      const mockEquipamento = {
        _id: '6839a07057d3853fbcc379b8', 
        equiQuantidadeDisponivel: 1,
        equiStatus: 'ativo',
      };
      Equipamento.findById.mockResolvedValue(mockEquipamento);
      const validReservaData = criarReservaData();

      await expect(reservaService.criar(validReservaData)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'quantidadeEquipamento',
          details: [],
          customMessage: 'Quantidade solicitada excede a quantidade disponível do equipamento.',
        })
      );

      expect(Equipamento.findById).toHaveBeenCalledWith(expect.objectContaining({
        toString: expect.any(Function),
        equals: expect.any(Function),
      }));
    });

    it('deve lançar erro se houver reservas sobrepostas', async () => {
      const mockEquipamento = {
        _id: equipamentoId,
        equiQuantidadeDisponivel: 5,
        equiStatus: 'ativo',
      };
      const mockUsuario = {
        _id: usuarioId,
        ativo: true,
      };
      Equipamento.findById.mockResolvedValue(mockEquipamento);
      Usuario.findById.mockResolvedValue(mockUsuario);
      repositoryMock.findReservasSobrepostas.mockResolvedValue([
        { _id: 'existing-reserva' },
      ]);
      repositoryMock.findReservasAtrasadas.mockResolvedValue([]);
      const futureReservaData = criarReservaData({
        dataInicial: new Date('2025-08-14'),
        dataFinal: new Date('2025-08-15'),
        dataFinalAtrasada: new Date('2025-08-19'),
      });

      await expect(reservaService.criar(futureReservaData)).rejects.toThrow(
        new CustomError({
          statusCode: 409,
          errorType: 'conflict',
          field: 'equipamento',
          details: [],
          customMessage: 'Conflito com reservas existentes, incluindo período de atraso.',
        })
      );
    });
  });

  describe('atualizar', () => {
    it('deve atualizar uma reserva válida', async () => {
      const mockReserva = {
        _id: reservaId,
        dataInicial: new Date('2025-06-01T05:01:45.884Z'),
        dataFinal: new Date('2025-06-05T05:01:45.884Z'),
        quantidadeEquipamento: 2,
        valorEquipamento: 200,
        enderecoEquipamento: 'Rua Exemplo, 123',
        statusReserva: 'pendente',
        equipamentos: equipamentoId,
        usuarios: usuarioId,
      };
      const updateData = { statusReserva: 'confirmada' };
      repositoryMock.atualizar.mockResolvedValue({ ...mockReserva, ...updateData });

      const result = await reservaService.atualizar(reservaId, updateData);

      expect(repositoryMock.atualizar).toHaveBeenCalledWith(reservaId, updateData);
      expect(result).toEqual({ ...mockReserva, ...updateData });
    });
  });

  describe('ensureReservaExists', () => {
    it('deve retornar a reserva se ela existir', async () => {
      const mockReserva = {
        _id: reservaId,
        dataInicial: new Date('2030-12-01T05:01:45.884Z'),
        dataFinal: new Date('2030-12-05T05:01:45.884Z'),
        quantidadeEquipamento: 2,
        valorEquipamento: 200,
        enderecoEquipamento: 'Rua Exemplo, 123',
        statusReserva: 'pendente',
        equipamentos: equipamentoId,
        usuarios: usuarioId,
      };
      repositoryMock.buscarPorID.mockResolvedValue(mockReserva);

      const result = await reservaService.ensureReservaExists(reservaId);

      expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(reservaId);
      expect(result).toEqual(mockReserva);
    });

    it('deve lançar erro se a reserva não for encontrada', async () => {
      repositoryMock.buscarPorID.mockResolvedValue(null);

      await expect(reservaService.ensureReservaExists(reservaId)).rejects.toThrow(
        new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Reserva',
          details: [],
          customMessage: 'Reserva não encontrada.',
        })
      );
    });
  });

  describe('marcarReservasAtrasadas', () => {
    it('deve marcar reservas como atrasadas quando existem reservas atrasadas', async () => {
      const mockReservasAtrasadas = [
        { _id: reservaId },
        { _id: '6839a06f57d3853fbcc3797f' }, // ID fixo para simular múltiplas reservas
      ];
      repositoryMock.findReservasParaMarcarAtrasada.mockResolvedValue(mockReservasAtrasadas);
      repositoryMock.marcarReservasComoAtrasadas.mockResolvedValue();

      const result = await reservaService.marcarReservasAtrasadas();

      expect(repositoryMock.findReservasParaMarcarAtrasada).toHaveBeenCalledWith(expect.any(Date));
      expect(repositoryMock.marcarReservasComoAtrasadas).toHaveBeenCalledWith([reservaId, '6839a06f57d3853fbcc3797f']);
      expect(result).toEqual({ message: '2 reservas marcadas como atrasadas.' });
    });
  });
});
