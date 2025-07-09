import express from "express";
import { asyncWrapper } from '../utils/helpers/index.js';
import EquipamentoController from "../controllers/EquipamentoController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import upload from "../config/multerConfig.js";

const router = express.Router();
const equipamentoController = new EquipamentoController();

router
    //lista todos os equipamentos cadastrados
    .get("/equipamentos", AuthMiddleware, asyncWrapper(equipamentoController.listar.bind(equipamentoController)))

    //lista um equipamento especifico
    .get("/equipamentos/:id", AuthMiddleware, asyncWrapper(equipamentoController.listarPorId.bind(equipamentoController)))

    //cadastrar um equipamento
    .post("/equipamentos", AuthMiddleware, upload.array('file'), asyncWrapper(equipamentoController.criar.bind(equipamentoController)))

    //atualizar dados do equipamento (que esteja ativo)
    .patch("/equipamentos/:id", AuthMiddleware, asyncWrapper(equipamentoController.atualizar.bind(equipamentoController)))

    // rota adm aprovar um equipamento
    .patch("/equipamentos/:id/aprovar", AuthMiddleware, asyncWrapper(equipamentoController.aprovar.bind(equipamentoController)))

    //rota adm reprovar um equipamento
    .patch("/equipamentos/:id/reprovar", AuthMiddleware, asyncWrapper(equipamentoController.reprovar.bind(equipamentoController)))

    //rota para inativar e ativar
    .patch("/equipamentos/:id/status", AuthMiddleware, asyncWrapper(equipamentoController.atualizarStatus.bind(equipamentoController)));

export default router;