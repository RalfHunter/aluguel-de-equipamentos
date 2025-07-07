import request from 'supertest';
import mongoose from 'mongoose';
import Reserva from '../../models/Reserva.js';
import Equipamento from '../../models/Equipamento.js';
import Usuario from '../../models/Usuario.js';
import { email } from 'zod/v4/index.js';


describe("reservaRoute", () => {
    let tokenUsuario;
    let idUsuario;
    let equipamentoId;
    let reservaId;
    let app = 'http://localhost:5011';

    beforeAll(async () => {
        const equipamento = await Equipamento.create({
            equiNome: 'Equipamento Teste',
            equiQuantidadeDisponivel: 10,
            equiStatus: true,
        });
        equipamentoId = equipamento._id;

        const usuario = await Usuario.create({
            nome: 'Danielle Melo',
            email: 'danielle.teste@gmail.com',
            senha: 'Danielle@1234',
            telefone: '(69) 98124-5678',
            CPF: '12345678901',
            dataNascimento: new Date('2004-09-12'),
            ativo: true,
        });
        idUsuario = usuario._id;
    });

    describe("Autenticação inicial", () => {
        it("obtendo token e id do usuário através do login", async () => {
            const body = {
                email: 'danielle.teste@gmail.com',
                senha:  'Danielle@1234'
            }

            const res = await request(app)
                .post('/login')
                .send(body);

            expect(res.status).toEqual(200);
            tokenUsuario = res.body?.data?.user?.accessToken;
            idUsuario = res.body?.data?.user?._id;
            expect(tokenUsuario).toBeDefined();
            expect(idUsuario).toBeDefined();
        })
    })
})