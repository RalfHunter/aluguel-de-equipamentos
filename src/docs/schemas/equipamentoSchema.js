import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Equipamento from '../../models/Equipamento.js';
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

mongooseSchemaJsonSchema(mongoose);

const equipamentoJsonSchema = Equipamento.schema.jsonSchema();

delete equipamentoJsonSchema.properties.__v;

const equipamentoSchemas = {
  EquipamentoFiltro: {
    type: "object",
    properties: {
      equiNome: equipamentoJsonSchema.properties.equiNome,
      equiCategoria: equipamentoJsonSchema.properties.equiCategoria,
      equiStatus: equipamentoJsonSchema.properties.equiStatus,
      equiValorDiaria: equipamentoJsonSchema.properties.equiValorDiaria,
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
    }
  },
  EquipamentoListagem: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/EquipamentoItem" }
      },
      totalDocs: { type: "number", example: 100 },
      limit: { type: "number", example: 10 },
      totalPages: { type: "number", example: 10 },
      page: { type: "number", example: 1 },
      pagingCounter: { type: "number", example: 1 },
      hasPrevPage: { type: "boolean", example: false },
      hasNextPage: { type: "boolean", example: true },
      prevPage: { type: "number", nullable: true, example: null },
      nextPage: { type: "number", example: 2 }
    },
    description: "Schema para listagem paginada de equipamentos"
  },
  EquipamentoItem: {
    ...deepCopy(equipamentoJsonSchema),
    description: "Schema para item de equipamento na listagem"
  },
  EquipamentoDetalhes: {
    ...deepCopy(equipamentoJsonSchema),
    description: "Schema para detalhes de um equipamento"
  },
  EquipamentoPost: {
    ...deepCopy(equipamentoJsonSchema),
    required: ["equiNome", "equiDescricao", "equiValorDiaria", "equiQuantidadeDisponivel", "equiCategoria", "equiFotos"],
    description: "Schema para criação de equipamento"
  },
  EquipamentoPutPatch: {
    ...deepCopy(equipamentoJsonSchema),
    required: [],
    description: "Schema para atualização de equipamento"
  }
};

const removalMapping = {
  EquipamentoItem: ['__v'],
  EquipamentoDetalhes: ['__v'],
  EquipamentoPost: ['createdAt', 'updatedAt', '__v', '_id', 'equiNotaMediaAvaliacao', 'equiAvaliacoes', 'equiStatus'],
  EquipamentoPutPatch: ['createdAt', 'updatedAt', '__v', '_id', 'equiNotaMediaAvaliacao', 'equiAvaliacoes', 'equiStatus']
};

Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (equipamentoSchemas[schemaKey]) {
    removeFieldsRecursively(equipamentoSchemas[schemaKey], fields);
  }
});

const equipamentoMongooseSchema = Equipamento.schema;

equipamentoSchemas.EquipamentoItem.example = await generateExample(equipamentoSchemas.EquipamentoItem, null, equipamentoMongooseSchema);
equipamentoSchemas.EquipamentoDetalhes.example = await generateExample(equipamentoSchemas.EquipamentoDetalhes, null, equipamentoMongooseSchema);
equipamentoSchemas.EquipamentoPost.example = {
  equiNome: "Furadeira Bosch",
  equiDescricao: "Furadeira elétrica de alta potência",
  equiValorDiaria: 50,
  equiQuantidadeDisponivel: 5,
  equiCategoria: "Furadeira",
  equiFotos: [{
    url: "https://exemplo.com/furadeira.jpg",
    largura: 800,
    altura: 600,
    tamanhoMb: 0.2
  }]
};
equipamentoSchemas.EquipamentoPutPatch.example = {
  equiValorDiaria: 60,
  equiQuantidadeDisponivel: 10
};

export default equipamentoSchemas;
