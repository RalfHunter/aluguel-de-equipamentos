import reservasSchemas from "../schemas/reservaSchema.js";
import avaliacaoSchemas from "../schemas/avaliacaoSchema.js";
import reservasPaths from "../paths/reserva.js";
import equipamentoPaths from "../paths/equipamento.js";
import equipamentoSchemas from "../schemas/equipamentoSchema.js";
import usuariosSchemas from "../schemas/usuarioSchema.js";
import usuariosPaths from "../paths/usuarios.js";
import authSchemas from "../schemas/authSchema.js";
import authPaths from "../paths/auth.js";
import gruposSchemas from "../schemas/grupoSchema.js";
import gruposPaths from "../paths/grupos.js";
import avaliacaoPaths from "../paths/avaliacao.js";

const getServersInCorrectOrder = () => {
    const PORT = process.env.APP_PORT
    const devUrl = { url: process.env.SWAGGER_DEV_URL || `http://localhost:${PORT}` };
    const prodUrl1 = { url: process.env.SWAGGER_PROD_URL || "https://api-aluguel-equipamentos.com" };

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
                    name: "Grupos",
                    description: "Rotas para gestão de grupos de permissões"
                },
                {
                    name: "Reservas",
                    description: "Rotas para gestão de reservas"
                },
                {
                    name: "Avaliações",
                    description: "Rotas relacionadas às avaliações feitas em equipamentos."
                },
                {
                    name: "Usuários",
                    description: "Rotas para gestão de usuários"
                },
                {
                    name: "Perfil",
                    description: "Rotas para gestão do perfil do usuário logado"
                },
            ],
            paths: {
                ...reservasPaths,
                ...equipamentoPaths,
                ...authPaths,
                ...gruposPaths,
                ...reservasPaths,
                ...usuariosPaths,
                ...avaliacaoPaths,

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
                    ...gruposSchemas,
                    ...reservasSchemas,
                    ...equipamentoSchemas,
                    ...usuariosSchemas,
                    ...avaliacaoSchemas,
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
