import GrupoRepository from '../../repositories/GrupoRepository.js';
import GrupoModel from '../../models/Grupo.js';
import UsuarioModel from '../../models/Usuario.js';
import { CustomError, messages } from '../../utils/helpers/index.js';
import GrupoFilterBuilder from '../../repositories/filters/GrupoFilterBuilder.js';

jest.mock('../../models/Grupo.js');
jest.mock('../../models/Usuario.js');
jest.mock('../../repositories/filters/GrupoFilterBuilder.js');

const mockPaginate = jest.fn();
const mockFindById = jest.fn();
const mockFindOne = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockSave = jest.fn();
const mockLean = jest.fn();

const mockUsuarioFindOne = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Mock do GrupoModel
  GrupoModel.mockImplementation(() => ({
    save: mockSave,
  }));

  GrupoModel.paginate = mockPaginate;
  GrupoModel.findById = mockFindById;
  GrupoModel.findOne = mockFindOne;
  GrupoModel.findByIdAndUpdate = mockFindByIdAndUpdate;
  GrupoModel.findByIdAndDelete = mockFindByIdAndDelete;

  // Mock do UsuarioModel
  UsuarioModel.findOne = mockUsuarioFindOne;

  // Mock das chains do mongoose
  mockFindById.mockReturnValue({
    lean: mockLean,
  });

  mockFindOne.mockReturnValue({
    lean: mockLean,
  });

  mockUsuarioFindOne.mockReturnValue({
    lean: mockLean,
  });

  // Mock do GrupoFilterBuilder
  const mockFilterBuilderInstance = {
    comNome: jest.fn().mockReturnThis(),
    comDescricao: jest.fn().mockReturnThis(),
    comAtivo: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  };

  GrupoFilterBuilder.mockImplementation(() => mockFilterBuilderInstance);
});

