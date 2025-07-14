import request from 'supertest'
import mongoose from 'mongoose';
import fakerbr from 'faker-br';
import { gerarDataAleatoria } from '../../utils/helpers/randomPastDate';
import "../../../src/routes/authRoutes.js"
import dotenv from 'dotenv'
dotenv.config()
const PORT = process.env.APP_PORT || 5011
describe('authRouter', () => {
    let usuarioToken;
    let idUsuario;
    let refreshTokenUsuario;
    let usuarioFake
    // URL da requisição
    let app = `http://localhost:${PORT}`
    // Usuário alvo da requisição
    let moderador;
    describe('rota /login', () => {
        it('/login, realiza login para poder deletar usuário criado durante os testes', async()=>{
            const body = {
                email:"moderador@gmail.com",
                senha:"Moderador@1234"
            }
            const res = await request(app)
            .post('/login')
            .send(body)
            .expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.data).not.toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            moderador = res.body?.data?.user
        })
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
            .expect(401)
            expect(res.body?.message).toEqual("Token de acesso inválido ou malformado.")
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
            expect(res.body?.message).toEqual('Refresh token inválido ou não corresponde ao usuário.')
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
            .post('/introspect')
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
            .post('/introspect')
            .send(body)
            .expect(400)
            expect(res.body?.message).toEqual('Erro de validação. 1 campo(s) inválido(s).')
            expect(res.body?.errors[0]).toEqual({"message": "Required", "path": "accessToken"})
        });
    });
    describe('post /signup', () =>{
        it('deve realziar singup com sucesso', async() =>{
            const body = gerarUsuarioFake()
            
            const res = await request(app)
            .post('/signup')
            .send(body)
            .expect(201)
            
            expect(res.body.message).toEqual('Recurso criado com sucesso')
            usuarioFake = res.body?.data
        });
        it('deve falhar ao realizar singup, dados inválidos', async() =>{
            const body = {
                nome:"1231", 
                email:"invalido",
                senha:"invalida",
                telefone:"fone",
                dataNascimento:"invalido",
                CPF:"invalido"
            }
            const res = await request(app)
            .post('/signup')
            .send(body)
            .expect(400)
            expect(res.body.message).toEqual('Erro de validação. 8 campo(s) inválido(s).')
            expect(res.body?.errors).toHaveLength(8)
        });
        it('deletar usuário criado durante os testes', async ()=>{
            // console.log(moderador)
             const res = await request(app)
            .delete(`/usuarios/${usuarioFake?._id}`)
            .set("Authorization", `Bearer ${moderador?.accessToken}`)
            .expect(200)
            expect(res.body?.message).toEqual('Usuário excluído com sucesso.')
            expect(res.body?.data).toMatchObject({
                _id: usuarioFake._id,
                nome: usuarioFake.nome,
                email: usuarioFake.email,
                ativo: usuarioFake.ativo,
                dataNascimento: usuarioFake.dataNascimento
            })
            // .expect(200)
        })
    });
})

function gerarUsuarioFake() {
  // Generate unique values to avoid conflicts
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  return {
    nome: fakerbr.name.firstName() + ' ' + fakerbr.name.lastName(),
    email: `test${uniqueId}@exemplo.com.br`,
    telefone: "(11) 91234-5678", // Valid format
    senha: "Senha@1234", // Valid strong password
    dataNascimento: "1990-01-01", // Valid date
    CPF: fakerbr.br.cpf(),
  }
}