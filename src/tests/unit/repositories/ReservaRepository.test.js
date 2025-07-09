import mongoose from 'mongoose';
import ReservaRepository from '../../../repositories/ReservaRepository.js';
import Reserva from '../../../models/Reserva.js'
import Equipamento from '../../../models/Equipamento.js'
import Usuario from '../../../models/Usuario.js'
import { CustomError, messages } from '../../../utils/helpers/index.js';
import ReservaFilterBuilder from '../../../repositories/filters/ReservaFilterBuilder.js';

class MockObjectId {
  constructor(id) {
    this.id = id;
  }
  toString() {
    return this.id;
  }
}

jest.mock('../../utils/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../models/Reserva.js');

jest.mock('../../models/Equipamento.js', () => {
  return {
    find: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn()
  };
});

jest.mock('../../models/Usuario.js', () => {
  return {
    find: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn()
  };
});

jest.mock('../../repositories/filters/ReservaFilterBuilder.js', () => {
  return jest.fn().mockImplementation(() => ({
    comDataInicial: jest.fn().mockReturnThis(),
    comDataFinal: jest.fn().mockReturnThis(),
    comDataFinalAtrasada: jest.fn().mockReturnThis(),
    comQuantidadeEquipamento: jest.fn().mockReturnThis(),
    comValorEquipamento: jest.fn().mockReturnThis(),
    comEnderecoEquipamento: jest.fn().mockReturnThis(),
    comStatus: jest.fn().mockReturnThis(),
    comUsuarios: jest.fn().mockReturnThis(),
    comEquipamentos: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  }));
});

jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  const ObjectIdMock = jest.fn().mockImplementation((id) => new MockObjectId(id));
  ObjectIdMock.isValid = jest.fn().mockImplementation((id) => {
    return typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
  });
  return {
    ...originalMongoose,
    Types: {
      ObjectId: ObjectIdMock,
    },
  };
});

