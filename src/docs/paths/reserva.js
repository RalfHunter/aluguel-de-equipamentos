import reservasSchemas from "../schemas/reservaSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js";

const reservasRoutes =  {
    "/reservas": {
        get: {
            tags: ["Reservas"],
            summary: "Lista todas as reservas",
            description: ``,
            security: [{ bearerAuth: [] }],
            parameters: generateParameters(reservasSchemas.ReservaFiltro).concat([
                {
                name: 'page',
                in: 'query',
                required: false,
                schema: {
                    type: 'integer',
                    minimum: 1,
                    default: 1,
                },
                description: 'Número da página',
                },
                {
                name: 'limit',
                in: 'query',
                required: false,
                schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    default: 10,
                },
                description: 'Quantidade de itens por página (máximo 100)',
                },
            ]),
            responses: {
                200: {
                description: 'Lista de reservas retornada com sucesso',
                content: {
                    'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ReservaListagem',
                    },
                    },
                },
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                500: commonResponses[500](),
            },
        },

        post: {
            tags: ["Reservas"],
            summary: "Criar uma nova reserva",
            description: ``,
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                'application/json': {
                    schema: {
                    $ref: '#/components/schemas/ReservaPost',
                    },
                },
                },
            },
            responses: {
                201: commonResponses[201]('#/components/schemas/ReservaDetalhes'),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                409: {
                    description: 'Conflito com reservas existentes, incluindo período de atraso.',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ReservaPost',
                            },
                        },
                    },
                },
                500: commonResponses[500](),
            },
        },
         
        "/reservas/{id}":{
            get: {
                tags: ["Reservas"],
                summary: "Lista uma reserva específica",
                description: ``,
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID da reserva',
                    },
                ],
            }
        }
    }
}