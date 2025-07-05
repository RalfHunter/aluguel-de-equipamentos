import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import GrupoController from '../controllers/GrupoController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const grupoController = new GrupoController(); // Instância da classe

router
  .get("/grupos", AuthMiddleware, authPermission, asyncWrapper(grupoController.listar.bind(grupoController)))
  .get("/grupos/:id", AuthMiddleware, authPermission, asyncWrapper(grupoController.listar.bind(grupoController)))
  .post("/grupos", AuthMiddleware, authPermission, asyncWrapper(grupoController.criar.bind(grupoController)))
  .patch("/grupos/:id", AuthMiddleware, authPermission, asyncWrapper(grupoController.atualizar.bind(grupoController)))
  .put("/grupos/:id", AuthMiddleware, authPermission, asyncWrapper(grupoController.atualizar.bind(grupoController)))
  .delete("/grupos/:id", AuthMiddleware, authPermission, asyncWrapper(grupoController.deletar.bind(grupoController)))
export default router;
