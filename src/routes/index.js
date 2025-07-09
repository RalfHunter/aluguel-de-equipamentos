import express from "express";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "../docs/config/head.js";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";
import dotenv from "dotenv"
import usuario from "./usuarioRoutes.js"
import reserva from "./reservaRoutes.js"
import avaliacoes from "./avaliacaoRoutes.js"
import equipamentoRoutes from "./equipamentoRoutes.js";
import grupo from'./grupoRoutes.js'
import '../models/Avaliacao.js';
import login from "./authRoutes.js";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();

const routes = (app) => {
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }

    app.get("/", (req, res) => {
        res.redirect("/docs");
    });

    const swaggerDocs = swaggerJSDoc(getSwaggerOptions());
    app.use(swaggerUI.serve);
    app.get("/docs", (req, res, next) => {
        swaggerUI.setup(swaggerDocs)(req, res, next);
    });

    app.use(express.json(),
        usuario,
        reserva,
        avaliacoes,
        equipamentoRoutes,
        login,
        grupo
        
    );

    app.use((req, res) => {
        res.status(404).json({ message: "Rota não encontrada" });
    });
};

export default routes;