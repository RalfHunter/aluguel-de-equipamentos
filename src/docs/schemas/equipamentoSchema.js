// schemas/equipamentoSchema.js

const equipamentoSchemas = {
    EquipamentoFiltro: {
        type: "object",
        properties: {
            categoria: {
                type: "string",
                description: "Categoria do equipamento",
                example: "Parafusadeira"
            },
            status: {
                type: "string",
                enum: ["pendente", "ativo", "inativo"],
                description: "Status do equipamento"
            },
            minValor: {
                type: "number",
                minimum: 0,
                description: "Valor mínimo da diária",
                example: 10.50
            },
            maxValor: {
                type: "number",
                minimum: 0,
                description: "Valor máximo da diária",
                example: 100.00
            },
            page: {
                type: "integer",
                minimum: 1,
                default: 1,
                description: "Número da página"
            },
            limit: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 10,
                description: "Quantidade de itens por página"
            }
        }
    },

    EquipamentoFoto: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                example: "64f123abc456def789012345"
            },
            url: {
                type: "string",
                format: "uri",
                example: "http://localhost:3000/uploads/equipamentos/foto.jpg"
            },
            largura: {
                type: "integer",
                minimum: 1,
                example: 800
            },
            altura: {
                type: "integer",
                minimum: 1,
                example: 600
            },
            tamanhoMb: {
                type: "number",
                minimum: 0,
                example: 1.5
            }
        },
        required: ["_id", "url", "largura", "altura", "tamanhoMb"]
    },

    EquipamentoDetalhes: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                example: "64f123abc456def789012345"
            },
            equiNome: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "Parafusadeira Makita 18V"
            },
            equiDescricao: {
                type: "string",
                minLength: 1,
                maxLength: 500,
                example: "Parafusadeira elétrica com bateria de 18V, ideal para trabalhos domésticos e profissionais"
            },
            equiValorDiaria: {
                type: "number",
                minimum: 0,
                example: 35.50
            },
            equiQuantidadeDisponivel: {
                type: "integer",
                minimum: 0,
                example: 5
            },
            equiCategoria: {
                type: "string",
                example: "Parafusadeira"
            },
            equiStatus: {
                type: "string",
                enum: ["pendente", "ativo", "inativo"],
                example: "ativo"
            },
            equiFotos: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/EquipamentoFoto"
                }
            },
            equiProprietario: {
                type: "string",
                example: "64f123abc456def789012345"
            },
            createdAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00.000Z"
            }
        },
        required: ["_id", "equiNome", "equiDescricao", "equiValorDiaria", "equiQuantidadeDisponivel", "equiCategoria", "equiStatus", "equiFotos", "equiProprietario"]
    },

    EquipamentoListagem: {
        type: "object",
        properties: {
            docs: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/EquipamentoDetalhes"
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
        required: ["docs", "totalDocs", "limit", "totalPages", "page"]
    },

    EquipamentoCriacao: {
        type: "object",
        properties: {
            equiNome: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "Parafusadeira Makita 18V"
            },
            equiDescricao: {
                type: "string",
                minLength: 1,
                maxLength: 500,
                example: "Parafusadeira elétrica com bateria de 18V, ideal para trabalhos domésticos e profissionais"
            },
            equiValorDiaria: {
                type: "string",
                pattern: "^\\d+(\\.\\d{1,2})?$",
                example: "35.50"
            },
            equiQuantidadeDisponivel: {
                type: "string",
                pattern: "^\\d+$",
                example: "5"
            },
            equiCategoria: {
                type: "string",
                example: "Parafusadeira"
            }
        },
        required: ["equiNome", "equiDescricao", "equiValorDiaria", "equiQuantidadeDisponivel", "equiCategoria"]
    },

    EquipamentoAtualizacao: {
        type: "object",
        properties: {
            equiNome: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                example: "Parafusadeira Makita 18V Atualizada"
            },
            equiDescricao: {
                type: "string",
                minLength: 1,
                maxLength: 500,
                example: "Parafusadeira elétrica com bateria de 18V, ideal para trabalhos domésticos e profissionais - versão atualizada"
            },
            equiValorDiaria: {
                type: "number",
                minimum: 0,
                example: 40.00
            },
            equiQuantidadeDisponivel: {
                type: "integer",
                minimum: 0,
                example: 3
            }
        }
    },

    EquipamentoStatus: {
        type: "object",
        properties: {
            status: {
                type: "string",
                enum: ["ativo", "inativo"],
                example: "ativo"
            }
        },
        required: ["status"]
    },

    EquipamentoResponse: {
        type: "object",
        properties: {
            data: {
                type: "object",
                properties: {
                    equipamento: {
                        $ref: "#/components/schemas/EquipamentoDetalhes"
                    }
                }
            },
            message: {
                type: "string",
                example: "Equipamento criado com sucesso."
            },
            errors: {
                type: "array",
                items: {},
                example: []
            }
        }
    },

    EquipamentoListaResponse: {
        type: "object",
        properties: {
            data: {
                $ref: "#/components/schemas/EquipamentoListagem"
            },
            message: {
                type: "string",
                example: "Equipamentos listados com sucesso."
            },
            errors: {
                type: "array",
                items: {},
                example: []
            }
        }
    },

    EquipamentoFotoResponse: {
        type: "object",
        properties: {
            data: {
                type: "object",
                properties: {
                    foto: {
                        $ref: "#/components/schemas/EquipamentoFoto"
                    }
                }
            },
            message: {
                type: "string",
                example: "Foto obtida com sucesso."
            },
            errors: {
                type: "array",
                items: {},
                example: []
            }
        }
    }
};

export default equipamentoSchemas;
