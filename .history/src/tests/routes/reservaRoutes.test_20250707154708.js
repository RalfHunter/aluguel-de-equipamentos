import request from "supertest";
import { describe, it, expect, beforeAll } from "@jest/globals";
import "../../routes/reservaRoutes.js";
import faker from "faker-br";
import dotenv from "dotenv";
import mongoose from "mongoose";

const PORT = process.env.APP_PORT;
const BASE_URL = `http://localhost:${PORT}`;

describe("reservaRoute", () => {
  let token;
  let reservaId;
  let equipamentoId;
  let usuarioId;
})