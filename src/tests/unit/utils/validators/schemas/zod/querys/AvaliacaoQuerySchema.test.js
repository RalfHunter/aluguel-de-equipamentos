import {AvaliacaoQuerySchema, AvaliacaoIdSchema } from '../../../../../../../utils/validators/schemas/zod/querys/AvaliacaoQuerySchema.js';
import mongoose from 'mongoose';

describe('AvaliacaoQuerySchema', () => {
  describe('AvaliacaoIdSchema', () => {
    it('deve validar um ID válido', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(() => AvaliacaoIdSchema.parse(validId)).not.toThrow();
    });

    it('deve rejeitar um ID inválido', async () => {
      const invalidId = 'invalid-id';
      await expect(AvaliacaoIdSchema.parseAsync(invalidId)).rejects.toThrow('Invalid MongoDB ObjectId');
    });
  });

  describe('AvaliacaoQuerySchema', () => {
    describe('notaMinima', () => {
      it('deve validar uma nota mínima válida', () => {
        const validQuery = { notaMinima: '4.5' };
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result).toEqual({ notaMinima: 4.5 });
      });

      it('deve aceitar notaMinima como opcional', () => {
        const validQuery = {};
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result.notaMinima).toBeUndefined();
      });

      it('deve rejeitar uma nota mínima inválida (menor que 1)', async () => {
        const invalidQuery = { notaMinima: '0.5' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('notaMinima deve ser entre 1 e 5');
      });

      it('deve rejeitar uma nota mínima inválida (maior que 5)', async () => {
        const invalidQuery = { notaMinima: '5.5' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('notaMinima deve ser entre 1 e 5');
      });

      it('deve rejeitar uma nota mínima não numérica', async () => {
        const invalidQuery = { notaMinima: 'abc' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('notaMinima deve ser entre 1 e 5');
      });
    });

    describe('notaMaxima', () => {
      it('deve validar uma nota máxima válida', () => {
        const validQuery = { notaMaxima: '4.5' };
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result).toEqual({ notaMaxima: 4.5 });
      });

      it('deve aceitar notaMaxima como opcional', () => {
        const validQuery = {};
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result.notaMaxima).toBeUndefined();
      });

      it('deve rejeitar uma nota máxima inválida (menor que 1)', async () => {
        const invalidQuery = { notaMaxima: '0.5' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('notaMaxima deve ser entre 1 e 5');
      });

      it('deve rejeitar uma nota máxima inválida (maior que 5)', async () => {
        const invalidQuery = { notaMaxima: '5.5' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('notaMaxima deve ser entre 1 e 5');
      });

      it('deve rejeitar uma nota máxima não numérica', async () => {
        const invalidQuery = { notaMaxima: 'abc' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('notaMaxima deve ser entre 1 e 5');
      });
    });

    describe('ordenarPorNota', () => {
      it('deve validar valores válidos de ordenarPorNota', () => {
        const validValues = ['mais-relevantes', 'menos-relevantes'];
        
        validValues.forEach(value => {
          const validQuery = { ordenarPorNota: value };
          const result = AvaliacaoQuerySchema.partial().parse(validQuery);
          expect(result).toEqual(validQuery);
        });
      });

      it('deve aceitar ordenarPorNota como opcional', () => {
        const validQuery = {};
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result.ordenarPorNota).toBeUndefined();
      });

      it('deve rejeitar um valor inválido para ordenarPorNota', async () => {
        const invalidQuery = { ordenarPorNota: 'invalido' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow("Invalid enum value. Expected 'mais-relevantes' | 'menos-relevantes'");
      });
    });

    describe('equipamentoId', () => {
      it('deve validar um equipamentoId válido', () => {
        const validQuery = { equipamentoId: new mongoose.Types.ObjectId().toString() };
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result).toEqual(validQuery);
      });

      it('deve aceitar equipamentoId como opcional', () => {
        const validQuery = {};
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result.equipamentoId).toBeUndefined();
      });

      it('deve rejeitar um equipamentoId inválido', async () => {
        const invalidQuery = { equipamentoId: 'invalid-id' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('Invalid MongoDB ObjectId');
      });
    });

    describe('page', () => {
      it('deve validar uma página válida', () => {
        const validQuery = { page: '2' };
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result).toEqual({ page: 2 });
      });

      it('deve usar valor padrão 1 quando page não for fornecida', () => {
        const emptyQuery = {};
        const result = AvaliacaoQuerySchema.parse(emptyQuery);
        expect(result.page).toBe(1);
      });

      it('deve rejeitar uma página inválida (não numérica)', async () => {
        const invalidQuery = { page: 'abc' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('Page deve ser um número inteiro maior que 0');
      });

      it('deve rejeitar uma página inválida (<= 0)', async () => {
        const invalidQuery = { page: '0' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('Page deve ser um número inteiro maior que 0');
      });
    });

    describe('limit', () => {
      it('deve validar um limite válido', () => {
        const validQuery = { limit: '20' };
        const result = AvaliacaoQuerySchema.partial().parse(validQuery);
        expect(result).toEqual({ limit: 20 });
      });

      it('deve usar valor padrão 10 quando limit não for fornecido', () => {
        const emptyQuery = {};
        const result = AvaliacaoQuerySchema.parse(emptyQuery);
        expect(result.limit).toBe(10);
      });

      it('deve rejeitar um limite inválido (não numérico)', async () => {
        const invalidQuery = { limit: 'abc' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('Limit deve ser um número entre 1 e 100');
      });

      it('deve rejeitar um limite inválido (< 1)', async () => {
        const invalidQuery = { limit: '0' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('Limit deve ser um número entre 1 e 100');
      });

      it('deve rejeitar um limite inválido (> 100)', async () => {
        const invalidQuery = { limit: '101' };
        await expect(AvaliacaoQuerySchema.partial().parseAsync(invalidQuery))
          .rejects.toThrow('Limit deve ser um número entre 1 e 100');
      });
    });

    describe('combinação de campos', () => {
      it('deve validar uma query com múltiplos campos válidos', () => {
        const validQuery = {
          notaMinima: '3.5',
          notaMaxima: '4.5',
          ordenarPorNota: 'mais-relevantes',
          equipamentoId: new mongoose.Types.ObjectId().toString(),
          page: '2',
          limit: '20',
        };

        const result = AvaliacaoQuerySchema.parse(validQuery);

        expect(result).toEqual({
          notaMinima: 3.5,
          notaMaxima: 4.5,
          ordenarPorNota: 'mais-relevantes',
          equipamentoId: validQuery.equipamentoId,
          page: 2,
          limit: 20,
        });
      });

      it('deve rejeitar uma query com múltiplos campos inválidos', async () => {
        const invalidQuery = {
          notaMinima: '6',
          notaMaxima: '0',
          ordenarPorNota: 'invalido',
          equipamentoId: 'invalid-id',
          page: '0',
          limit: '101',
        };

        await expect(AvaliacaoQuerySchema.parseAsync(invalidQuery)).rejects.toThrow();
      });
    });
  });
});