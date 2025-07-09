import reservaRoutes from "../../routes/reservaRoutes.js";
import request from "supertest";
import mongoose from "mongoose";

let app = 'http://localhost:5011'

describe("Reservas", () => {
    let token;
    let usuarioId;
    let equipamentoId = '685de5ee33dc9509d2d7cc52';
    let reservaId = '685de5f433dc9509d2d7cddb';

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/login')
            .send({ email: "dev@gmail.com", senha: "Dev@1234" });

        token = loginRes.body?.data?.user?.accessToken
        usuarioId = loginRes.body?.data?.user?._id
        expect(token).toBeTruthy();
    });

    describe("get /reservas", () => {
        it("Deve retornar uma lista de reservas cadastradas", async () => {
            // const equipamentoRes = await request(app).post("/equipamentos").send({
            //     equiNome: "Betoneira 400L",
            //     equiDescricao: "Betoneira elétrica de 400 litros, ideal para obras de médio porte.",
            //     equiValorDiaria: 150,
            //     equiCategoria: "construção civil",
            //     equiFotos: [
            //         {
            //             url: `https://exemplo.com/fotos/${uuid()}.jpg`,
            //             largura: 800,
            //             altura: 600,
            //             tamanhoMb: 1
            //         }
            //     ],
            //     equiQuantidadeDisponivel: 5,
            //     equiUsuario: usuarioId,
            // }).set('Authorization', `Bearer ${token}`);
            // console.log("EQUIPAMENTO", equipamentoRes)
            // const equipamentoId = equipamentoRes.body.data._id;

            await request(app)
                .post("/reservas")
                .send({
                    dataInicial: new Date(Date.now() + 86400000).toISOString(), // Amanhã
                    dataFinal: new Date(Date.now() + 2 * 86400000).toISOString(), // Depois de amanhã
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
        // it("Deve cadastrar uma nova reserva com sucesso", async () => {
        //     const novaReserva = {
        //         dataInicial: new Date('2026-08-22'),
        //         dataFinal: new Date('2026-08-23'),
        //         quantidadeEquipamento: 2,
        //         valorEquipamento: 100,
        //         enderecoEquipamento: "Rua Teste, 123",
        //         statusReserva: "pendente",
        //         equipamentos: equipamentoId,
        //         usuarios: usuarioId,
        //     };

        //     const res = await request(app)
        //         .post("/reservas")
        //         .send(novaReserva)
        //         .set("Authorization", `Bearer ${token}`);

        //     console.log("RESERVA", res.body)
        //     expect(res.status).toBe(201);
        //     expect(res.body).toHaveProperty("message");
        //     expect(res.body).toHaveProperty("data");
        //     expect(res.body.data).toHaveProperty("quantidadeEquipamento", novaReserva.quantidadeEquipamento);
        // });

        it("Deve retornar erro ao cadastrar reserva com dados inválidos", async () => {
            const novaReserva = {
                dataInicial: new Date(Date.now() - 86400000).toISOString(), // Data no passado
                dataFinal: new Date(Date.now() + 86400000).toISOString(),
                quantidadeEquipamento: 0, // Quantidade inválida
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
    });
    describe("patch /reservas/:id", () => {
        it("Deve atualizar parcialmente uma reserva", async () => {
            const reservaRes = await request(app)
                .post("/reservas")
                .send({
                    quantidadeEquipamento: 2,
                    valorEquipamento: 100,
                    enderecoEquipamento: "Rua Teste, 123",
                    statusReserva: "pendente",
                    equipamentos: equipamentoId,
                    usuarios: usuarioId,
                })
                .set("Authorization", `Bearer ${token}`);

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