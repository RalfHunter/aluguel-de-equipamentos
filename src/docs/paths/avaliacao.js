import commonResponses from "../schemas/swaggerCommonResponses.js";

const avaliacaoRoutes = {
  "/avaliacoes": {
    get: {
      tags: ["Avaliações"],
      summary: "Listar avaliações de um equipamento",
      description: `
        + Caso de Uso:
          - Listar avaliações feitas em um determinado equipamento.
        
        + Regras de Negócio:
            - Obrigatório fornecer equipamentoId via query params.
            - ordenarPorNota=mais-relevantes (ordem crescente)
            - ordenarPorNota=menos-relevantes (ordem decrescente)

        + Resultado Esperado:
          - Lista de avaliações do equipamento especificado com metadados de paginação.
          - Mensagem de "nenhuma avaliação encontrada" se não houver registros.
      `,
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "equipamentoId",
          in: "query",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID do equipamento a ser avaliado",
        },
        {
          name: "ordenarPorNota",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["mais-relevantes", "menos-relevantes"],
          },
          description: "Ordenação das avaliações por nota",
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
          description: "Número da página para paginação",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            default: 10,
            maximum: 100,
          },
          description: "Número de avaliações por página",
        },
      ],
      responses: {
        200: {
          description: "Lista de avaliações retornada com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AvaliacaoListagem",
              },
            },
          },
        },
        400: commonResponses[400](),
        401: commonResponses[401](),
        404: commonResponses[404](),
      },
    },
    post: {
      tags: ["Avaliações"],
      summary: "Criar uma nova avaliação",
      description: `
        + Caso de Uso:
          - Permitir que um usuário avalie um equipamento.

        + Regras de Negócio:
          - Um usuário só pode avaliar um mesmo equipamento uma única vez.
          - A nota deve ser um número de 1 a 5.
          - O ID do usuário e do equipamento devem ser válidos.

        + Resultado Esperado:
          - Avaliação registrada e associada ao equipamento.
          - A nota média do equipamento será recalculada automaticamente.
          - Em caso de erro (como avaliação duplicada), retornar mensagem de erro.
      `,
      security: [{ bearerAuth: [] }],
      parameters: [
        {
            name: "usuarioId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID do usuário que irá avaliar",
        },
        {
          name: "equipamentoId",
          in: "query",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID do equipamento a ser atualizado",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AvaliacaoPost",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Avaliação criada com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AvaliacaoDetalhes",
              },
            },
          },
        },
        400: commonResponses[400](),
        401: commonResponses[401](),
        404: commonResponses[404](),
        409: {
          description: "Usuário já avaliou este equipamento",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AvaliacaoPost",
              },
            },
          },
        },
      },
    },
  },
  "/avaliacoes/{id}": {
    patch: {
      tags: ["Avaliações"],
      summary: "Atualizar uma avaliação existente",
      description: `
        + Caso de Uso:
          - Permitir que o próprio usuário atualize sua avaliação.

        + Regras de Negócio:
          - Apenas o autor da avaliação pode editá-la.
          - IDs devem ser válidos.
          - A nota média do equipamento será recalculada após a atualização.

        + Resultado Esperado:
          - Avaliação atualizada com sucesso.
          - Média do equipamento ajustada.
          - Em caso de tentativa de edição por outro usuário, retornar mensagem de erro.
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
          description: "ID da avaliação a ser atualizada",
        },
        {
            name: "usuarioId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID do usuário que irá atualizar",
          },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AvaliacaoPatch",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Avaliação atualizada com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AvaliacaoDetalhes",
              },
            },
          },
        },
        400: commonResponses[400](),
        401: commonResponses[401](),
        403: {
          description: "Usuário não autorizado a editar esta avaliação",
        },
        404: commonResponses[404](),
      },
    },
    delete: {
      tags: ["Avaliações"],
      summary: "Excluir uma avaliação (admin apenas)",
      description: `
        + Caso de Uso:
          - Permitir que apenas o administrador ou moderador remova avaliações.

        + Regras de Negócio:
          - Apenas usuários com permissão "admin" ou "moderador" podem excluir avaliações.
          - O ID da avaliação deve ser válido.
          - A média do equipamento será recalculada após a exclusão.

        + Resultado Esperado:
          - Avaliação removida com sucesso.
          - Equipamento atualizado com nova média.
          - Em caso de acesso não autorizado, retornar mensagem de erro.
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
          description: "ID da avaliação a ser excluída",
        },
        {
            name: "usuarioId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID do usuário",
          },
      ],
      responses: {
        200: {
          description: "Avaliação excluída com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AvaliacaoDetalhes",
              },
            },
          },
        },
        400: commonResponses[400](),
        401: commonResponses[401](),
        403: {
          description: "Apenas administradores podem remover avaliações",
        },
        404: commonResponses[404](),
      },
    },
  },
};

export default avaliacaoRoutes;
