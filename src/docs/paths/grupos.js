import grupoSchemas from "../schemas/grupoSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js";

const gruposRoutes = {
    "/grupos": {
        get: {
            tags: ["Grupos"],
            summary: "Lista todos os grupos",
            description: `
                + Caso de uso: 
                    - Listagem de grupos para gerenciamento de permissões e controle de acesso.
            
                + Função de Negócio:
                    - Permitir à front-end, App Mobile e serviços server-to-server obter uma lista paginada de grupos cadastrados.
                    + Recebe como query parameters (opcionais):
                        • filtros: nome, descricao, ativo, nivelPermissao.
                        • paginação: page (número da página), limit (quantidade de itens por página).

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores e moderadores podem listar grupos.
                    - Validar formatos e valores dos filtros fornecidos.
                    - Aplicar paginação e retornar metadados: total de registros e total de páginas.

                + Resultado Esperado:
                    - 200 OK com corpo conforme schema **GrupoListagem**, contendo:
                        • **docs**: array de grupos.
                        • **dados de paginação**: totalDocs, limit, totalPages, page, pagingCounter, hasPrevPage, hasNextPage, prevPage, nextPage.
            `,
            security: [{ bearerAuth: [] }],
            parameters: generateParameters(grupoSchemas.GrupoFiltro).concat([
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
                200: commonResponses[200]("#/components/schemas/GrupoListagem"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        },

        post: {
            tags: ["Grupos"],
            summary: "Cria um novo grupo",
            description: `
                + Caso de uso: 
                    - Criação de novo grupo de permissões no sistema.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador inserir um novo grupo com todas as permissões necessárias.
                    + Recebe no corpo da requisição:
                        - Objeto conforme schema **GrupoPost**, contendo campos como nome, descricao, nivelPermissao, permissoes, etc.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem criar grupos.
                    - Nome do grupo deve ser único no sistema.
                    - Nível de permissão deve estar entre 1 e 10.
                    - Validar estrutura das permissões fornecidas.
                    - Aplicar transformações padrão nos dados (trim, lowercase em campos específicos).

                + Resultado Esperado:
                    - 201 Created com corpo conforme schema **GrupoDetalhes**, contendo todos os dados do grupo criado.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/GrupoPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                409: commonResponses[409](),
                500: commonResponses[500]()
            }
        }
    },

    "/grupos/{id}": {
        get: {
            tags: ["Grupos"],
            summary: "Busca um grupo específico",
            description: `
                + Caso de uso: 
                    - Consulta detalhada de um grupo específico.
                
                + Função de Negócio:
                    - Permitir à front-end, App Mobile e serviços server-to-server obter dados completos de um grupo pelo ID.
                    + Recebe como path parameter:
                        • id: ObjectId do grupo.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores e moderadores podem consultar grupos.
                    - ID deve ser um ObjectId válido.
                    - Grupo deve existir no sistema.

                + Resultado Esperado:
                    - 200 OK com corpo conforme schema **GrupoDetalhes**, contendo todos os dados do grupo solicitado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '507f1f77bcf86cd799439011'
                    },
                    description: 'ID único do grupo'
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },

        put: {
            tags: ["Grupos"],
            summary: "Atualiza completamente um grupo",
            description: `
                + Caso de uso: 
                    - Atualização completa de todos os dados de um grupo.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador atualizar completamente os dados de um grupo.
                    + Recebe como path parameter:
                        • id: ObjectId do grupo.
                    + Recebe no corpo da requisição:
                        - Objeto conforme schema **GrupoPut**, contendo todos os campos obrigatórios.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem atualizar grupos.
                    - ID deve ser um ObjectId válido.
                    - Grupo deve existir no sistema.
                    - Nome do grupo deve ser único (se alterado).
                    - Nível de permissão deve estar entre 1 e 10.
                    - Todos os campos obrigatórios devem ser fornecidos.

                + Resultado Esperado:
                    - 200 OK com corpo conforme schema **GrupoDetalhes**, contendo todos os dados atualizados do grupo.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '507f1f77bcf86cd799439011'
                    },
                    description: 'ID único do grupo'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/GrupoPut"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: commonResponses[409](),
                500: commonResponses[500]()
            }
        },

        patch: {
            tags: ["Grupos"],
            summary: "Atualiza parcialmente um grupo",
            description: `
                + Caso de uso: 
                    - Atualização parcial de dados específicos de um grupo.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador atualizar campos específicos de um grupo.
                    + Recebe como path parameter:
                        • id: ObjectId do grupo.
                    + Recebe no corpo da requisição:
                        - Objeto conforme schema **GrupoPatch**, contendo apenas os campos a serem atualizados.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem atualizar grupos.
                    - ID deve ser um ObjectId válido.
                    - Grupo deve existir no sistema.
                    - Nome do grupo deve ser único (se alterado).
                    - Nível de permissão deve estar entre 1 e 10 (se fornecido).
                    - Pelo menos um campo deve ser fornecido para atualização.

                + Resultado Esperado:
                    - 200 OK com corpo conforme schema **GrupoDetalhes**, contendo todos os dados atualizados do grupo.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '507f1f77bcf86cd799439011'
                    },
                    description: 'ID único do grupo'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: "#/components/schemas/GrupoPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: commonResponses[409](),
                500: commonResponses[500]()
            }
        },

        delete: {
            tags: ["Grupos"],
            summary: "Remove um grupo",
            description: `
                + Caso de uso: 
                    - Exclusão de um grupo do sistema.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador remover um grupo que não é mais necessário.
                    + Recebe como path parameter:
                        • id: ObjectId do grupo.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem excluir grupos.
                    - ID deve ser um ObjectId válido.
                    - Grupo deve existir no sistema.
                    - Não deve existir usuários associados a este grupo.
                    - Grupos padrão do sistema não podem ser excluídos.

                + Resultado Esperado:
                    - 200 OK com mensagem de confirmação da exclusão.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'ObjectId',
                        example: '507f1f77bcf86cd799439011'
                    },
                    description: 'ID único do grupo'
                }
            ],
            responses: {
                200: {
                    description: "Grupo removido com sucesso",
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Grupo removido com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: commonResponses[409](),
                500: commonResponses[500]()
            }
        }
    }
};

export default gruposRoutes;
