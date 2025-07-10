// schemas/authSchema.js

const authSchemas = {
    LoginRequest: {
        type: "object",
        required: ["email", "senha"],
        properties: {
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário",
                example: "usuario@exemplo.com"
            },
            senha: {
                type: "string",
                format: "password",
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$",
                description: "Senha do usuário (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)",
                example: "MinhaSenh@123"
            }
        }
    },

    LoginResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true
            },
            data: {
                type: "object",
                properties: {
                    access_token: {
                        type: "string",
                        description: "Token de acesso JWT",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    },
                    refresh_token: {
                        type: "string",
                        description: "Token de refresh JWT",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    },
                    token_type: {
                        type: "string",
                        example: "Bearer"
                    },
                    expires_in: {
                        type: "integer",
                        description: "Tempo de expiração do token em segundos",
                        example: 3600
                    },
                    user_info: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "ID do usuário",
                                example: "507f1f77bcf86cd799439011"
                            },
                            nome: {
                                type: "string",
                                description: "Nome do usuário",
                                example: "João Silva"
                            },
                            email: {
                                type: "string",
                                format: "email",
                                description: "Email do usuário",
                                example: "joao@exemplo.com"
                            }
                        }
                    }
                }
            },
            message: {
                type: "string",
                example: "Login realizado com sucesso"
            }
        }
    },

    LogoutRequest: {
        type: "object",
        properties: {
            access_token: {
                type: "string",
                description: "Token de acesso a ser invalidado (opcional se enviado no header)",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    },

    RefreshTokenRequest: {
        type: "object",
        required: ["refresh_token"],
        properties: {
            refresh_token: {
                type: "string",
                description: "Token de refresh para obter novo access token",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    },

    RefreshTokenResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true
            },
            data: {
                type: "object",
                properties: {
                    access_token: {
                        type: "string",
                        description: "Novo token de acesso JWT",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    },
                    refresh_token: {
                        type: "string",
                        description: "Novo token de refresh JWT",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    },
                    token_type: {
                        type: "string",
                        example: "Bearer"
                    },
                    expires_in: {
                        type: "integer",
                        description: "Tempo de expiração do token em segundos",
                        example: 3600
                    }
                }
            },
            message: {
                type: "string",
                example: "Token renovado com sucesso"
            }
        }
    },

    RevokeTokenRequest: {
        type: "object",
        required: ["id"],
        properties: {
            id: {
                type: "string",
                description: "ID do usuário para revogar o token",
                example: "507f1f77bcf86cd799439011"
            }
        }
    },

    RecoverPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário para recuperação de senha",
                example: "usuario@exemplo.com"
            }
        }
    },

    ResetPasswordRequest: {
        type: "object",
        required: ["senha"],
        properties: {
            senha: {
                type: "string",
                format: "password",
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$",
                description: "Nova senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)",
                example: "NovaSenha@123"
            }
        }
    },

    SignupRequest: {
        type: "object",
        required: ["nome", "email", "senha"],
        properties: {
            nome: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário",
                example: "joao@exemplo.com"
            },
            senha: {
                type: "string",
                format: "password",
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$",
                description: "Senha do usuário (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)",
                example: "MinhaSenh@123"
            }
        }
    },

    IntrospectRequest: {
        type: "object",
        required: ["accessToken"],
        properties: {
            accessToken: {
                type: "string",
                description: "Token de acesso a ser validado",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    },

    IntrospectResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true
            },
            data: {
                type: "object",
                properties: {
                    active: {
                        type: "boolean",
                        description: "Indica se o token está ativo",
                        example: true
                    },
                    client_id: {
                        type: "string",
                        description: "ID do cliente OAuth",
                        example: "507f1f77bcf86cd799439011"
                    },
                    token_type: {
                        type: "string",
                        example: "Bearer"
                    },
                    exp: {
                        type: "integer",
                        description: "Timestamp UNIX de expiração",
                        example: 1675209600
                    },
                    iat: {
                        type: "integer",
                        description: "Timestamp UNIX de emissão",
                        example: 1675206000
                    },
                    nbf: {
                        type: "integer",
                        description: "Não válido antes deste timestamp",
                        example: 1675206000
                    }
                }
            },
            message: {
                type: "string",
                example: "Token validado com sucesso"
            }
        }
    },

    SuccessResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true
            },
            data: {
                type: "object",
                nullable: true,
                example: null
            },
            message: {
                type: "string",
                example: "Operação realizada com sucesso"
            }
        }
    }
};

export default authSchemas;
