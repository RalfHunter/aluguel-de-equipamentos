import request from 'supertest'



describe('grupoRouter', () => {
    let admin = ''
    let moderador = ''
    let usuario = ''
    let app = 'http://localhost:5011'
    let grupoUsuario = ''
    let grupoCriado = ''
    describe('get /grupos', () => {
        it('deve logar como usuario para provar que seu acesso não é permitido em nenhuma dessas rotas', async()=>{
            const body = {
                email: "usuario@gmail.com",
                senha:"Usuario@1234"
            }
            const res = await request(app)
                .post("/login")
                .send(body)
            usuario = res.body?.data?.user
        })
        it('deve logar como moderador para provar que seu acesso não é permitido em nenhuma dessas rotas', async() =>{
            const body = {
                email: "moderador@gmail.com",
                senha:"Moderador@1234"
            }
            const res = await request(app)
                .post("/login")
                .send(body)
            moderador = res.body?.data?.user
        })
        it('deve logar como Dev/admin para ser possivel fazer requisições', async () => {
            const body = {
                email: "dev@gmail.com",
                senha: "Dev@1234"
            }
            const res = await request(app)
                .post("/login")
                .send(body)
            admin = res.body?.data?.user
        })
        it('deve falhar ao listar grupos, permissão negada (usuario).', async () =>{
            const res = await request(app)
            .get(`/grupos/`)
            .set("Authorization", `Bearer ${usuario?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve falhar ao listar grupos, permissão negada (moderador).', async () =>{
            const res = await request(app)
            .get(`/grupos/`)
            .set("Authorization", `Bearer ${moderador?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve listar todos os grupos, sem nenhuma query', async () => {
            // console.log(admin)
            const res = await request(app)
                .get('/grupos')
                .set("Authorization", `Bearer ${admin?.accessToken}`)
            expect(200)
            expect(res.body.message).toEqual("Requisição bem-sucedida")
            expect(res.body).toHaveProperty("data")
            expect(Array.isArray(res.body?.data?.docs)).toBe(true)
            expect(Array.isArray(res.body?.data?.docs[0]?.permissoes)).toBe(true)
            expect(res.body?.data?.docs[0]).toHaveProperty("_id")
            expect(res.body?.data?.docs[0]).toHaveProperty("nome")
            expect(res.body?.data?.docs[0]).toHaveProperty("descricao")
            expect(res.body?.data?.docs[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]).toHaveProperty("nivelPermissao")
            expect(res.body?.data?.docs[0]).toHaveProperty("permissoes")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("rota")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("dominio")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("ativo")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("buscar")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("enviar")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("substituir")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("modificar")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("excluir")
            expect(res.body?.data?.docs[0]?.permissoes[0]).toHaveProperty("_id")
            grupoUsuario = await pegarIdGrupo(res.body?.data?.docs)
            // console.log(grupoUsuario)
        });
        it('deve listar os grupos baseado nas queries, por nome neste exemplo', async () => {
            const res = await request(app)
                .get('/grupos')
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .query({ nome: "moderador" })
            expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.data?.docs[0]?.nome).toEqual("moderador")
            expect(Number.isInteger(res.body?.data?.docs[0]?.nivelPermissao)).toBe(true)
        });
        it('deve listar os grupos baseado nas queries, por ativo neste exemplo', async () => {
            const res = await request(app)
                .get('/grupos')
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .query({ ativo: true })
            expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.data?.docs[0]?.ativo).toBe(true)
            expect(Number.isInteger(res.body?.data?.docs[0]?.nivelPermissao)).toBe(true)
        });
        it('deve listar os grupos baseado nas queries, por descrição neste exemplo', async () => {
            const res = await request(app)
                .get('/grupos')
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .query({ descricao: "Grupo que pude alocar e alugar equipamentos" })
            expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.data?.docs[0]?.ativo).toBe(true)
            expect(res.body?.data?.docs[0]?.descricao).toEqual("Grupo que pude alocar e alugar equipamentos")
        });
        it('deve listar um grupo por id passado no params', async () => {
            const res = await request(app)
                .get(`/grupos/${grupoUsuario._id}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
            expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
        });
        it('não deve retorna data = null se o id fornecido não existir', async () => {
            const res = await request(app)
                .get(`/grupos/${"ffffffffffffffffffffffff"}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .expect(404)
            expect(res.body?.message).toEqual("Recurso não encontrado em Grupo.")
            expect(res.body?.data).toEqual(null)
            expect(Array.isArray(res.body?.errors)).toBe(true)
            expect(res.body?.errors).toHaveLength(0)
        });
        it('não deve retorna uma mensagem de erro se o id for inválido', async () => {
            const res = await request(app)
                .get(`/grupos/${"idInvalido"}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .expect(400)
            expect(res.body?.message).toEqual('Erro de validação. 1 campo(s) inválido(s).')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors[0]).toEqual({ path: '', message: 'ID inválido' })
        });
    });
    describe('post /grupos', () => {
        it('deve falhar ao criar grupo, permissão negada (usuario).', async () =>{
            const res = await request(app)
            .post(`/grupos`)
            .set("Authorization", `Bearer ${usuario?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve falhar ao criar grupo, permissão negada (moderador).', async () =>{
            const res = await request(app)
            .post(`/grupos`)
            .set("Authorization", `Bearer ${moderador?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve criar um grupo com sucesso com todos os dados válidos', async () => {
            const body = {
                nome: "Grupo_Criado_Teste",
                descricao: "Grupo durante a execução dos testes",
                ativo: true,
                nivelPermissao: 110,
                permissoes: [
                    {
                        rota: "/usuarios",
                        dominio: "localhost",
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: true,
                        modificar: true,
                        excluir: true
                    },
                ]
            }

            const res = await request(app)
                .post('/grupos')
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .send(body)
                .expect(201)
            grupoCriado = res.body?.data
        });
        it('não deve criar um grupo com nome repetido já que ele é um index no mongo', async () => {
            const body = {
                nome: "Grupo_Criado_Teste",
                descricao: "Grupo durante a execução dos testes",
                ativo: true,
                nivelPermissao: 110,
                permissoes: [
                    {
                        rota: "/usuarios",
                        dominio: "localhost",
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: true,
                        modificar: true,
                        excluir: true
                    },
                ]
            }

            const res = await request(app)
                .post('/grupos')
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .send(body)
                .expect(400)
            expect(res.body.message).toEqual('Nome já está em uso.')
            expect(res.body.data).toEqual(null)
            expect(res.body.errors[0]).toEqual({ path: 'nome', message: 'Nome já está em uso.' })
            // console.log(res.body)
        });
    });
    describe('patch /grupos', () => {
        it('deve falhar ao atualizar grupo, permissão negada (usuario).', async () =>{
            const res = await request(app)
            .patch(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${usuario?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve falhar ao atualizar grupo, permissão negada (moderador).', async () =>{
            const res = await request(app)
            .patch(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${moderador?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve atualizar um grupo com dados parciais com sucesso', async () => {
            const body = {
                nome: "Grupo alterado com sucesso",
                descricao: "Grupo alterado durante os testes",
                ativo: true,
                nivelPermissao: 200

            }
            const res = await request(app)
                .patch(`/grupos/${grupoCriado._id}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .send(body)
                .expect(200)
                expect(res.body?.message).toEqual('Requisição bem-sucedida')
                expect(res.body?.data?.nome).toEqual('Grupo alterado com sucesso')
                expect(res.body?.data?.descricao).toEqual('Grupo alterado durante os testes')
                expect(res.body?.data?.ativo).toBe(true)
                expect(res.body?.data?.nivelPermissao).toEqual(200)
                // console.log(res.body)
        });
        it('deve retorna erro ao atualizar grupo, id inválido', async () => {
            const body = {
                nome: "Grupo alterado com sucesso",
                descricao: "Grupo alterado durante os testes",
                ativo: true,
                nivelPermissao: 200

            }
            const res = await request(app)
                .patch(`/grupos/IdInvalido`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .send(body)
                .expect(400)
                expect(res.body?.message).toEqual('Erro de validação. 1 campo(s) inválido(s).')
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors[0]).toEqual( { path: '', message: 'ID inválido' } )
        });
        it('deve retorna erro ao atualizar grupo, id não existe no banco de dados', async () => {
            const body = {
                nome: "Grupo alterado com sucesso",
                descricao: "Grupo alterado durante os testes",
                ativo: true,
                nivelPermissao: 200

            }
            const res = await request(app)
                .patch(`/grupos/ffffffffffffffffffffffff`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .send(body)
                .expect(404)
                expect(res.body?.message).toEqual("Grupo não encontrado")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors).toHaveLength(0)
        });
         it('deve retorna erro ao atualizar grupo, body com valores incorretos', async () => {
            // nome não pode ser numero
            const body = {
                nome: 44,
            }
            const res = await request(app)
                .patch(`/grupos/${grupoCriado._id}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .send(body)
                .expect(400)
                expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors[0]).toEqual({ path: 'nome', message: 'Expected string, received number' })
        });
    });
    describe('put /grupos', () =>{
        it('deve falhar ao atualizar grupo, permissão negada (usuario).', async () =>{
            const res = await request(app)
            .put(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${usuario?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve falhar ao atualizar grupo, permissão negada (moderador).', async () =>{
            const res = await request(app)
            .put(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${moderador?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve atualizar grupos com sucesso, todos os campos são obrigatórios', async()=>{
            const body = {
                nome: "Grupo_Criado_Teste",
                descricao: "Grupo durante a execução dos testes",
                ativo: true,
                nivelPermissao: 110,
                permissoes: [
                    {
                        rota: "/usuarios",
                        dominio: "localhost",
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: true,
                        modificar: true,
                        excluir: true
                    },
                ]
            }
            const res = await request(app)
            .put(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${admin?.accessToken}`)
            .send(body)
            .expect(200)
            expect(res.body?.message).toEqual("Requisição bem-sucedida")
            expect(res.body?.data).toMatchObject(body)
            grupoCriado = res.body?.data
        })
        it('deve retornar erro atualizar grupos, id invalido', async()=>{
            const body = {
                nome: "Grupo_Criado_Teste",
            }
            const res = await request(app)
            .put(`/grupos/IdInvalido`)
            .set("Authorization", `Bearer ${admin?.accessToken}`)
            .send(body)
            .expect(400)
            expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors[0]).toEqual({"message": "ID inválido", "path": ""})
        });
        it('deve retornar falha ao atualizar grupos, id não consta no banco de dados', async()=>{
            const body = {
                nome: "Grupo_Criado_Teste",
            }
            const res = await request(app)
            .put(`/grupos/ffffffffffffffffffffffff`)
            .set("Authorization", `Bearer ${admin?.accessToken}`)
            .send(body)
            .expect(404)
            expect(res.body?.message).toEqual("Grupo não encontrado")
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
        });
        
    });
    
    describe('delete /grupos', () => {
        it('deve falhar ao deletar grupo, permissão negada (usuario).', async () =>{
            const res = await request(app)
            .delete(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${usuario?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve falhar ao deletar grupo, permissão negada (moderador).', async () =>{
            const res = await request(app)
            .delete(`/grupos/${grupoCriado._id}`)
            .set("Authorization", `Bearer ${moderador?.accessToken}`)
            .expect(403)
            expect(res.body?.message).toEqual('Recurso não encontrado em Permissão.')
            expect(res.body?.data).toEqual(null)
            expect(res.body?.errors).toHaveLength(0)
            // console.log(res.body)
        })
        it('deve deletar um grupo com sucesso', async () => {
            const res = await request(app)
                .delete(`/grupos/${grupoCriado._id}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .expect(200)
                expect(res.body?.message).toEqual('Grupo excluído com sucesso.')
                expect(res.body?.data).toMatchObject(grupoCriado)
        });
        it('deve falhar ao tentar deletar um grupo, id não existe no banco', async () => {
            const res = await request(app)
                .delete(`/grupos/${grupoCriado._id}`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .expect(404)
                expect(res.body?.message).toEqual("Grupo não encontrado")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors).toHaveLength(0)
                // console.log(res.body)
        });
        it('deve falhar ao tentar deletar um grupo, id não é válido', async () => {
            const res = await request(app)
                .delete(`/grupos/IdInvalido`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .expect(400)
                expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors[0]).toEqual({"message": "ID inválido", "path": ""})
                // console.log(res.body)
        });
        it('deve falhar ao tentar deletar um grupo, nenhum id foi passado', async () => {
            const res = await request(app)
                .delete(`/grupos/null`)
                .set("Authorization", `Bearer ${admin?.accessToken}`)
                .expect(400)
                expect(res.body?.message).toEqual("Erro de validação. 1 campo(s) inválido(s).")
                expect(res.body?.data).toEqual(null)
                expect(res.body?.errors[0]).toEqual({"message": "ID inválido", "path": ""})
                // console.log(res.body)
        });
    })
})

async function pegarIdGrupo(grupos) {
    console.log(grupos.length)
    for (const grupo of grupos) {
        if (grupo.nome === "usuario") {
            return grupo
        }
    }
}