import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
//import authPermission from '../middlewares/AuthPermission.js';
import AvaliacaoController from '../controllers/AvaliacaoController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const avaliacaoController = new AvaliacaoController(); 

router
.get("/avaliacoes", AuthMiddleware, asyncWrapper(avaliacaoController.listar.bind(avaliacaoController)))
.post("/avaliacoes", AuthMiddleware, asyncWrapper(avaliacaoController.criar.bind(avaliacaoController)))
.patch("/avaliacoes/:id", AuthMiddleware, asyncWrapper(avaliacaoController.atualizar.bind(avaliacaoController)))
.delete("/avaliacoes/:id", AuthMiddleware, asyncWrapper(avaliacaoController.remover.bind(avaliacaoController)))

export default router;
