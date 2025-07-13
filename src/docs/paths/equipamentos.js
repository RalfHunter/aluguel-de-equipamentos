import equipamentoSchemas from "../schemas/equipamentoSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js";

const equipamentosRoutes = {
    "/equipamentos": {
        get: {
            tags: ["Equipamentos"],
            summary: "Lista todos os equipamentos",
            description: `
                + Caso de uso: 
                    - Listagem de equipamentos para consulta e aluguel.
            
                + Função de Negócio:
                    - Permitir à front-end, App Mobile e serviços server-to-server obter uma lista paginada de equipamentos disponíveis.
                    + Recebe como query parameters (opcionais):
                        • filtros: categoria, status, minValor, maxValor.
                        • paginação: page (número da página), limit (quantidade de itens por página).

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Usuários comuns só podem ver equipamentos com status "ativo".
                    - Administradores podem filtrar por qualquer status, incluindo "pendente".
                    - Validar formatos e valores dos filtros fornecidos.
                    - Aplicar paginação e retornar metadados: total de registros e total de páginas.

                + Resultado Esperado:
                    - 200 OK com corpo conforme schema **EquipamentoListaResponse**, contendo:
                        • **docs**: array de equipamentos.
                        • **dados de paginação**: totalDocs, limit, totalPages, page, pagingCounter, hasPrevPage, hasNextPage, prevPage, nextPage.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'categoria',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string'
                    },
                    description: 'Categoria do equipamento para filtro'
                },
                {
                    name: 'status',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['pendente', 'ativo', 'inativo']
                    },
                    description: 'Status do equipamento (apenas admins podem filtrar por "pendente")'
                },
                {
                    name: 'minValor',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'number',
                        minimum: 0
                    },
                    description: 'Valor mínimo da diária'
                },
                {
                    name: 'maxValor',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'number',
                        minimum: 0
                    },
                    description: 'Valor máximo da diária'
                },
                {
                    name: 'page',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1
                    },
                    description: 'Número da página'
                },
                {
                    name: 'limit',
                    in: 'query',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    },
                    description: 'Quantidade de itens por página'
                }
            ],
            responses: {
                200: {
                    description: "Lista de equipamentos obtida com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoListaResponse"
                            }
                        }
                    }
                },
                403: commonResponses[403](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Equipamentos"],
            summary: "Cadastra um novo equipamento",
            description: `
                + Caso de uso: 
                    - Cadastro de novos equipamentos para disponibilização no sistema.
            
                + Função de Negócio:
                    - Permitir que usuários autenticados cadastrem equipamentos para aluguel.
                    - Equipamentos ficam com status "pendente" até aprovação do administrador.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Obrigatório enviar pelo menos 1 foto e no máximo 5 fotos.
                    - Validar dados obrigatórios: nome, descrição, valor diária, quantidade, categoria.
                    - Equipamento é automaticamente associado ao usuário logado como proprietário.
                    - Status inicial é sempre "pendente".

                + Resultado Esperado:
                    - 201 Created com equipamento criado conforme schema **EquipamentoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                equiNome: {
                                    type: "string",
                                    description: "Nome do equipamento",
                                    example: "Parafusadeira Makita 18V"
                                },
                                equiDescricao: {
                                    type: "string",
                                    description: "Descrição detalhada do equipamento",
                                    example: "Parafusadeira elétrica com bateria de 18V"
                                },
                                equiValorDiaria: {
                                    type: "string",
                                    description: "Valor da diária (formato string para form-data)",
                                    example: "35.50"
                                },
                                equiQuantidadeDisponivel: {
                                    type: "string",
                                    description: "Quantidade disponível (formato string para form-data)",
                                    example: "5"
                                },
                                equiCategoria: {
                                    type: "string",
                                    description: "Categoria do equipamento",
                                    example: "Parafusadeira"
                                },
                                files: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "binary"
                                    },
                                    description: "Fotos do equipamento (mínimo 1, máximo 5)",
                                    minItems: 1,
                                    maxItems: 5
                                }
                            },
                            required: ["equiNome", "equiDescricao", "equiValorDiaria", "equiQuantidadeDisponivel", "equiCategoria", "files"]
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Equipamento criado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoResponse"
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/equipamentos/{id}": {
        get: {
            tags: ["Equipamentos"],
            summary: "Busca um equipamento específico",
            description: `
                + Caso de uso: 
                    - Obter detalhes completos de um equipamento específico.
            
                + Função de Negócio:
                    - Permitir visualização detalhada de um equipamento para decisão de aluguel.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Equipamento deve existir no sistema.
                    - Retornar todas as informações do equipamento incluindo fotos.

                + Resultado Esperado:
                    - 200 OK com equipamento conforme schema **EquipamentoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            responses: {
                200: {
                    description: "Equipamento encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoResponse"
                            }
                        }
                    }
                },
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Equipamentos"],
            summary: "Atualiza dados de um equipamento",
            description: `
                + Caso de uso: 
                    - Atualização de informações de equipamentos pelos proprietários.
            
                + Função de Negócio:
                    - Permitir que proprietários atualizem dados de seus equipamentos ativos.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas o proprietário do equipamento pode atualizar.
                    - Equipamento deve estar com status "ativo" (não "pendente").
                    - Campos permitidos: nome, descrição, valor diária, quantidade disponível.
                    - Não é possível alterar categoria, status ou proprietário.

                + Resultado Esperado:
                    - 200 OK com equipamento atualizado conforme schema **EquipamentoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/EquipamentoAtualizacao"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Equipamento atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoResponse"
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Equipamentos"],
            summary: "Deleta um equipamento",
            description: `
                + Caso de uso: 
                    - Remoção de equipamentos do sistema.
            
                + Função de Negócio:
                    - Permitir que proprietários ou administradores removam equipamentos.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas o proprietário ou administrador pode deletar.
                    - Equipamento não pode ter reservas ativas.

                + Resultado Esperado:
                    - 200 OK com confirmação de deleção.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            responses: {
                200: {
                    description: "Equipamento deletado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "array",
                                        items: {},
                                        example: []
                                    },
                                    message: {
                                        type: "string",
                                        example: "Equipamento deletado com sucesso."
                                    },
                                    errors: {
                                        type: "array",
                                        items: {},
                                        example: []
                                    }
                                }
                            }
                        }
                    }
                },
                403: commonResponses[403](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/equipamentos/{id}/aprovar": {
        patch: {
            tags: ["Equipamentos"],
            summary: "Aprova um equipamento (Admin)",
            description: `
                + Caso de uso: 
                    - Aprovação de equipamentos pendentes por administradores.
            
                + Função de Negócio:
                    - Permitir que administradores aprovem equipamentos que estão pendentes.
                    - Após aprovação, equipamento fica disponível para aluguel.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem aprovar equipamentos.
                    - Equipamento deve estar com status "pendente".
                    - Após aprovação, status muda para "ativo".

                + Resultado Esperado:
                    - 200 OK com equipamento aprovado conforme schema **EquipamentoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            responses: {
                200: {
                    description: "Equipamento aprovado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoResponse"
                            }
                        }
                    }
                },
                403: commonResponses[403](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/equipamentos/{id}/reprovar": {
        patch: {
            tags: ["Equipamentos"],
            summary: "Reprova um equipamento (Admin)",
            description: `
                + Caso de uso: 
                    - Reprovação de equipamentos pendentes por administradores.
            
                + Função de Negócio:
                    - Permitir que administradores reprovem equipamentos que não atendem aos critérios.
                    - Equipamento reprovado fica inativo no sistema.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas administradores podem reprovar equipamentos.
                    - Equipamento deve estar com status "pendente".
                    - Após reprovação, status muda para "inativo".

                + Resultado Esperado:
                    - 200 OK com equipamento reprovado conforme schema **EquipamentoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            responses: {
                200: {
                    description: "Equipamento reprovado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoResponse"
                            }
                        }
                    }
                },
                403: commonResponses[403](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/equipamentos/{id}/status": {
        patch: {
            tags: ["Equipamentos"],
            summary: "Atualiza status do equipamento (ativo/inativo)",
            description: `
                + Caso de uso: 
                    - Alteração de status de equipamentos pelos proprietários.
            
                + Função de Negócio:
                    - Permitir que proprietários ativem ou inativem seus equipamentos.
                    - Controle de disponibilidade para aluguel.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas o proprietário pode alterar o status.
                    - Equipamento deve estar aprovado (não "pendente").
                    - Status possíveis: "ativo" ou "inativo".

                + Resultado Esperado:
                    - 200 OK com equipamento com status atualizado conforme schema **EquipamentoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/EquipamentoStatus"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Status do equipamento atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoResponse"
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/equipamentos/{id}/foto": {
        post: {
            tags: ["Equipamentos"],
            summary: "Adiciona novas fotos ao equipamento",
            description: `
                + Caso de uso: 
                    - Adição de fotos complementares a equipamentos existentes.
            
                + Função de Negócio:
                    - Permitir que proprietários adicionem mais fotos aos seus equipamentos.
                    - Melhorar a apresentação visual dos equipamentos.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Apenas o proprietário pode adicionar fotos.
                    - Máximo de 5 fotos por upload.
                    - Formatos aceitos: JPG, JPEG, PNG.

                + Resultado Esperado:
                    - 200 OK com confirmação da adição das fotos.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                files: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "binary"
                                    },
                                    description: "Fotos do equipamento (máximo 5)",
                                    maxItems: 5
                                }
                            },
                            required: ["files"]
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fotos adicionadas com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "array",
                                        items: {},
                                        example: []
                                    },
                                    message: {
                                        type: "string",
                                        example: "Fotos adicionadas com sucesso."
                                    },
                                    errors: {
                                        type: "array",
                                        items: {},
                                        example: []
                                    }
                                }
                            }
                        }
                    }
                },
                403: commonResponses[403](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/equipamentos/{id}/foto/{fotoId}": {
        get: {
            tags: ["Equipamentos"],
            summary: "Obtém uma foto específica do equipamento",
            description: `
                + Caso de uso: 
                    - Visualização de fotos específicas de equipamentos.
            
                + Função de Negócio:
                    - Permitir acesso direto a fotos individuais dos equipamentos.
                    - Suporte para galeria de imagens e visualização detalhada.

                + Regras de Negócio:
                    - Usuário deve estar autenticado.
                    - Equipamento e foto devem existir no sistema.
                    - Retornar dados da foto incluindo URL de acesso.

                + Resultado Esperado:
                    - 200 OK com dados da foto conforme schema **EquipamentoFotoResponse**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID do equipamento"
                },
                {
                    name: "fotoId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    },
                    description: "ID da foto"
                }
            ],
            responses: {
                200: {
                    description: "Foto obtida com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/EquipamentoFotoResponse"
                            }
                        }
                    }
                },
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default equipamentosRoutes;
