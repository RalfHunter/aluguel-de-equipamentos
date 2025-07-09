import express from "express"
import { asyncWrapper } from "../utils/helpers/index.js"
import UsuarioController from "../controllers/UsuarioController.js"
import AuthMiddleware from "../middlewares/AuthMiddleware.js"
import AuthPermission from "../middlewares/AuthPermission.js"
import upload from "../config/multerConfig.js"
import uploadUsuario from "../config/multerUserConfig.js"
import FileMiddleware from "../middlewares/FileMiddleware.js"
import MulterErrorHandler from "../middlewares/MulterErrorHandler.js"
import { accessSync } from "fs"
const router = express.Router()

const usuarioController = new UsuarioController()

router
    .get("/usuarios", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id",AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .patch("/usuarios/",AuthMiddleware, asyncWrapper(usuarioController.updateUsuario.bind(usuarioController)))
    .patch("/usuarios/:id",AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.alterarStatus.bind(usuarioController)))
    .post("/usuarios", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController)))
    .post("/usuarios/:id/foto", AuthMiddleware, uploadUsuario.single('file'), MulterErrorHandler, asyncWrapper(usuarioController.fotoUpload.bind(usuarioController)))
    .get("/usuarios/:id/foto", AuthMiddleware, asyncWrapper(usuarioController.getFoto.bind(usuarioController)))
    .delete("/usuarios/:id/foto", AuthMiddleware, asyncWrapper(usuarioController.removerFoto.bind(usuarioController)))
    .delete("/usuarios/:id", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController)))
    .get("/perfil/", AuthMiddleware, asyncWrapper(usuarioController.getPerfil.bind(usuarioController)))
    .post("/perfil/", AuthMiddleware, asyncWrapper(usuarioController.updatePerfil.bind(usuarioController)))
export default router