describe('GrupoRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new GrupoRepository({
      grupoModel: GrupoModel,
      usuarioModel: UsuarioModel,
    });
  });

  describe('constructor', () => {
    it('deve usar os modelos padrão quando nenhum for fornecido', () => {
      const repo = new GrupoRepository();
      expect(repo.model).toBe(GrupoModel);
      expect(repo.usuarioModel).toBe(UsuarioModel);
    });

    it('deve usar os modelos fornecidos no constructor', () => {
      const customGrupoModel = jest.fn();
      const customUsuarioModel = jest.fn();
      const repo = new GrupoRepository({
        grupoModel: customGrupoModel,
        usuarioModel: customUsuarioModel,
      });
      expect(repo.model).toBe(customGrupoModel);
      expect(repo.usuarioModel).toBe(customUsuarioModel);
    });
  });

  describe('listar', () => {
    it('deve retornar grupo específico quando ID for fornecido', async () => {
      const req = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockGrupo = { _id: '507f1f77bcf86cd799439011', nome: 'Grupo Teste' };
      
      mockLean.mockResolvedValue(mockGrupo);

      const result = await repository.listar(req);

      expect(result).toEqual(mockGrupo);
      expect(mockFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockLean).toHaveBeenCalled();
    });

    it('deve lançar erro quando grupo não for encontrado por ID', async () => {
      const req = { params: { id: '507f1f77bcf86cd799439011' } };
      
      mockLean.mockResolvedValue(null);

      await expect(repository.listar(req)).rejects.toThrow(CustomError);
      expect(mockFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('deve listar grupos com filtros e paginação', async () => {
      const req = {
        query: {
          nome: 'Admin',
          descricao: 'Administradores',
          ativo: 'true',
          page: 2,
          limite: 5
        }
      };
      
      const mockResult = {
        docs: [
          { _id: '1', nome: 'Grupo Admin' },
          { _id: '2', nome: 'Grupo User' }
        ],
        totalDocs: 2,
        page: 2,
        limit: 5
      };

      mockPaginate.mockResolvedValue(mockResult);

      const result = await repository.listar(req);

      expect(result).toEqual(mockResult);
      expect(mockPaginate).toHaveBeenCalledWith({}, {
        page: 2,
        limit: 5,
        sort: { data_criacao: -1 },
        lean: true
      });
    });

    it('deve usar valores padrão para paginação quando não fornecidos', async () => {
      const req = { query: {} };
      
      const mockResult = {
        docs: [{ _id: '1', nome: 'Grupo Teste' }],
        totalDocs: 1
      };

      mockPaginate.mockResolvedValue(mockResult);

      const result = await repository.listar(req);

      expect(result).toEqual(mockResult);
      expect(mockPaginate).toHaveBeenCalledWith({}, {
        page: 1,
        limit: 10,
        sort: { data_criacao: -1 },
        lean: true
      });
    });

    it('deve limitar o limite máximo a 100', async () => {
      const req = { query: { limite: 150 } };
      
      const mockResult = { docs: [], totalDocs: 0 };
      mockPaginate.mockResolvedValue(mockResult);

      await repository.listar(req);

      expect(mockPaginate).toHaveBeenCalledWith({}, expect.objectContaining({
        limit: 100
      }));
    });
  });

  describe('buscarPorNome', () => {
    it('deve buscar grupo por nome sem ID ignorado', async () => {
      const nome = 'Grupo Teste';
      const mockGrupo = { _id: '1', nome: 'Grupo Teste' };
      
      mockLean.mockResolvedValue(mockGrupo);

      const result = await repository.buscarPorNome(nome);

      expect(result).toEqual(mockGrupo);
      expect(mockFindOne).toHaveBeenCalledWith({
        nome: { $regex: '^Grupo Teste$', $options: 'i' }
      });
      expect(mockLean).toHaveBeenCalled();
    });

    it('deve buscar grupo por nome ignorando ID específico', async () => {
      const nome = 'Grupo Teste';
      const idIgnorado = '507f1f77bcf86cd799439011';
      const mockGrupo = { _id: '2', nome: 'Grupo Teste' };
      
      mockLean.mockResolvedValue(mockGrupo);

      const result = await repository.buscarPorNome(nome, idIgnorado);

      expect(result).toEqual(mockGrupo);
      expect(mockFindOne).toHaveBeenCalledWith({
        nome: { $regex: '^Grupo Teste$', $options: 'i' },
        _id: { $ne: idIgnorado }
      });
    });

    it('deve retornar null quando grupo não for encontrado', async () => {
      const nome = 'Grupo Inexistente';
      
      mockLean.mockResolvedValue(null);

      const result = await repository.buscarPorNome(nome);

      expect(result).toBeNull();
    });
  });

  describe('criar', () => {
    it('deve criar e salvar um novo grupo', async () => {
      const dadosGrupo = {
        nome: 'Novo Grupo',
        descricao: 'Descrição do novo grupo',
        ativo: true
      };
      
      const grupoSalvo = { _id: '123', ...dadosGrupo };
      mockSave.mockResolvedValue(grupoSalvo);

      const result = await repository.criar(dadosGrupo);

      expect(result).toEqual(grupoSalvo);
      expect(GrupoModel).toHaveBeenCalledWith(dadosGrupo);
      expect(mockSave).toHaveBeenCalled();
    });

    it('deve lançar erro quando falhar ao salvar grupo', async () => {
      const dadosGrupo = { nome: 'Grupo Inválido' };
      
      mockSave.mockRejectedValue(new Error('Validation failed'));

      await expect(repository.criar(dadosGrupo)).rejects.toThrow('Validation failed');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar grupo com sucesso', async () => {
      const id = '507f1f77bcf86cd799439011';
      const dadosAtualizacao = {
        nome: 'Grupo Atualizado',
        descricao: 'Nova descrição'
      };
      
      const grupoAtualizado = { _id: id, ...dadosAtualizacao };
      mockFindByIdAndUpdate.mockResolvedValue(grupoAtualizado);

      const result = await repository.atualizar(id, dadosAtualizacao);

      expect(result).toEqual(grupoAtualizado);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        id,
        dadosAtualizacao,
        { new: true }
      );
    });

    it('deve lançar erro quando grupo não for encontrado para atualização', async () => {
      const id = '507f1f77bcf86cd799439011';
      const dadosAtualizacao = { nome: 'Grupo Inexistente' };
      
      mockFindByIdAndUpdate.mockResolvedValue(null);

      await expect(repository.atualizar(id, dadosAtualizacao)).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    it('deve deletar grupo quando não há usuários associados', async () => {
      const id = '507f1f77bcf86cd799439011';
      const grupoDeletado = { _id: id };
      
      mockFindByIdAndDelete.mockResolvedValue(grupoDeletado);

      const result = await repository.deletar(id);

      expect(result).toEqual(grupoDeletado);
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('deve lançar erro quando grupo não for encontrado para deleção', async () => {
      const id = '507f1f77bcf86cd799439011';
      
      mockFindByIdAndDelete.mockResolvedValue(null); // Grupo não encontrado

      await expect(repository.deletar(id)).rejects.toThrow(CustomError);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar grupo quando encontrado', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockGrupo = { _id: id, nome: 'Grupo Teste' };
      
      mockLean.mockResolvedValue(mockGrupo);

      const result = await repository.buscarPorId(id);

      expect(result).toEqual(mockGrupo);
      expect(mockFindById).toHaveBeenCalledWith(id);
      expect(mockLean).toHaveBeenCalled();
    });

    it('deve lançar erro quando grupo não for encontrado', async () => {
      const id = '507f1f77bcf86cd799439011';
      
      mockLean.mockResolvedValue(null);

      await expect(repository.buscarPorId(id)).rejects.toThrow(CustomError);
    });
  });

  describe('verificarUsuariosAssociados', () => {
    it('deve retornar usuário quando há usuários associados ao grupo', async () => {
      const id = '507f1f77bcf86cd799439011';
      const usuarioAssociado = { _id: 'user123', nome: 'Usuario Teste' };
      
      mockUsuarioFindOne.mockResolvedValue(usuarioAssociado);

      const result = await repository.verificarUsuariosAssociados(id);

      expect(result).toEqual(usuarioAssociado);
      expect(mockUsuarioFindOne).toHaveBeenCalledWith({ grupos: id });
    });

    it('deve retornar null quando não há usuários associados ao grupo', async () => {
      const id = '507f1f77bcf86cd799439011';
      
      mockUsuarioFindOne.mockResolvedValue(null);

      const result = await repository.verificarUsuariosAssociados(id);

      expect(result).toBeNull();
      expect(mockUsuarioFindOne).toHaveBeenCalledWith({ grupos: id });
    });

    it('deve lançar CustomError quando ocorrer erro na consulta', async () => {
      const id = '507f1f77bcf86cd799439011';
      
      mockUsuarioFindOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.verificarUsuariosAssociados(id)).rejects.toThrow(CustomError);
      expect(mockUsuarioFindOne).toHaveBeenCalledWith({ grupos: id });
    });
  });
});
