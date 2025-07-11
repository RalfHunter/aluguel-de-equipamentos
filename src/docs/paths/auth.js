import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";

const authRoutes = {
    "/login": {
        post: {
            tags: ["Autenticação"],
            summary: "Fazer login do usuário",
            description: `
                + Caso de uso: 
                    - Autenticação de usuário no sistema.
            
                + Função de Negócio:
                    - Permitir que usuários façam login fornecendo email e senha.
                    - Gerar tokens de acesso e refresh para autenticação subsequente.
                    - Retornar informações básicas do usuário autenticado.

                + Regras de Negócio:
                    - Email deve ser válido e existir no sistema.
                    - Senha deve atender aos critérios: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número.
                    - Usuário deve estar ativo no sistema.
                    - Gerar access_token com expiração curta e refresh_token com expiração longa.

                + Resultado Esperado:
                    - 200 OK com tokens de acesso e informações do usuário.
                    - 401 se credenciais inválidas.
                    - 400 se dados de entrada inválidos.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Login realizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LoginResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Campos obrigatórios ausentes ou inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Erro de validação. 2 campo(s) inválido(s)." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                path: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { path: "email", message: "Campo email é obrigatório." },
                                            { path: "senha", message: "A senha deve ter pelo menos 8 caracteres." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Credenciais inválidas ou usuário inativo",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Não autorizado" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Email", message: "Erro de autorização: Senha ou Email." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Usuário desativado pelo administrador",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Proibido" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Status", message: "Está conta foi desativada por um administrador por violação de contrato." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                422: {
                    description: "Dados de entrada não atendem aos critérios de validação",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Falha na validação" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                path: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { path: "email", message: "Formato de email inválido." },
                                            { path: "senha", message: "A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses.internalServerError
            }
        }
    },

    "/logout": {
        post: {
            tags: ["Autenticação"],
            summary: "Fazer logout do usuário",
            description: `
                + Caso de uso: 
                    - Invalidar tokens de acesso do usuário.
            
                + Função de Negócio:
                    - Permitir que usuários façam logout invalidando seus tokens.
                    - Revogar o access_token fornecido.
                    - Garantir que o token não possa mais ser usado.

                + Regras de Negócio:
                    - Token deve ser válido e não expirado.
                    - Token pode ser fornecido no body ou no header Authorization.
                    - Após logout, o token fica inválido permanentemente.

                + Resultado Esperado:
                    - 200 OK confirmando logout.
                    - 401 se token inválido.
                    - 400 se token não fornecido.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: false,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LogoutRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Logout realizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SuccessResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Token não fornecido ou inválido",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Requisição com sintaxe incorreta" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Logout", message: "Requisição com sintaxe incorreta" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Token inválido, malformado ou expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                },
                                examples: {
                                    tokenInvalido: {
                                        value: {
                                            success: false,
                                            message: "Token de acesso inválido ou malformado.",
                                            data: null,
                                            errors: [
                                                { field: "NotAuthorized", message: "Token de acesso inválido ou malformado." }
                                            ]
                                        }
                                    },
                                    tokenExpirado: {
                                        value: {
                                            success: false,
                                            message: "Token de acesso expirado.",
                                            data: null,
                                            errors: [
                                                { field: "NotAuthorized", message: "Token de acesso expirado." }
                                            ]
                                        }
                                    },
                                    tokenNaoValido: {
                                        value: {
                                            success: false,
                                            message: "Token de acesso ainda não é válido.",
                                            data: null,
                                            errors: [
                                                { field: "NotAuthorized", message: "Token de acesso ainda não é válido." }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses.internalServerError
            }
        }
    },

    "/refresh": {
        post: {
            tags: ["Autenticação"],
            summary: "Renovar token de acesso",
            description: `
                + Caso de uso: 
                    - Renovar access_token usando refresh_token.
            
                + Função de Negócio:
                    - Permitir renovação de tokens sem novo login.
                    - Gerar novos access_token e refresh_token.
                    - Manter a sessão do usuário ativa.

                + Regras de Negócio:
                    - Refresh token deve ser válido e não expirado.
                    - Gerar novos tokens com nova expiração.
                    - Invalidar refresh_token anterior.

                + Resultado Esperado:
                    - 200 OK com novos tokens.
                    - 401 se refresh_token inválido.
                    - 400 se refresh_token não fornecido.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RefreshTokenRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Token renovado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RefreshTokenResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Refresh token não fornecido ou inválido",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Requisição com sintaxe incorreta" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Refresh", message: "Refresh token is missing." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Refresh token inválido, malformado ou expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                },
                                examples: {
                                    tokenInvalido: {
                                        value: {
                                            success: false,
                                            message: "Token JWT inválido!",
                                            data: null,
                                            errors: [
                                                { field: "Token", message: "Token JWT inválido!" }
                                            ]
                                        }
                                    },
                                    tokenExpirado: {
                                        value: {
                                            success: false,
                                            message: "Token JWT expirado!",
                                            data: null,
                                            errors: [
                                                { field: "Token", message: "Token JWT expirado!" }
                                            ]
                                        }
                                    },
                                    tokenNaoValido: {
                                        value: {
                                            success: false,
                                            message: "Token JWT ainda não é válido!",
                                            data: null,
                                            errors: [
                                                { field: "Token", message: "Token JWT ainda não é válido!" }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                498: {
                    description: "Refresh token expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Token JWT expirado!" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Token", message: "Token JWT expirado!" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses.internalServerError
            }
        }
    },

    "/revoke": {
        post: {
            tags: ["Autenticação"],
            summary: "Revogar tokens de usuário",
            description: `
                + Caso de uso: 
                    - Revogar todos os tokens de um usuário específico.
            
                + Função de Negócio:
                    - Permitir revogação de tokens por ID de usuário.
                    - Invalidar todos os tokens associados ao usuário.
                    - Forçar novo login do usuário.

                + Regras de Negócio:
                    - ID do usuário deve ser válido (ObjectId do MongoDB).
                    - Todos os tokens do usuário ficam inválidos.
                    - Operação irreversível.

                + Resultado Esperado:
                    - 200 OK confirmando revogação.
                    - 400 se ID inválido.
                    - 500 se erro interno.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RevokeTokenRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Tokens revogados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SuccessResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "ID de usuário inválido ou não fornecido",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Erro de validação. 1 campo(s) inválido(s)." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                path: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { path: "", message: "ID inválido" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                401: commonResponses.unauthorized,
                404: {
                    description: "Usuário não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Recurso não encontrado em Usuário." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Usuário", message: "Recurso não encontrado em Usuário." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses.internalServerError
            }
        }
    },

    "/introspect": {
        post: {
            tags: ["Autenticação"],
            summary: "Validar token de acesso (Introspecção OAuth2)",
            description: `
                + Caso de uso: 
                    - Validar se um token está ativo e obter suas informações.
                    - Implementar endpoint de introspecção conforme RFC 7662.
            
                + Função de Negócio:
                    - Implementar endpoint de introspecção OAuth2.
                    - Verificar validade, expiração e status do token.
                    - Retornar metadados detalhados do token.
                    - Suportar validação de tokens JWT com diferentes estados.

                + Regras de Negócio:
                    - Token de acesso é obrigatório no body da requisição.
                    - Token deve ser um JWT válido e bem formado.
                    - Verificar assinatura, expiração e período de validade.
                    - Retornar informações de expiração, cliente e status ativo.
                    - Seguir padrão RFC 7662 (OAuth 2.0 Token Introspection).

                + Cenários de Erro:
                    - 400: Token não fornecido ou vazio
                    - 401: Token malformado ou com assinatura inválida
                    - 498: Token expirado ou ainda não válido
                    - 500: Erro interno durante validação

                + Resultado Esperado:
                    - 200 OK com status e metadados do token.
                    - Diferentes códigos de erro para diferentes problemas de validação.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/IntrospectRequest"
                        },
                        examples: {
                            validToken: {
                                summary: "Token válido",
                                value: {
                                    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNWY5NDg3ODkzNTQwMDAxNjAwMDAwMSIsImlhdCI6MTYzMzc4MDM1MSwiZXhwIjoxNjMzNzgzOTUxfQ.abc123def456ghi789"
                                }
                            },
                            emptyToken: {
                                summary: "Token vazio (causará erro 400)",
                                value: {
                                    accessToken: ""
                                }
                            },
                            malformedToken: {
                                summary: "Token malformado (causará erro 401)",
                                value: {
                                    accessToken: "token.invalido.malformado"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Token validado com sucesso - contém metadados do token",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/IntrospectResponse"
                            },
                            examples: {
                                activeToken: {
                                    summary: "Token ativo",
                                    value: {
                                        success: true,
                                        data: {
                                            active: true,
                                            client_id: "615f9487893540001600001",
                                            token_type: "Bearer",
                                            exp: 1633783951,
                                            iat: 1633780351,
                                            nbf: 1633780351
                                        },
                                        message: "Token validado com sucesso"
                                    }
                                },
                                expiredToken: {
                                    summary: "Token expirado (mas válido)",
                                    value: {
                                        success: true,
                                        data: {
                                            active: false,
                                            client_id: "615f9487893540001600001",
                                            token_type: "Bearer",
                                            exp: 1633780000,
                                            iat: 1633776400,
                                            nbf: 1633776400
                                        },
                                        message: "Token validado com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Token não fornecido ou campos de validação inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                path: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                },
                                examples: {
                                    campoObrigatorio: {
                                        value: {
                                            success: false,
                                            message: "Erro de validação. 1 campo(s) inválido(s).",
                                            data: null,
                                            errors: [
                                                { path: "accessToken", message: "Required" }
                                            ]
                                        }
                                    },
                                    tokenVazio: {
                                        value: {
                                            success: false,
                                            message: "Token de acesso é obrigatório para validação.",
                                            data: null,
                                            errors: [
                                                { field: "accessToken", message: "Token de acesso é obrigatório para validação." }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Token inválido, malformado ou ainda não válido",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                },
                                examples: {
                                    tokenInvalido: {
                                        value: {
                                            success: false,
                                            message: "Token de acesso inválido ou malformado.",
                                            data: null,
                                            errors: [
                                                { field: "accessToken", message: "Token de acesso inválido ou malformado." }
                                            ]
                                        }
                                    },
                                    tokenNaoValido: {
                                        value: {
                                            success: false,
                                            message: "Token de acesso ainda não é válido.",
                                            data: null,
                                            errors: [
                                                { field: "accessToken", message: "Token de acesso ainda não é válido." }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                422: {
                    description: "Token expirado (Token Expired Error)",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Token de acesso expirado." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string", example: "accessToken" },
                                                message: { type: "string", example: "Token de acesso expirado." }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno durante validação do token",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Erro interno durante validação do token." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string", example: "introspection" },
                                                message: { type: "string", example: "Erro interno durante validação do token." }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    "/recover": {
        post: {
            tags: ["Autenticação"],
            summary: "Solicitar recuperação de senha",
            description: `
                + Caso de uso: 
                    - Iniciar processo de recuperação de senha por email.
            
                + Função de Negócio:
                    - Enviar email com token de recuperação.
                    - Gerar token temporário para reset de senha.
                    - Permitir que usuário recupere acesso à conta.

                + Regras de Negócio:
                    - Email deve estar cadastrado no sistema.
                    - Token de recuperação tem validade limitada.
                    - Enviar email com link contendo o token.

                + Resultado Esperado:
                    - 200 OK confirmando envio do email.
                    - 400 se email inválido.
                    - 404 se email não encontrado.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RecoverPasswordRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Email de recuperação enviado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SuccessResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Campo email inválido ou não fornecido",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Erro de validação. 1 campo(s) inválido(s)." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                path: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { path: "email", message: "Campo email é obrigatório." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Usuário desativado não pode recuperar senha",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Proibido" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Aprovado", message: "Se sua conta foi desativada, ela não pode mais ser acessada. Para dúvidas, entre em contato com o suporte." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Email não encontrado no sistema",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Recurso não encontrado" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { field: "Email", message: "Recurso não encontrado" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses.internalServerError
            }
        }
    },

    "/signup": {
        post: {
            tags: ["Autenticação"],
            summary: "Cadastrar novo usuário",
            description: `
                + Caso de uso: 
                    - Permitir auto-cadastro de novos usuários.
            
                + Função de Negócio:
                    - Criar nova conta de usuário.
                    - Validar dados de entrada.
                    - Criptografar senha antes de salvar.
                    - Validar documentos e informações pessoais.

                + Regras de Negócio:
                    - Email deve ser único no sistema.
                    - CPF deve ser único e válido (formato brasileiro).
                    - Telefone deve seguir formato brasileiro com DDD.
                    - Senha deve atender aos critérios de segurança.
                    - Nome completo é obrigatório.
                    - Data de nascimento deve ser válida (formato YYYY-MM-DD).
                    - Usuário criado com status ativo por padrão.

                + Campos Obrigatórios:
                    - nome: Nome completo do usuário
                    - email: Email único no sistema
                    - senha: Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
                    - telefone: Formato brasileiro (XX) XXXXX-XXXX
                    - CPF: Formato brasileiro XXX.XXX.XXX-XX
                    - dataNascimento: Formato YYYY-MM-DD

                + Resultado Esperado:
                    - 201 Created com dados do usuário criado.
                    - 400 se dados inválidos ou formato incorreto.
                    - 409 se email ou CPF já existem.
                    - 422 se validação de dados falhar.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/SignupRequest"
                        },
                        examples: {
                            validUser: {
                                summary: "Dados válidos de usuário",
                                value: {
                                    nome: "João Silva Santos",
                                    email: "joao.silva@exemplo.com",
                                    senha: "MinhaSenh@123",
                                    telefone: "(11) 99999-9999",
                                    CPF: "123.456.789-00",
                                    dataNascimento: "1990-05-15"
                                }
                            },
                            invalidData: {
                                summary: "Dados inválidos (causará erro)",
                                value: {
                                    nome: "",
                                    email: "email-invalido",
                                    senha: "123",
                                    telefone: "123",
                                    CPF: "123",
                                    dataNascimento: "data-invalida"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Usuário criado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SuccessResponse"
                            }
                        }
                    }
                },
                400: commonResponses.badRequest,
                409: commonResponses.conflict,
                422: commonResponses.unprocessableEntity,
                500: commonResponses.internalServerError
            }
        }
    },

    "/password/reset/token": {
        patch: {
            tags: ["Autenticação"],
            summary: "Redefinir senha com token",
            description: `
                + Caso de uso: 
                    - Redefinir senha usando token de recuperação.
            
                + Função de Negócio:
                    - Permitir alteração de senha via token.
                    - Validar token de recuperação.
                    - Atualizar senha no banco de dados.

                + Regras de Negócio:
                    - Token deve ser válido e não expirado.
                    - Nova senha deve atender aos critérios de segurança.
                    - Token é invalidado após uso.
                    - Senha é criptografada antes de salvar.

                + Resultado Esperado:
                    - 200 OK confirmando alteração.
                    - 400 se token inválido ou senha inválida.
                    - 401 se token expirado.
            `,
            parameters: [
                {
                    name: "token",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "Token de recuperação de senha"
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResetPasswordRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Senha redefinida com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/SuccessResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Senha inválida ou não fornecida",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Erro de validação. 1 campo(s) inválido(s)." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                path: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        },
                                        example: [
                                            { path: "senha", message: "A senha deve ter pelo menos 8 caracteres." }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Token de recuperação não fornecido, inválido, malformado ou expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                },
                                examples: {
                                    tokenAusente: {
                                        value: {
                                            success: false,
                                            message: "Token de recuperação na URL como parâmetro ou query é obrigatório para troca da senha.",
                                            data: null,
                                            errors: [
                                                { field: "authentication", message: "Token de recuperação na URL como parâmetro ou query é obrigatório para troca da senha." }
                                            ]
                                        }
                                    },
                                    tokenInvalido: {
                                        value: {
                                            success: false,
                                            message: "Token de recuperação inválido ou malformado.",
                                            data: null,
                                            errors: [
                                                { field: "token", message: "Token de recuperação inválido ou malformado." }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                422: {
                    description: "Token de recuperação expirado ou dados de entrada inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string" },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string" },
                                                message: { type: "string" }
                                            }
                                        }
                                    }
                                },
                                examples: {
                                    tokenExpirado: {
                                        value: {
                                            success: false,
                                            message: "Token de recuperação expirado.",
                                            data: null,
                                            errors: [
                                                { field: "token", message: "Token de recuperação expirado." }
                                            ]
                                        }
                                    },
                                    senhaInvalida: {
                                        value: {
                                            success: false,
                                            message: "Falha na validação",
                                            data: null,
                                            errors: [
                                                { path: "senha", message: "A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres." }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno durante alteração da senha",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Erro interno durante alteração da senha." },
                                    data: { type: "null", example: null },
                                    errors: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                field: { type: "string", example: "passwordReset" },
                                                message: { type: "string", example: "Erro interno durante alteração da senha." }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default authRoutes;
