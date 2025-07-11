import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Avaliacao from '../../models/Avaliacao.js';
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

mongooseSchemaJsonSchema(mongoose);

const avaliacaoJsonSchema = Avaliacao.schema.jsonSchema();
delete avaliacaoJsonSchema.properties.__v;

const avaliacaoSchemas = {
  AvaliacaoFiltro: {
    type: 'object',
    properties: {
      nota: avaliacaoJsonSchema.properties.nota,
      usuarios: avaliacaoJsonSchema.properties.usuarios,
      equipamentos: avaliacaoJsonSchema.properties.equipamentos,
    },
  },
  AvaliacaoListagem: {
    type: 'object',
    properties: {
      docs: {
        type: 'array',
        items: { $ref: '#/components/schemas/AvaliacaoItem' },
      },
      totalDocs: { type: 'number', example: 100 },
      limit: { type: 'number', example: 10 },
      totalPages: { type: 'number', example: 10 },
      page: { type: 'number', example: 1 },
      pagingCounter: { type: 'number', example: 1 },
      hasPrevPage: { type: 'boolean', example: false },
      hasNextPage: { type: 'boolean', example: true },
      prevPage: { type: 'number', nullable: true, example: null },
      nextPage: { type: 'number', example: 2 },
    },
    description: 'Schema para listagem paginada de avaliações',
  },
  AvaliacaoItem: {
    ...deepCopy(avaliacaoJsonSchema),
    description: 'Schema para item de avaliação na listagem',
  },
  AvaliacaoDetalhes: {
    ...deepCopy(avaliacaoJsonSchema),
    description: 'Schema para detalhes de uma avaliação',
  },
  AvaliacaoPost: {
    ...deepCopy(avaliacaoJsonSchema),
    required: ["nota", "usuarios", "equipamentos"],
    description: "Schema para criação de avaliação"
  },
  AvaliacaoPatch: {
    type: 'object',
    properties: {
      nota: avaliacaoJsonSchema.properties.nota,
      descricao: avaliacaoJsonSchema.properties.descricao,
    },
    description: 'Schema para atualização de avaliação',
  },
};

const removalMapping = {
  AvaliacaoItem: [],
  AvaliacaoDetalhes: [],
  AvaliacaoPost: ['createdAt', 'updatedAt', '_id'],
  AvaliacaoPatch: ['createdAt', 'updatedAt', '_id'],
};

Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (avaliacaoSchemas[schemaKey]) {
    removeFieldsRecursively(avaliacaoSchemas[schemaKey], fields);
  }
});

export default avaliacaoSchemas;