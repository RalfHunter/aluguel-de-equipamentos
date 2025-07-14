import express from "express";
import { asyncWrapper } from '../utils/helpers/index.js';
import EquipamentoController from "../controllers/EquipamentoController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import upload from "../config/multerConfig.js";
import AuthPermission from "../middlewares/AuthPermission.js";

const router = express.Router();
const equipamentoController = new EquipamentoController();


router
    //lista todos os equipamentos cadastrados
    .get("/equipamentos", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.listar.bind(equipamentoController)))

    //lista um equipamento especifico
    .get("/equipamentos/:id", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.listarPorId.bind(equipamentoController)))

    //cadastrar um equipamento
   .post("/equipamentos", AuthMiddleware,  upload.array('files', 5), AuthPermission, asyncWrapper(equipamentoController.criar.bind(equipamentoController)))

    //atualizar dados do equipamento (que esteja ativo)
    .patch("/equipamentos/:id", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.atualizar.bind(equipamentoController)))

    // rota adm aprovar um equipamento
    .patch("/equipamentos/:id/aprovar", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.aprovar.bind(equipamentoController)))

    //rota adm reprovar um equipamento
    .patch("/equipamentos/:id/reprovar", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.reprovar.bind(equipamentoController)))

    //rota para inativar e ativar
    .patch("/equipamentos/:id/status", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.atualizarStatus.bind(equipamentoController)))

    // --- para fotos --- 
    //obter uma foto especifica do equipamento
    .get("/equipamentos/:id/foto/:fotoId", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.listarFoto.bind(equipamentoController)))

    //adicionar uma nova foto
    .post("/equipamentos/:id/foto", AuthMiddleware, upload.array('files', 5), AuthPermission, asyncWrapper(equipamentoController.adicionarFotos.bind(equipamentoController)))

    //deletar um equipamento
    .delete("/equipamentos/:id", AuthMiddleware, AuthPermission, asyncWrapper(equipamentoController.deletarEquipamento.bind(equipamentoController)));


export default router;
