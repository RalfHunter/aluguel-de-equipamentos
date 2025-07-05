import EquipamentoRepository from '../../../repositories/EquipamentoRepository.js';
import EquipamentoModel from '../../../models/Equipamento.js
import { CustomError, HttpStatusCodes } from '../../../utils/helpers/index.js';

jest.mock('../../models/Equipamento.js');

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

  const mockPopulateUsuarios = jest.fn().mockReturnThis();
  const mockPopulateAvaliacoes = jest.fn().mockReturnValue({
    populate: mockPopulateUsuarios,
  });
  const mockPopulateUsuario = jest.fn().mockReturnThis();

  mockFindById.mockReturnValue({
    populate: jest.fn()
      .mockImplementationOnce(() => mockPopulateAvaliacoes())
      .mockImplementationOnce(() => mockPopulateUsuario()),
  });
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

    it('deve listar apenas equipamentos ativos para usuários comuns', async () => {
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
      expect(mockPaginate).toHaveBeenCalledWith({ equiStatus: 'ativo' }, expect.any(Object));
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
  });

  describe('listarPorId', () => {
    it('deve retornar detalhes de um equipamento ativo', async () => {
      const id = '123';
      const mockEquipamento = { _id: '123', equiNome: 'Betoneira', equiStatus: 'ativo' };

      const mockPopulateUsuarios = jest.fn().mockReturnValue(mockEquipamento);
      const mockPopulateAvaliacoes = jest.fn().mockReturnValue({
        populate: mockPopulateUsuarios,
      });
      const mockPopulateUsuario = jest.fn().mockReturnValue({
        populate: mockPopulateUsuarios,
      });

      mockFindById.mockReturnValue({
        populate: jest.fn()
          .mockImplementationOnce(() => mockPopulateAvaliacoes())
          .mockImplementationOnce(() => mockPopulateUsuario()),
      });

      const result = await repository.listarPorId(id);

      expect(result).toEqual(mockEquipamento);
      expect(mockFindById).toHaveBeenCalledWith(id);
    });

    it('deve retornar null se o equipamento não for encontrado', async () => {
      const id = '123';

      const mockPopulateUsuarios = jest.fn().mockReturnValue(null);
      const mockPopulateAvaliacoes = jest.fn().mockReturnValue({
        populate: mockPopulateUsuarios,
      });
      const mockPopulateUsuario = jest.fn().mockReturnValue({
        populate: mockPopulateUsuarios,
      });

      mockFindById.mockReturnValue({
        populate: jest.fn()
          .mockImplementationOnce(() => mockPopulateAvaliacoes())
          .mockImplementationOnce(() => mockPopulateUsuario()),
      });

      const result = await repository.listarPorId(id);

      expect(result).toBeNull();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar equipamento e marcar como inativo para nova aprovação', async () => {
      const id = '123';
      const dadosAtualizados = { equiNome: 'Betoneira Atualizada', equiValorDiaria: 180 };
      const mockEquipamento = { _id: '123', equiNome: 'Betoneira Atualizada', equiValorDiaria: 180, equiStatus: 'inativo' };
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
  });
});
