import "../../../src/routes/reservaRoutes.js"
import request from "supertest";
import mongoose from "mongoose";

const PORT = process.env.APP_PORT || 3000;
let app = `http://localhost:${PORT}`

describe("Reservas", () => {
    let token;
    let usuarioId;
    let equipamentoId
    let reservaId 

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/login')
            .send({ email: "dev@gmail.com", senha: "Dev@1234" });

        token = loginRes.body?.data?.user?.accessToken
        usuarioId = loginRes.body?.data?.user?._id
        expect(token).toBeTruthy();

        const equipamentoRes = await request(app)
            .get('/equipamentos')
            .set('Authorization', `Bearer ${token}`)
        equipamentoId = equipamentoRes.body?.data?.docs[0]?._id;
        expect(equipamentoId).toBeTruthy();

        const reservaRes = await request(app)
            .get('/reservas')
            .set('Authorization', `Bearer ${token}`)
        reservaId = reservaRes.body?.data?.dados?.docs[0]?._id;
        expect(reservaId).toBeTruthy();
    });

    describe("get /reservas", () => {
        it("Deve retornar uma lista de reservas cadastradas", async () => {

            await request(app)
                .post("/reservas")
                .send({
                    dataInicial: new Date(Date.now() + 86400000).toISOString(),
                    dataFinal: new Date(Date.now() + 2 * 86400000).toISOString(), 
                    quantidadeEquipamento: 2,
                    valorEquipamento: 100,
                    enderecoEquipamento: "Rua Teste, 123",
                    statusReserva: "pendente",
                    equipamentos: equipamentoId,
                    usuarios: usuarioId,
                })
                .set("Authorization", `Bearer ${token}`);

            const res = await request(app)
                .get("/reservas")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Requisição bem-sucedida");
            expect(res.body.data.dados).toHaveProperty("docs");
            expect(Array.isArray(res.body.data.dados.docs)).toBe(true);
        });

        it("Deve retornar reservas filtradas por statusReserva", async () => {
            const res = await request(app)
                .get(`/reservas?statusReserva=pendente`)
                .set("Authorization", `Bearer ${token}`);
        
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.dados.docs)).toBe(true);
        });
    });

    describe("get /reservas/:id", () => {
        it("Deve retornar uma reserva pelo ID", async () => {
            const res = await request(app)
                .get(`/reservas/${reservaId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Requisição bem-sucedida");
            expect(res.body.data.dados).toHaveProperty("_id", reservaId);
        });

        it("Deve retornar erro de reserva não encontrada para ID inválido", async () => {
            const invalidId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .get(`/reservas/${invalidId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Reserva não encontrada.");
        });
    });
    describe("post /reservas", () => {
        // it("Deve criar uma nova reserva com sucesso", async () => {
        //     const dataInicial = new Date(Date.now() + 86400000 + Math.floor(Math.random() * 10000)).toISOString();
        //     const dataFinal = new Date(new Date(dataInicial).getTime() + 86400000).toISOString();           
        //     const novaReserva = {
        //         dataInicial,
        //         dataFinal,
        //         quantidadeEquipamento: 1,
        //         valorEquipamento: 200,
        //         enderecoEquipamento: "Av. Teste, 456",
        //         statusReserva: "pendente",
        //         equipamentos: equipamentoId,
        //         usuarios: usuarioId,
        //     };
        
        //     const res = await request(app)
        //         .post("/reservas")
        //         .send(novaReserva)
        //         .set("Authorization", `Bearer ${token}`);
        
        //     expect(res.status).toBe(201);
        //     expect(res.body.message).toBe("Recurso criado com sucesso");
        //     expect(res.body.data).toHaveProperty("_id");
        //     expect(res.body.data).toHaveProperty("statusReserva", "pendente");
        // });

        it("Deve retornar erro ao cadastrar reserva com dados inválidos", async () => {
            const novaReserva = {
                dataInicial: new Date(Date.now() - 86400000).toISOString(), 
                dataFinal: new Date(Date.now() + 86400000).toISOString(),
                quantidadeEquipamento: 0,
                valorEquipamento: 100,
                enderecoEquipamento: "Rua Teste, 123",
                statusReserva: "pendente",
                equipamentos: new mongoose.Types.ObjectId().toString(),
                usuarios: new mongoose.Types.ObjectId().toString(),
            };

            const res = await request(app)
                .post("/reservas")
                .send(novaReserva)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toContain("A data inicial não pode ser no passado");
        });

        it("Deve retornar erro ao tentar criar reserva com dataFinal menor que dataInicial", async () => {
            const reservaInvalida = {
                dataInicial: new Date(Date.now() + 2 * 86400000).toISOString(),
                dataFinal: new Date(Date.now() + 86400000).toISOString(), 
                quantidadeEquipamento: 1,
                valorEquipamento: 100,
                enderecoEquipamento: "Rua Exemplo, 999",
                statusReserva: "pendente",
                equipamentos: equipamentoId,
                usuarios: usuarioId,
            };
        
            const res = await request(app)
                .post("/reservas")
                .send(reservaInvalida)
                .set("Authorization", `Bearer ${token}`);
        
            expect(res.status).toBe(400); 
            expect(res.body.message).toContain("A data inicial deve ser anterior à data final.");
        });

        it("Deve retornar erro ao tentar reservar com equipamento inexistente", async () => {
            const res = await request(app)
                .post("/reservas")
                .send({
                    dataInicial: new Date(Date.now() + 86400000),
                    dataFinal: new Date(Date.now() + 2 * 86400000),
                    quantidadeEquipamento: 1,
                    valorEquipamento: 100,
                    enderecoEquipamento: "Rua Teste, 123",
                    statusReserva: "pendente",
                    equipamentos: new mongoose.Types.ObjectId().toString(), 
                    usuarios: usuarioId
                })
                .set("Authorization", `Bearer ${token}`);
        
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Equipamento não encontrado.");
        });

        it("Deve retornar erro ao tentar reservar com usuário inexistente", async () => {
            const res = await request(app)
                .post("/reservas")
                .send({
                    dataInicial: new Date(Date.now() + 86400000),
                    dataFinal: new Date(Date.now() + 2 * 86400000),
                    quantidadeEquipamento: 1,
                    valorEquipamento: 100,
                    enderecoEquipamento: "Rua Teste, 123",
                    statusReserva: "pendente",
                    equipamentos: equipamentoId,
                    usuarios: new mongoose.Types.ObjectId().toString()
                })
                .set("Authorization", `Bearer ${token}`);
        
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Usuário não encontrado.");
        });
    });
    describe("patch /reservas/:id", () => {
        it("Deve atualizar parcialmente uma reserva", async () => {
            const atualizacao = {
                statusReserva: "confirmada",
            };

            const res = await request(app)
                .patch(`/reservas/${reservaId}`)
                .send(atualizacao)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Reserva atualizada com sucesso.");
            expect(res.body.data).toHaveProperty("statusReserva", atualizacao.statusReserva);
        });

        it("Deve retornar erro ao tentar atualizar uma reserva inexistente", async () => {
            const invalidId = new mongoose.Types.ObjectId().toString();
            const atualizacao = {
                statusReserva: "confirmada",
            };

            const res = await request(app)
                .patch(`/reservas/${invalidId}`)
                .send(atualizacao)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Reserva não encontrada.");
        });
    });
});