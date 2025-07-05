import reservasSchemas from "../schemas/reservaSchema.js";
import reservasPaths from "../paths/reserva.js";

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
                    name: "Reservas",
                    description: "Rotas para gestão de reservas"
                },
            ],
            paths: {
                ...reservasPaths
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
                    ...reservasSchemas,
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
