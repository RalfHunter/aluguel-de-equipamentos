import GrupoService from "../../../services/GrupoService.js";
import GrupoRepository from "../../../repositories/GrupoRepository.js"
import UsuarioRepository from "../../../repositories/UsuarioRepository.js"


jest.mock("../../../repositories/GrupoRepository.js");
jest.mock("../../../repositories/UsuarioRepository.js");

const mockCustomError = jest.fn();
jest.mock("../../../utils/helpers/index.js", () => {
  const originalHelpers = jest.requireActual("../../../utils/helpers/index.js");
  return {
    ...originalHelpers,
    CustomError: jest.fn().mockImplementation(function (args) {
      const instance = new Error(args.customMessage || "Erro Customizado");
      Object.assign(instance, args);
      instance.name = "CustomError";
      mockCustomError(args);
      return instance;
    }),
    HttpStatusCodes: {
      BAD_REQUEST: { code: 400, reason: "Bad Request" },
      NOT_FOUND: { code: 404, reason: "Not Found" },
      FORBIDDEN: { code: 403, reason: "Forbidden" },
      CONFLICT: { code: 409, reason: "Conflict" },
    },
    messages: {
      error: {
        resourceNotFound: jest.fn((resource) => `Recurso não encontrado em ${resource}.`),
        resourceConflict: jest.fn((resource, field) => `Conflito de recurso em ${resource} contém ${field}.`),
      },
    },
  };
});

const makeGrupo = (props = {}) => ({
    _id: "507f1f77bcf86cd799439011",
    nome: "Grupo Teste",
    descricao: "Descrição do grupo teste",
    ativo: true,
    data_criacao: new Date(),
    save: jest.fn(),
    ...props,
});

