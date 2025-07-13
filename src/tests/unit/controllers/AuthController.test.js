
import AuthController from '../../../controllers/AuthController.js'

import { CustomError, messages } from '../../../utils/helpers/index.js'
import jwt from 'jsonwebtoken'



jest.mock('../../../services/AuthService.js')
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
            req.body.id = '68654c39ac28e36ce3578c68'
            controller.service.revoke.mockResolvedValue(req.body.id)
            await controller.revoke(req, res)
            expect(controller.service.revoke).toHaveBeenCalledWith('68654c39ac28e36ce3578c68')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(mockData)
        });
        it('falha ao fazer revoke, id não fornecido ou é inválido', async () => {
            req.body.id = null; // Simulating missing ID
            await expect(controller.revoke(req, res)).rejects.toThrowErrorMatchingInlineSnapshot(`
"[
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "null",
    "path": [],
    "message": "Expected string, received null"
  }
]"
`);
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
        });
    });
    describe('atualizarSenhaToken', () => {
        beforeEach(() => {
            req = {
                query: { token: 'token-recuperacao-123' },
                body: { senha: 'NovaSenha@123' }
            };
        });

        it('deve atualizar a senha com sucesso usando token da query', async () => {
            const mockResponse = { message: 'Senha atualizada com sucesso.' };
            controller.service.atualizarSenhaToken = jest.fn().mockResolvedValue(mockResponse);

            await controller.atualizarSenhaToken(req, res);

            expect(controller.service.atualizarSenhaToken).toHaveBeenCalledWith(
                'token-recuperacao-123',
                { senha: 'NovaSenha@123' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: null,
                message: 'Senha atualizada com sucesso.',
                errors: []
            }));
        });

        it('deve atualizar a senha com sucesso usando token dos params', async () => {
            req.query = {}; // Remove token da query
            req.params = { token: 'token-recuperacao-params' }; // Adiciona token nos params
            
            const mockResponse = { message: 'Senha atualizada com sucesso.' };
            controller.service.atualizarSenhaToken = jest.fn().mockResolvedValue(mockResponse);

            await controller.atualizarSenhaToken(req, res);

            expect(controller.service.atualizarSenhaToken).toHaveBeenCalledWith(
                'token-recuperacao-params',
                { senha: 'NovaSenha@123' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve falhar quando token de recuperação não é fornecido', async () => {
            req.query = {}; // Remove token da query
            req.params = {}; // Remove token dos params

            await expect(controller.atualizarSenhaToken(req, res)).rejects.toMatchObject({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'authentication',
                customMessage: 'Token de recuperação na URL como parâmetro ou query é obrigatório para troca da senha.'
            });
        });

        it('deve falhar quando senha não é fornecida', async () => {
            req.body = {}; // Remove senha do body

            await expect(controller.atualizarSenhaToken(req, res)).rejects.toThrow();
        });

        it('deve falhar quando senha tem formato inválido', async () => {
            req.body.senha = '123'; // Senha muito simples

            await expect(controller.atualizarSenhaToken(req, res)).rejects.toThrow();
        });

        it('deve falhar quando o serviço retorna erro', async () => {
            const serviceError = new CustomError({
                statusCode: 404,
                errorType: 'notFound',
                field: 'Token',
                customMessage: 'Token de recuperação não encontrado.'
            });

            controller.service.atualizarSenhaToken = jest.fn().mockRejectedValue(serviceError);

            await expect(controller.atualizarSenhaToken(req, res)).rejects.toMatchObject({
                statusCode: 404,
                errorType: 'notFound',
                field: 'Token',
                customMessage: 'Token de recuperação não encontrado.'
            });
        });

        it('deve falhar quando token é string vazia', async () => {
            req.query.token = ''; // Token vazio
            req.params = {};

            await expect(controller.atualizarSenhaToken(req, res)).rejects.toMatchObject({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'authentication'
            });
        });

        it('deve falhar quando senha é null', async () => {
            req.body.senha = null;

            await expect(controller.atualizarSenhaToken(req, res)).rejects.toThrow();
        });
    });
})