import express from "express";
import ReservaController from '../controllers/ReservaController.js';
import AuthMiddleware from "../middlewares/AuthMiddleware.js"
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const reservaController = new ReservaController(); 

router
.get("/reservas", AuthMiddleware, asyncWrapper(reservaController.listar.bind(reservaController)))
.get("/reservas/:id", AuthMiddleware, asyncWrapper(reservaController.listar.bind(reservaController)))
.post("/reservas", AuthMiddleware, asyncWrapper(reservaController.criar.bind(reservaController)))
.patch("/reservas/:id", AuthMiddleware, asyncWrapper(reservaController.atualizar.bind(reservaController)))

export default router;
