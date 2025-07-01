import request from 'supertest'
import mongoose from 'mongoose';
import { email } from 'zod/v4';

describe('authRouter', () => {
    let usuarioToken;
    let idUsuario;
    let refreshTokenUsuario;
    let tokenAdmin;
    let idAdmin;
    let nomeAdmin;
    // URL da requisição
    let app = 'http://localhost:5011'
    // Usuário alvo da requisição
    let tokenUsuario;
    let id;
    let statusUser;
    let user;
    // Admin alvo para testes
    let idAdmin2
    describe('rota /login', () => {
        it('/login realizado com sucesso por um usuário comum', async () => {
            const body = {
                email:"usuario@gmail.com",
                senha:"Usuario@1234"
            }
            const res = await request(app)
            .post('/login')
            .send(body)
            .expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.data).not.toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            usuarioToken = res.body?.data?.user?.accessToken

        });
        it('falha ao realizar login um usuário comum, campos inválidos', async () => {
            const body = {
                invalido:"usuario@gmail.com",
                senha:"Usuario@1234"
            }
            const res = await request(app)
            .post('/login')
            .send(body)
            .expect(400)
            expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors[0]).toEqual({"message": "Required", "path": "email"})
        });
        it('falha ao realizar login com um usuário comum, senha ou email errados ou usuário não cadastrado', async () => {
            const body = {
                email:"erradoouinexistente@gmail.com",
                senha:"Senhaerradaouinexistente@1234"
            }
            const res = await request(app)
            .post('/login')
            .send(body)
            .expect(401)
            expect(res.body?.message).toEqual("Erro de autorização: Senha ou Email.")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
        });
    });
    describe('/logout', () =>{
        it('sucesso ao realizar logout', async () =>{
            const res = await request(app)
            .post("/logout")
            .set("Authorization", `Bearer ${usuarioToken}`)
            .expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
        });
        it('falha ao realizar logout, nenhum token passado', async () =>{
            const res = await request(app)
            .post("/logout")
            .set("Authorization", `Bearer  `)
            .expect(400)
            expect(res.body?.message).toEqual("Requisição com sintaxe incorreta")
        });
        it('falha ao realizar logout, token invalido passado', async () =>{
            const res = await request(app)
            .post("/logout")
            .set("Authorization", `Bearer invalido`)
            .expect(500)
            expect(res.body?.message).toEqual("Erro interno do servidor. Tente novamente mais tarde.")
        });
        
    });
    describe('/revoke', () =>{
        it('usuario comum realizando login', async () =>{
            const body = {
                email:"usuario@gmail.com",
                senha:"Usuario@1234"
            }
            const res = await request(app)
            .post("/login")
            .send(body)
            idUsuario = res.body?.data?.user?._id
        })
        it('sucesso ao realizar revoke', async () => {
            const res = await request(app)
            .post("/revoke")
            .send({id: idUsuario})
            .expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
        });
        it('falha ao realizar revoke, id não corresponde a nenhum usuario', async () => {
            const res = await request(app)
            .post("/revoke")
            .send({id: "ffffffffffffffffffffffff"})
            .expect(404)
            expect(res.body?.message).toEqual("Recurso não encontrado em Usuário.")
        });
        it('falha ao realizar revoke, id não é do tipo mongoose', async () => {
            const res = await request(app)
            .post("/revoke")
            .send({id: "invalido"})
            .expect(400)
            expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
            expect(res.body?.errors[0]).toEqual({ path: '', message: 'ID inválido' } )
        });
    });
    describe('/refresh', () =>{
         it('usuario comum realizando login', async () =>{
            const body = {
                email:"usuario@gmail.com",
                senha:"Usuario@1234"
            }
            const res = await request(app)
            .post("/login")
            .send(body)
            idUsuario = res.body?.data?.user?._id
            refreshTokenUsuario = res.body?.data?.user?.refreshToken
        })
        it('deve ter sucesso ao realizar um refresh', async ()=>{
            const body ={
                refresh_token: refreshTokenUsuario
            }
            const res = await request(app)
            .post('/refresh')
            .send(body)
            .expect(200)
            expect(res?.body?.message).toEqual('Requisição bem-sucedida')
            expect(res.body?.data?.user).not.toEqual(null)
        });
        it('deve falhar ao realizar um refresh, usuário não possue um refreshToken e nem accessToken valido', async () =>{
            const body = {
                refresh_token: refreshTokenUsuario
            }
            const res = await request(app)
            .post('/refresh')
            .send(body)
            .expect(401)
            expect(res.body?.data).toEqual(null)
            expect(res.body?.message).toEqual('Erro de autorização: Token.')
        });
    });
    describe('/introspect', () =>{
        // Esse primeiro it serve para obter o accesstoken válido
        it('usuario comum realizando login', async () =>{
            const body = {
                email:"usuario@gmail.com",
                senha:"Usuario@1234"
            }
            const res = await request(app)
            .post('/login')
            .send(body)
            usuarioToken = res.body?.data?.user.accessToken
        })
        it('deve ter sucesso ao realizar um introspect', async ()=>{
            const body = {
                accessToken: usuarioToken
            }
            const res = await request(app)
            .post('/instrospect')
            .send(body)
            .expect(200)
            expect(res.body?.message).toEqual('autorizado')
            expect(res.body?.data?.active).toBe(true)
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.client_id)).toBe(true)
            expect(res.body?.data?.token_type).toEqual('Bearer')
            expect(res.body?.data).toHaveProperty("exp")
            expect(res.body?.data).toHaveProperty("iat")
            expect(res.body?.data).toHaveProperty("nbf")
        });
        it('deve falhar ao receber um token inválido', async ()=>{
            const body ={
                invalido:'inválido'
            }
            const res = await request(app)
            .post('/instrospect')
            .send(body)
            .expect(400)
            expect(res.body?.message).toEqual('Erro de validação. 1 campo(s) inválido(s).')
            expect(res.body?.errors[0]).toEqual({"message": "Required", "path": "accessToken"})
        });
    });
    describe('/recover', () =>{
        it('deve ter sucesso ao realizar recover', async () =>{
           const body = {
            email:'usuario@gmail.com'
           }
           const res = await request(app)
           .post('/recover')
           .send(body)
           .expect(200) 
           expect(res.body?.message).toEqual('Requisição bem-sucedida')
           expect(res.body?.data?.message).toEqual('Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.')
           expect(res.body?.errors).toHaveLength(0)
        });
        it('deve falhar ao realizar recover, campo email invalido', async () =>{
           const body = {
            invalido:'usuario@gmail.com'
           }
           const res = await request(app)
           .post('/recover')
           .send(body)
           .expect(404) 
           expect(res.body?.message).toEqual('Recurso não encontrado')
           expect(res.body?.errors).toHaveLength(0)
        });
        it('deve falhar ao realizar recover, valor do campo email invalido', async () =>{
           const body = {
            email:'EsteEmailComCertezaNãoExiste'
           }
           const res = await request(app)
           .post('/recover')
           .send(body)
           .expect(400) 
           expect(res.body?.message).toEqual('Erro de validação. 1 campo(s) inválido(s).')
           expect(res.body?.errors[0]).toEqual({"message": "Formato de email inválido.", "path": "email"})
        });
    })
})