describe('GrupoService', () => {
    let grupoService;
    let mockGrupoRepositoryInstance;
    let mockUsuarioRepositoryInstance;
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {}, user_id: "admin123" };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockGrupoRepositoryInstance = {
            listar: jest.fn(),
            criar: jest.fn(),
            atualizar: jest.fn(),
            deletar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorNome: jest.fn(),
            verificarUsuariosAssociados: jest.fn(),
        };

        mockUsuarioRepositoryInstance = {
            buscarPorId: jest.fn(),
        };

        GrupoRepository.mockImplementation(() => mockGrupoRepositoryInstance);
        UsuarioRepository.mockImplementation(() => mockUsuarioRepositoryInstance);

        grupoService = new GrupoService();
        mockCustomError.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar todos os grupos', async () => {
            const mockData = [
                makeGrupo({ nome: 'Grupo 1' }),
                makeGrupo({ nome: 'Grupo 2' })
            ];
            mockGrupoRepositoryInstance.listar.mockResolvedValue(mockData);

            const resultado = await grupoService.listar(req);

            expect(mockGrupoRepositoryInstance.listar).toHaveBeenCalledWith(req);
            expect(resultado).toEqual(mockData);
        });

        it('deve listar grupo por id', async () => {
            const mockData = makeGrupo({ nome: 'Grupo Específico' });
            req.params = { id: '507f1f77bcf86cd799439011' };
            mockGrupoRepositoryInstance.listar.mockResolvedValue(mockData);

            const resultado = await grupoService.listar(req);

            expect(mockGrupoRepositoryInstance.listar).toHaveBeenCalledWith(req);
            expect(resultado).toEqual(mockData);
        });

        it('deve listar grupos com filtros da query', async () => {
            const mockData = [makeGrupo({ nome: 'Grupo Filtrado' })];
            req.query = { nome: 'Grupo Filtrado', ativo: 'true' };
            mockGrupoRepositoryInstance.listar.mockResolvedValue(mockData);

            const resultado = await grupoService.listar(req);

            expect(mockGrupoRepositoryInstance.listar).toHaveBeenCalledWith(req);
            expect(resultado).toEqual(mockData);
        });
    });

    describe('criar', () => {
        const mockDadosGrupo = {
            nome: "Grupo Teste",
            descricao: "Descrição do grupo teste",
            ativo: true,
            nivelPermissao: 1
        };

        it('deve criar um grupo com sucesso', async () => {
            const mockGrupoCriado = makeGrupo(mockDadosGrupo);
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(null);
            mockGrupoRepositoryInstance.criar.mockResolvedValue(mockGrupoCriado);

            const resultado = await grupoService.criar(mockDadosGrupo);

            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockDadosGrupo.nome, null);
            expect(mockGrupoRepositoryInstance.criar).toHaveBeenCalledWith(mockDadosGrupo);
            expect(resultado).toEqual(mockGrupoCriado);
        });

        it('deve lançar erro se já existe um grupo com o mesmo nome', async () => {
            const grupoExistente = makeGrupo({ nome: mockDadosGrupo.nome });
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(grupoExistente);

            await expect(grupoService.criar(mockDadosGrupo)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockDadosGrupo.nome, null);
            expect(mockGrupoRepositoryInstance.criar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se nivelPermissao é menor ou igual a zero', async () => {
            const dadosInvalidos = { ...mockDadosGrupo, nivelPermissao: 0 };
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(null);

            await expect(grupoService.criar(dadosInvalidos)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: "validationError",
                field: "nivelPermissao",
                details: [
                    {
                        path: "nivelPermissao",
                        message: "O nível de permissão deve ser maior que zero.",
                    },
                ],
                customMessage: "Não é permitido criar um grupo com nível de permissão menor ou igual a zero.",
            });
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(dadosInvalidos.nome, null);
            expect(mockGrupoRepositoryInstance.criar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se nivelPermissao é negativo', async () => {
            const dadosInvalidos = { ...mockDadosGrupo, nivelPermissao: -1 };
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(null);

            await expect(grupoService.criar(dadosInvalidos)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: "validationError",
                field: "nivelPermissao",
                details: [
                    {
                        path: "nivelPermissao",
                        message: "O nível de permissão deve ser maior que zero.",
                    },
                ],
                customMessage: "Não é permitido criar um grupo com nível de permissão menor ou igual a zero.",
            });
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(dadosInvalidos.nome, null);
            expect(mockGrupoRepositoryInstance.criar).not.toHaveBeenCalled();
        });
    });

    describe('atualizar', () => {
        const mockId = "507f1f77bcf86cd799439011";
        const mockDadosAtualizacao = {
            nome: "Grupo Atualizado",
            descricao: "Nova descrição",
            ativo: false
        };

        beforeEach(() => {
            mockGrupoRepositoryInstance.buscarPorId.mockResolvedValue(makeGrupo());
        });

        it('deve atualizar um grupo com sucesso', async () => {
            const mockGrupoAtualizado = makeGrupo(mockDadosAtualizacao);
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(null);
            mockGrupoRepositoryInstance.atualizar.mockResolvedValue(mockGrupoAtualizado);

            const resultado = await grupoService.atualizar(mockId, mockDadosAtualizacao);

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockDadosAtualizacao.nome, mockId);
            expect(mockGrupoRepositoryInstance.atualizar).toHaveBeenCalledWith(mockId, mockDadosAtualizacao);
            expect(resultado).toEqual(mockGrupoAtualizado);
        });

        it('deve lançar erro se o grupo não existir', async () => {
            mockGrupoRepositoryInstance.buscarPorId.mockResolvedValue(null);

            await expect(grupoService.atualizar(mockId, mockDadosAtualizacao)).rejects.toThrow('Recurso não encontrado em Grupo.');

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockGrupoRepositoryInstance.atualizar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se já existe outro grupo com o mesmo nome', async () => {
            const outroGrupo = makeGrupo({ _id: "507f1f77bcf86cd799439012", nome: mockDadosAtualizacao.nome });
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(outroGrupo);

            await expect(grupoService.atualizar(mockId, mockDadosAtualizacao)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockDadosAtualizacao.nome, mockId);
            expect(mockGrupoRepositoryInstance.atualizar).not.toHaveBeenCalled();
        });
    });

    describe('deletar', () => {
        const mockId = "507f1f77bcf86cd799439011";

        beforeEach(() => {
            mockGrupoRepositoryInstance.buscarPorId.mockResolvedValue(makeGrupo());
        });

        it('deve deletar um grupo com sucesso quando não há usuários associados e admin não pertence ao grupo', async () => {
            const mockUsuarioAdmin = {
                _id: "admin123",
                grupos: [{ _id: "507f1f77bcf86cd799439012" }] // Grupo diferente
            };
            mockUsuarioRepositoryInstance.buscarPorId.mockResolvedValue(mockUsuarioAdmin);
            mockGrupoRepositoryInstance.verificarUsuariosAssociados.mockResolvedValue(null);
            mockGrupoRepositoryInstance.deletar.mockResolvedValue(true);

            const resultado = await grupoService.deletar(req, mockId);

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockUsuarioRepositoryInstance.buscarPorId).toHaveBeenCalledWith(req.user_id);
            expect(mockGrupoRepositoryInstance.verificarUsuariosAssociados).toHaveBeenCalledWith(mockId);
            expect(mockGrupoRepositoryInstance.deletar).toHaveBeenCalledWith(mockId);
            expect(resultado).toBe(true);
        });

        it('deve lançar erro se o grupo não existir', async () => {
            mockGrupoRepositoryInstance.buscarPorId.mockResolvedValue(null);

            await expect(grupoService.deletar(req, mockId)).rejects.toThrow('Recurso não encontrado em Grupo.');

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockUsuarioRepositoryInstance.buscarPorId).not.toHaveBeenCalled();
            expect(mockGrupoRepositoryInstance.verificarUsuariosAssociados).not.toHaveBeenCalled();
            expect(mockGrupoRepositoryInstance.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se o admin pertence ao grupo que está tentando deletar', async () => {
            const mockUsuarioAdmin = {
                _id: "admin123",
                grupos: [{ _id: mockId }] // Mesmo grupo que está tentando deletar
            };
            mockUsuarioRepositoryInstance.buscarPorId.mockResolvedValue(mockUsuarioAdmin);

            await expect(grupoService.deletar(req, mockId)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 403,
                errorType: "unauthorized",
                details: [],
                customMessage: "Admin não pode deletar o grupo ao qual pertence"
            });
            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockUsuarioRepositoryInstance.buscarPorId).toHaveBeenCalledWith(req.user_id);
            expect(mockGrupoRepositoryInstance.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se há usuários associados ao grupo', async () => {
            const mockUsuarioAdmin = {
                _id: "admin123",
                grupos: [{ _id: "507f1f77bcf86cd799439012" }] // Grupo diferente
            };
            const usuarioAssociado = { _id: "user123", nome: "Usuario Teste" };
            mockUsuarioRepositoryInstance.buscarPorId.mockResolvedValue(mockUsuarioAdmin);
            mockGrupoRepositoryInstance.verificarUsuariosAssociados.mockResolvedValue(usuarioAssociado);

            await expect(grupoService.deletar(req, mockId)).rejects.toThrow('Conflito de recurso em Grupo contém Usuários associados.');

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockUsuarioRepositoryInstance.buscarPorId).toHaveBeenCalledWith(req.user_id);
            expect(mockGrupoRepositoryInstance.verificarUsuariosAssociados).toHaveBeenCalledWith(mockId);
            expect(mockGrupoRepositoryInstance.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se o usuário admin não for encontrado', async () => {
            mockUsuarioRepositoryInstance.buscarPorId.mockResolvedValue(null);

            await expect(grupoService.deletar(req, mockId)).rejects.toThrow('Recurso não encontrado em Usuario.');

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
            expect(mockUsuarioRepositoryInstance.buscarPorId).toHaveBeenCalledWith(req.user_id);
            expect(mockGrupoRepositoryInstance.verificarUsuariosAssociados).not.toHaveBeenCalled();
            expect(mockGrupoRepositoryInstance.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se o admin pertence ao grupo usando string comparison', async () => {
            const mockUsuarioAdmin = {
                _id: "admin123",
                grupos: [{ _id: "507f1f77bcf86cd799439011" }] // Mesmo ID como string
            };
            mockUsuarioRepositoryInstance.buscarPorId.mockResolvedValue(mockUsuarioAdmin);

            await expect(grupoService.deletar(req, mockId)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 403,
                errorType: "unauthorized",
                details: [],
                customMessage: "Admin não pode deletar o grupo ao qual pertence"
            });
        });
    });

    describe('ensureGroupExists', () => {
        const mockId = "507f1f77bcf86cd799439011";

        it('deve passar sem erro se o grupo existir', async () => {
            const grupoExistente = makeGrupo();
            mockGrupoRepositoryInstance.buscarPorId.mockResolvedValue(grupoExistente);

            await expect(grupoService.ensureGroupExists(mockId)).resolves.not.toThrow();

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
        });

        it('deve lançar erro se o grupo não existir', async () => {
            mockGrupoRepositoryInstance.buscarPorId.mockResolvedValue(null);

            await expect(grupoService.ensureGroupExists(mockId)).rejects.toThrow('Recurso não encontrado em Grupo.');

            expect(mockGrupoRepositoryInstance.buscarPorId).toHaveBeenCalledWith(mockId);
        });
    });

    describe('validateGroupName', () => {
        const mockNome = "Grupo Teste";

        it('deve passar sem erro se não existe grupo com o mesmo nome', async () => {
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(null);

            await expect(grupoService.validateGroupName(mockNome)).resolves.not.toThrow();

            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockNome, null);
        });

        it('deve passar sem erro se existe grupo com o mesmo nome mas é o mesmo grupo (atualização)', async () => {
            const mockId = "507f1f77bcf86cd799439011";
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(null);

            await expect(grupoService.validateGroupName(mockNome, mockId)).resolves.not.toThrow();

            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockNome, mockId);
        });

        it('deve lançar erro se já existe um grupo com o mesmo nome', async () => {
            const grupoExistente = makeGrupo({ nome: mockNome });
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(grupoExistente);

            await expect(grupoService.validateGroupName(mockNome)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockNome, null);
        });

        it('deve lançar erro se já existe outro grupo com o mesmo nome (diferentes IDs)', async () => {
            const mockId = "507f1f77bcf86cd799439011";
            const grupoExistente = makeGrupo({ _id: "507f1f77bcf86cd799439012", nome: mockNome });
            mockGrupoRepositoryInstance.buscarPorNome.mockResolvedValue(grupoExistente);

            await expect(grupoService.validateGroupName(mockNome, mockId)).rejects.toThrow();

            expect(mockCustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
            expect(mockGrupoRepositoryInstance.buscarPorNome).toHaveBeenCalledWith(mockNome, mockId);
        });
    });
});
