import request from 'supertest';
import mongoose from 'mongoose';
import Reserva from '../../models/Reserva.js';
import Equipamento from '../../models/Equipamento.js';
import Usuario from '../../models/Usuario.js';


describe("reservaRoute", () => {
    let tokenAdmin;
    let idAdmin;
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
            nome: 'Usuario Teste',
            email: 'usuario.teste@gmail.com',
            senha: 'Usuario@1234',
            telefone: '(11) 91234-5678',
            CPF: '12345678901',
            dataNascimento: new Date('1990-01-01'),
            ativo: true,
        });
        idUsuario = usuario._id;
    });
})