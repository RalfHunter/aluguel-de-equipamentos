import { beforeEach, describe, expect, jest } from "@jest/globals";
import GrupoController from "../../../controllers/GrupoController.js";
import GrupoService from "../../../services/GrupoService.js";

// Mock dependencies
jest.mock('../../../services/GrupoService.js');
jest.mock('../../../utils/helpers/index.js', () => ({
    CommonResponse: {
        success: jest.fn(),
        created: jest.fn(),
        error: jest.fn(),
    },
}));
jest.mock('../../../utils/validators/schemas/zod/GrupoSchema.js', () => ({
    GrupoSchema: { parse: jest.fn() },
    GrupoUpdateSchema: { parse: jest.fn() },
}));
jest.mock('../../../utils/validators/schemas/zod/querys/GrupoQuerySchema.js', () => ({
    GrupoIdSchema: { parse: jest.fn() },
    GrupoQuerySchema: { parse: jest.fn() },
}));

import { CommonResponse } from '../../../utils/helpers/index.js';
import { GrupoSchema, GrupoUpdateSchema } from '../../../utils/validators/schemas/zod/GrupoSchema.js';
import { GrupoIdSchema, GrupoQuerySchema } from '../../../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';

describe('GrupoController', () => {
    let Grupo;
    let req, res;

    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        Grupo = new GrupoController();
        req = { params: {}, body: {}, query: {} };
        res = mockResponse();

        Grupo.service = new GrupoService();

        // mocks para verificarUsuariosAssociados
        Grupo.usuarioModel = {
            findOne: jest.fn()
        };
        Grupo.customError = jest.fn();

        // mock para mensagens no geral
        global.messages = {
            error: {
                internalServerError: jest.fn().mockReturnValue('Internal server error')
            }
        };


        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar todos os grupos sem parâmetros', async () => {
            const mockData = [
                { _id: '1', nome: 'Grupo Admin', descricao: 'Administradores' },
                { _id: '2', nome: 'Grupo User', descricao: 'Usuários comuns' }
            ];

            //   Para cobrir 100% de todas as linhas
            req.params = null
            req.query = null
            Grupo.service.listar.mockResolvedValue(mockData);

            await Grupo.listar(req, res);

            expect(Grupo.service.listar).toHaveBeenCalledWith(req);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                res,
                mockData
            );
        });

        it('deve listar um grupo específico por ID', async () => {
            const id = 'abc123';
            req.params.id = id;
            const mockData = { _id: id, nome: 'Grupo Admin', descricao: 'Administradores' };

            GrupoIdSchema.parse.mockReturnValue(id);
            Grupo.service.listar.mockResolvedValue(mockData);

            await Grupo.listar(req, res);

            expect(GrupoIdSchema.parse).toHaveBeenCalledWith(id);
            expect(Grupo.service.listar).toHaveBeenCalledWith(req);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                res,
                mockData
            );
        });

        it('deve listar grupos com query params válidos', async () => {
            req.query = { nome: 'Admin', ativo: 'true' };
            const mockData = [{ _id: '1', nome: 'Grupo Admin' }];

            GrupoQuerySchema.parse.mockReturnValue(req.query);
            Grupo.service.listar.mockResolvedValue(mockData);

            await Grupo.listar(req, res);

            expect(GrupoQuerySchema.parse).toHaveBeenCalledWith(req.query);
            expect(Grupo.service.listar).toHaveBeenCalledWith(req);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                res,
                mockData
            );
        });

        it('deve lançar erro se ID for inválido', async () => {
            req.params.id = 'idInvalido';
            const error = new Error('ID inválido');
            error.name = 'ZodError';
            GrupoIdSchema.parse.mockImplementation(() => {
                throw error;
            });

            await expect(Grupo.listar(req, res)).rejects.toThrow('ID inválido');
            expect(GrupoIdSchema.parse).toHaveBeenCalledWith('idInvalido');
        });

        it('deve lançar erro se query params forem inválidos', async () => {
            req.query = { ativo: 'invalido' };
            const error = new Error('Query inválida');
            error.name = 'ZodError';
            GrupoQuerySchema.parse.mockImplementation(() => {
                throw error;
            });

            await expect(Grupo.listar(req, res)).rejects.toThrow('Query inválida');
            expect(GrupoQuerySchema.parse).toHaveBeenCalledWith(req.query);
        });

        it('deve listar grupos com query vazia', async () => {
            req.query = {};
            const mockData = [{ _id: '1', nome: 'Grupo Test' }];

            Grupo.service.listar.mockResolvedValue(mockData);

            await Grupo.listar(req, res);

            expect(GrupoQuerySchema.parse).not.toHaveBeenCalled();
            expect(Grupo.service.listar).toHaveBeenCalledWith(req);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                res,
                mockData
            );
        });
    });

    describe('criar', () => {
        it('deve criar um grupo com dados válidos', async () => {
            const dadosGrupo = {
                nome: 'Novo Grupo',
                descricao: 'Descrição do novo grupo',
                ativo: true,
                nivelPermissao: 100,
                permissoes: [
                    {
                        rota: '/teste',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: true,
                        modificar: true,
                        excluir: true
                    }
                ]
            };

            req.body = dadosGrupo;
            const mockResult = { _id: 'abc123', ...dadosGrupo };

            GrupoSchema.parse.mockReturnValue(dadosGrupo);
            Grupo.service.criar.mockResolvedValue(mockResult);

            await Grupo.criar(req, res);

            expect(GrupoSchema.parse).toHaveBeenCalledWith(req.body);
            expect(Grupo.service.criar).toHaveBeenCalledWith(dadosGrupo);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                res,
                mockResult,
                201,
                'Grupo criado com sucesso'
            );
        });

        it('deve lançar erro se dados forem inválidos', async () => {
            req.body = { nome: '', descricao: '' };
            const error = new Error('Dados inválidos');
            error.name = 'ZodError';
            GrupoSchema.parse.mockImplementation(() => {
                throw error;
            });

            await expect(Grupo.criar(req, res)).rejects.toThrow('Dados inválidos');
            expect(GrupoSchema.parse).toHaveBeenCalledWith(req.body);
            expect(Grupo.service.criar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se campos obrigatórios estiverem ausentes', async () => {
            req.body = { nome: 'Teste' }; // Faltando outros campos obrigatórios
            const error = new Error('Campo obrigatório ausente');
            error.name = 'ZodError';
            GrupoSchema.parse.mockImplementation(() => {
                throw error;
            });

            await expect(Grupo.criar(req, res)).rejects.toThrow('Campo obrigatório ausente');
            expect(GrupoSchema.parse).toHaveBeenCalledWith(req.body);
            expect(Grupo.service.criar).not.toHaveBeenCalled();
        });
    });

    describe('atualizar', () => {
        it('deve atualizar um grupo com dados válidos', async () => {
            const id = 'abc123';
            const dadosAtualizacao = {
                nome: 'Grupo Atualizado',
                descricao: 'Nova descrição'
            };

            req.params.id = id;
            req.body = dadosAtualizacao;
            const mockResult = { _id: id, ...dadosAtualizacao };

            GrupoIdSchema.parse.mockReturnValue(id);
            GrupoUpdateSchema.parse.mockReturnValue(dadosAtualizacao);
            Grupo.service.atualizar.mockResolvedValue(mockResult);

            await Grupo.atualizar(req, res);

            expect(GrupoIdSchema.parse).toHaveBeenCalledWith(id);
            expect(GrupoUpdateSchema.parse).toHaveBeenCalledWith(req.body);
            expect(Grupo.service.atualizar).toHaveBeenCalledWith(id, dadosAtualizacao);
            expect(CommonResponse.success).toHaveBeenCalledWith(res, mockResult);
        });

        it('não deve atualizar grupo sem ID no params', async () => {
            req.params = null;

            // O erro que vai acontecer é TypeError devido ao destructuring de null
            await expect(Grupo.atualizar(req, res)).rejects.toThrow(TypeError);
        });

        it('deve lançar erro se dados de atualização forem inválidos', async () => {
            const id = 'abc123';
            req.params.id = id;
            req.body = { nome: 123 }; // Tipo inválido

            GrupoIdSchema.parse.mockReturnValue(id);
            const error = new Error('Dados inválidos');
            error.name = 'ZodError';
            GrupoUpdateSchema.parse.mockImplementation(() => {
                throw error;
            });

            await expect(Grupo.atualizar(req, res)).rejects.toThrow('Dados inválidos');
            expect(GrupoIdSchema.parse).toHaveBeenCalledWith(id);
            expect(GrupoUpdateSchema.parse).toHaveBeenCalledWith(req.body);
            expect(Grupo.service.atualizar).not.toHaveBeenCalled();
        });
    });

    describe('deletar', () => {
        it('deve deletar um grupo com ID válido', async () => {
            const id = 'abc123';
            req.params.id = id;
            const mockResult = { message: 'Grupo deletado com sucesso' };

            Grupo.service.deletar.mockResolvedValue(mockResult);

            await Grupo.deletar(req, res);

            expect(Grupo.service.deletar).toHaveBeenCalledWith(id);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                res,
                mockResult,
                200,
                'Grupo excluído com sucesso.'
            );
        });

        it('deve lançar erro se ID não for fornecido', async () => {
            req.params = {};

            await expect(Grupo.deletar(req, res)).rejects.toThrow();
            expect(Grupo.service.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se ID for null', async () => {
            req.params.id = null;

            await expect(Grupo.deletar(req, res)).rejects.toThrow();
            expect(Grupo.service.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se ID for undefined', async () => {
            req.params.id = undefined;

            await expect(Grupo.deletar(req, res)).rejects.toThrow();
            expect(Grupo.service.deletar).not.toHaveBeenCalled();
        });

        it('deve lançar erro se params for null', async () => {
            req.params = null;

            await expect(Grupo.deletar(req, res)).rejects.toThrow();
            expect(Grupo.service.deletar).not.toHaveBeenCalled();
        });
    });

    describe('constructor', () => {
        it('deve inicializar com GrupoService', () => {
            const newController = new GrupoController();
            expect(newController.service).toBeInstanceOf(GrupoService);
        });
    });
});
