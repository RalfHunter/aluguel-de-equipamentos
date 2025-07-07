import request from "supertest";
import { describe, it, expect, beforeAll } from "@jest/globals";
import "../../routes/reservaRoutes.js";
import faker from "faker-br";
import dotenv from "dotenv";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;