describe('ReservaRepository', () => {
  let reservaRepository;

  beforeEach(() => {
    reservaRepository = new ReservaRepository({
      reservaModel: Reserva,
      equipamentoModel: Equipamento,
      usuarioModel: Usuario,
    });
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar uma reserva por ID', async () => {
      const mockReserva = {
        _id: '1234567890abcdef12345678',
        dataInicial: new Date(),
        dataFinal: new Date(),
        quantidadeEquipamento: 1,
        valorEquipamento: 100,
        enderecoEquipamento: 'Rua Teste',
        statusReserva: 'pendente',
        equipamentos: { _id: 'equip1', equiNome: 'Equipamento 1' },
        usuarios: { _id: 'user1', nome: 'Usuário 1' },
      };

      const mockExec = jest.fn().mockResolvedValue(mockReserva);
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockPopulateUsuarios = jest.fn().mockReturnValue({ lean: mockLean });
      const mockPopulateEquipamentos = jest.fn().mockReturnValue({ populate: mockPopulateUsuarios });
      
      Reserva.findById.mockReturnValueOnce({
        populate: mockPopulateEquipamentos
      });

      const result = await reservaRepository.buscarPorID('1234567890abcdef12345678');

      expect(Reserva.findById).toHaveBeenCalledWith('1234567890abcdef12345678');
      expect(mockPopulateEquipamentos).toHaveBeenCalledWith('equipamentos', 'equiNome');
      expect(mockPopulateUsuarios).toHaveBeenCalledWith('usuarios', 'nome');
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual(mockReserva);
    });

    it('deve lançar erro se a reserva por ID não for encontrada', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
      const mockPopulateUsuarios = jest.fn().mockReturnValue({ lean: mockLean });
      const mockPopulateEquipamentos = jest.fn().mockReturnValue({ populate: mockPopulateUsuarios });
      
      Reserva.findById.mockReturnValueOnce({
        populate: mockPopulateEquipamentos
      });

      await expect(reservaRepository.buscarPorID('1234567890abcdef12345678')).rejects.toThrow(
        new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Reserva',
          details: [],
          customMessage: 'Reserva não encontrada.',
        })
      );
    });

    it('deve listar reservas com filtros e paginação', async () => {
      const mockFiltros = { statusReserva: 'pendente' };
      const mockResultado = {
        docs: [{ _id: '123', toObject: jest.fn().mockReturnValue({ _id: '123' }) }],
        totalDocs: 1,
        page: 1,
        limit: 10,
      };

      ReservaFilterBuilder.mockImplementation(() => ({
        comDataInicial: jest.fn().mockReturnThis(),
        comDataFinal: jest.fn().mockReturnThis(),
        comDataFinalAtrasada: jest.fn().mockReturnThis(),
        comQuantidadeEquipamento: jest.fn().mockReturnThis(),
        comValorEquipamento: jest.fn().mockReturnThis(),
        comEnderecoEquipamento: jest.fn().mockReturnThis(),
        comStatus: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockFiltros),
      }));
      Reserva.paginate.mockResolvedValue(mockResultado);

      const req = {
        query: { statusReserva: 'pendente', page: '1', limite: '10' },
        params: {},
      };

      const result = await reservaRepository.listar(req);

      expect(Reserva.paginate).toHaveBeenCalledWith(mockFiltros, {
        page: 1,
        limit: 10,
        populate: [
          { path: 'equipamentos', select: 'equiNome' },
          { path: 'usuarios', select: 'nome' },
        ],
        sort: { createdAt: 1 },
      });
      expect(result).toEqual(mockResultado);
    });

    it('deve retornar resultado vazio quando nenhum usuário é encontrado', async () => {
      const mockReq = {
        query: { usuarios: 'Inexistente', page: '1', limite: '10' },
        params: {},
      };

      // Configura o mock para retornar uma lista vazia de usuários
      const findMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      Usuario.find.mockReturnValue(findMock);

      const result = await reservaRepository.listar(mockReq);

      expect(Usuario.find).toHaveBeenCalledWith(
        { nome: { $regex: 'Inexistente', $options: 'i' } },
        '_id'
      );
      expect(findMock.lean).toHaveBeenCalled();
      expect(findMock.exec).toHaveBeenCalled();
      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      });
      expect(Reserva.paginate).not.toHaveBeenCalled();
    });

    it('deve retornar resultado vazio quando nenhum equipamento é encontrado', async () => {
      const mockReq = {
        query: { equipamentos: 'Inexistente', page: '1', limite: '10' },
        params: {},
      };

      // Mock para retornar uma lista vazia de equipamentos
      Equipamento.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await reservaRepository.listar(mockReq);

      expect(Equipamento.find).toHaveBeenCalledWith(
        { equiNome: { $regex: 'Inexistente', $options: 'i' } },
        '_id'
      );
      expect(result).toEqual({
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      });
      // Garante que a query não foi construída além do necessário
      expect(Reserva.paginate).not.toHaveBeenCalled();
    });

    it('deve lançar erro para ID inválido', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      const req = { params: { id: 'invalid_id' } };

      await expect(reservaRepository.listar(req)).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'id',
          customMessage: 'ID inválido: invalid_id',
        })
      );
    });
  });

  describe('criar', () => {
    it('deve criar uma nova reserva', async () => {
      const mockDados = {
        dataInicial: new Date(),
        dataFinal: new Date(),
        quantidadeEquipamento: 1,
        valorEquipamento: 100,
        enderecoEquipamento: 'Rua Teste',
        statusReserva: 'pendente',
        equipamentos: new MockObjectId('equip1'),
        usuarios: new MockObjectId('user1'),
      };

      const mockReserva = { ...mockDados, _id: '1234567890abcdef12345678' };
      Reserva.create.mockResolvedValue(mockReserva);

      const result = await reservaRepository.criar(mockDados);

      expect(Reserva.create).toHaveBeenCalledWith(mockDados);
      expect(result).toEqual(mockReserva);
    });

    it('deve lançar erro se a criação da reserva falhar', async () => {
      const mockDados = {
        dataInicial: new Date(),
        dataFinal: new Date(),
        quantidadeEquipamento: 1,
        equipamentos: new MockObjectId('equip1'),
        usuarios: new MockObjectId('user1'),
      };

      Reserva.create.mockRejectedValue(new Error('Erro de validação'));

      await expect(reservaRepository.criar(mockDados)).rejects.toThrow('Erro de validação');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar uma reserva existente', async () => {
      const mockReserva = {
        _id: '1234567890abcdef12345678',
        dataInicial: new Date(),
        dataFinal: new Date(),
        quantidadeEquipamento: 2,
        equipamentos: new MockObjectId('equip1'),
        usuarios: new MockObjectId('user1'),
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Reserva.findByIdAndUpdate.mockResolvedValue(mockReserva);

      const result = await reservaRepository.atualizar('1234567890abcdef12345678', { quantidadeEquipamento: 2 });

      expect(Reserva.findByIdAndUpdate).toHaveBeenCalledWith(
        '1234567890abcdef12345678', 
        { quantidadeEquipamento: 2 }, 
        { new: true }
      );
      expect(result).toEqual(mockReserva);
    });

    it('deve lançar erro se a reserva não for encontrada', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Reserva.findByIdAndUpdate.mockResolvedValue(null);

      await expect(reservaRepository.atualizar('1234567890abcdef12345678', { quantidadeEquipamento: 2 })).rejects.toThrow(
        new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Reserva',
          customMessage: 'Reserva não encontrada.',
        })
      );
    });

    it('deve lançar erro para ID inválido', async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(reservaRepository.atualizar('invalid_id', {})).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'id',
          customMessage: 'ID inválido: invalid_id',
        })
      );
    });
  });

  describe('findReservasSobrepostas', () => {
    it('deve encontrar reservas sobrepostas', async () => {
      const mockReservas = [
        {
          _id: '1234567890abcdef12345678',
          equipamentos: new MockObjectId('1234567890abcdef12345678'),
          dataInicial: new Date('2025-06-01'),
          dataFinal: new Date('2025-06-02'),
        },
      ];

      mongoose.Types.ObjectId.mockReturnValue(new MockObjectId('1234567890abcdef12345678'));
      Reserva.find.mockResolvedValue(mockReservas);

      const result = await reservaRepository.findReservasSobrepostas(
        '1234567890abcdef12345678',
        new Date('2025-06-01'),
        new Date('2025-06-02')
      );

      expect(Reserva.find).toHaveBeenCalled();
      expect(result).toEqual(mockReservas);
    });

    it('deve lançar erro em caso de falha no banco', async () => {
      mongoose.Types.ObjectId.mockReturnValue(new MockObjectId('equip1'));
      Reserva.find.mockRejectedValue(new Error('Erro no banco'));

      await expect(
        reservaRepository.findReservasSobrepostas('equip1', new Date('2025-06-01'), new Date('2025-06-02'))
      ).rejects.toThrow('Erro no banco');
    });

    it('deve encontrar reservas sobrepostas com diferentes condições de data', async () => {
      const equipamentoId = '1234567890abcdef12345678';
      const dataInicial = new Date('2025-06-01');
      const dataFinal = new Date('2025-06-02');
      const mockReservas = [
        {
          _id: 'reserva1',
          equipamentos: new MockObjectId(equipamentoId),
          dataInicial: new Date('2025-06-01'),
          dataFinal: new Date('2025-06-03'),
          statusReserva: 'confirmada',
        },
        {
          _id: 'reserva2',
          equipamentos: new MockObjectId(equipamentoId),
          dataInicial: new Date('2025-05-30'),
          dataFinalAtrasada: new Date('2025-06-02'),
          statusReserva: 'atrasada',
        },
      ];

      mongoose.Types.ObjectId.mockReturnValue(new MockObjectId(equipamentoId));
      Reserva.find.mockResolvedValue(mockReservas);

      const result = await reservaRepository.findReservasSobrepostas(
        equipamentoId,
        dataInicial,
        dataFinal
      );

      expect(Reserva.find).toHaveBeenCalledWith({
        equipamentos: expect.any(MockObjectId),
        statusReserva: { $in: ['pendente', 'confirmada'] },
        $or: [
          { dataInicial: { $lte: dataFinal }, dataFinal: { $gte: dataInicial } },
          { dataInicial: { $lte: dataFinal }, dataFinalAtrasada: { $gte: dataInicial } },
          { dataFinalAtrasada: { $gte: dataInicial, $lte: dataFinal } },
        ],
      });
      expect(result).toEqual(mockReservas);
    });

    it('deve retornar lista vazia quando não há reservas atrasadas', async () => {
    const equipamentoId = '1234567890abcdef12345678';
        const dataInicial = new Date('2025-06-30');
        const dataFinal = new Date('2025-07-01');

        mongoose.Types.ObjectId.mockReturnValue(new MockObjectId(equipamentoId));
        Reserva.find.mockResolvedValue([]);

        const result = await reservaRepository.findReservasSobrepostas(equipamentoId, dataInicial, dataFinal);

        expect(Reserva.find).toHaveBeenCalledWith({
          equipamentos: expect.any(MockObjectId),
          statusReserva: { $in: ['pendente', 'confirmada'] },
          $or: [
            { dataInicial: { $lte: dataFinal }, dataFinal: { $gte: dataInicial } },
            { dataInicial: { $lte: dataFinal }, dataFinalAtrasada: { $gte: dataInicial } },
            { dataFinalAtrasada: { $gte: dataInicial, $lte: dataFinal } },
          ],
        });
        expect(result).toEqual([]);
    });
  });

  describe('findReservasAtrasadas', () => {
    it('deve encontrar reservas atrasadas para um equipamento', async () => {
      const equipamentoId = '1234567890abcdef12345678';
      const currentDate = new Date('2025-06-30');
      const mockReservas = [ /* ... */ ];

      mongoose.Types.ObjectId.mockReturnValue(new MockObjectId(equipamentoId));

      mongoose.Types.ObjectId.mockImplementation((id) => new MockObjectId(id));
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);

      Reserva.find.mockResolvedValue(mockReservas);

      const result = await reservaRepository.findReservasAtrasadas(equipamentoId, currentDate);

      expect(Reserva.find).toHaveBeenCalledWith({
        equipamentos: expect.any(MockObjectId),
        statusReserva: { $in: ['pendente', 'confirmada', 'atrasada'] },
        dataFinalAtrasada: { $lt: currentDate, $ne: null }
      });
      expect(result).toEqual(mockReservas);
    });

    it('deve lançar erro para ID inválido', async () => {

      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await expect(
        reservaRepository.findReservasAtrasadas('invalid_id', new Date())
      ).rejects.toThrow(
        new CustomError({
          statusCode: 400,
          errorType: 'invalidData',
          field: 'id',
          customMessage: 'ID inválido: invalid_id',
        })
      );

      expect(Reserva.find).not.toHaveBeenCalled();
    });
  });

  describe('findReservasParaMarcarAtrasada', () => {
    it('deve encontrar reservas que precisam ser marcadas como atrasadas', async () => {
      const currentDate = new Date('2025-06-30');
      const mockReservas = [
        {
          _id: 'reserva1',
          dataFinal: new Date('2025-06-28'),
          statusReserva: 'confirmada'
        }
      ];

      Reserva.find.mockResolvedValue(mockReservas);

      const result = await reservaRepository.findReservasParaMarcarAtrasada(currentDate);

      expect(Reserva.find).toHaveBeenCalledWith({
        statusReserva: { $in: ['pendente', 'confirmada'] },
        dataFinal: { $lt: currentDate },
        dataFinalAtrasada: { $exists: false }
      });
      expect(result).toEqual(mockReservas);
    });
    it('deve retornar lista vazia quando não há reservas para marcar como atrasadas', async () => {
      const currentDate = new Date('2025-06-30');
      Reserva.find.mockResolvedValue([]);

      const result = await reservaRepository.findReservasParaMarcarAtrasada(currentDate);

      expect(Reserva.find).toHaveBeenCalledWith({
        statusReserva: { $in: ['pendente', 'confirmada'] },
        dataFinal: { $lt: currentDate },
        dataFinalAtrasada: { $exists: false },
      });
      expect(result).toEqual([]);
    });
  });

  describe('marcarReservasComoAtrasadas', () => {
    it('deve marcar reservas como atrasadas', async () => {
      const reservaIds = ['reserva1', 'reserva2'];
      const mockResult = { modifiedCount: 2 };

      Reserva.updateMany.mockResolvedValue(mockResult);

      const result = await reservaRepository.marcarReservasComoAtrasadas(reservaIds);

      expect(Reserva.updateMany).toHaveBeenCalledWith(
        { _id: { $in: reservaIds } },
        { $set: { statusReserva: 'atrasada' } }
      );
      expect(result).toEqual(mockResult);
    });

    it('deve lidar com nenhuma reserva modificada', async () => {
      const reservaIds = ['reserva1', 'reserva2'];
      const mockResult = { modifiedCount: 0 };

      Reserva.updateMany.mockResolvedValue(mockResult);

      const result = await reservaRepository.marcarReservasComoAtrasadas(reservaIds);

      expect(result).toEqual(mockResult);
    });
  });

});