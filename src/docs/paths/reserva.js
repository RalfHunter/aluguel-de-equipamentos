import reservasSchemas from "../schemas/reservaSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js";

const reservasRoutes = {
    "/reservas/{id}": {
        patch: {
            tags: ["Reservas"],
            summary: "Atualizar informações de uma reserva existente.",
            description: `
                + Caso de uso: 
                    - Atualizar parcialmente os dados de uma reserva.
            
                + Função de Negócio:
                    - Permitir edição de informações como datas, quantidade, endereço e valor.

                + Regras de Negócio:
                    - A reserva deve existir.
                    - Não permitir sobreposição de datas.

                + Resultado Esperado:
                    - Lista paginada de reservas com metadados 200.
            `,
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
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: reservasSchemas.ReservaPatch,
                    },
                },
            },
            responses: {
                200: {
                    description: 'Reserva retornada com sucesso',
                    content: {
                        'application/json': {
                            schema: reservasSchemas.ReservaDetalhes,
                        },
                    },
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: {
                    description: 'Reserva não encontrada',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ReservaPatch'
                            },
                        },
                    },
                },
            }
        },
        get: {
            tags: ["Reservas"],
            summary: "Listar uma reserva específica usando o identificador único dela.",
            description: `
                    + Caso de uso: 
                        - Consultar os detalhes completos de uma reserva específica.
            
                    + Função de Negócio:
                        - Permitir ao usuário visualizar uma reserva vinculada a ele ou ao seu equipamento.

                    + Regras de Negócio:
                        - ID da reserva deve ser válido.
                        - Verificar se a reserva existe e se o usuário tem permissão.

                    + Resultado Esperado:
                        - Retorno dos dados da reserva, 200.
                `,
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
            responses: {
                200: {
                    description: 'Reserva retornada com sucesso',
                    content: {
                        'application/json': {
                            schema: reservasSchemas.ReservaDetalhes,
                        },
                    },
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
            },
        },
    },
    "/reservas": {
        get: {
            tags: ["Reservas"],
            summary: "Lista todas as reservas",
            description: `
                + Caso de uso: 
                    - Listar reservas feitas ou recebidas pelo usuário, com filtros.
            
                + Função de Negócio:
                    - Exibir as reservas com suporte a filtragem.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Filtros opcionais: dataInicial, dataFinal, statusReserva.
                    - Paginação com limite máximo de 100 itens.
                    - Apenas reservas do usuário são retornadas.

                + Resultado Esperado:
                    - Lista paginada de reservas com metadados,200.
            `,
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
            description: `
                 + Caso de uso: 
                    - Criar uma nova reserva de equipamento com datas, local e quantidade.
            
                + Função de Negócio:
                    - Permitir ao usuário criar orçamentos para projetos específicos.
                    + Recebe no corpo da requisição:
                        - Objeto conforme schema **OrcamentoPost**, contendo dados do orçamento e componentes.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Campos obrigatórios: dataInicial, dataFinal, quantidadeEquipamento, valorEquipamento, enderecoEquipamento, equipamentos, usuarios.
                    - dataInicial não pode ser no passado.
                    - Não pode haver reservas sobrepostas.
                    - Verificar existência do equipamento.

                + Resultado Esperado:
                    - Reserva criada com status "pendente" e retorno dos dados completos, 201.
            `,
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
    },

}

export default reservasRoutes;