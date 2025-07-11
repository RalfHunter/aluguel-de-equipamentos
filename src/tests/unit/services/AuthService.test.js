import AuthService from '../../../services/AuthService.js';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js'
import CustomError from '../../../utils/helpers/CustomError.js';
import messages from "../../../utils/helpers/messages.js"
import jwt from 'jsonwebtoken';
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
import bcrypt from 'bcrypt';
jest.mock('../../../utils/TokenUtil.js')
jest.mock('../../../utils/helpers/messages.js')
jest.mock('../../../utils/helpers/messages.js')
jest.mock('../../../repositories/UsuarioRepository.js'); // Mockando o repositório
jest.mock('../../../utils/AuthHelper.js'); // Mockando o AuthHelper

// Mock global fetch
global.fetch = jest.fn();

import AuthHelper from '../../../utils/AuthHelper.js';

describe('AuthService - carregatokens', () => {
    let service;
    let usuarioRepository;
    let authRepository;
    let req;
    let tokenUtil;
    let id;
    let token;
    let res;
    // let bcrypt

    beforeEach(() => {
        id = '123'
        token = 'tokenVálido'
        req = {
            body: {}
        }
        usuarioRepository = {
            buscarPorId: jest.fn(),
            buscarPorEmailCadastrado: jest.fn(),
            buscarPorCodigoRecuperacao: jest.fn(),
            buscarPorTokenUnico: jest.fn(),
            atualizar: jest.fn(),
            alterar: jest.fn(),
            atualizarSenha: jest.fn(),
            removeToken: jest.fn(),
            armazenarTokens: jest.fn()
        }
        tokenUtil = {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            generatePasswordRecoveryToken: jest.fn(),
            decodePasswordRecoveryToken: jest.fn(),
            verifyToken: jest.fn()
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        service = new AuthService({ tokenUtil, usuarioRepository });
        messages.error = {
            resourceNotFound: jest.fn((field) => `Recurso não encontrado em ${field}.`),
            unauthorized: jest.fn((field) => `Erro de autorização: ${field}`),
        };
        bcrypt.compare = jest.fn();
        
        // Mock AuthHelper
        AuthHelper.hashPassword = jest.fn().mockResolvedValue('$2b$08$hashedPassword123');
        
        // Setup environment variables for tests
        process.env.MAIL_API_URL = 'https://test-email-service.com';
        process.env.MAIL_API_KEY = 'test-api-key';
        process.env.FRONTEND_URL = 'http://localhost:5013';
        process.env.JWT_SECRET_PASSWORD_RECOVERY = 'test-secret-recovery';
        
        // Mock fetch to return successful response
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Email sent successfully' })
        });
    })
    beforeEach(() => {
        jest.clearAllMocks(); // limpa todos os mocks
    });;
    describe('carregatokens', () => {
        it('Deve carregar os tokens do usuário com sucesso', async () => {
            const mockId = '123';
            const mockTokens = { access_token: 'valid_token', refresh_token: 'refresh_token' };

            service.repository.buscarPorId.mockResolvedValue({ ...mockTokens });

            const result = await service.carregatokens(mockId);

            expect(service.repository.buscarPorId).toHaveBeenCalledWith(mockId, { includeTokens: true });
            expect(result).toEqual({ data: mockTokens });
        });

        it('Deve retornar erro se o usuário não for encontrado', async () => {
            service.repository.buscarPorId.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Usuário")
            }))
            await expect(service.carregatokens('123')).rejects.toMatchObject({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: "Usuário",
                details: [],
                customMessage: 'Recurso não encontrado em Usuário.'
            });
        });
    });
    describe('revoke', () => {
        it('Sucesso ao realizar revoke', async () => {
            const mockData = {
                id: '123',
                nome: 'Fulano',
                nota: 0,
                email: "Witney_Saraiva75@hotmail.com"
            }
            service.repository.buscarPorId.mockResolvedValue(mockData)
            service.repository.removeToken.mockResolvedValue(mockData)
            const resultado = await service.revoke(mockData.id)
            expect(service.repository.buscarPorId).toHaveBeenCalledWith(mockData.id)
            expect(service.repository.removeToken).toHaveBeenCalledWith(mockData.id)
            expect(resultado).toEqual({ message: "Tokens revogados com sucesso." })
        });
        it('falha ao realizar revoke, id passado não existe', async () => {
            const mockData = {
                id: '123',
                nome: 'Fulano',
                nota: 0,
                email: "Witney_Saraiva75@hotmail.com"
            }
            service.repository.removeToken.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            }))
            await expect(service.revoke(null)).rejects.toMatchObject({
                statusCode: 400,
                errorType: 'validationError',
                field: "id",
                details: [],
                customMessage: 'ID do usuário é obrigatório para revogar tokens.'
            });
            // Não deveria chamar o repository quando a validação falha
        });
    });
    describe('logout', () => {
        it('Sucesso ao realizar logout', async () => {
            const mockData = {
                id: '123',
                nome: 'Fulano',
                nota: 0,
                email: "Witney_Saraiva75@hotmail.com",
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorId.mockResolvedValue(mockData)
            service.repository.removeToken.mockResolvedValue(mockData)
            const resultado = await service.logout(mockData.id, 'valid-token')
            expect(service.repository.buscarPorId).toHaveBeenCalledWith(mockData.id)
            expect(service.repository.removeToken).toHaveBeenCalledWith(mockData.id)
            expect(resultado).toEqual({ message: "Logout realizado com sucesso." })
        });
        it('falha ao realizar revoke, id passado não existe', async () => {
            const mockData = {
                id: '123',
                nome: 'Fulano',
                nota: 0,
                email: "Witney_Saraiva75@hotmail.com",
                ativo: true,
                status: "ativo"
            }
            service.repository.removeToken.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            }))
            await expect(service.logout(null)).rejects.toMatchObject({
                statusCode: 400,
                errorType: 'validationError',
                field: "id",
                details: [],
                customMessage: 'ID do usuário é obrigatório para logout.'
            });
            // Não deveria chamar o repository quando a validação falha
        });
    });
    describe('login', () => {
        it('deve realizar login com sucesso', async () => {
            req.body = { email: 'usuario@gmail.com', senha: 'Usuario@1234' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            // A função passada aqui, transforma o objeto javascript em um objeto mongoose
            // Para que pesso ser convertido em objeto javascript novamente, afim de não
            // Quebrar o código na parte: const userObjeto = userLogado.toObject();
            service.repository.buscarPorEmailCadastrado.mockResolvedValue({
                ...mockData, toObject: () => ({
                    _id: '123',
                    nome: 'Usuario',
                    email: 'usuario@gmail.com',
                    senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                    refeshToken: null,
                    accessToken: null,
                    ativo: true,
                status: "ativo"
                })
            })
            bcrypt.compare.mockResolvedValue(true)
            service.repository.buscarPorId.mockResolvedValue(mockData)
            // service.repository.armazenarTokens.mockResolvedValue(mockData)
            const resposta = await service.login(req.body)
            expect(service.repository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
            expect(bcrypt.compare).toHaveBeenCalledWith(req.body.senha, mockData.senha)
            await expect(bcrypt.compare(req.body.senha, mockData.senha)).resolves.toEqual(true)
        });
        it('falha ao realizar login, email não existe', async () => {
            req.body = { email: 'sem@gmail.com', senha: 'Usuario@1234' }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(null)
            await expect(service.login(req.body)).rejects.toMatchObject({
                statusCode: 401,
                errorType: 'notFound',
                field: 'Email',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
            expect(service.repository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
        });
        it('falha ao realizar login, nenhum usuário encontrado, email não existe', async () => {
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(null)
            await expect(service.login(req.body)).rejects.toMatchObject({
                statusCode: 401,
                errorType: 'notFound',
                field: 'Email',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            })
        })
        it('falha ao realizar login, senha não é a mesma', async () => {
            req.body = { email: 'usuario@gmail.com', senha: 'Usuario@12345' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            await expect(service.login(req.body)).rejects.toMatchObject({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'Senha',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
        });
        it('deve falhar ao realizar login, usuário não é ativo', async () => {
            req.body = { email: 'usuario@gmail.com', senha: 'Usuario@1234' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                status: 'inativo'
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            bcrypt.compare.mockResolvedValue(true)
            await expect(service.login(req.body)).rejects.toMatchObject({
                statusCode: 403,
                errorType: 'unauthorized',
                field: 'Status',
                details: [],
                customMessage: "Está conta foi desativada por um administrador por violação de contrato."
            });
        });
        it('deve falhar ao realizar login, falha ao gerar accessToken', async () => {
            req.body = { email: 'usuario@gmail.com', senha: 'Usuario@1234' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            bcrypt.compare.mockResolvedValue(true)
            service.TokenUtil.generateAccessToken.mockRejectedValue(new Error("Erro no TokenUtil"))
            await expect(service.login(req.body)).rejects.toThrow("Erro no TokenUtil")

        });
        it('não deve gerar novo refreshToken se o atual for válido', async () => {
            const mockUser = {
                _id: '123',
                refreshToken: 'token.valido',
                ativo: true,
                status: "ativo",
                toObject: () => ({ _id: '123', refreshToken: 'token.valido' })
            };

            jwt.verify.mockReturnValue(true); // token válido

            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockUser);
            service.repository.buscarPorId.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            service.TokenUtil.generateAccessToken.mockResolvedValue('access');

            const result = await service.login({ email: 'email@email.com', senha: 'Senha@1234' });

            expect(jwt.verify).toHaveBeenCalledWith('token.valido', process.env.JWT_SECRET_REFRESH_TOKEN);
            expect(service.TokenUtil.generateRefreshToken).not.toHaveBeenCalled();
            expect(result.user.refreshToken).toBe('token.valido');
        });
        it('deve lançar erro 500 se refreshToken der erro desconhecido ao validar', async () => {
            const mockUser = {
                _id: '123',
                ativo: true,
                status: "ativo",
                refreshToken: 'token.invalido',
                toObject: () => ({ _id: '123', refreshToken: 'token.invalido' })
            };

            jwt.verify.mockImplementation(() => {
                const err = new Error('Erro estranho');
                err.name = 'OutraCoisa';
                throw err;
            });

            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockUser);
            service.repository.buscarPorId.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            service.TokenUtil.generateAccessToken.mockResolvedValue('access');

            await expect(service.login({ email: 'email@email.com', senha: 'Senha@1234' }))
                .rejects.toMatchObject({
                    statusCode: 500,
                    errorType: 'serverError',
                    field: 'Token',
                    customMessage: 'Erro de autorização: falha na geração do token'
                });
        });
        it('try catch deve retornar error.name =TokenExpiredError', async () => {
            req.body = { email: 'usuario@gmail.com', senha: 'Usuario@1234' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            // A função passada aqui, transforma o objeto javascript em um objeto mongoose
            // Para que pesso ser convertido em objeto javascript novamente, afim de não
            // Quebrar o código na parte: const userObjeto = userLogado.toObject();
            service.repository.buscarPorEmailCadastrado.mockResolvedValue({
                ...mockData, toObject: () => ({
                    _id: '123',
                    nome: 'Usuario',
                    email: 'usuario@gmail.com',
                    senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                    refeshToken: 'token válido',
                    accessToken: null,
                    ativo: true,
                status: "ativo"
                })
            })
            bcrypt.compare.mockResolvedValue(true)
            service.repository.buscarPorId.mockResolvedValue(mockData)
            jwt.verify.mockImplementation(() => {
                const error = new Error('Token expirado');
                error.name = 'TokenExpiredError';
                throw error;
            });

            // service.repository.armazenarTokens.mockResolvedValue(mockData)
            await service.login(req.body)
        });
        it('try catch deve retornar error.name =TokenExpiredError', async () => {
            req.body = { email: 'usuario@gmail.com', senha: 'Usuario@1234' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: 'token válido',
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            // A função passada aqui, transforma o objeto javascript em um objeto mongoose
            // Para que pesso ser convertido em objeto javascript novamente, afim de não
            // Quebrar o código na parte: const userObjeto = userLogado.toObject();
            service.repository.buscarPorEmailCadastrado.mockResolvedValue({
                ...mockData, toObject: () => ({
                    _id: '123',
                    nome: 'Usuario',
                    email: 'usuario@gmail.com',
                    senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                    refeshToken: null,
                    accessToken: null,
                    ativo: true,
                status: "ativo"
                })
            })
            bcrypt.compare.mockResolvedValue(true)
            service.repository.buscarPorId.mockResolvedValue(mockData)
            jwt.verify.mockImplementation(() => {
                const error = new Error('Token inválido');
                error.name = 'JsonWebTokenError';
                throw error;
            });
            // service.repository.armazenarTokens.mockResolvedValue(mockData)
            await service.login(req.body)
        });
    });
    describe('refresh', () => {
        it('sucesso ao realizar refresh', async () => {
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: 'valid-token',
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorId.mockResolvedValue({
                ...mockData, toObject: () => ({
                    _id: '123',
                    nome: 'Usuario',
                    email: 'usuario@gmail.com',
                    senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                    refreshToken: 'valid-token',
                    accessToken: null,
                    ativo: true,
                status: "ativo"
                })
            })
            service.TokenUtil.generateAccessToken.mockResolvedValue(true)

            await expect(service.refresh(mockData._id, 'valid-token')).resolves.toMatchObject({ user: mockData })
        });
        it('deve gerar novo refreshToken se SINGLE_SESSION_REFRESH_TOKEN for true', async () => {
            process.env.SINGLE_SESSION_REFRESH_TOKEN = 'true';

            const mockUser = {
                _id: '123',
                refreshToken: 'token-antigo',
                senha: 'senha',
                ativo: true,
                status: "ativo",
                toObject: () => ({ _id: '123', refreshToken: 'token-antigo', ativo: true,
                status: "ativo" })
            };

            service.repository.buscarPorId.mockResolvedValue(mockUser);
            service.TokenUtil.generateAccessToken.mockResolvedValue('novo-access');
            service.TokenUtil.generateRefreshToken.mockResolvedValue('novo-refresh');

            const result = await service.refresh('123', 'token-antigo');

            expect(service.TokenUtil.generateRefreshToken).toHaveBeenCalledWith('123');
            expect(service.repository.armazenarTokens).toHaveBeenCalledWith('123', 'novo-access', 'novo-refresh');
            expect(result.user.refreshtoken).toBe('novo-refresh');
        });
        it('erro ao realizar refresh, usuário é null', async () => {
            service.repository.buscarPorId.mockResolvedValue(null)
            await expect(service.refresh(id, token)).rejects.toThrowErrorMatchingInlineSnapshot(`"Usuário não encontrado para renovação de token."`)
            expect(service.repository.buscarPorId).toHaveBeenCalledWith(id, { includeTokens: true })
        });
        it('erro ao relizar refresh, usuário com refreshToken diferente de token', async () => {
            const mockUser = {
                _id: '123',
                refreshToken: 'token-diferente',
                senha: 'senha',
                ativo: true,
                status: "ativo",
                toObject: () => ({ _id: '123', refreshToken: 'token-diferente', ativo: true,
                status: "ativo" })
            };
            service.repository.buscarPorId.mockResolvedValue(mockUser)

            await expect(service.refresh(id, token)).rejects.toThrow(CustomError)
            try {
                await service.refresh(id, token)
            } catch (err) {
                expect(err.statusCode).toEqual(401)
                expect(err.errorType).toEqual('invalidToken')
                expect(err.field).toEqual('Token')
                expect(err.customMessage).toContain('Refresh token inválido')
            }
        })

    });
    describe('recuperarSenha', () => {
        it('deve realizar a recuperação de senha com sucesso', async () => {
            req.body = { email: 'usuario@gmail.com' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            service.repository.buscarPorCodigoRecuperacao.mockResolvedValue(null)
            service.TokenUtil.generatePasswordRecoveryToken.mockResolvedValue('token-recuperacao')
            service.repository.atualizar.mockResolvedValue(mockData)
            const resposta = await service.recuperaSenha(req.body)
            expect(resposta).toEqual({
                message:
                    'Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.'
            })
        });
        // Email não consta no banco de dados
        it('deve falhar ao pedir recuperação de senha, usuário não existe', async () => {
            req.body = { email: 'usuario@gmail.com' }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(null)
            await expect(service.recuperaSenha(req.body)).rejects.toThrow(CustomError)
            try {
                await service.recuperaSenha(req.body)
            } catch (err) {
                expect(err).toBeInstanceOf(CustomError)
                expect(err.statusCode).toEqual(404)
                expect(err.errorType).toEqual('notFound')
                expect(err.customMessage).toEqual('Email não encontrado no sistema.')
            }
            expect(service.repository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
        });
        // Usuarios com status inativo não podem solicitar recuperação de senha
        it('deve falhar ao pedir recuperação de senha, usário não tem o status ativo', async () => {
            req.body = { email: 'usuario@gmail.com' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                status: 'inativo'
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            try {
                await service.recuperaSenha(req.body)
            } catch (err) {
                expect(err).toBeInstanceOf(CustomError)
                expect(err.statusCode).toEqual(403)
                expect(err.errorType).toEqual('forbidden')
                expect(err.customMessage).toEqual("Se sua conta foi desativada, ela não pode mais ser acessada. Para dúvidas, entre em contato com o suporte.")
            }
            expect(service.repository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
        });
        it('deve cair no while se outro usuário com mesmo código for encontrado', async () => {
            req.body = { email: 'usuario@gmail.com' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData);
            service.repository.buscarPorCodigoRecuperacao
                .mockResolvedValueOnce({ id: 'existe' }) // código repetido
                .mockResolvedValueOnce(null);            // código válido

            service.TokenUtil.generatePasswordRecoveryToken.mockResolvedValue('token-recuperacao')
            service.repository.atualizar.mockResolvedValue(mockData)

            await service.recuperaSenha(req.body);

            expect(service.repository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email);
            expect(service.repository.buscarPorCodigoRecuperacao).toHaveBeenCalledTimes(2);
        });
        it('deve retornar erro 500 se nenhum dado retornar apos a atualização do token Único, codigo, e tempo de expiração', async () => {
            req.body = { email: 'usuario@gmail.com' }
            const mockData = {
                _id: '123',
                nome: 'Usuario',
                email: 'usuario@gmail.com',
                senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.repository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            service.repository.buscarPorCodigoRecuperacao.mockResolvedValue(null)
            service.TokenUtil.generatePasswordRecoveryToken.mockResolvedValue('token-recuperacao')
            service.repository.atualizar.mockResolvedValue(null)
            
            await expect(service.recuperaSenha(req.body)).rejects.toMatchObject({
                statusCode: 500,
                field: 'Recuperação de Senha',
                customMessage: 'Erro interno do servidor'
            })
        })
    });
    describe('atualizarSenhaToken', () => {
        it('deve atualizar a senha com sucesso usando token de recuperação', async () => {
            const tokenRecuperacao = 'token-valido-123';
            const senhaBody = { senha: 'NovaSenha@123' };
            const usuarioId = '123';
            const mockUsuario = {
                _id: usuarioId,
                email: 'usuario@gmail.com',
                ativo: true,
                exp_tokenUnico_recuperacao: new Date(Date.now() + 60 * 60 * 1000) // 1 hora no futuro
            };

            service.TokenUtil.decodePasswordRecoveryToken.mockResolvedValue(usuarioId);
            service.repository.buscarPorTokenUnico.mockResolvedValue(mockUsuario);
            service.repository.atualizarSenha.mockResolvedValue(mockUsuario);

            const resultado = await service.atualizarSenhaToken(tokenRecuperacao, senhaBody);

            expect(service.TokenUtil.decodePasswordRecoveryToken).toHaveBeenCalledWith(
                tokenRecuperacao,
                process.env.JWT_SECRET_PASSWORD_RECOVERY
            );
            expect(service.repository.buscarPorTokenUnico).toHaveBeenCalledWith(tokenRecuperacao);
            expect(service.repository.atualizarSenha).toHaveBeenCalledWith(usuarioId, expect.any(String));
            expect(resultado).toEqual({ message: 'Senha atualizada com sucesso.' });
        });

        it('deve falhar se o token de recuperação não existir no banco', async () => {
            const tokenRecuperacao = 'token-inexistente';
            const senhaBody = { senha: 'NovaSenha@123' };
            const usuarioId = '123';

            service.TokenUtil.decodePasswordRecoveryToken.mockResolvedValue(usuarioId);
            service.repository.buscarPorTokenUnico.mockResolvedValue(null);

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 404,
                field: 'Token',
                customMessage: 'Token de recuperação já foi utilizado ou é inválido.'
            });

            expect(service.repository.buscarPorTokenUnico).toHaveBeenCalledWith(tokenRecuperacao);
        });

        it('deve falhar se o token de recuperação estiver expirado', async () => {
            const tokenRecuperacao = 'token-expirado';
            const senhaBody = { senha: 'NovaSenha@123' };
            const usuarioId = '123';
            const mockUsuario = {
                _id: usuarioId,
                email: 'usuario@gmail.com',
                ativo: true,
                exp_tokenUnico_recuperacao: new Date(Date.now() - 60 * 60 * 1000) // 1 hora no passado
            };

            service.TokenUtil.decodePasswordRecoveryToken.mockResolvedValue(usuarioId);
            service.repository.buscarPorTokenUnico.mockResolvedValue(mockUsuario);

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 401,
                field: 'Token de Recuperação',
                customMessage: 'Token de recuperação expirado.'
            });

            expect(service.repository.buscarPorTokenUnico).toHaveBeenCalledWith(tokenRecuperacao);
        });

        it('deve falhar se houver erro ao atualizar a senha no banco', async () => {
            const tokenRecuperacao = 'token-valido-123';
            const senhaBody = { senha: 'NovaSenha@123' };
            const usuarioId = '123';
            const mockUsuario = {
                _id: usuarioId,
                email: 'usuario@gmail.com',
                ativo: true,
                exp_tokenUnico_recuperacao: new Date(Date.now() + 60 * 60 * 1000)
            };

            service.TokenUtil.decodePasswordRecoveryToken.mockResolvedValue(usuarioId);
            service.repository.buscarPorTokenUnico.mockResolvedValue(mockUsuario);
            service.repository.atualizarSenha.mockResolvedValue(null); // Simula erro no banco

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 500,
                field: 'Senha',
                customMessage: 'Erro ao atualizar a senha.'
            });

            expect(service.repository.atualizarSenha).toHaveBeenCalledWith(usuarioId, expect.any(String));
        });

        it('deve falhar se o token for inválido e gerar erro no decode', async () => {
            const tokenRecuperacao = 'token-invalido';
            const senhaBody = { senha: 'NovaSenha@123' };

            service.TokenUtil.decodePasswordRecoveryToken.mockRejectedValue(new Error('Token inválido'));

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toThrow('Erro ao validar token de recuperação.');

            expect(service.TokenUtil.decodePasswordRecoveryToken).toHaveBeenCalledWith(
                tokenRecuperacao,
                process.env.JWT_SECRET_PASSWORD_RECOVERY
            );
        });
        it('deve falhar se a senha for nula no body', async () => {
            const tokenRecuperacao = 'token-valido';
            const senhaBody = { senha: null }; // Senha nula

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 400,
                field: 'senha',
                customMessage: 'Nova senha é obrigatória.'
            });
        });

        it('deve falhar se o usuário não estiver ativo no atualizarSenhaToken', async () => {
            const tokenRecuperacao = 'token-valido';
            const senhaBody = { senha: 'NovaSenha@123' };
            const usuarioId = '123';

            const mockUsuario = {
                _id: usuarioId,
                email: 'usuario@gmail.com',
                ativo: false, // Usuário inativo
                exp_tokenUnico_recuperacao: new Date(Date.now() + 60 * 60 * 1000)
            };

            service.TokenUtil.decodePasswordRecoveryToken.mockResolvedValue(usuarioId);
            service.repository.buscarPorTokenUnico.mockResolvedValue(mockUsuario);

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 403,
                field: 'Status',
                customMessage: 'Usuário desativado. Não é possível alterar a senha.'
            });
        });

        it('deve lidar com erro ao limpar token após atualização da senha', async () => {
            const tokenRecuperacao = 'token-valido';
            const senhaBody = { senha: 'NovaSenha@123' };
            const usuarioId = '123';

            const mockUsuario = {
                _id: usuarioId,
                email: 'usuario@gmail.com',
                ativo: true,
                exp_tokenUnico_recuperacao: new Date(Date.now() + 60 * 60 * 1000)
            };

            const mockUsuarioAtualizado = {
                _id: usuarioId,
                email: 'usuario@gmail.com',
                senha: 'hashedPassword'
            };

            service.TokenUtil.decodePasswordRecoveryToken.mockResolvedValue(usuarioId);
            service.repository.buscarPorTokenUnico.mockResolvedValue(mockUsuario);
            service.repository.atualizarSenha.mockResolvedValue(mockUsuarioAtualizado);
            // Simula erro ao limpar o token - isso deve apenas gerar um warning
            service.repository.alterar.mockRejectedValue(new Error('Erro ao limpar token'));

            // Deve ainda retornar sucesso, mesmo com erro ao limpar token
            const result = await service.atualizarSenhaToken(tokenRecuperacao, senhaBody);

            expect(result).toEqual({ message: 'Senha atualizada com sucesso.' });
            expect(service.repository.atualizarSenha).toHaveBeenCalledWith(usuarioId, expect.any(String));
        });
        it('deve falhar se token for string "null"', async () => {
            const tokenRecuperacao = 'null'; // String "null"
            const senhaBody = { senha: 'NovaSenha@123' };

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 400,
                field: 'token',
                customMessage: 'Token de recuperação é obrigatório.'
            });
        });

        it('deve falhar se token for string "undefined"', async () => {
            const tokenRecuperacao = 'undefined'; // String "undefined"
            const senhaBody = { senha: 'NovaSenha@123' };

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 400,
                field: 'token',
                customMessage: 'Token de recuperação é obrigatório.'
            });
        });

        it('deve falhar se senhaBody for null', async () => {
            const tokenRecuperacao = 'token-valido';
            const senhaBody = null; // senhaBody nulo

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 400,
                field: 'senha',
                customMessage: 'Nova senha é obrigatória.'
            });
        });

        it('deve tratar erro JsonWebTokenError no atualizarSenhaToken', async () => {
            const tokenRecuperacao = 'token-invalido';
            const senhaBody = { senha: 'NovaSenha@123' };

            const jwtError = new Error('Token malformado');
            jwtError.name = 'JsonWebTokenError';

            service.TokenUtil.decodePasswordRecoveryToken.mockRejectedValue(jwtError);

            await expect(service.atualizarSenhaToken(tokenRecuperacao, senhaBody)).rejects.toMatchObject({
                statusCode: 401,
                field: 'token',
                customMessage: 'Token de recuperação inválido ou malformado.'
            });
        });


    });
});
