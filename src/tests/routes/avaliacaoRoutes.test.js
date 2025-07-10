import avaliacaoRoutes from "../../routes/avaliacaoRoutes.js";
import request from "supertest";
import mongoose from "mongoose";

const PORT = process.env.APP_PORT || 5011;
let app = `http://localhost:${PORT}`;

describe("Avaliações", () => {
    let token;
    let usuarioId;
    let equipamentoId;
    let avaliacaoId;

    beforeAll(async () => {
        // Faz login para obter o token e o ID do usuário
        const loginRes = await request(app)
            .post('/login')
            .send({ email: "dev@gmail.com", senha: "Dev@1234" });

        token = loginRes.body?.data?.user?.accessToken;
        usuarioId = loginRes.body?.data?.user?._id;
        expect(token).toBeTruthy();
        expect(usuarioId).toBeTruthy();

        // Obtém um equipamento válido para os testes
        const equipamentoRes = await request(app)
            .get('/equipamentos')
            .set('Authorization', `Bearer ${token}`);
        console.log("EQUIP", equipamentoRes.body.data?.docs[0]?._id)
        equipamentoId = equipamentoRes.body?.data?.docs[0]?._id;
        expect(equipamentoId).toBeTruthy();

        const avaliacaoRes = await request(app)
            .get(`/avaliacoes?equipamentoId=${equipamentoId}`)
            .set('Authorization', `Bearer ${token}`);

        console.log("AVALIACAO", avaliacaoRes.body.data?.docs[0]?._id)
        avaliacaoId = avaliacaoRes.body.data?.docs[0]?._id;
        expect(avaliacaoId).toBeTruthy();
    });

    describe("GET /avaliacoes", () => {
        it("Deve retornar uma lista de avaliações para um equipamento", async () => {
            const res = await request(app)
                .get(`/avaliacoes?equipamentoId=${equipamentoId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Avaliações listadas com sucesso.");
            expect(res.body.data).toHaveProperty("docs");
            expect(Array.isArray(res.body.data.docs)).toBe(true);
        });

        it("Deve retornar erro se equipamentoId não for fornecido", async () => {
            const res = await request(app)
                .get("/avaliacoes")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("O ID do equipamento é obrigatório");
        });

        it("Deve retornar avaliações filtradas por nota mínima", async () => {
            const res = await request(app)
                .get(`/avaliacoes?equipamentoId=${equipamentoId}&notaMinima=3`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.docs.every(doc => doc.nota >= 3)).toBe(true);
        });
    });

    describe("POST /avaliacoes", () => {
        // it("Deve criar uma nova avaliação com sucesso", async () => {
        //     const novaAvaliacao = {
        //         nota: 5,
        //         descricao: "Excelente equipamento!",
        //         equipamentoId: equipamentoId,
        //         usuarioId: usuarioId
        //     };

        //     const res = await request(app)
        //         .post("/avaliacoes")
        //         .send(novaAvaliacao)
        //         .set("Authorization", `Bearer ${token}`);

        //     expect(res.status).toBe(201);
        //     expect(res.body.message).toBe("Avaliação criada com sucesso.");
        //     expect(res.body.data).toHaveProperty("_id");
        //     expect(res.body.data).toHaveProperty("nota", novaAvaliacao.nota);
        //     expect(res.body.data).toHaveProperty("descricao", novaAvaliacao.descricao);
        // });

        it("Deve retornar erro ao tentar criar avaliação com nota inválida", async () => {
            const avaliacaoInvalida = {
                nota: 6, 
            };

            const res = await request(app)
                .post(`/avaliacoes?equipamentoId=${equipamentoId}&usuarioId=${usuarioId}`)
                .send(avaliacaoInvalida)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("A nota deve ser um número entre 1 e 5.");
        });

        it("Deve retornar erro ao tentar criar avaliação com equipamentoId inválido", async () => {
            const avaliacaoInvalida = {
                nota: 4,
                descricao: "Teste com equipamento inválido",
                equipamentoId: new mongoose.Types.ObjectId().toString(),
                usuarioId: usuarioId
            };

            const res = await request(app)
                .post("/avaliacoes")
                .send(avaliacaoInvalida)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("ID de usuário ou equipamento inválido.");
        });

        it("Deve retornar erro ao tentar criar avaliação duplicada para o mesmo equipamento", async () => {
            const avaliacaoDuplicada = {
                nota: 3,
                descricao: "Tentativa de avaliação duplicada",
            };

            const res = await request(app)
                .post(`/avaliacoes?equipamentoId=${equipamentoId}&usuarioId=${usuarioId}`)
                .send(avaliacaoDuplicada)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(409);
            expect(res.body.message).toBe("Usuário já avaliou este equipamento.");
        });
    });

    describe("PATCH /avaliacoes/:id", () => {
        it("Deve atualizar uma avaliação com sucesso", async () => {
            const atualizacao = {
                nota: 3,
                descricao: "Esperava mais do equipamento"
            };

            const res = await request(app)
                .patch(`/avaliacoes/${avaliacaoId}?usuarioId=${usuarioId}`)
                .send(atualizacao)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Avaliação atualizada com sucesso.");
            expect(res.body.data).toHaveProperty("nota", atualizacao.nota);
            expect(res.body.data).toHaveProperty("descricao", atualizacao.descricao);
        });

        it("Deve retornar erro ao tentar atualizar com nota inválida", async () => {
            const atualizacaoInvalida = {
                nota: 0, 
                descricao: "Não gostei"
            };

            const res = await request(app)
                .patch(`/avaliacoes/${avaliacaoId}?usuarioId=${usuarioId}`)
                .send(atualizacaoInvalida)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("A nota deve ser um número entre 1 e 5.");
        });

        it("Deve retornar erro ao tentar atualizar avaliação inexistente", async () => {
            const invalidId = new mongoose.Types.ObjectId().toString();
            const atualizacao = {
                nota: 4,
                descricao: "Tentativa de atualização"
            };

            const res = await request(app)
                .patch(`/avaliacoes/${invalidId}`)
                .send(atualizacao)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("ID inválido.");
        });
    });

    describe("DELETE /avaliacoes/:id", () => {
        it("Deve remover uma avaliação com sucesso", async () => {
            const res = await request(app)
                .delete(`/avaliacoes/${invalidId}?usuarioId=${usuarioId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Avaliação removida com sucesso.");
        });

        it("Deve retornar erro ao tentar remover avaliação com ID inválido", async () => {
            const invalidId = new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .delete(`/avaliacoes/${invalidId}?usuarioId=${usuarioId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("ID inválido.");
        });
;
    });
});