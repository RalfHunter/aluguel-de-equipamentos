import { json } from 'express'
import AuthController from '../../controllers/AuthController.js'
import AuthService from '../../services/AuthService.js'
import { CommonResponse, CustomError, messages } from '../../utils/helpers/index.js'
import { tr } from '@faker-js/faker'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'

jest.mock('../../services/AuthService.js')
jest.mock('jsonwebtoken')
describe("AuthController", () => {
    let controller;
    let req;
    let res;
    beforeEach(() => {
        controller = new AuthController()
        req = {
            body: {
                email: 'usuario@gmail.com',
                senha: 'Usuario@1234'
            },

            headers: {
                authorization: 'Bearer meuAccessToken123'
            },

        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        // CommonResponse.success = jest.fn()
    })
    describe('login', () => {
        it('deve retornar dados de login com sucesso', async () => {
            const mockData = {
                data: { accessToken: "abc123" },
                errors: [],
                message: "Requisição bem-sucedida"
            };

            controller.service.login = jest.fn().mockResolvedValue(mockData.data)
            await controller.login(req, res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(controller.service.login).toHaveBeenCalledWith(req.body)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining(mockData));

        })
        it('deve falhar ao tentar logar, body null', async () => {
            req = {}
            await expect(controller.login(req, res)).rejects.toThrow()
        })
        // Credenciais do usuario erradas ou usuário não existe no banco de dados
        it('deve falhar ao tentar logar', async () => {
            const mockData = {
                message: "Erro de autorização: Senha ou Email",
                data: null,
                errors: []
            }
            controller.service.login = jest.fn().mockRejectedValue(new CustomError(
                {
                    statusCode: 401,
                    errorType: 'notFound',
                    field: 'Email',
                    details: [],
                    customMessage: messages.error.unauthorized('Senha ou Email')
                }))
            // Verificar se um erro foi lançado
            await expect(controller.login(req, res)).rejects.toThrowErrorMatchingInlineSnapshot(`"Erro de autorização: Senha ou Email."`)
            try {
                await controller.login(req, res)
            } catch (err) {
                expect(err.statusCode).toBe(401)
                expect(err).toBeInstanceOf(CustomError)
                expect(err.message).toBe('Erro de autorização: Senha ou Email.')
            }

        });
    });
    describe('refresh', () => {
        it('sucesso ao realizar refresh', async () => {
            // Simula o envio de um token
            req.body.refresh_token = "TokenValido"
            const decoded = { id: 'usuario' }

            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decoded))
            const mockData = {
                data: { accessToken: "abc123" },
                errors: [],
                message: "Requisição bem-sucedida"
            };

            controller.service.refresh.mockResolvedValue(mockData.data)

            await controller.refresh(req, res)

            expect(jwt.verify).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(controller.service.refresh).toHaveBeenCalledWith(decoded.id, req.body.refresh_token)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining(mockData));
        });
        it('deve falhar ao receber um token nullo', async () => {
            req.body.refresh_token = null;
            await expect(controller.refresh(req, res)).rejects.toThrow(CustomError);
        });
        it('deve falhar ao receber um token undefined', async () => {
            req.body.refresh_token = undefined;
            await expect(controller.refresh(req, res)).rejects.toThrow(CustomError);
        });
        it('deve falhar quando jwt é inválido', async () => {
            jest.mock('util', () => ({
                ...jest.requireActual('util'),
                promisify: () => jest.fn().mockRejectedValue(new Error('Token inválido')),
            }));


            await expect(controller.refresh(req, res)).rejects.toThrow('Refresh token is missing.');
        });
    });
    describe('logout', () => {
        it('sucesso ao realizar logout', async () => {
            const mockData = { data: null, errors: [], message: "Requisição bem-sucedida" }
            const decode = { id: 'usuario' }
            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decode))
            controller.service.logout.mockResolvedValue(null)
            await controller.logout(req, res)
            expect(controller.service.logout).toHaveBeenCalledWith('usuario', 'meuAccessToken123');
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenLastCalledWith(mockData)

        });
        it('falha ao realizar logout, token null ou undefined', async () => {
            req.headers.authorization = undefined
            await expect(controller.logout(req, res)).rejects.toThrowErrorMatchingInlineSnapshot(`"Requisição com sintaxe incorreta"`)
        });
        // id é null
        it("falha ao obter id do token", async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, null); // decoded será null
            });
            await expect(controller.logout(req, res)).rejects.toThrow()
        })
    });
    describe('revoke', () => {
        it('sucesso ao remover tokens do usuario', async () => {
            const mockData = { data: null, errors: [], message: "Requisição bem-sucedida" }
            req.body.id = '123'
            controller.service.revoke.mockResolvedValue(req.body.id)
            await controller.revoke(req, res)
            expect(controller.service.revoke).toHaveBeenCalledWith('123')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(mockData)
        });
        it('falha ao fazer revoke, id não fornecido', async () => {
            controller.service.revoke.mockRejectedValue(new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            }));

            await expect(controller.revoke(req, res)).rejects.toThrow(CustomError);

            try {
                await controller.revoke(req, res);
            } catch (err) {
                expect(err.statusCode).toBe(404); // Verifica se o statusCode está correto
                expect(err).toBeInstanceOf(CustomError);
                expect(err.message).toBe(messages.error.resourceNotFound('Usuário'));
            }
        });
    });
    describe('introspect', () => {
        it('sucesso ao realizar introspect', async () => {
            const decode = { id: 'usuario', exp: Math.floor(Date.now() / 1000) + 3600 };
            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decode));

            req.body = { accessToken: 'validAccessToken' }; // Simulando um token válido

            await controller.pass(req, res); // Chamando o método correto

            expect(res.status).toHaveBeenCalledWith(200)

        });
        it('falha ao realizar introspect, body é null ou undefined', async () => {
            req = {}
            await expect(controller.pass(req, res)).rejects.toThrow()
        });
        // atribuindo null ao decoded.exp
        it('decode.exp é null, não retorna um erro', async () => {
            const decode = { id: 'usuario', exp:null};
            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decode));

            req.body = { accessToken: 'validAccessToken' }; // Simulando um token válido

            await controller.pass(req, res); // Chamando o método correto
        });
        it('caindo na primeira condição, decoded.client_id', async ()=>{
            const decode = { client_id: 'usuario', exp: Math.floor(Date.now() / 1000) + 3600 };
            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decode));
            req.body = { accessToken: 'validAccessToken' }
            await controller.pass(req, res)
        });
        it('caindo na terceira condição, decoded.aud', async ()=>{
            const decode = { aud: 'usuario', exp: Math.floor(Date.now() / 1000) + 3600 };
            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decode));
            req.body = { accessToken: 'validAccessToken' }
            await controller.pass(req, res)
        });
        it('caindo na quarta condição, null', async ()=>{
            const decode = {  exp: Math.floor(Date.now() / 1000) + 3600 };
            jwt.verify.mockImplementationOnce((token, secret, cb) => cb(null, decode));
            req.body = { accessToken: 'validAccessToken' }
            await controller.pass(req, res)
        });
        it('falha ao realizar introspect', async () => {
            jest.mock('util', () => ({
                ...jest.requireActual('util'),
                promisify: () => jest.fn().mockRejectedValue(new Error()),
            }));
            await expect(controller.pass(req, res)).rejects.toThrow(Error)
        });
    });
    describe('recover', () => {
        // O recover diz respeito a rota ao pedido de recuperação da senha
        it('sucesso ao realziar recover', async () => {
            const resposta = { message: 'Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.' }
            controller.service.recuperaSenha.mockResolvedValue(resposta)
            await controller.recuperaSenha(req, res)
            expect(controller.service.recuperaSenha).toHaveBeenCalledWith(req.body)
        });
        it('falha ao realizar recover, email inválido', async () => {
            req.body = { email: "invalido" }
            await expect(controller.recuperaSenha(req, res)).rejects.toThrowErrorMatchingInlineSnapshot(`
"[
  {
    "validation": "email",
    "code": "invalid_string",
    "message": "Formato de email inválido.",
    "path": [
      "email"
    ]
  }
]"
`)
        })
    })
})