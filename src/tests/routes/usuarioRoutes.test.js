import request from 'supertest'
import mongoose from 'mongoose';
import { includes } from 'zod/v4';
import Usuario from '../../models/Usuario';
import sharp from 'sharp';

describe('usuarioRoute', () => {
    // Admin que está fazendo a requição
    let idAdmin;
    let nomeAdmin;
    // URL da requisição
    let app = 'http://localhost:5011'
    // Usuário alvo da requisição
   
    let id;
    let statusUser;
    let user;
    let moderador
    // Admin alvo para testes
    let idAdmin2
    let userLogado
    describe('get /usuarios', () => {
       it('obtendo token e id do admin através do login', async () => {
            const body = {
                email: "moderador@gmail.com",
                senha: "Moderador@1234"
            }
            const res = await request(app)
                .post('/login')
                .send(body)
            moderador = res.body?.data?.user
            // moderador.accessToken = res.body?.data?.user?.accessToken
            // idAdmin = res.body?.data?.user?._id
            // nomeAdmin = res.body?.data?.user?.nome
        });
       it('obtendousuario comum através do login', async ()=>{
            const body = {
                email: "usuario@gmail.com",
                senha: "Usuario@1234"
            }
            const res = await request(app)
                .post('/login')
                .send(body)

            userLogado = res.body?.data?.user
        })
       it('deve listar todos os usuários sem parametros com sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
            expect(res.body?.data?.docs[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            user = await pegarUsuario(res.body?.data?.docs)
            idAdmin2 = await pegarAdmin(res.body?.data.docs, idAdmin)
            statusUser = user?.ativo == true ? false:true
        })
       it('deve listar todos os usuários pelo nome passado como query e ter sucesso', async () => {
        // console.log(moderador.accessToken)
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
            expect(res.body?.data?.docs[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect((res.body?.data?.docs[0]?.nome.split(' ')).includes("Usuario")).toBe(true)
            
        });
       it('deve listar todos os usuários pelo email passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
            expect(res.body?.data?.docs[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect(res.body?.data?.docs[0]?.email).toEqual("usuario@gmail.com")
        });
       it('deve listar todos os usuários pelo status passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ ativo: true})
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
            expect(res.body?.data?.docs[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect(res.body?.data?.docs[0]?.ativo).toEqual(true)
        });
       it('deve listar todos os usuários pelo tipoUsuario passado como query e ter sucesso', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ grupo: "usuario" })
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
            expect(res.body?.data?.docs[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]).toHaveProperty("fotoUsuario")
            expect(mongoose.Types.ObjectId.isValid(res.body?.data?.docs[0]?._id)).toBe(true)
            expect(res.body?.data?.docs[0]?.grupos[0]?.nome).toEqual("usuario")
        });
       it('deve retornar vazio ao nenhum usuário com nome correspondete ser encontrado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ limit: 200 })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.limit).toEqual(100)
        });
       it('deve retorna um limit de no page de no minimo 1 mesmo que um valor menor igual a zero seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ page: 0 })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.page).toEqual(1)
        });
       it('deve retorna um page de no minimo 1 mesmo que um valor diferente de um numero seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ page: "string" })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.page).toEqual(1)
        });
       it('deve retorna um limit de no minimo 10 mesmo que um valor diferente de numero seja passado', async () => {
            const res = await request(app)
                .get('/usuarios')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ limit: "string" })
            expect(res.status).toEqual(200)
            expect(res.body?.data?.limit).toEqual(10)
        });
       it('deve retornar rota inválida', async () => {
            const res = await request(app)
                .get('/invalida')
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .query({ limit: "string" })
            expect(res.status).toEqual(404)
            expect(res.body?.message).toEqual("Rota não encontrada")
        });
    });
    describe('/usuarios/:id', () => {
       it('deve retornar o usuário com sucesso', async () => {
            const res = await request(app)
                .get(`/usuarios/${user?._id}`)
                .set('Authorization', `Bearer ${moderador.accessToken}`)
                .expect(200)
            expect(res.body?.data?._id).toEqual(user?._id)
            expect(res.body?.data).toHaveProperty("_id")
            expect(res.body?.data).toHaveProperty("nome")
            expect(res.body?.data).toHaveProperty("email")
            expect(res.body?.data).toHaveProperty("telefone")
            expect(res.body?.data).toHaveProperty("dataNascimento")
            expect(res.body?.data).toHaveProperty("CPF")
            expect(res.body?.data).toHaveProperty("notaMedia")
            expect(res.body?.data).toHaveProperty("ativo")
            expect(res.body?.data).toHaveProperty("fotoUsuario")
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
        });
       it('deve retornar data igual null se nenhum usuário for encontrado', async () => {
            const res = await request(app)
                .get(`/usuarios/ffffffffffffffffffffffff`)
                .set('Authorization', `Bearer ${moderador.accessToken}`)
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
                .set('Authorization', `Bearer ${userLogado.accessToken}`)
                .send({nome: "Usuario Alterado", email:"usuario@gmail.com", telefone:"(11) 91334-5678"})
                .expect(200)
            
        });
       it('deve retornar erro ter campos unicos duplicados no banco, neste caso, email', async()=>{
            const res = await request(app)
                .patch(`/usuarios/`)
                .set('Authorization', `Bearer ${userLogado?.accessToken}`)
                .send({nome: "Usuario Alterado", email:"dev@gmail.com", telefone:"(11) 91334-5678"})
                .expect(409)
                expect(res.body?.message).toEqual("Conflito de recurso em Usuário contém Email.")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors).toHaveLength(0)
        });
       it('deve retornar erro ter campos unicos duplicados no banco, neste caso, Telefone', async()=>{
            const res = await request(app)
                .patch(`/usuarios/`)
                .set('Authorization', `Bearer ${userLogado.accessToken}`)
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
            .patch(`/usuarios/${user?._id}`)
            .set('Authorization', `Bearer ${moderador.accessToken}`)
            .send({ativo: statusUser})
            .expect(200)
            console.log(res.body)
            expect(res.body?.message).toEqual(`Status alterado com sucesso para ${statusUser}`)
            expect(res.body?.errors).toHaveLength(0)
            expect(res.body?.data).not.toEqual(null)

        });
       it('deve retornar falha ao tentar mudar status de si mesmo', async () =>{
            const res = await request(app)
            .patch(`/usuarios/${moderador?._id}`)
            .set('Authorization', `Bearer ${moderador.accessToken}`)
            .send({ativo: statusUser})
            .expect(403)
            expect(res.body?.message).toEqual("Não pode alterar o status de si mesmo.")

        });
       it('deve retornar falha ao tentar mudar status de outro admin', async () =>{
            // console.log(idAdmin2)    
        const res = await request(app)
            .patch(`/usuarios/${idAdmin2?._id}`)
            .set('Authorization', `Bearer ${moderador.accessToken}`)
            .send({ativo: statusUser})
            .expect(403)
            expect(res.body?.message).toEqual("Erro de autorização: Permissão.")

        });
    });
    describe('post /usuarios/:id/foto', () =>{
        it('deve ter sucesso ao enviar uma foto', async ()=>{
            const img = await criarImagem()
            const res = await request(app)
            .post(`/usuarios/${userLogado?._id}/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .attach('file', img, 'imagem-pequena.png')
            .expect(200)
        });
        it('deve falhar ao tentar foto com o nome campo diferente de "file" grande demais ', async ()=>{
            const img = await criarImagem(6000, 6000)
            const res = await request(app)
            .post(`/usuarios/${userLogado?._id}/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .attach('imagem', img, 'imagem-pequena.png')
            .expect(200)
        });
    })
})

async function pegarUsuario(users) {
    for(let i = 0; i<users.length; i++){
        if(users[i]?.grupos[0].nome !== "moderador"  && users[i]?.grupos[0] !== "admin" && users[i]?.nome.split(' ')[0] != "Usuario")
            return users[i]
    }
}
async function pegarAdmin(users, idAdmin) {
     for(let i = 0; i<users.length; i++){
        if(users[i]?.grupos[0].nome === "moderador" && users[i]?._id != idAdmin)
            return users[i]
    }
}

async function criarImagem(width = 300, height = 200) {
const largura = height;
const altura = width;
const cor = { r: 0, g: 102, b: 204, alpha: 1 }; // azul

return await sharp({
  create: {
    width: largura,
    height: altura,
    channels: 4,
    background: cor
  }
})
  .png()
  .toBuffer()
  .catch(err => {
    console.error('Erro ao criar imagem:', err);
  });
}