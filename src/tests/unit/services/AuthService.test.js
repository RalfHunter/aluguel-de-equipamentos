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
        authRepository = {
            removeToken: jest.fn(),
            armazenarTokens: jest.fn(),
            buscarPorEmailCadastrado: jest.fn()
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        // usuarioRepository = new UsuarioRepository();
        service = new AuthService({ tokenUtil, usuarioRepository, authRepository });
        messages.error = {
            resourceNotFound: jest.fn((field) => `Recurso não encontrado em ${field}.`),
            unauthorized: jest.fn((field) => `Erro de autorização: ${field}`),
        };
        bcrypt.compare = jest.fn();
    })
    beforeEach(() => {
        jest.clearAllMocks(); // limpa todos os mocks
    });;
    describe('carregatokens', () => {
        it('Deve carregar os tokens do usuário com sucesso', async () => {
            const mockId = '123';
            const mockTokens = { access_token: 'valid_token', refresh_token: 'refresh_token' };

            service.usuarioRepository.buscarPorId.mockResolvedValue({ ...mockTokens });

            const result = await service.carregatokens(mockId);

            expect(service.usuarioRepository.buscarPorId).toHaveBeenCalledWith(mockId, { includeTokens: true });
            expect(result).toEqual({ data: mockTokens });
        });

        it('Deve retornar erro se o usuário não for encontrado', async () => {
            service.usuarioRepository.buscarPorId.mockRejectedValue(new CustomError({
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
            service.repository.removeToken.mockResolvedValue(mockData)
            const resultado = await service.revoke(mockData.id)
            expect(service.repository.removeToken).toHaveBeenCalledWith(mockData.id)
            expect(resultado).toEqual({ data: mockData })
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
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: "Usuário",
                details: [],
                customMessage: 'Recurso não encontrado em Usuário.'
            });
            expect(service.repository.removeToken).toHaveBeenCalledWith(null)
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
            service.repository.removeToken.mockResolvedValue(mockData)
            const resultado = await service.logout(mockData.id)
            expect(service.repository.removeToken).toHaveBeenCalledWith(mockData.id)
            expect(resultado).toEqual({ data: mockData })
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
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: "Usuário",
                details: [],
                customMessage: 'Recurso não encontrado em Usuário.'
            });
            expect(service.repository.removeToken).toHaveBeenCalledWith(null)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue({
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
            service.usuarioRepository.buscarPorId.mockResolvedValue(mockData)
            // service.repository.armazenarTokens.mockResolvedValue(mockData)
            const resposta = await service.login(req.body)
            expect(service.usuarioRepository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
            expect(bcrypt.compare).toHaveBeenCalledWith(req.body.senha, mockData.senha)
            await expect(bcrypt.compare(req.body.senha, mockData.senha)).resolves.toEqual(true)
        });
        it('falha ao realizar login, email não existe', async () => {
            req.body = { email: 'sem@gmail.com', senha: 'Usuario@1234' }
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(null)
            await expect(service.login(req.body)).rejects.toMatchObject({
                statusCode: 401,
                errorType: 'notFound',
                field: 'Email',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
            expect(service.usuarioRepository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
        });
        it('falha ao realizar login, nenhum usuário encontrado, email não existe', async () => {
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(null)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
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

            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockUser);
            service.usuarioRepository.buscarPorId.mockResolvedValue(mockUser);
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

            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockUser);
            service.usuarioRepository.buscarPorId.mockResolvedValue(mockUser);
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue({
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
            service.usuarioRepository.buscarPorId.mockResolvedValue(mockData)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue({
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
            service.usuarioRepository.buscarPorId.mockResolvedValue(mockData)
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
                refreshToken: null,
                accessToken: null,
                ativo: true,
                status: "ativo"
            }
            service.usuarioRepository.buscarPorId.mockResolvedValue({
                ...mockData, toObject: () => ({
                    _id: '123',
                    nome: 'Usuario',
                    email: 'usuario@gmail.com',
                    senha: '$2b$08$g3EwTL5DLNQDtzqYaJs/COncY6TNqmkuxjyXS6HfxTYqX0YNTtsia',
                    refreshToken: null,
                    accessToken: null,
                    ativo: true,
                status: "ativo"
                })
            })
            service.TokenUtil.generateAccessToken.mockResolvedValue(true)

            await expect(service.refresh(mockData.id, null)).resolves.toMatchObject({ user: mockData })
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

            service.usuarioRepository.buscarPorId.mockResolvedValue(mockUser);
            service.TokenUtil.generateAccessToken.mockResolvedValue('novo-access');
            service.TokenUtil.generateRefreshToken.mockResolvedValue('novo-refresh');

            const result = await service.refresh('123', 'token-antigo');

            expect(service.TokenUtil.generateRefreshToken).toHaveBeenCalledWith('123');
            expect(service.repository.armazenarTokens).toHaveBeenCalledWith('123', 'novo-access', 'novo-refresh');
            expect(result.user.refreshtoken).toBe('novo-refresh');
        });
        it('erro ao realizar refresh, usuário é null', async () => {
            service.usuarioRepository.buscarPorId.mockResolvedValue(null)
            await expect(service.refresh(id, token)).rejects.toThrowErrorMatchingInlineSnapshot(`"Recurso não encontrado"`)
            expect(service.usuarioRepository.buscarPorId).toHaveBeenCalledWith(id, { includeTokens: true })
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
            service.usuarioRepository.buscarPorId.mockResolvedValue(mockUser)

            await expect(service.refresh(id, token)).rejects.toThrow(CustomError)
            try {
                await service.refresh(id, token)
            } catch (err) {
                expect(err.statusCode).toEqual(401)
                expect(err.errorType).toEqual('invalidToken')
                expect(err.field).toEqual('Token')
                expect(err.customMessage).toContain('Token')
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            service.usuarioRepository.atualizar.mockResolvedValue(mockData)
            const resposta = await service.recuperaSenha(req.body)
            expect(resposta).toEqual({
                message:
                    'Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.'
            })
        });
        // Email não consta no banco de dados
        it('deve falhar ao pedir recuperação de senha, usuário não existe', async () => {
            req.body = { email: 'usuario@gmail.com' }
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(null)
            await expect(service.recuperaSenha(req.body)).rejects.toThrow(CustomError)
            try {
                await service.recuperaSenha(req.body)
            } catch (err) {
                expect(err).toBeInstanceOf(CustomError)
                expect(err.statusCode).toEqual(404)
                expect(err.errorType).toEqual('notFound')
                expect(err.customMessage).toEqual('Recurso não encontrado')
            }
            expect(service.usuarioRepository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            try {
                await service.recuperaSenha(req.body)
            } catch (err) {
                expect(err).toBeInstanceOf(CustomError)
                expect(err.statusCode).toEqual(403)
                expect(err.errorType).toEqual('unauthorized')
                expect(err.customMessage).toEqual("Se sua conta foi desativada, ela não pode mais ser acessada. Para dúvidas, entre em contato com o suporte.")
            }
            expect(service.usuarioRepository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email)
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData);
            service.usuarioRepository.buscarPorCodigoRecuperacao
                .mockResolvedValueOnce({ id: 'existe' }) // código repetido
                .mockResolvedValueOnce(null);            // código válido

            service.usuarioRepository.salvarCodigoRecuperacao = jest.fn().mockResolvedValue(true);
            service.usuarioRepository.atualizar.mockResolvedValue(mockData)

            await service.recuperaSenha(req.body);

            expect(service.usuarioRepository.buscarPorEmailCadastrado).toHaveBeenCalledWith(req.body.email);
            expect(service.usuarioRepository.buscarPorCodigoRecuperacao).toHaveBeenCalledTimes(2);
        });
        it('deve retornar erro 500 se nenhum dado retornar apos a atualização do token Único, codigo, e tempo de expiração', async () =>{
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
            service.usuarioRepository.buscarPorEmailCadastrado.mockResolvedValue(mockData)
            service.usuarioRepository.atualizar.mockResolvedValue(null)
            try{
                await service.recuperaSenha(req.body)
            }catch (err){
                expect(err.statusCode).toEqual(500)
                expect(err.field).toEqual('Recuperação de Senha')
                expect(err.customMessage).toEqual('Erro interno do servidor')
            }
        })
    })
});
