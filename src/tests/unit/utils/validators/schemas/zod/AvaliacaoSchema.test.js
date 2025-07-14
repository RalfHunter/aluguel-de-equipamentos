import { AvaliacaoSchema, AvaliacaoUpdateSchema } from '../../../../../../utils/validators/schemas/zod/AvaliacaoSchema.js';
import { z } from 'zod';
import mongoose from 'mongoose';

describe('AvaliacaoSchema', () => {
  let avaliacaoSchema;

  beforeEach(() => {
    avaliacaoSchema = AvaliacaoSchema;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parse', () => {
    it('deve validar todos os dados da avaliação sem retornar erro', () => {
      const mockData = {
        nota: 4.5,
        descricao: 'Ótimo equipamento',
        usuarioId: new mongoose.Types.ObjectId().toString(),
        equipamentoId: new mongoose.Types.ObjectId().toString(),
      };

      const resultado = avaliacaoSchema.parse(mockData);
      expect(resultado).toEqual({
        ...mockData,
        descricao: mockData.descricao.trim(),
      });
    });
  });

  describe('nota', () => {
    it('deve validar uma nota válida', () => {
      const schema = avaliacaoSchema.partial();
      const dataValida = { nota: 4.5 };
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual(dataValida);
    });

    it('deve retornar erro para nota menor que 1', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { nota: 0 };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('A nota mínima é 1');
    });

    it('deve retornar erro para nota maior que 5', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { nota: 6 };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('A nota máxima é 5');
    });

    it('deve retornar erro se nota não for número', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { nota: 'abc' };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Expected number');
    });

    it('deve retornar erro se nota estiver ausente', async () => {
      const schema = avaliacaoSchema;
      const dataInvalida = {
        descricao: 'Ótimo equipamento',
        usuarioId: new mongoose.Types.ObjectId().toString(),
        equipamentoId: new mongoose.Types.ObjectId().toString(),
      };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Required');
    });
  });

  describe('descricao', () => {
    it('deve validar uma descrição válida', () => {
      const schema = avaliacaoSchema.partial();
      const dataValida = { descricao: '  Ótimo equipamento  ' };
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual({ descricao: 'Ótimo equipamento' });
    });

    it('deve retornar erro para descrição vazia', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { descricao: '' };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('A descrição é obrigatória');
    });

    it('deve retornar erro se descricao não for texto', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { descricao: 123 };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Expected string');
    });

    it('deve retornar erro se descricao estiver ausente', async () => {
      const schema = avaliacaoSchema;
      const dataInvalida = {
        nota: 4.5,
        usuarioId: new mongoose.Types.ObjectId().toString(),
        equipamentoId: new mongoose.Types.ObjectId().toString(),
      };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Required');
    });
  });

  describe('usuarioId', () => {
    it('deve validar um ObjectId válido', () => {
      const schema = avaliacaoSchema.partial();
      const dataValida = { usuarioId: new mongoose.Types.ObjectId().toString() };
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual(dataValida);
    });

    it('deve retornar erro para ObjectId inválido', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { usuarioId: 'invalid-id' };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Invalid MongoDB ObjectId');
    });

    it('deve retornar erro se usuarioId não for string', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { usuarioId: 123 };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Expected string');
    });

    it('deve retornar erro se usuarioId estiver ausente', async () => {
      const schema = avaliacaoSchema;
      const dataInvalida = {
        nota: 4.5,
        descricao: 'Ótimo equipamento',
        equipamentoId: new mongoose.Types.ObjectId().toString(),
      };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Required');
    });
  });

  describe('equipamentoId', () => {
    it('deve validar um ObjectId válido', () => {
      const schema = avaliacaoSchema.partial();
      const dataValida = { equipamentoId: new mongoose.Types.ObjectId().toString() };
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual(dataValida);
    });

    it('deve retornar erro para ObjectId inválido', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { equipamentoId: 'invalid-id' };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Invalid MongoDB ObjectId');
    });

    it('deve retornar erro se equipamentoId não for string', async () => {
      const schema = avaliacaoSchema.partial();
      const dataInvalida = { equipamentoId: 123 };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Expected string');
    });

    it('deve retornar erro se equipamentoId estiver ausente', async () => {
      const schema = avaliacaoSchema;
      const dataInvalida = {
        nota: 4.5,
        descricao: 'Ótimo equipamento',
        usuarioId: new mongoose.Types.ObjectId().toString(),
      };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Required');
    });
  });

  describe('AvaliacaoUpdateSchema', () => {
    it('deve validar atualização parcial com apenas alguns campos', () => {
      const schema = AvaliacaoUpdateSchema;
      const dataValida = { nota: 3.5, descricao: 'Atualizado' };
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual({ nota: 3.5, descricao: 'Atualizado' });
    });

    it('deve permitir objeto vazio na atualização', () => {
      const schema = AvaliacaoUpdateSchema;
      const dataValida = {};
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual({});
    });

    it('deve validar nota e aplicar mesmas regras do AvaliacaoSchema', async () => {
      const schema = AvaliacaoUpdateSchema;
      const dataInvalida = { nota: 6 };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('A nota máxima é 5');
    });

    it('deve validar descricao e aplicar trim na atualização', () => {
      const schema = AvaliacaoUpdateSchema;
      const dataValida = { descricao: '  Atualizado  ' };
      const resultado = schema.parse(dataValida);
      expect(resultado).toEqual({ descricao: 'Atualizado' });
    });

    it('deve validar usuarioId e equipamentoId como ObjectId na atualização', async () => {
      const schema = AvaliacaoUpdateSchema;
      const dataInvalida = { usuarioId: 'invalid-id', equipamentoId: 'invalid-id' };
      await expect(schema.parseAsync(dataInvalida)).rejects.toThrow('Invalid MongoDB ObjectId');
    });
  });
});