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
})