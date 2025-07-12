import UsuarioService from "../../../services/UsuarioService.js";
import UsuarioRepository from "../../../repositories/UsuarioRepository.js"
import { afterEach, beforeEach, describe, expect, jest } from "@jest/globals";
import { CustomError, messages } from "../../../utils/helpers/index.js";
import { it } from '@jest/globals';
jest.mock('../../../repositories/UsuarioRepository.js')

describe('UsuarioService', () => {
    let usuarioService;
    let repositoryMock;
    let req, res;
    beforeEach(() => {
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        repositoryMock = new UsuarioRepository();
        usuarioService = new UsuarioService(repositoryMock);
    });
    afterEach(() => {
        jest.clearAllMocks()
    });
    describe('listar', () => {
        it('deve listar todos os clientes', async () => {
            const mockData = [{
                id: '67959501ea0999e0a0fa9f58',
                nome: 'Usuario'
            }]
            usuarioService.model.listar.mockResolvedValue(mockData);
            const resultado = await usuarioService.listar(req)
            expect(usuarioService.model.listar).toHaveBeenCalled();
            expect(resultado).toEqual(mockData)
        });
        it('deve listar por id', async () => {
            const mockData = {
                id: '67959501ea0999e0a0fa9f58',
                nome: 'Usuario'
            }
            req.params = { id: '67959501ea0999e0a0fa9f58' }
            usuarioService.model.listar.mockResolvedValue(mockData)
            const resultado = await usuarioService.listar(req)
            expect(usuarioService.model.listar).toHaveBeenCalledWith(req);
            expect(resultado).toEqual(mockData)
        });
        it('deve listar por params', async () => {
            const mockData = {
                id: '67959501ea0999e0a0fa9f58',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                status: 'ativo',
                tipoUsuario: 'admin'
            }
            req.query = {
                nome: 'Usuario'
            }
            usuarioService.model.listar.mockResolvedValue(mockData)
            const resultado = await usuarioService.listar(req)
            expect(usuarioService.model.listar).toHaveBeenCalledWith(req)
            expect(resultado).toEqual(mockData)
        });
    });
    describe('criar', () => {
        it('deve criar um usuário válido', async () => {
            const mockData = {
                nome: "TESTE",
                email: "teste1234@gmail.com",
                telefone: "(69) 99999-8888",
                senha: "Laravel@123",
                dataNascimento: "2000-08-08",
                CPF: "96945788253",
                status: "ativo",
                tipoUsuario: "usuario",
                fotoUsuario: "http://lorempixel.com/640/480"
            }
            
            const verificaGrupos = { ...mockData, grupos: [] }; // Mock do resultado de verificaGrupos
            
            req.body = mockData
            usuarioService.model.buscarPorCpf.mockResolvedValue(null)
            usuarioService.model.buscarPorEmail.mockResolvedValue(null)
            usuarioService.model.buscarPorTelefone.mockResolvedValue(null)
            usuarioService.model.verificaGrupos.mockResolvedValue(verificaGrupos)
            usuarioService.model.cadastrarUsuario.mockResolvedValue({ id: '67959501ea0999e0a0fa9f58', ...verificaGrupos })
            
            const resultado = await usuarioService.cadastrarUsuario(mockData)
            
            expect(resultado).toHaveProperty('id')
            expect(usuarioService.model.buscarPorCpf).toHaveBeenCalledWith(mockData.CPF)
            expect(usuarioService.model.buscarPorEmail).toHaveBeenCalledWith(mockData.email)
            expect(usuarioService.model.buscarPorTelefone).toHaveBeenCalledWith(mockData.telefone)
            expect(usuarioService.model.verificaGrupos).toHaveBeenCalledWith(mockData)
            expect(usuarioService.model.cadastrarUsuario).toHaveBeenCalledWith(verificaGrupos)
        });
        it("deve lançar um erro se o CPF já estiver em uso", async () => {
            const mockData = {
                nome: "TESTE",
                email: "teste1234@gmail.com",
                telefone: "(69) 99999-8888",
                senha: "Laravel@123",
                dataNascimento: "2000-08-08",
                CPF: "96945788253",
                status: "ativo",
                tipoUsuario: "usuario",
                fotoUsuario: "http://lorempixel.com/640/480"
            };

            req.body = mockData;

            usuarioService.model.buscarPorCpf.mockRejectedValue(new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "CPF")
            })); // Simulando usuário existente
            usuarioService.model.buscarPorEmail.mockResolvedValue(null);
            usuarioService.model.buscarPorTelefone.mockResolvedValue(null);

            await expect(usuarioService.cadastrarUsuario(mockData)).rejects.toThrowErrorMatchingInlineSnapshot(`"Conflito de recurso em Usuário contém CPF."`)
            expect(usuarioService.model.buscarPorCpf).toHaveBeenCalledWith(mockData.CPF)
        })
        it('deve lançar um erro se o E-mail já estiver em uso', async () => {
            const dataMock = {
                nome: "TESTE",
                email: "teste1234@gmail.com",
                telefone: "(69) 99999-8888",
                senha: "Laravel@123",
                dataNascimento: "2000-08-08",
                CPF: "96945788253",
                status: "ativo",
                tipoUsuario: "usuario",
                fotoUsuario: "http://lorempixel.com/640/480"
            }

            req.body = dataMock
            usuarioService.model.buscarPorCpf.mockResolvedValue(null)
            usuarioService.model.buscarPorEmail.mockRejectedValue(new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "E-mail")
            }))
            usuarioService.model.buscarPorTelefone.mockResolvedValue(null)
            await expect(usuarioService.cadastrarUsuario(dataMock)).rejects.toThrowErrorMatchingInlineSnapshot(`"Conflito de recurso em Usuário contém E-mail."`)
        });
        it('deve lançar um erro se o telefone já estiver em uso', async () => {
            const mockData = {
                nome: "TESTE",
                email: "teste1234@gmail.com",
                telefone: "(69) 99999-8888",
                senha: "Laravel@123",
                dataNascimento: "2000-08-08",
                CPF: "96945788253",
                status: "ativo",
                tipoUsuario: "usuario",
                fotoUsuario: "http://lorempixel.com/640/480"
            }
            req.body = mockData
            usuarioService.model.buscarPorCpf.mockResolvedValue(null)
            usuarioService.model.buscarPorEmail.mockResolvedValue(null)
            usuarioService.model.buscarPorTelefone.mockRejectedValue(new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "Telefone")

            }));
            await expect(usuarioService.cadastrarUsuario(mockData)).rejects.toThrow(CustomError)
            // await expect(usuarioService.cadastrarUsuario(mockData)).rejects.toThrowErrorMatchingInlineSnapshot(`"Conflito de recurso em Usuário contém Telefone."`)
        });

    });
    describe('atualizar', () => {
        it('deve atualizar todos os campos permitidos pela regra de negócios de usuário com todas as credenciais válidas', async () => {
            const mockData = {
                nome: "Usuario Atualizado",
                telefone: "(69) 8888-7777",
                email: "novo@gmail.com",
                fotoUsuario: "http://lorempixel.com/780/560"
            }
            const id = '67959501ea0999e0a0fa9f58'
            req.body = mockData
            req.params = { id }
            usuarioService.model.buscarPorEmail.mockResolvedValue(null)
            usuarioService.model.buscarPorTelefone.mockResolvedValue(null)
            usuarioService.model.updateUsuario.mockResolvedValue({ _id: id, ...mockData })
            const resultado = await usuarioService.updateUsuario(id, mockData)
            expect(resultado).toEqual({ _id: id, ...mockData })
        });
        it('deve atualizar parte dos dados de um usuário com credenciais válidas', async () => {
            const mockData = {
                nome: "Usuario Atualizado",
                email: "novo@gmail.com",
                telefone: "(69) 8888-7777",
                fotoUsuario: "http://lorempixel.com/780/560"
            }
            const mockDataAtualizado = { ...mockData, nome: "Novo Nome" }
            const id = '67959501ea0999e0a0fa9f58'
            req.body = mockDataAtualizado
            req.params = { id }
            usuarioService.model.buscarPorEmail.mockResolvedValue(null)
            usuarioService.model.buscarPorTelefone.mockResolvedValue(null)
            usuarioService.model.updateUsuario.mockResolvedValue({ _id: id, ...mockDataAtualizado })
            const resultado = await usuarioService.updateUsuario(id, mockDataAtualizado)
            expect(resultado).toEqual({ _id: id, ...mockDataAtualizado })
        });
        it('deve retornar um erro ao tentar atualizar o email já persistente em outro usuário', async () => {
            const mockData = {
                nome: "Usuario Atualizado",
                email: "novo@gmail.com",
                telefone: "(69) 8888-7777",
                fotoUsuario: "http://lorempixel.com/780/560"
            }
            const id = '67959501ea0999e0a0fa9f58'
            req.params = { id }
            usuarioService.model.buscarPorEmail.mockRejectedValue(new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "E-mail")
            }))
            usuarioService.model.buscarPorTelefone.mockResolvedValue(null)
            await expect(usuarioService.updateUsuario(id, mockData)).rejects.toThrow(CustomError)
            // await expect(usuarioService.updateUsuario(id, mockData)).rejects.toThrowErrorMatchingInlineSnapshot(`"Conflito de recurso em Usuário contém E-mail."`)
        });
        it('deve retornar um erro ao tentar atualizar o telefone já persistente em outro usuário', async () => {
            const mockData = {
                nome: "Usuario Atualizado",
                email: "novo@gmail.com",
                telefone: "(69) 8888-7777",
                fotoUsuario: "http://lorempixel.com/780/560"
            }
            const id = '67959501ea0999e0a0fa9f58'
            req.params = { id }
            usuarioService.model.buscarPorEmail.mockResolvedValue(null)
            usuarioService.model.buscarPorTelefone.mockRejectedValue(new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "Telefone")
            }))
            await expect(usuarioService.updateUsuario(id, mockData)).rejects.toThrow(CustomError)
            // await expect(usuarioService.updateUsuario(id, mockData)).rejects.toThrowErrorMatchingInlineSnapshot(`"Conflito de recurso em Usuário contém Telefone."`)
        });
    });
    describe('alterarStatus', () => {
        it('deve alterar status com sucesso quando usuário tem permissão', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: '67959501ea0999e0a0fa9f59', // ID diferente do usuário a ser alterado
                nivelPermissao: 1 
            };
            
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 2 } // Nível maior que o usuário solicitante (menor permissão)
                ]
            };
            
            const mockUpdatedUser = { ...mockUser, ativo: false };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            usuarioService.model.alterarStatus.mockResolvedValue(mockUpdatedUser);
            
            const resultado = await usuarioService.alterarStatus(userId, parseData, reqData);
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.alterarStatus).toHaveBeenCalledWith(userId, parseData);
            expect(resultado).toEqual(mockUpdatedUser);
        });

        it('deve lançar erro quando usuário tenta alterar próprio status', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: userId, // Mesmo ID do usuário a ser alterado
                nivelPermissao: 1 
            };
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow(CustomError);
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow('Não pode alterar o status de si mesmo.');
        });

        it('deve lançar erro quando usuário não tem permissão suficiente', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 3 // Nível maior (menor permissão)
            };
            
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 1 } // Nível menor ou igual ao solicitante (maior permissão)
                ]
            };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow(CustomError);
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow(messages.error.unauthorized("Permissão"));
        });

        it('deve permitir alteração quando todos os grupos têm nível maior que o solicitante', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 1 
            };
            
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 2 }, // Nível maior que o solicitante (menor permissão)
                    { nivelPermissao: 3 }  // Nível maior que o solicitante (menor permissão)
                ]
            };
            
            const mockUpdatedUser = { ...mockUser, ativo: false };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            usuarioService.model.alterarStatus.mockResolvedValue(mockUpdatedUser);
            
            const resultado = await usuarioService.alterarStatus(userId, parseData, reqData);
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.alterarStatus).toHaveBeenCalledWith(userId, parseData);
            expect(resultado).toEqual(mockUpdatedUser);
        });

        it('deve lançar erro quando nenhum grupo tem permissão', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 3 
            };
            
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 1 }, // Menor ou igual ao solicitante (sem permissão)
                    { nivelPermissao: 2 }  // Menor ou igual ao solicitante (sem permissão)
                ]
            };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow(CustomError);
        });

        it('deve propagar erro do repository.buscarPorId', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 1 
            };
            
            usuarioService.model.buscarPorId.mockRejectedValue(new Error('Usuário não encontrado'));
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow('Usuário não encontrado');
        });

        it('deve propagar erro do repository.alterarStatus', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parseData = { ativo: false };
            const reqData = { 
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 1 
            };
            
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 2 }
                ]
            };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            usuarioService.model.alterarStatus.mockRejectedValue(new Error('Erro ao alterar status'));
            
            await expect(usuarioService.alterarStatus(userId, parseData, reqData))
                .rejects.toThrow('Erro ao alterar status');
        });
    });
    describe('getFoto', () => {
        it('deve retornar caminho da foto quando usuário existe e foto está presente', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                fotoUsuario: 'uploads/usuarios/foto123.jpg'
            };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            
            // Mock do fs.existsSync para retornar true
            const fs = require('fs');
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            
            const resultado = await usuarioService.getFoto(userId);
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(fs.existsSync).toHaveBeenCalledWith(mockUser.fotoUsuario);
            expect(resultado).toBe(mockUser.fotoUsuario);
            
            // Limpar o mock
            fs.existsSync.mockRestore();
        });

        it('deve lançar erro quando foto não existe no sistema de arquivos', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                fotoUsuario: 'uploads/usuarios/foto_inexistente.jpg'
            };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            
            // Mock do fs.existsSync para retornar false
            const fs = require('fs');
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            
            await expect(usuarioService.getFoto(userId))
                .rejects.toThrow(CustomError);
            
            await expect(usuarioService.getFoto(userId))
                .rejects.toThrow('Foto não encontrada.');
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(fs.existsSync).toHaveBeenCalledWith(mockUser.fotoUsuario);
            
            // Limpar o mock
            fs.existsSync.mockRestore();
        });

        it('deve propagar erro quando usuário não é encontrado', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            
            usuarioService.model.buscarPorId.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: "Usuário não encontrado"
            }));
            
            await expect(usuarioService.getFoto(userId))
                .rejects.toThrow(CustomError);
            
            await expect(usuarioService.getFoto(userId))
                .rejects.toThrow('Usuário não encontrado');
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
        });
    });
    describe('getPerfil', () => {
        it('deve retornar perfil do usuário com sucesso', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const mockUser = {
                _id: userId,
                nome: 'João Silva',
                email: 'joao@teste.com',
                CPF: '123.456.789-00',
                telefone: '(69) 99999-9999',
                dataNascimento: '1990-01-01',
                fotoUsuario: 'uploads/usuarios/foto.jpg',
                notaMedia: 4.5,
                accessToken: 'token123',
                refreshToken: 'refreshToken123',
                grupos: [
                    { nome: 'Administrador' },
                    { nome: 'Usuario' }
                ],
                toObject: jest.fn().mockReturnValue({
                    _id: userId,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    CPF: '123.456.789-00',
                    telefone: '(69) 99999-9999',
                    dataNascimento: '1990-01-01',
                    fotoUsuario: 'uploads/usuarios/foto.jpg',
                    notaMedia: 4.5,
                    accessToken: 'token123',
                    refreshToken: 'refreshToken123',
                    grupos: [
                        { nome: 'Administrador' },
                        { nome: 'Usuario' }
                    ]
                })
            };

            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);

            const resultado = await usuarioService.getPerfil(userId);

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(resultado).toEqual({
                nome: 'João Silva',
                email: 'joao@teste.com',
                CPF: '123.456.789-00',
                telefone: '(69) 99999-9999',
                dataNascimento: '1990-01-01',
                fotoUsuario: 'uploads/usuarios/foto.jpg',
                notaMedia: 4.5,
                grupos: ['Administrador', 'Usuario']
            });
            expect(resultado).not.toHaveProperty('accessToken');
            expect(resultado).not.toHaveProperty('refreshToken');
        });

        it('deve propagar erro quando usuário não é encontrado', async () => {
            const userId = '67959501ea0999e0a0fa9f58';

            usuarioService.model.buscarPorId.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: "Usuário não encontrado"
            }));

            await expect(usuarioService.getPerfil(userId))
                .rejects.toThrow(CustomError);

            await expect(usuarioService.getPerfil(userId))
                .rejects.toThrow('Usuário não encontrado');

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
        });
    });
    describe('updatePerfil', () => {
        it('deve atualizar perfil do usuário com sucesso', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parsedData = {
                nome: 'João Silva Atualizado',
                telefone: '(69) 88888-8888'
            };

            const mockUpdatedUser = {
                _id: userId,
                nome: 'João Silva Atualizado',
                email: 'joao@teste.com',
                CPF: '123.456.789-00',
                telefone: '(69) 88888-8888',
                dataNascimento: '1990-01-01',
                fotoUsuario: 'uploads/usuarios/foto.jpg',
                notaMedia: 4.5,
                accessToken: 'token123',
                refreshToken: 'refreshToken123',
                grupos: [
                    { nome: 'Administrador' },
                    { nome: 'Usuario' }
                ],
                toObject: jest.fn().mockReturnValue({
                    _id: userId,
                    nome: 'João Silva Atualizado',
                    email: 'joao@teste.com',
                    CPF: '123.456.789-00',
                    telefone: '(69) 88888-8888',
                    dataNascimento: '1990-01-01',
                    fotoUsuario: 'uploads/usuarios/foto.jpg',
                    notaMedia: 4.5,
                    accessToken: 'token123',
                    refreshToken: 'refreshToken123',
                    grupos: [
                        { nome: 'Administrador' },
                        { nome: 'Usuario' }
                    ]
                })
            };

            usuarioService.model.updateUsuario.mockResolvedValue(mockUpdatedUser);

            const resultado = await usuarioService.updatePerfil(userId, parsedData);

            expect(usuarioService.model.updateUsuario).toHaveBeenCalledWith(userId, {
                nome: 'João Silva Atualizado',
                telefone: '(69) 88888-8888'
            });
            expect(resultado).toEqual({
                nome: 'João Silva Atualizado',
                email: 'joao@teste.com',
                telefone: '(69) 88888-8888',
                dataNascimento: '1990-01-01',
                CPF: '123.456.789-00',
                fotoUsuario: 'uploads/usuarios/foto.jpg',
                notaMedia: 4.5,
                grupos: ['Administrador', 'Usuario']
            });
            expect(resultado).not.toHaveProperty('accessToken');
            expect(resultado).not.toHaveProperty('refreshToken');
        });

        it('deve atualizar apenas nome quando só nome é fornecido', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parsedData = {
                nome: 'João Silva Novo Nome'
            };

            const mockUpdatedUser = {
                _id: userId,
                nome: 'João Silva Novo Nome',
                email: 'joao@teste.com',
                CPF: '123.456.789-00',
                telefone: '(69) 99999-9999',
                dataNascimento: '1990-01-01',
                fotoUsuario: 'uploads/usuarios/foto.jpg',
                notaMedia: 4.5,
                accessToken: 'token123',
                refreshToken: 'refreshToken123',
                grupos: [
                    { nome: 'Usuario' }
                ],
                toObject: jest.fn().mockReturnValue({
                    _id: userId,
                    nome: 'João Silva Novo Nome',
                    email: 'joao@teste.com',
                    CPF: '123.456.789-00',
                    telefone: '(69) 99999-9999',
                    dataNascimento: '1990-01-01',
                    fotoUsuario: 'uploads/usuarios/foto.jpg',
                    notaMedia: 4.5,
                    accessToken: 'token123',
                    refreshToken: 'refreshToken123',
                    grupos: [
                        { nome: 'Usuario' }
                    ]
                })
            };

            usuarioService.model.updateUsuario.mockResolvedValue(mockUpdatedUser);

            const resultado = await usuarioService.updatePerfil(userId, parsedData);

            expect(usuarioService.model.updateUsuario).toHaveBeenCalledWith(userId, {
                nome: 'João Silva Novo Nome',
                telefone: undefined
            });
            expect(resultado).toEqual({
                nome: 'João Silva Novo Nome',
                email: 'joao@teste.com',
                telefone: undefined,
                dataNascimento: '1990-01-01',
                CPF: '123.456.789-00',
                fotoUsuario: 'uploads/usuarios/foto.jpg',
                notaMedia: 4.5,
                grupos: ['Usuario']
            });
        });

        it('deve propagar erro do repository.updateUsuario', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const parsedData = {
                nome: 'João Silva Atualizado',
                telefone: '(69) 88888-8888'
            };

            usuarioService.model.updateUsuario.mockRejectedValue(new Error('Erro ao atualizar usuário'));

            await expect(usuarioService.updatePerfil(userId, parsedData))
                .rejects.toThrow('Erro ao atualizar usuário');

            expect(usuarioService.model.updateUsuario).toHaveBeenCalledWith(userId, {
                nome: 'João Silva Atualizado',
                telefone: '(69) 88888-8888'
            });
        });
    });
    describe('deletarUsuario', () => {
        it('deve deletar usuário com sucesso quando usuário tem permissão', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const reqData = {
                user_id: '67959501ea0999e0a0fa9f59', // ID diferente do usuário a ser deletado
                nivelPermissao: 1
            };

            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                email: 'teste@email.com',
                grupos: [
                    { nivelPermissao: 2 } // Nível maior que o usuário solicitante (menor permissão)
                ]
            };

            const mockDeletedUser = {
                _id: userId,
                nome: 'Usuario Teste',
                email: 'teste@email.com',
                deletedCount: 1
            };

            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            usuarioService.model.deletarUsuario.mockResolvedValue(mockDeletedUser);

            const resultado = await usuarioService.deletarUsuario(reqData, userId);

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.deletarUsuario).toHaveBeenCalledWith(userId);
            expect(resultado).toEqual(mockDeletedUser);
        });

        it('deve lançar erro quando usuário tenta deletar a si mesmo', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const reqData = {
                user_id: userId, // Mesmo ID do usuário a ser deletado
                nivelPermissao: 1
            };

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow(CustomError);

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow('Não pode alterar o status de si mesmo.');

            expect(usuarioService.model.buscarPorId).not.toHaveBeenCalled();
            expect(usuarioService.model.deletarUsuario).not.toHaveBeenCalled();
        });

        it('deve lançar erro quando usuário não tem permissão suficiente', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const reqData = {
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 3 // Nível maior (menor permissão)
            };

            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 1 } // Nível menor ou igual ao solicitante (maior permissão)
                ]
            };

            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow(CustomError);

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow(messages.error.unauthorized("Permissão"));

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.deletarUsuario).not.toHaveBeenCalled();
        });

        it('deve permitir deleção quando todos os grupos têm nível maior que o solicitante', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const reqData = {
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 1
            };

            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 2 }, // Nível maior que o solicitante (menor permissão)
                    { nivelPermissao: 3 }  // Nível maior que o solicitante (menor permissão)
                ]
            };

            const mockDeletedUser = {
                _id: userId,
                nome: 'Usuario Teste',
                deletedCount: 1
            };

            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            usuarioService.model.deletarUsuario.mockResolvedValue(mockDeletedUser);

            const resultado = await usuarioService.deletarUsuario(reqData, userId);

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.deletarUsuario).toHaveBeenCalledWith(userId);
            expect(resultado).toEqual(mockDeletedUser);
        });

        it('deve propagar erro quando usuário não é encontrado', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const reqData = {
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 1
            };

            usuarioService.model.buscarPorId.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: "Usuário não encontrado"
            }));

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow(CustomError);

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow('Usuário não encontrado');

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.deletarUsuario).not.toHaveBeenCalled();
        });

        it('deve propagar erro do repository.deletarUsuario', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const reqData = {
                user_id: '67959501ea0999e0a0fa9f59',
                nivelPermissao: 1
            };

            const mockUser = {
                _id: userId,
                nome: 'Usuario Teste',
                grupos: [
                    { nivelPermissao: 2 }
                ]
            };

            usuarioService.model.buscarPorId.mockResolvedValue(mockUser);
            usuarioService.model.deletarUsuario.mockRejectedValue(new Error('Erro ao deletar usuário'));

            await expect(usuarioService.deletarUsuario(reqData, userId))
                .rejects.toThrow('Erro ao deletar usuário');

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.deletarUsuario).toHaveBeenCalledWith(userId);
        });
    });
    describe('atualizarFotoUsuario', () => {
        it('deve atualizar foto do usuário com sucesso', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const nomeArquivo = 'foto123.jpg';
            const metadadosFoto = {
                url: 'http://localhost:3000/uploads/usuarios/foto123.jpg',
                largura: 640,
                altura: 480,
                tamanhoMb: 1.5
            };
            
            const mockUsuarioExistente = {
                _id: userId,
                nome: 'Usuario Teste',
                email: 'teste@email.com'
            };
            
            const mockUsuarioAtualizado = {
                ...mockUsuarioExistente,
                fotoUsuario: 'uploads/usuarios/foto123.jpg'
            };
            
            usuarioService.model.buscarPorId.mockResolvedValue(mockUsuarioExistente);
            usuarioService.model.atualizar.mockResolvedValue(mockUsuarioAtualizado);
            
            const resultado = await usuarioService.atualizarFotoUsuario(userId, nomeArquivo, metadadosFoto);
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.atualizar).toHaveBeenCalledWith(userId, {
                fotoUsuario: 'uploads/usuarios/foto123.jpg'
            });
            expect(resultado).toHaveProperty('id', mockUsuarioAtualizado._id);
            expect(resultado).toHaveProperty('metadados', metadadosFoto);
        });

        it('deve lançar erro quando usuário não é encontrado', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const nomeArquivo = 'foto123.jpg';
            const metadadosFoto = { url: 'test.jpg' };
            
            usuarioService.model.buscarPorId.mockResolvedValue(null);
            
            await expect(usuarioService.atualizarFotoUsuario(userId, nomeArquivo, metadadosFoto))
                .rejects.toThrow(CustomError);
            
            await expect(usuarioService.atualizarFotoUsuario(userId, nomeArquivo, metadadosFoto))
                .rejects.toThrow('Usuário não encontrado.');
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.atualizar).not.toHaveBeenCalled();
        });
    });
    describe('removerFoto', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('deve remover foto do usuário com sucesso', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const fotoPath = 'uploads/usuarios/foto.jpg';
            const usuario = {
                _id: userId,
                nome: 'João Silva',
                email: 'joao@teste.com',
                fotoUsuario: fotoPath
            };
            const usuarioAtualizado = {
                ...usuario,
                fotoUsuario: null
            };

            // Mock para verificar se arquivo existe
            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
            // Mock para remover arquivo
            jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {});
            
            usuarioService.model.buscarPorId.mockResolvedValue(usuario);
            usuarioService.model.updateUsuario.mockResolvedValue(usuarioAtualizado);

            const resultado = await usuarioService.removerFoto(userId);

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(require('fs').existsSync).toHaveBeenCalledWith(fotoPath);
            expect(require('fs').unlinkSync).toHaveBeenCalledWith(fotoPath);
            expect(usuarioService.model.updateUsuario).toHaveBeenCalledWith(userId, { fotoUsuario: null });
            expect(resultado).toEqual(usuarioAtualizado);
        });

        it('deve lançar erro quando usuário não é encontrado', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            
            usuarioService.model.buscarPorId.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado.'
            }));

            await expect(usuarioService.removerFoto(userId))
                .rejects.toThrow(CustomError);
            
            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(usuarioService.model.updateUsuario).not.toHaveBeenCalled();
        });

        it('deve lançar erro quando foto não existe no sistema de arquivos', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const fotoPath = 'uploads/usuarios/foto_inexistente.jpg';
            const usuario = {
                _id: userId,
                nome: 'João Silva',
                email: 'joao@teste.com',
                fotoUsuario: fotoPath
            };

            // Mock para verificar se arquivo não existe
            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);
            
            usuarioService.model.buscarPorId.mockResolvedValue(usuario);

            await expect(usuarioService.removerFoto(userId))
                .rejects.toThrow(CustomError);
            
            await expect(usuarioService.removerFoto(userId))
                .rejects.toThrow('Foto não encontrada.');

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(require('fs').existsSync).toHaveBeenCalledWith(fotoPath);
            expect(usuarioService.model.updateUsuario).not.toHaveBeenCalled();
        });

        it('deve lançar erro quando falha ao remover arquivo do sistema', async () => {
            const userId = '67959501ea0999e0a0fa9f58';
            const fotoPath = 'uploads/usuarios/foto.jpg';
            const usuario = {
                _id: userId,
                nome: 'João Silva',
                email: 'joao@teste.com',
                fotoUsuario: fotoPath
            };

            // Mock para verificar se arquivo existe
            jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
            // Mock para simular erro ao remover arquivo
            jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {
                throw new Error('Erro ao remover arquivo');
            });
            
            usuarioService.model.buscarPorId.mockResolvedValue(usuario);

            await expect(usuarioService.removerFoto(userId))
                .rejects.toThrow('Erro ao remover arquivo');

            expect(usuarioService.model.buscarPorId).toHaveBeenCalledWith(userId);
            expect(require('fs').existsSync).toHaveBeenCalledWith(fotoPath);
            expect(require('fs').unlinkSync).toHaveBeenCalledWith(fotoPath);
            expect(usuarioService.model.updateUsuario).not.toHaveBeenCalled();
        });
    });
});
