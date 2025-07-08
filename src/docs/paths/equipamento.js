const equipamentoPaths = {
  "/equipamentos": {
    get: {
      tags: ["Equipamentos"],
      summary: "Listar equipamentos",
      description: "Lista equipamentos com filtros (categoria, valor) e paginação.",
      parameters: [
        { name: "categoria", in: "query", schema: { type: "string" }, description: "Categoria para filtrar" },
        { name: "status", in: "query", schema: { type: "string", enum: ["pendente", "ativo", "inativo"] }, description: "Status do equipamento" },
        { name: "minValor", in: "query", schema: { type: "number" }, description: "Valor mínimo da diária" },
        { name: "maxValor", in: "query", schema: { type: "number" }, description: "Valor máximo da diária" },
        { name: "page", in: "query", schema: { type: "integer" }, description: "Número da página" },
        { name: "limit", in: "query", schema: { type: "integer" }, description: "Limite por página (máx 100)" }
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Lista paginada de equipamentos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EquipamentoListagem" }
            }
          }
        }
      }
    },
    post: {
      tags: ["Equipamentos"],
      summary: "Criar equipamento",
      description: "Cadastra um novo equipamento (somente locador autenticado).",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EquipamentoPost" } 
          }
        }
      },
      responses: {
        201: {
          description: "Equipamento criado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EquipamentoDetalhes" } 
            }
          }
        },
        400: { description: "Erro de validação ou campos inválidos" }
      }
    }
  },
  "/equipamentos/{id}": {
    get: {
      tags: ["Equipamentos"],
      summary: "Buscar equipamento por ID",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } } 
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Equipamento encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EquipamentoDetalhes" } 
            }
          }
        },
        400: { description: "ID inválido ou não encontrado" }
      }
    },
    patch: {
      tags: ["Equipamentos"],
      summary: "Atualizar equipamento",
      description: "Atualiza valor da diária ou quantidade (somente locador).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } } 
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EquipamentoPutPatch" } 
          }
        }
      },
      responses: {
        200: {
          description: "Equipamento atualizado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EquipamentoDetalhes" } 
            }
          }
        },
        400: { description: "Erro de validação ou campos inválidos" }
      }
    }
  },
  "/equipamentos/{id}/aprovar": {
    patch: {
      tags: ["Equipamentos"],
      summary: "Aprovar equipamento",
      description: "Aprovação de equipamento pendente (somente admin).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } } 
      ],
      responses: {
        200: {
          description: "Equipamento aprovado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EquipamentoDetalhes" } 
            }
          }
        },
        400: { description: "ID inválido ou status não pendente" },
        403: { description: "Acesso restrito a admin" }
      }
    }
  },
  "/equipamentos/{id}/reprovar": {
    patch: {
      tags: ["Equipamentos"],
      summary: "Reprovar equipamento",
      description: "Reprovação e exclusão de equipamento pendente (somente admin).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } } 
      ],
      responses: {
        200: {
          description: "Equipamento reprovado e excluído",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EquipamentoDetalhes" } 
            }
          }
        },
        400: { description: "ID inválido ou status não pendente" },
        403: { description: "Acesso restrito a admin" }
      }
    }
  }
};

export default equipamentoPaths;