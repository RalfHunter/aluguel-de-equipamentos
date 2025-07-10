import reservasSchemas from "../schemas/reservaSchema.js";
import reservasPaths from "../paths/reserva.js";
import usuariosSchemas from "../schemas/usuarioSchema.js";
import usuariosPaths from "../paths/usuarios.js";
import authSchemas from "../schemas/authSchema.js";
import authPaths from "../paths/auth.js";

const getServersInCorrectOrder = () => {
    const PORT = process.env.APP_PORT
    const devUrl = { url: process.env.SWAGGER_DEV_URL || `http://localhost:${PORT}` };
    const prodUrl1 = { url: process.env.SWAGGER_PROD_URL || "https://api-aluguel.exemplo.com" };

    if (process.env.NODE_ENV === "production") return [prodUrl1, devUrl];
    else return [devUrl, prodUrl1];
};

const getSwaggerOptions = () => {
    return {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "API Aluguel de Equipamentos",
                version: "1.0.0",
                description: "",
                contact: {
                    name: "Aluguel de Equipamento",
                    email: "aluguelEquipamentos@gmail.com",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "Autenticação",
                    description: "Rotas para autenticação e autorização"
                },
                {
                    name: "Reservas",
                    description: "Rotas para gestão de reservas"
                },
                {
                    name: "Usuários",
                    description: "Rotas para gestão de usuários"
                },
            ],
            paths: {
                ...authPaths,
                ...reservasPaths,
                ...usuariosPaths
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                },
                schemas: {
                    ...authSchemas,
                    ...reservasSchemas,
                    ...usuariosSchemas,
                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: ["./src/routes/*.js"]
    };
};

export default getSwaggerOptions;
