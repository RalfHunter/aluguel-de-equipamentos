import express from "express";
import { asyncWrapper } from '../utils/helpers/index.js';
import EquipamentoController from "../controllers/EquipamentoController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import upload from "../config/multerConfig.js";
import AuthPermission from "../middlewares/AuthPermission.js";
import MulterErrorHandler from "../middlewares/MulterErrorHandler.js";

const router = express.Router();
const equipamentoController = new EquipamentoController();

router
    //lista todos os equipamentos cadastrados
    .get("/equipamentos", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.listar.bind(equipamentoController)))

    //lista um equipamento especifico
    .get("/equipamentos/:id", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.listarPorId.bind(equipamentoController)))

    //cadastrar um equipamento
    .post("/equipamentos", AuthMiddleware, upload.array('files'), MulterErrorHandler, AuthPermission, asyncWrapper(equipamentoController.criar.bind(equipamentoController)))

    //atualizar dados do equipamento (que esteja ativo)
    .patch("/equipamentos/:id", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.atualizar.bind(equipamentoController)))

    // rota adm aprovar um equipamento
    .patch("/equipamentos/:id/aprovar", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.aprovar.bind(equipamentoController)))

    //rota adm reprovar um equipamento
    .patch("/equipamentos/:id/reprovar", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.reprovar.bind(equipamentoController)))

    //rota para inativar e ativar
    .patch("/equipamentos/:id/status", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.atualizarStatus.bind(equipamentoController)));

export default router;
