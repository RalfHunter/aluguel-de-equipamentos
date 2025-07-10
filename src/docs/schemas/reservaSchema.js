import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Reserva from '../../models/Reserva.js';
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

mongooseSchemaJsonSchema(mongoose);

const reservaJsonSchema = Reserva.schema.jsonSchema();
delete reservaJsonSchema.properties.__v;

const reservaSchemas = {
  ReservaFiltro: {
    type: 'object',
    properties: {
      dataInicial: reservaJsonSchema.properties.dataInicial,
      dataFinal: reservaJsonSchema.properties.dataFinal,
      statusReserva: reservaJsonSchema.properties.statusReserva,
    },
  },
  ReservaListagem: {
    type: 'object',
    properties: {
      docs: {
        type: 'array',
        items: { $ref: '#/components/schemas/ReservaItem' },
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
    description: 'Schema para listagem paginada de reservas',
  },
  ReservaItem: {
    ...deepCopy(reservaJsonSchema),
    description: 'Schema para item de reserva na listagem',
  },
  ReservaDetalhes: {
    ...deepCopy(reservaJsonSchema),
    description: 'Schema para detalhes de uma reserva',
  },
  ReservaPost: {
    type: 'object',
    properties: {
      dataInicial: reservaJsonSchema.properties.dataInicial,
      dataFinal: reservaJsonSchema.properties.dataFinal,
      dataFinalAtrasada: reservaJsonSchema.properties.dataFinalAtrasada,
      quantidadeEquipamento: reservaJsonSchema.properties.quantidadeEquipamento,
      valorEquipamento: reservaJsonSchema.properties.valorEquipamento,
      enderecoEquipamento: reservaJsonSchema.properties.enderecoEquipamento,
      statusReserva: reservaJsonSchema.properties.statusReserva,
      equipamentos: reservaJsonSchema.properties.equipamentos,
      usuarios: reservaJsonSchema.properties.usuarios,
    },
    required: [
      'dataInicial',
      'dataFinal',
      'quantidadeEquipamento',
      'valorEquipamento',
      'enderecoEquipamento',
      'equipamentos',
      'usuarios',
    ],
    description: 'Schema para criação de reserva',
  },
  ReservaPatch: {
    type: 'object',
    properties: {
      dataInicial: reservaJsonSchema.properties.dataInicial,
      dataFinal: reservaJsonSchema.properties.dataFinal,
      dataFinalAtrasada: reservaJsonSchema.properties.dataFinalAtrasada,
      quantidadeEquipamento: reservaJsonSchema.properties.quantidadeEquipamento,
      valorEquipamento: reservaJsonSchema.properties.valorEquipamento,
      enderecoEquipamento: reservaJsonSchema.properties.enderecoEquipamento,
      statusReserva: reservaJsonSchema.properties.statusReserva,
      equipamentos: reservaJsonSchema.properties.equipamentos,
      usuarios: reservaJsonSchema.properties.usuarios,
    },
    description: 'Schema para atualização de reserva',
  },
};

const removalMapping = {
  ReservaItem: [],
  ReservaDetalhes: [],
  ReservaPost: ['createdAt', 'updatedAt', '_id'],
  ReservaPatch: ['createdAt', 'updatedAt', '_id'],
};

Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (reservaSchemas[schemaKey]) {
    removeFieldsRecursively(reservaSchemas[schemaKey], fields);
  }
});

const reservaMongooseSchema = Reserva.schema;

reservaSchemas.ReservaItem.example = await generateExample(reservaSchemas.ReservaItem, null, reservaMongooseSchema);
reservaSchemas.ReservaDetalhes.example = await generateExample(reservaSchemas.ReservaDetalhes, null, reservaMongooseSchema);
reservaSchemas.ReservaPatch.example = {
  dataInicial: '2025-07-10',
  dataFinal: '2025-07-15',
  quantidadeEquipamento: 2,
  valorEquipamento: 150.0,
  enderecoEquipamento: 'Major Amarante, 123, Vilhena, RO',
  statusReserva: 'pendente',
  equipamentos: '507f1f77bcf86cd799439011',
  usuarios: '507f191e810c19729de860ea',
};
reservaSchemas.ReservaPatch.example = await generateExample(reservaSchemas.ReservaPatch, null, reservaMongooseSchema);

export default reservaSchemas;