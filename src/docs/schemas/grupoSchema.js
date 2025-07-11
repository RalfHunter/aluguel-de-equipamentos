// schemas/grupoSchema.js

const grupoSchemas = {
    GrupoFiltro: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome do grupo para filtro"
            },
            descricao: {
                type: "string",
                description: "Descrição do grupo para filtro"
            },
            ativo: {
                type: "boolean",
                description: "Status ativo/inativo do grupo"
            },
            nivelPermissao: {
                type: "integer",
                description: "Nível de permissão do grupo",
                minimum: 1,
                maximum: 10
            }
        }
    },

    GrupoListagem: {
        type: "object",
        properties: {
            docs: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/GrupoDetalhes"
                }
            },
            totalDocs: {
                type: "integer",
                example: 25
            },
            limit: {
                type: "integer",
                example: 10
            },
            totalPages: {
                type: "integer",
                example: 3
            },
            page: {
                type: "integer",
                example: 1
            },
            pagingCounter: {
                type: "integer",
                example: 1
            },
            hasPrevPage: {
                type: "boolean",
                example: false
            },
            hasNextPage: {
                type: "boolean",
                example: true
            },
            prevPage: {
                type: "integer",
                nullable: true,
                example: null
            },
            nextPage: {
                type: "integer",
                nullable: true,
                example: 2
            }
        },
        description: "Schema para listagem paginada de grupos"
    },

    GrupoDetalhes: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                format: "ObjectId",
                example: "507f1f77bcf86cd799439011",
                description: "ID único do grupo"
            },
            nome: {
                type: "string",
                example: "Administradores",
                description: "Nome do grupo"
            },
            descricao: {
                type: "string",
                example: "Grupo com permissões administrativas completas",
                description: "Descrição detalhada do grupo"
            },
            ativo: {
                type: "boolean",
                example: true,
                description: "Status do grupo (ativo/inativo)"
            },
            nivelPermissao: {
                type: "integer",
                example: 10,
                description: "Nível de permissão do grupo (1-10)"
            },
            permissoes: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/GrupoPermissao"
                },
                description: "Lista de permissões específicas do grupo"
            },
            createdAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z",
                description: "Data de criação do grupo"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z",
                description: "Data da última atualização"
            }
        },
        description: "Schema detalhado de um grupo"
    },

    GrupoPermissao: {
        type: "object",
        properties: {
            rota: {
                type: "string",
                example: "usuarios",
                description: "Nome da rota/módulo"
            },
            ativo: {
                type: "boolean",
                example: true,
                description: "Status da permissão"
            },
            buscar: {
                type: "boolean",
                example: true,
                description: "Permissão para buscar/listar (GET)"
            },
            enviar: {
                type: "boolean",
                example: true,
                description: "Permissão para criar (POST)"
            },
            editar: {
                type: "boolean",
                example: true,
                description: "Permissão para editar (PUT/PATCH)"
            },
            deletar: {
                type: "boolean",
                example: true,
                description: "Permissão para deletar (DELETE)"
            }
        },
        description: "Schema para permissões específicas de rota"
    },

    GrupoPost: {
        type: "object",
        required: ["nome", "descricao", "nivelPermissao"],
        properties: {
            nome: {
                type: "string",
                example: "Moderadores",
                description: "Nome único do grupo",
                minLength: 3,
                maxLength: 50
            },
            descricao: {
                type: "string",
                example: "Grupo com permissões de moderação",
                description: "Descrição detalhada do grupo",
                minLength: 10,
                maxLength: 200
            },
            ativo: {
                type: "boolean",
                example: true,
                default: true,
                description: "Status inicial do grupo"
            },
            nivelPermissao: {
                type: "integer",
                example: 5,
                description: "Nível de permissão (1-10)",
                minimum: 1,
                maximum: 10
            },
            permissoes: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/GrupoPermissaoPost"
                },
                description: "Lista de permissões específicas"
            }
        },
        description: "Schema para criação de novo grupo"
    },

    GrupoPermissaoPost: {
        type: "object",
        required: ["rota"],
        properties: {
            rota: {
                type: "string",
                example: "equipamentos",
                description: "Nome da rota/módulo"
            },
            ativo: {
                type: "boolean",
                example: true,
                default: true,
                description: "Status da permissão"
            },
            buscar: {
                type: "boolean",
                example: true,
                default: false,
                description: "Permissão para buscar/listar"
            },
            enviar: {
                type: "boolean",
                example: false,
                default: false,
                description: "Permissão para criar"
            },
            editar: {
                type: "boolean",
                example: false,
                default: false,
                description: "Permissão para editar"
            },
            deletar: {
                type: "boolean",
                example: false,
                default: false,
                description: "Permissão para deletar"
            }
        },
        description: "Schema para permissões na criação de grupo"
    },

    GrupoPut: {
        type: "object",
        required: ["nome", "descricao", "nivelPermissao"],
        properties: {
            nome: {
                type: "string",
                example: "Administradores Atualizados",
                description: "Nome único do grupo",
                minLength: 3,
                maxLength: 50
            },
            descricao: {
                type: "string",
                example: "Grupo com permissões administrativas completas - atualizado",
                description: "Descrição detalhada do grupo",
                minLength: 10,
                maxLength: 200
            },
            ativo: {
                type: "boolean",
                example: true,
                description: "Status do grupo"
            },
            nivelPermissao: {
                type: "integer",
                example: 10,
                description: "Nível de permissão (1-10)",
                minimum: 1,
                maximum: 10
            },
            permissoes: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/GrupoPermissaoPost"
                },
                description: "Lista completa de permissões"
            }
        },
        description: "Schema para atualização completa de grupo"
    },

    GrupoPatch: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                example: "Moderadores Atualizados",
                description: "Nome único do grupo",
                minLength: 3,
                maxLength: 50
            },
            descricao: {
                type: "string",
                example: "Descrição atualizada do grupo",
                description: "Descrição detalhada do grupo",
                minLength: 10,
                maxLength: 200
            },
            ativo: {
                type: "boolean",
                example: false,
                description: "Status do grupo"
            },
            nivelPermissao: {
                type: "integer",
                example: 7,
                description: "Nível de permissão (1-10)",
                minimum: 1,
                maximum: 10
            },
            permissoes: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/GrupoPermissaoPost"
                },
                description: "Lista de permissões a serem atualizadas"
            }
        },
        description: "Schema para atualização parcial de grupo"
    }
};

export default grupoSchemas;
