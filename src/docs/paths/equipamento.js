const equipamentosPaths = {
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
              schema: { $ref: "#/components/schemas/EquipamentoList" }
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
            schema: { $ref: "#/components/schemas/EquipamentoCreate" }
          }
        }
      },
      responses: {
        201: {
          description: "Equipamento criado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Equipamento" }
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
        { name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/EquipamentoId" } }
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Equipamento encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Equipamento" } } } },
        400: { description: "ID inválido ou não encontrado" }
      }
    },
    patch: {
      tags: ["Equipamentos"],
      summary: "Atualizar equipamento",
      description: "Atualiza valor da diária ou quantidade (somente locador).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/EquipamentoId" } }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EquipamentoUpdate" }
          }
        }
      },
      responses: {
        200: { description: "Equipamento atualizado" },
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
        { name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/EquipamentoId" } }
      ],
      responses: {
        200: { description: "Equipamento aprovado" },
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
        { name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/EquipamentoId" } }
      ],
      responses: {
        200: { description: "Equipamento reprovado e excluído" },
        400: { description: "ID inválido ou status não pendente" },
        403: { description: "Acesso restrito a admin" }
      }
    }
  }
};

export default equipamentosPaths;
