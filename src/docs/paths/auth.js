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
                400: commonResponses.badRequest,
                401: commonResponses.unauthorized,
                422: commonResponses.unprocessableEntity,
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
                400: commonResponses.badRequest,
                401: commonResponses.unauthorized,
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
                400: commonResponses.badRequest,
                401: commonResponses.unauthorized,
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
                400: commonResponses.badRequest,
                401: commonResponses.unauthorized,
                500: commonResponses.internalServerError
            }
        }
    },

    "/introspect": {
        post: {
            tags: ["Autenticação"],
            summary: "Validar token de acesso",
            description: `
                + Caso de uso: 
                    - Validar se um token está ativo e obter suas informações.
            
                + Função de Negócio:
                    - Implementar endpoint de introspecção OAuth2.
                    - Verificar validade e status do token.
                    - Retornar metadados do token.

                + Regras de Negócio:
                    - Token deve ser fornecido no body.
                    - Retornar informações de expiração e cliente.
                    - Seguir padrão RFC 7662 (OAuth 2.0 Token Introspection).

                + Resultado Esperado:
                    - 200 OK com status e metadados do token.
                    - 401 se token inválido.
                    - 400 se token não fornecido.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/IntrospectRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Token validado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/IntrospectResponse"
                            }
                        }
                    }
                },
                400: commonResponses.badRequest,
                401: commonResponses.unauthorized,
                500: commonResponses.internalServerError
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
                400: commonResponses.badRequest,
                404: commonResponses.notFound,
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

                + Regras de Negócio:
                    - Email deve ser único no sistema.
                    - Senha deve atender aos critérios de segurança.
                    - Nome é obrigatório.
                    - Usuário criado com status ativo por padrão.

                + Resultado Esperado:
                    - 201 Created com dados do usuário criado.
                    - 400 se dados inválidos.
                    - 409 se email já existe.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/SignupRequest"
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
                400: commonResponses.badRequest,
                401: commonResponses.unauthorized,
                422: commonResponses.unprocessableEntity,
                500: commonResponses.internalServerError
            }
        }
    }
};

export default authRoutes;
