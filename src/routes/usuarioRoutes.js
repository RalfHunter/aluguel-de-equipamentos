import express from "express"
import { asyncWrapper } from "../utils/helpers/index.js"
import UsuarioController from "../controllers/UsuarioController.js"
import AuthMiddleware from "../middlewares/AuthMiddleware.js"
import AuthPermission from "../middlewares/AuthPermission.js"
import upload from "../config/multerConfig.js"
const router = express.Router()

const usuarioController = new UsuarioController()

router
    .get("/usuarios", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id",AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .patch("/usuarios/",AuthMiddleware, asyncWrapper(usuarioController.updateUsuario.bind(usuarioController)))
    .patch("/usuarios/:id",AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.alterarStatus.bind(usuarioController)))
    .post("/usuarios", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController)))
    .post("/usuarios/:id/foto", AuthMiddleware, AuthPermission, upload.array('file'), asyncWrapper(usuarioController.fotoUpload.bind(usuarioController)))
export default router