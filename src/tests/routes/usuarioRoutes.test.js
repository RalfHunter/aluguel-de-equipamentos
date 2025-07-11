import request from 'supertest'
import mongoose from 'mongoose';
import { includes } from 'zod/v4';
import Usuario from '../../models/Usuario';
import sharp from 'sharp';
import bcrypt from 'bcrypt'
import "../../../src/routes/usuarioRoutes.js"

describe('usuarioRoute', () => {
    // Admin que está fazendo a requição
    let idAdmin;
    let nomeAdmin;
    // URL da requisição
    let app = 'http://localhost:5011'
    // Usuário alvo da requisição
//    Usuario criado durante os teste e deletano nos mesmos

    let userTemp;
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
    describe('get /usuarios/:id', () => {
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
        const body ={nome: "Usuario Alterado", email:"usuario@gmail.com", telefone:"(11) 91334-5678"}
            const res = await request(app)
                .patch(`/usuarios/`)
                .set('Authorization', `Bearer ${userLogado.accessToken}`)
                .send(body)
                .expect(200)
                expect(res.body?.message).toEqual('Usuário atualizado com sucesso!')
                expect(res.body?.data?._id).toEqual(userLogado?._id)
                expect(res.body?.data?.nome).toEqual(body.nome)
                expect(res.body?.data?.email).toEqual(body.email)
                expect(res.body?.data?.telefone).toEqual(body.telefone)
                expect(res.body?.data?.dataNascimento).toEqual(userLogado?.dataNascimento)
                expect(res.body?.data?.CPF).toEqual(userLogado?.CPF)
                expect(res.body?.data?.ativo).toEqual(userLogado?.ativo)
                expect(res.body?.data?.fotoUsuario).toEqual(userLogado?.fotoUsuario)
                expect(res.body?.errors).toHaveLength(0)
                userLogado.nome = res.body?.data?.nome
            
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
    describe('patch /usuarios/:id', () =>{
       it('deve retornar sucesso ao mudar o status de usuário', async () =>{
        
            const res = await request(app)
            .patch(`/usuarios/${user?._id}`)
            .set('Authorization', `Bearer ${moderador.accessToken}`)
            .send({ativo: statusUser})
            .expect(200)
            // console.log(res.body)
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
            expect(res.body?.message).toEqual('Requisição bem-sucedida'),
            expect(res.body?.data?.message).toEqual('Foto atualizada com sucesso.')
            expect(res.body?.data?.dados?.id).toEqual(userLogado?._id)
            expect(res.body?.data?.dados?.nome).toEqual(userLogado?.nome)
            expect(res.body?.data?.dados?.email).toEqual(userLogado?.email)
            expect(res.body?.data?.metadados).toHaveProperty("url")
            expect(res.body?.data?.metadados).toHaveProperty("largura")
            expect(res.body?.data?.metadados).toHaveProperty("altura")
            expect(res.body?.data?.metadados).toHaveProperty("tamanhoMb")
            expect(res.body?.data?.metadados).toHaveProperty("nomeOriginal")
            
            
        });
        it('deve falhar ao enviar foto com o nome campo diferente de "file" grande demais ', async ()=>{
            const img = await criarImagem()
            const res = await request(app)
            .post(`/usuarios/${userLogado?._id}/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .attach('imagem', img, 'imagem-pequena.png')
            .expect(400)
            // console.log(res.body)
            expect(res.body?.message).toEqual('Arquivo inesperado. Use o campo "file" para enviar o arquivo.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
        });
        it('deve falhar ao tentar enviar foto com formato diferente de .png, .jpeg, .jpg', async ()=>{
            const img = await criarImagem()
            const res = await request(app)
            .post(`/usuarios/${userLogado?._id}/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .attach('file', img, 'imagem-pequena.gif')
            .expect(400)
            // console.log(res.body)
            expect(res.body?.message).toEqual("Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
        });
    });
    describe('get getFoto', ()=>{
        it('deve ter sucesso ao buscar foto', async()=>{
            const res = await request(app)
            .get(`/usuarios/${userLogado?._id}/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            expect(res.body).toBeInstanceOf(Buffer)
        });
        it('deve falhar ao buscar foto sem id persistente no banco', async()=>{
            const res = await request(app)
            .get(`/usuarios/ffffffffffffffffffffffff/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .expect(404)
            expect(res.body?.message).toEqual('Recurso não encontrado em Usuário.')
            expect(res.body?.data).toBeNull()
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        });
        it('deve falhar ao buscar foto com id inválido persistente no banco', async()=>{
            const res = await request(app)
            .get(`/usuarios/invalido/foto`)
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .expect(400)
            console.log(res.body)
            expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
            expect(res.body?.data).toBeNull()
            expect(res.body?.errors[0]).toEqual({ path: '', message: 'ID inválido' } )
        });
    });
    describe('post /usuarios/', ()=>{
        it('deve criar um usuário com sucesso', async ()=>{
            const body = {
                nome:"Usuario Novo",
                email:"usuarionovo@gmail.com",
                telefone:"99 6666-4444",
                senha:"Senha@1234",
                dataNascimento:"2001-01-01",
                CPF:"72643266080"
            }
            const res = await request(app)
            .post('/usuarios/')
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .send(body)
            .expect(201)
            // console.log(res.body)
            expect(res.body?.data?.nome).toEqual(body.nome)
            expect(res.body?.data?.email).toEqual(body.email)
            
            userTemp = res.body?.data
        });
        it('deve falhar ao criar um usuário, campos unicos repitidos', async ()=>{
            const body = {
                nome:"Usuario Novo",
                email:"usuarionovo@gmail.com",
                telefone:"99 6666-4444",
                senha:"Senha@1234",
                dataNascimento:"2001-01-01",
                CPF:"72643266080"
            }
            const res = await request(app)
            .post('/usuarios/')
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .send(body)
            .expect(409)
            expect(res.body?.message).toEqual("Conflito de recurso em Usuário contém CPF.")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            /*
            Eu sei que o primeiro campo a entrar em conflito é o CPF, já que ele 
            é o primeiro a ser procurado no service no cadastarUsuario
            se o código acha ele, imediatamente lança um erro.
            */
            
        });
        it('deve falhar ao criar um usuário, campo(s) inváldo(s)', async ()=>{
        //    campo inválido escolhido é o email
            const body = {
                nome:"Usuario Novo",
                email:"email invalido",
                telefone:"99 6666-4444",
                senha:"Senha@1234",
                dataNascimento:"2001-01-01",
                CPF:"72643266080"
            }
            const res = await request(app)
            .post('/usuarios/')
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .send(body)
            .expect(400)
            console.log(res.body)
            expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors[0]).toEqual( { path: 'email', message: 'Formato de email inválido.' } )
        });
        it('deve falhar ao criar um usuário, faltando campos', async ()=>{
        //    campo inválido escolhido é o email
            const body = {
                nome:"Usuario Novo",
            }
            const res = await request(app)
            .post('/usuarios/')
            .set('Authorization', `Bearer ${userLogado.accessToken}`)
            .send(body)
            .expect(400)
            expect(res.body?.message).toEqual('Erro de validação. 5 campo(s) inválido(s).')
            expect(res.body?.data).toEqual(null)
            expect([...res.body?.errors]).toEqual([
        { path: 'email', message: 'O email deve ser do tipo string' },
        { path: 'telefone', message: 'O telefone deve ser do tipo string' },
        { path: 'senha', message: 'A senha deve ser do tipo string' },
        {
          path: 'dataNascimento',
          message: 'A data de nascimento deve ser do tipo string'
        },
        { path: 'CPF', message: 'O CPF deve ser do tipo string' }
      ]);
            
        });
    });
    describe('delete usuarios/:id', ()=> {
        it('deve deletar um usuário com sucesso', async ()=>{
            const res = await request(app)
            .delete(`/usuarios/${userTemp?._id}`)
            .set('Authorization', `Bearer ${moderador?.accessToken}`)
            .expect(200)
            expect(res.body?.message).toEqual('Usuário excluído com sucesso.')
            expect(res.body?.data).toMatchObject(userTemp)
            // console.log(userTemp)
        });
        it('deve falhar ao tentar deletar um usuário que não existe', async ()=>{
            const res = await request(app)
            .delete(`/usuarios/${userTemp?._id}`)
            .set('Authorization', `Bearer ${moderador?.accessToken}`)
            .expect(404)
            expect(res.body?.message).toEqual("Recurso não encontrado em Usuário.")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(userTemp)
        });
    });
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