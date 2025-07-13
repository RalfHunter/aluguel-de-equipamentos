// schemas/usuarioSchema.js

const usuarioSchemas = {
    UsuarioFiltro: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome do usuário para filtro"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário para filtro"
            },
            ativo: {
                type: "boolean",
                description: "Status ativo/inativo do usuário"
            },
            grupo: {
                type: "string",
                description: "Grupo do usuário para filtro"
            }
        }
    },

    UsuarioListagem: {
        type: "object",
        properties: {
            docs: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/UsuarioDetalhes"
                }
            },
            totalDocs: {
                type: "integer",
                example: 50
            },
            limit: {
                type: "integer",
                example: 10
            },
            totalPages: {
                type: "integer",
                example: 5
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
        description: "Schema para listagem paginada de usuários"
    },

    UsuarioDetalhes: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                format: "objectId",
                description: "ID único do usuário",
                example: "64a7b8c9d1e2f3a4b5c6d789"
            },
            nome: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva Santos"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário",
                example: "joao.silva@example.com"
            },
            telefone: {
                type: "string",
                description: "Telefone do usuário",
                example: "+55 (11) 99999-9999"
            },
            dataNascimento: {
                type: "string",
                format: "date",
                description: "Data de nascimento do usuário",
                example: "1990-05-15"
            },
            CPF: {
                type: "string",
                description: "CPF do usuário",
                example: "123.456.789-00"
            },
            notaMedia: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description: "Nota média do usuário",
                example: 8.5
            },
            ativo: {
                type: "boolean",
                description: "Status ativo/inativo do usuário",
                example: true
            },
            tipoUsuario: {
                type: "string",
                enum: ["admin", "moderador", "usuario"],
                description: "Tipo de usuário",
                example: "usuario"
            },
            fotoUsuario: {
                type: "string",
                format: "uri",
                description: "URL da foto do usuário",
                example: "https://example.com/usuarios/foto.jpg"
            },
            grupos: {
                type: "array",
                items: {
                    type: "string",
                    format: "objectId"
                },
                description: "IDs dos grupos associados ao usuário"
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data de criação do usuário",
                example: "2023-01-15T08:30:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "Data da última atualização do usuário",
                example: "2023-01-16T10:45:00.000Z"
            }
        },
        required: ["nome", "email", "telefone", "dataNascimento", "CPF"],
        description: "Schema completo de detalhes do usuário"
    },

    UsuarioPost: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva Santos"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário",
                example: "joao.silva@example.com"
            },
            telefone: {
                type: "string",
                description: "Telefone do usuário",
                example: "+55 (11) 99999-9999"
            },
            senha: {
                type: "string",
                format: "password",
                description: "Senha do usuário",
                example: "MinhaSenh@123"
            },
            dataNascimento: {
                type: "string",
                format: "date",
                description: "Data de nascimento do usuário",
                example: "1990-05-15"
            },
            CPF: {
                type: "string",
                description: "CPF do usuário",
                example: "123.456.789-00"
            },
            notaMedia: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description: "Nota média do usuário",
                example: 8.5
            },
            ativo: {
                type: "boolean",
                description: "Status ativo/inativo do usuário",
                example: true
            },
            tipoUsuario: {
                type: "string",
                enum: ["admin", "moderador", "usuario"],
                description: "Tipo de usuário",
                example: "usuario"
            },
            fotoUsuario: {
                type: "string",
                format: "uri",
                description: "URL da foto do usuário",
                example: "https://example.com/usuarios/foto.jpg"
            },
            grupos: {
                type: "array",
                items: {
                    type: "string",
                    format: "objectId"
                },
                description: "IDs dos grupos associados ao usuário"
            }
        },
        required: ["nome", "email", "telefone", "senha", "dataNascimento", "CPF"],
        description: "Schema para criação de usuário"
    },

    UsuarioPatch: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva Santos"
            },
            telefone: {
                type: "string",
                description: "Telefone do usuário",
                example: "+55 (11) 99999-9999"
            },
            dataNascimento: {
                type: "string",
                format: "date",
                description: "Data de nascimento do usuário",
                example: "1990-05-15"
            },
            notaMedia: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description: "Nota média do usuário",
                example: 8.5
            },
            ativo: {
                type: "boolean",
                description: "Status ativo/inativo do usuário",
                example: true
            },
            tipoUsuario: {
                type: "string",
                enum: ["admin", "moderador", "usuario"],
                description: "Tipo de usuário",
                example: "usuario"
            },
            fotoUsuario: {
                type: "string",
                format: "uri",
                description: "URL da foto do usuário",
                example: "https://example.com/usuarios/foto.jpg"
            },
            grupos: {
                type: "array",
                items: {
                    type: "string",
                    format: "objectId"
                },
                description: "IDs dos grupos associados ao usuário"
            }
        },
        description: "Schema para atualização parcial de usuário"
    },

    UsuarioPerfilPatch: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva Santos"
            },
            telefone: {
                type: "string",
                description: "Telefone do usuário",
                example: "+55 (11) 99999-9999"
            }
        },
        description: "Schema para atualização do próprio perfil pelo usuário logado (apenas nome e telefone)"
    },

    UsuarioFoto: {
        type: "object",
        properties: {
            file: {
                type: "string",
                format: "binary",
                description: "Arquivo de imagem a ser enviado"
            }
        },
        required: ["file"],
        description: "Schema para upload de foto do usuário"
    },

    UsuarioFotoResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Foto do usuário atualizada com sucesso"
            },
            fotoUrl: {
                type: "string",
                format: "uri",
                example: "https://example.com/usuarios/64a7b8c9d1e2f3a4b5c6d789/foto.jpg"
            },
            metadata: {
                type: "object",
                properties: {
                    originalName: {
                        type: "string",
                        example: "foto_perfil.jpg"
                    },
                    size: {
                        type: "integer",
                        example: 204800
                    },
                    mimetype: {
                        type: "string",
                        example: "image/jpeg"
                    }
                }
            }
        },
        description: "Schema para resposta de upload de foto"
    }
};

export default usuarioSchemas;
