import usuarioSchemas from "../schemas/usuarioSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js";

const usuariosRoutes = {
    "/usuarios": {
        get: {
            tags: ["Usuários"],
            summary: "Lista todos os usuários",
            description: `
                + Caso de uso: 
                    - Listagem de usuários para gerenciamento e consulta.
            
                + Função de Negócio:
                    - Permitir à front-end, App Mobile e serviços server-to-server obter uma lista paginada de usuários cadastrados.
                    + Recebe como query parameters (opcionais):
                        • filtros: nome, email, ativo, grupo.
                        • paginação: page (número da página), limit (quantidade de itens por página).

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores e moderadores podem listar usuários.
                    - Validar formatos e valores dos filtros fornecidos.
                    - Aplicar paginação e retornar metadados: total de registros e total de páginas.

                + Resultado Esperado:
                    - 200 OK com corpo conforme schema **UsuarioListagem**, contendo:
                        • **docs**: array de usuários.
                        • **dados de paginação**: totalDocs, limit, totalPages, page, pagingCounter, hasPrevPage, hasNextPage, prevPage, nextPage.
            `,
            security: [{ bearerAuth: [] }],
            parameters: generateParameters(usuarioSchemas.UsuarioFiltro).concat([
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
                200: commonResponses[200]("#/components/schemas/UsuarioListagem"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        },

        post: {
            tags: ["Usuários"],
            summary: "Cria um novo usuário",
            description: `
                + Caso de uso: 
                    - Criação de novo usuário no sistema.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador inserir um novo usuário com todos os dados obrigatórios.
                    + Recebe no corpo da requisição:
                        - Objeto conforme schema **UsuarioPost**, contendo campos como nome, email, telefone, senha, etc.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores e moderadores podem criar usuários.
                    - Validação de campos obrigatórios (nome, email, telefone, senha, dataNascimento, CPF).
                    - Verificação de unicidade para campos únicos (email, telefone, CPF).
                    - Senha deve atender critérios de segurança mínimos.
                    - Definição de status inicial (ativo) de acordo com o fluxo de cadastro.

                + Resultado Esperado:
                    - HTTP 201 Created com corpo conforme **UsuarioDetalhes**, contendo todos os dados do usuário criado.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                409: {
                    description: 'Conflito - dados únicos já existem (email, telefone ou CPF).',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UsuarioPost',
                            },
                        },
                    },
                },
                500: commonResponses[500]()
            }
        }
    },

    "/usuarios/{id}": {
        get: {
            tags: ["Usuários"],
            summary: "Obtém detalhes de um usuário",
            description: `
                + Caso de uso: 
                    - Consulta de detalhes de usuário específico.
                
                + Função de Negócio:
                    - Permitir à front-end, App Mobile ou serviços obter todas as informações de um usuário cadastrado.
                    + Recebe como path parameter:
                        - **id**: identificador do usuário (MongoDB ObjectId).

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores e moderadores podem visualizar detalhes de outros usuários.
                    - Validação do formato do ID.
                    - Verificar existência do usuário e seu status (ativo/inativo).

                + Resultado Esperado:
                    - HTTP 200 OK com corpo conforme **UsuarioDetalhes**, contendo dados completos do usuário.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                    },
                    description: "ID do usuário"
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },

        delete: {
            tags: ["Usuários"],
            summary: "Deleta um usuário",
            description: `
                + Caso de uso: 
                    - Exclusão ou inativação de usuário.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador remover ou inativar um usuário sem afetar integridade de dados.
                    + Recebe como path parameter:
                        - **id**: identificador do usuário.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem deletar usuários.
                    - Verificar impedimentos por relacionamento (conformidade ou auditoria) antes de excluir.
                    - Registrar log de auditoria sobre a operação.
                    - Garantir que não haja vínculos críticos pendentes.

                + Resultado Esperado:
                    - HTTP 200 OK - usuário excluído ou inativado com sucesso.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                    },
                    description: "ID do usuário"
                }
            ],
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    "/usuarios/{id}/status": {
        patch: {
            tags: ["Usuários"],
            summary: "Altera o status de um usuário (ativo/inativo)",
            description: `
                + Caso de uso: 
                    - Ativação ou desativação de usuário por administrador.
                
                + Função de Negócio:
                    - Permitir ao perfil administrador alterar o status ativo/inativo de usuários.
                    + Recebe:
                        - **id** no path.
                        - No corpo, objeto com o novo status.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem alterar status de usuários.
                    - Aplicar imediatamente alterações críticas (ex.: desativação inibe login).
                    - Registrar log de auditoria sobre a operação.

                + Resultado Esperado:
                    - HTTP 200 OK com corpo conforme **UsuarioDetalhes**, refletindo as alterações.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                    },
                    description: "ID do usuário"
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                ativo: {
                                    type: "boolean",
                                    description: "Novo status do usuário",
                                    example: false
                                }
                            },
                            required: ["ativo"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    // Rotas para upload de foto do usuário
    "/usuarios/{id}/foto": {
        post: {
            tags: ["Usuários"],
            summary: "Faz upload da foto do usuário",
            description: `
                + Caso de uso: 
                    - Recebe um arquivo de imagem e atualiza o campo fotoUsuario.
                
                + Função de Negócio:
                    - Validar extensão (jpg, jpeg, png, svg).
                    - Redimensionar para tamanho apropriado.
                    - Salvar no servidor e atualizar o campo fotoUsuario.
                
                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Verificar se o usuário existe.
                    - Garantir que o arquivo seja uma imagem válida.
                    - Limitar tamanho do arquivo.
                
                + Resultado Esperado:
                    - 200 OK com mensagem de sucesso, fotoUsuario atualizado e metadados do arquivo.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "ID do usuário"
                }
            ],
            requestBody: {
                content: {
                    "multipart/form-data": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioFoto"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]('#/components/schemas/UsuarioFotoResponse'),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },

        get: {
            tags: ["Usuários"],
            summary: "Faz download da foto do usuário",
            description: `
                + Caso de uso: 
                    - Retorna o arquivo de imagem associado ao usuário.
                
                + Função de Negócio:
                    - Buscar fotoUsuario no banco.
                    - Retornar o binário da imagem com o Content-Type apropriado.
                
                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Verificar se o usuário existe.
                    - Verificar se o usuário possui foto cadastrada.
                
                + Resultado Esperado:
                    - 200 OK com o arquivo de imagem.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "ID do usuário"
                }
            ],
            responses: {
                200: {
                    description: "Arquivo de imagem retornado",
                    content: {
                        "image/jpeg": { schema: { type: "string", format: "binary" } },
                        "image/png": { schema: { type: "string", format: "binary" } },
                        "image/svg+xml": { schema: { type: "string", format: "binary" } }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },

        delete: {
            tags: ["Usuários"],
            summary: "Remove a foto do usuário",
            description: `
                + Caso de uso: 
                    - Remove a foto associada ao usuário.
                
                + Função de Negócio:
                    - Remover arquivo de imagem do servidor.
                    - Limpar o campo fotoUsuario no banco de dados.
                
                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Verificar se o usuário existe.
                    - Verificar se o usuário possui foto cadastrada.
                
                + Resultado Esperado:
                    - 200 OK com mensagem de sucesso.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "ID do usuário"
                }
            ],
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    // Rotas de perfil
    "/perfil": {
        get: {
            tags: ["Perfil"],
            summary: "Obtém o perfil do usuário logado",
            description: `
                + Caso de uso: 
                    - Consulta do próprio perfil pelo usuário autenticado.
                
                + Função de Negócio:
                    - Permitir ao usuário visualizar seus próprios dados completos.
                
                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Retornar dados do usuário baseado no token de autenticação.
                
                + Resultado Esperado:
                    - HTTP 200 OK com corpo conforme **UsuarioDetalhes**, contendo dados do usuário logado.
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                401: commonResponses[401](),
                500: commonResponses[500]()
            }
        },

        patch: {
            tags: ["Perfil"],
            summary: "Atualiza o perfil do usuário logado",
            description: `
                + Caso de uso: 
                    - Atualização do próprio perfil pelo usuário autenticado.
                
                + Função de Negócio:
                    - Permitir ao usuário modificar seus próprios dados básicos.
                    + Recebe no corpo da requisição:
                        - Objeto conforme **UsuarioPerfilPatch** com os campos a alterar (apenas nome e telefone).

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Usuário só pode alterar seu próprio perfil.
                    - Apenas os campos nome e telefone podem ser alterados pelo próprio usuário.
                    - Garantir unicidade de campos como telefone.

                + Resultado Esperado:
                    - HTTP 200 OK com corpo conforme **UsuarioDetalhes**, refletindo as alterações.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPerfilPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                500: commonResponses[500]()
            }
        }
    }
};

export default usuariosRoutes;
