import request from 'supertest'
import mongoose from 'mongoose';
import { includes } from 'zod/v4';
import Usuario from '../../models/Usuario';

describe('usuarioRoute', () => {
    // Admin que está fazendo a requição
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
    describe('get /usuarios', () => {
        it('obtendo token e id do admin através do login', async () => {
            const body = {
                email: "dev@gmail.com",
                senha: "Dev@1234"
            }
            const res = await request(app)
                .post('/login')
                .send(body)

            tokenAdmin = res.body?.data?.user?.accessToken
            idAdmin = res.body?.data?.user?._id
            nomeAdmin = res.body?.data?.user?.nome
        });
        it('obtendo token e id do usuario comum através do login', async ()=>{
            const body = {
                email: "usuario@gmail.com",
                senha: "Usuario@1234"
            }
            const res = await request(app)
                .post('/login')
                .send(body)

            tokenUsuario = res.body?.data?.user?.accessToken
        })
        it('deve listar todos os usuários sem parametros com sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data?.docs[0]).toHaveProperty("_id")
            expect(res.body?.data?.docs[0]).toHaveProperty("nome")
            expect(res.body?.data?.docs[0]).toHaveProperty("email")
            expect(res.body?.data?.docs[0]).toHaveProperty("telefone")
            expect(res.body?.data?.docs[0]).toHaveProperty("dataNascimento")
            expect(res.body?.data?.docs[0]).toHaveProperty("CPF")
            expect(res.body?.data?.docs[0]).toHaveProperty("notaMedia")
            expect(res.body?.data?.docs[0]).toHaveProperty("status")
            expect(res.body?.data?.docs[0]).toHaveProperty("tipoUsuario")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            user = await pegarUsuario(res.body?.data?.docs)
            idAdmin2 = await pegarAdmin(res.body?.data.docs, idAdmin)
            id = user?._id
            statusUser = user?.status == "ativo" ? "inativo":"ativo"
        })
        it('deve listar todos os usuários pelo nome passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ nome: "Usuario" })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data?.docs[0]).toHaveProperty("_id")
            expect(res.body?.data?.docs[0]).toHaveProperty("nome")
            expect(res.body?.data?.docs[0]).toHaveProperty("email")
            expect(res.body?.data?.docs[0]).toHaveProperty("telefone")
            expect(res.body?.data?.docs[0]).toHaveProperty("dataNascimento")
            expect(res.body?.data?.docs[0]).toHaveProperty("CPF")
            expect(res.body?.data?.docs[0]).toHaveProperty("notaMedia")
            expect(res.body?.data?.docs[0]).toHaveProperty("status")
            expect(res.body?.data?.docs[0]).toHaveProperty("tipoUsuario")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect((res.body?.data?.docs[0]?.nome.split(' ')).includes("Usuario")).toBe(true)
            
        });
        it('deve listar todos os usuários pelo email passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ email: "usuario@gmail.com" })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data?.docs[0]).toHaveProperty("_id")
            expect(res.body?.data?.docs[0]).toHaveProperty("nome")
            expect(res.body?.data?.docs[0]).toHaveProperty("email")
            expect(res.body?.data?.docs[0]).toHaveProperty("telefone")
            expect(res.body?.data?.docs[0]).toHaveProperty("dataNascimento")
            expect(res.body?.data?.docs[0]).toHaveProperty("CPF")
            expect(res.body?.data?.docs[0]).toHaveProperty("notaMedia")
            expect(res.body?.data?.docs[0]).toHaveProperty("status")
            expect(res.body?.data?.docs[0]).toHaveProperty("tipoUsuario")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect(res.body?.data?.docs[0]?.email).toEqual("usuario@gmail.com")
        });
        it('deve listar todos os usuários pelo status passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ status: "ativo" })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data?.docs[0]).toHaveProperty("_id")
            expect(res.body?.data?.docs[0]).toHaveProperty("nome")
            expect(res.body?.data?.docs[0]).toHaveProperty("email")
            expect(res.body?.data?.docs[0]).toHaveProperty("telefone")
            expect(res.body?.data?.docs[0]).toHaveProperty("dataNascimento")
            expect(res.body?.data?.docs[0]).toHaveProperty("CPF")
            expect(res.body?.data?.docs[0]).toHaveProperty("notaMedia")
            expect(res.body?.data?.docs[0]).toHaveProperty("status")
            expect(res.body?.data?.docs[0]).toHaveProperty("tipoUsuario")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect(res.body?.data?.docs[0]?.status).toEqual("ativo")
        });
        it('deve listar todos os usuários pelo tipoUsuario passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ tipoUsuario: "usuario" })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data?.docs[0]).toHaveProperty("_id")
            expect(res.body?.data?.docs[0]).toHaveProperty("nome")
            expect(res.body?.data?.docs[0]).toHaveProperty("email")
            expect(res.body?.data?.docs[0]).toHaveProperty("telefone")
            expect(res.body?.data?.docs[0]).toHaveProperty("dataNascimento")
            expect(res.body?.data?.docs[0]).toHaveProperty("CPF")
            expect(res.body?.data?.docs[0]).toHaveProperty("notaMedia")
            expect(res.body?.data?.docs[0]).toHaveProperty("status")
            expect(res.body?.data?.docs[0]).toHaveProperty("tipoUsuario")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect(res.body?.data?.docs[0]?.tipoUsuario).toEqual("usuario")
        });
        it('deve retornar vazio ao nenhum usuário com nome correspondete ser encontrado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ nome: "Fulano de Tal" })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data?.docs).toHaveLength(0)

        });
        it('deve fornecer a retornar o numero da pagina certa de acordo com a query', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ status: "inativo", page: 10 })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data.page).toEqual(10)

        });
        it('deve fornecer a retornar o limite certa de acordo com a query', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ status: "ativo", limit: 12 })
                .expect(200)
            expect(res.status).toEqual(200)
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(res.body?.message).toEqual('Requisição bem-sucedida')
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data.limit).toEqual(12)

        });
        it('deve retorna um limit de no máximo 100 mesmo que um valor maior seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ limit: 200 })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.limit).toEqual(100)
        });
        it('deve retorna um limit de no page de no minimo 1 mesmo que um valor menor igual a zero seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ page: 0 })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.page).toEqual(1)
        });
        it('deve retorna um page de no minimo 1 mesmo que um valor diferente de um numero seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ page: "string" })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.page).toEqual(1)
        });
        it('deve retorna um limit de no minimo 10 mesmo que um valor diferente de numero seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ limit: "string" })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.limit).toEqual(10)
        });
        it('deve retornar rota inválida', async () => {
            const res = await request(app)
                .get('/invalida')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .query({ limit: "string" })
            expect(res.status).toEqual(404)
            expect(res.body?.message).toEqual("Rota não encontrada")
        });
    });
    describe('/usuarios/:id', () => {
        it('deve retornar o usuário com sucesso', async () => {
            const res = await request(app)
                .get(`/usuarios/${id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .expect(200)
            expect(res.body?.data?._id).toEqual(id)
            expect(res.body?.data).toHaveProperty("_id")
            expect(res.body?.data).toHaveProperty("nome")
            expect(res.body?.data).toHaveProperty("email")
            expect(res.body?.data).toHaveProperty("telefone")
            expect(res.body?.data).toHaveProperty("dataNascimento")
            expect(res.body?.data).toHaveProperty("CPF")
            expect(res.body?.data).toHaveProperty("notaMedia")
            expect(res.body?.data).toHaveProperty("status")
            expect(res.body?.data).toHaveProperty("tipoUsuario")
            expect(res.body?.data).toHaveProperty("fotoUsuario")
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
        });
        it('deve retornar data igual null se nenhum usuário for encontrado', async () => {
            const res = await request(app)
                .get(`/usuarios/ffffffffffffffffffffffff`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .expect(200)
            expect(res.body?.data).toEqual(null)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.errors).toHaveLength(0)
        });
    });
    describe('patch /usuarios/', () =>{
        it('deve alterar todos dados (nome, email, telefone) com sucesso', async()=>{
            const res = await request(app)
                .patch(`/usuarios/`)
                .set('Authorization', `Bearer ${tokenUsuario}`)
                .send({nome: "Usuario Alterado", email:"usuario@gmail.com", telefone:"(11) 91334-5678"})
                .expect(200)
            
        });
        it('deve retornar erro ter campos unicos duplicados no banco, neste caso, email', async()=>{
            const res = await request(app)
                .patch(`/usuarios/`)
                .set('Authorization', `Bearer ${tokenUsuario}`)
                .send({nome: "Usuario Alterado", email:"dev@gmail.com", telefone:"(11) 91334-5678"})
                .expect(409)
                expect(res.body?.message).toEqual("Conflito de recurso em Usuário contém Email.")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors).toHaveLength(0)
        });
        it('deve retornar erro ter campos unicos duplicados no banco, neste caso, Telefone', async()=>{
            const res = await request(app)
                .patch(`/usuarios/`)
                .set('Authorization', `Bearer ${tokenUsuario}`)
                .send({nome: "Usuario Alterado", email:"usuario@gmail.com", telefone:"69 98191-4471"})
                .expect(409)
                expect(res.body?.message).toEqual("Conflito de recurso em Usuário contém Telefone.")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors).toHaveLength(0)
        });
    });
    describe('patch /usuarios/id', () =>{
        it('deve retornar sucesso ao mudar o status de usuário', async () =>{
            const res = await request(app)
            .patch(`/usuarios/${id}`)
            .set('Authorization', `Berear ${tokenAdmin}`)
            .send({status: statusUser})
            .expect(200)
            expect(res.body?.message).toEqual(`Status alterado com sucesso para ${statusUser}`)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data).not.toEqual(null)

        });
        it('deve retornar falha ao tentar mudar status de si mesmo', async () =>{
            const res = await request(app)
            .patch(`/usuarios/${idAdmin}`)
            .set('Authorization', `Berear ${tokenAdmin}`)
            .send({status: statusUser})
            .expect(403)
            expect(res.body?.message).toEqual("Não pode alterar o status de si mesmo.")

        });
        it('deve retornar falha ao tentar mudar status de outro admin', async () =>{
            const res = await request(app)
            .patch(`/usuarios/${idAdmin2?._id}`)
            .set('Authorization', `Berear ${tokenAdmin}`)
            .send({status: statusUser})
            .expect(403)
            expect(res.body?.message).toEqual("Erro de autorização: Permissão.")

        });
    })
})

async function pegarUsuario(users) {
    for(let i = 0; i<users.length; i++){
        if(users[i]?.tipoUsuario !== "admin" && users[i]?.nome.split(' ')[0] != "Usuario")
            return users[i]
    }
}
async function pegarAdmin(users, idAdmin) {
     for(let i = 0; i<users.length; i++){
        if(users[i]?.tipoUsuario === "admin" && users[i]?._id != idAdmin)
            return users[i]
    }
}