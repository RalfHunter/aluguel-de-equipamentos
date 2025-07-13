import EquipamentoRepository from '../../../repositories/EquipamentoRepository.js';
import EquipamentoModel from '../../../models/Equipamento.js';
import { CustomError, HttpStatusCodes } from '../../../utils/helpers/index.js';

jest.mock('../../../models/Equipamento.js');

const mockPaginate = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockSave = jest.fn();
const mockDeleteOne = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  EquipamentoModel.mockImplementation(() => ({
    save: mockSave,
  }));

  EquipamentoModel.paginate = mockPaginate;
  EquipamentoModel.findById = mockFindById;
  EquipamentoModel.findByIdAndUpdate = mockFindByIdAndUpdate;
  EquipamentoModel.deleteOne = mockDeleteOne;
});

describe('EquipamentoRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new EquipamentoRepository({ equipamentoModel: EquipamentoModel });
  });

  describe('constructor', () => {
    it('deve usar o modelo padrão quando nenhum for fornecido', () => {
      const repo = new EquipamentoRepository();
      expect(repo.model).toBe(EquipamentoModel);
    });

    it('deve usar o modelo fornecido quando especificado', () => {
      const customModel = {};
      const repo = new EquipamentoRepository({ equipamentoModel: customModel });
      expect(repo.model).toBe(customModel);
    });
  });

  describe('criar', () => {
    it('deve criar e retornar equipamento com status inativo', async () => {
      const dadosEquipamento = {
        equiNome: 'Betoneira',
        equiDescricao: 'Betoneira elétrica para construção civil',
        equiCategoria: 'Ferramentas',
        equiValorDiaria: 150,
        equiQuantidadeDisponivel: 3,
        equiFotos: ['betoneira1.jpg'],
      };
      const equipamentoSalvo = { _id: '123', ...dadosEquipamento, equiStatus: 'inativo' };
      mockSave.mockResolvedValueOnce(equipamentoSalvo);

      const result = await repository.criar(dadosEquipamento);

      expect(result).toEqual(equipamentoSalvo);
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result.equiStatus).toBe('inativo');
    });

    it('deve lançar erro se atributos obrigatórios estiverem faltando', async () => {
      const dadosEquipamento = { equiNome: 'Betoneira' };
      mockSave.mockRejectedValueOnce(new Error('Missing required fields'));

      await expect(repository.criar(dadosEquipamento)).rejects.toThrow('Missing required fields');
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('listar', () => {
    it('deve listar equipamentos com filtros de categoria, faixa de preço e disponibilidade', async () => {
      const query = {
        equiCategoria: 'Ferramentas',
        valorDiariaMin: 100,
        valorDiariaMax: 300,
        disponibilidade: '2025-06-01',
      };
      const pagina = 1;
      const limite = 10;
      const mockEquipamentos = {
        docs: [{ _id: '123', equiNome: 'Betoneira', equiCategoria: 'Ferramentas', equiValorDiaria: 150 }],
        totalDocs: 1,
      };
      mockPaginate.mockResolvedValueOnce(mockEquipamentos);

      const result = await repository.listar(query, pagina, limite);

      expect(result).toEqual(mockEquipamentos);
      expect(mockPaginate).toHaveBeenCalledWith(query, {
        page: pagina,
        limit: limite,
        sort: { equiNome: 1 },
        populate: [
          {
            path: 'equiAvaliacoes',
            populate: { path: 'usuarios', select: 'nome' },
          },
          {
            path: 'equiUsuario',
            select: 'nome',
          },
        ],
      });
    });

    it('deve listar apenas equipamentos ativos para query com status ativo', async () => {
      const query = { equiStatus: 'ativo' };
      const pagina = 1;
      const limite = 10;
      const mockEquipamentos = {
        docs: [{ _id: '123', equiNome: 'Betoneira', equiStatus: 'ativo' }],
        totalDocs: 1,
      };
      mockPaginate.mockResolvedValueOnce(mockEquipamentos);

      const result = await repository.listar(query, pagina, limite);

      expect(result).toEqual(mockEquipamentos);
      expect(mockPaginate).toHaveBeenCalledWith(query, expect.any(Object));
    });

    it('deve lidar com erro no banco de dados', async () => {
      const query = { equiCategoria: 'Ferramentas' };
      mockPaginate.mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.listar(query, 1, 10)).rejects.toThrow('Database error');
    });
  });

  describe('listarPendentes', () => {
    it('deve listar equipamentos pendentes com paginação e população', async () => {
      const pagina = 2;
      const limite = 5;
      const mockPendentes = {
        docs: [{ _id: '999', equiStatus: 'pendente' }],
        totalDocs: 1,
      };
      mockPaginate.mockResolvedValueOnce(mockPendentes);

      const result = await repository.listarPendentes(pagina, limite);

      expect(result).toEqual(mockPendentes);
      expect(mockPaginate).toHaveBeenCalledWith(
        { equiStatus: 'pendente' },
        expect.objectContaining({
          page: pagina,
          limit: limite,
          sort: { createdAt: -1 },
          populate: expect.any(Array),
        })
      );
    });

    it('deve usar pagina e limite padrão se não forem passados', async () => {
      const mockPendentes = {
        docs: [{ _id: '999', equiStatus: 'pendente' }],
        totalDocs: 1,
      };
      mockPaginate.mockResolvedValueOnce(mockPendentes);

      const result = await repository.listarPendentes();

      expect(result).toEqual(mockPendentes);
      expect(mockPaginate).toHaveBeenCalledWith(
        { equiStatus: 'pendente' },
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
    });

    it('deve lidar com erro no banco de dados', async () => {
      mockPaginate.mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.listarPendentes()).rejects.toThrow('Database error');
    });
  });
  describe('listarPorId', () => {

    it('deve lançar erro para ID inválido', async () => {
      const id = 'invalid_id';
      mockFindById.mockRejectedValueOnce(new Error('Invalid ID'));

      await expect(repository.listarPorId(id)).rejects.toThrow('Invalid ID');
      expect(mockFindById).toHaveBeenCalledWith(id);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar equipamento e marcar como inativo para nova aprovação', async () => {
      const id = '123';
      const dadosAtualizados = { equiNome: 'Betoneira Atualizada', equiValorDiaria: 180 };
      const mockEquipamento = { _id: '123', ...dadosAtualizados, equiStatus: 'inativo' };
      mockFindByIdAndUpdate.mockResolvedValueOnce(mockEquipamento);

      const result = await repository.atualizar(id, dadosAtualizados);

      expect(result).toEqual(mockEquipamento);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(id, dadosAtualizados, { new: true });
    });

    it('deve retornar null se o equipamento não for encontrado', async () => {
      const id = '123';
      mockFindByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await repository.atualizar(id, { equiNome: 'Betoneira' });

      expect(result).toBeNull();
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(id, { equiNome: 'Betoneira' }, { new: true });
    });

    it('deve lançar erro para ID inválido', async () => {
      const id = 'invalid_id';
      mockFindByIdAndUpdate.mockRejectedValueOnce(new Error('Invalid ID'));

      await expect(repository.atualizar(id, { equiNome: 'Betoneira' })).rejects.toThrow('Invalid ID');
    });
  });

  describe('excluir', () => {
    it('deve excluir equipamento com sucesso', async () => {
      mockDeleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const result = await repository.excluir('123');

      expect(result).toEqual({ deletedCount: 1 });
      expect(mockDeleteOne).toHaveBeenCalledWith({ _id: '123' });
    });

    it('deve lançar erro se equipamento não for encontrado para exclusão', async () => {
      mockDeleteOne.mockResolvedValueOnce({ deletedCount: 0 });

      await expect(repository.excluir('999')).rejects.toMatchObject({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: 'Equipamento não encontrado para exclusão.',
      });
      expect(mockDeleteOne).toHaveBeenCalledWith({ _id: '999' });
    });

    it('deve lançar erro para ID inválido', async () => {
      mockDeleteOne.mockRejectedValueOnce(new Error('Invalid ID'));

      await expect(repository.excluir('invalid_id')).rejects.toThrow('Invalid ID');
    });
  });

  describe('buscarFotoPorId', () => {
    it('deve retornar a foto correspondente ao ID fornecido', async () => {
      const equipamentoId = '123';
      const fotoId = '456';
      const mockEquipamento = {
        _id: equipamentoId,
        equiFotos: [{ _id: fotoId, url: 'betoneira1.jpg' }],
      };
      mockFindById.mockResolvedValueOnce(mockEquipamento);

      const result = await repository.buscarFotoPorId(equipamentoId, fotoId);

      expect(result).toEqual({ _id: fotoId, url: 'betoneira1.jpg' });
      expect(mockFindById).toHaveBeenCalledWith(equipamentoId);
    });

    it('deve lançar erro se o equipamento não for encontrado', async () => {
      const equipamentoId = '123';
      const fotoId = '456';
      mockFindById.mockResolvedValueOnce(null);

      await expect(repository.buscarFotoPorId(equipamentoId, fotoId)).rejects.toMatchObject({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: 'Equipamento não encontrado.',
      });
      expect(mockFindById).toHaveBeenCalledWith(equipamentoId);
    });

    it('deve retornar undefined se a foto não for encontrada', async () => {
      const equipamentoId = '123';
      const fotoId = '456';
      const mockEquipamento = {
        _id: equipamentoId,
        equiFotos: [{ _id: '789', url: 'betoneira2.jpg' }],
      };
      mockFindById.mockResolvedValueOnce(mockEquipamento);

      const result = await repository.buscarFotoPorId(equipamentoId, fotoId);

      expect(result).toBeUndefined();
      expect(mockFindById).toHaveBeenCalledWith(equipamentoId);
    });

    it('deve lançar erro para ID de equipamento inválido', async () => {
      const equipamentoId = 'invalid_id';
      const fotoId = '456';
      mockFindById.mockRejectedValueOnce(new Error('Invalid ID'));

      await expect(repository.buscarFotoPorId(equipamentoId, fotoId)).rejects.toThrow('Invalid ID');
    });
  });
});