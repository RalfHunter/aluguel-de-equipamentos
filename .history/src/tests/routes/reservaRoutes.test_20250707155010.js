import request from "supertest";
import { describe, it, expect, beforeAll } from "@jest/globals";
import "../../routes/reservaRoutes.js";
import faker from "faker-br";
import dotenv from "dotenv";
import mongoose from "mongoose";

const PORT = process.env.APP_PORT;
const BASE_URL = `http://localhost:${PORT}`;

describe("reservaRoute", () => {
    let tokenAdmin;
    let idAdmin;
    let tokenUsuario;
    let idUsuario;
    let equipamentoId;
    let reservaId;
    let app = 'http://localhost:5011';
})