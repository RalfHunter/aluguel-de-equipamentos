import { EquipamentoIdSchema, EquipamentoQuerySchema } from '../../../../../../../utils/validators/schemas/zod/querys/EquipamentoQuerySchema';
import mongoose from 'mongoose';

describe('EquipamentoQuerySchema', () => {
  let equipamentoIdSchema;
  let equipamentoQuerySchema;

  beforeEach(() => {
    equipamentoIdSchema = EquipamentoIdSchema;
    equipamentoQuerySchema = EquipamentoQuerySchema;
  });

  describe('EquipamentoIdSchema', () => {
    it('deve validar um ID válido', () => {
      const IdValido = '507f1f77bcf86cd799439011';
      const resultado = equipamentoIdSchema.parse(IdValido);
      expect(resultado).toEqual(IdValido);
    });

    it('deve retornar erro para um ID inválido', () => {
      const IdInvalido = '507f1f77bcf86cd7994390';
      let erro;
      try {
        equipamentoIdSchema.parse(IdInvalido);
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/ID inválido/);
    });

    it('deve retornar erro para um ID com caracteres inválidos', () => {
      const IdInvalido = '507f1f77bcf86cd79943901g';
      let erro;
      try {
        equipamentoIdSchema.parse(IdInvalido);
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/ID inválido/);
    });

    it('deve retornar erro para um ID vazio', () => {
      const IdInvalido = '';
      let erro;
      try {
        equipamentoIdSchema.parse(IdInvalido);
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/ID inválido/);
    });
  });

  describe('Categoria', () => {
    it('deve validar uma categoria não vazia', () => {
      const CategoriaValida = { categoria: 'Furadeira' };
      const resultado = equipamentoQuerySchema.partial().parse(CategoriaValida);
      expect(resultado).toEqual(CategoriaValida);
    });

    it('deve aceitar categoria ausente', () => {
      const resultado = equipamentoQuerySchema.partial().parse({});
      expect(resultado.categoria).toBeUndefined();
    });

    it('deve rejeitar categoria vazia', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ categoria: '   ' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Categoria não pode ser vazia/);
    });
  });

  describe('Status', () => {
    it('deve validar status válido', () => {
      const StatusValido = { status: 'ativo' };
      const resultado = equipamentoQuerySchema.partial().parse(StatusValido);
      expect(resultado).toEqual(StatusValido);
    });

    it('deve aceitar status ausente', () => {
      const resultado = equipamentoQuerySchema.partial().parse({});
      expect(resultado.status).toBeUndefined();
    });

    it('deve rejeitar status inválido', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ status: 'invalido' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Status deve ser 'ativo', 'inativo' ou 'pendente'/);
    });
  });

  describe('MinValor', () => {
    it('deve validar valor mínimo válido', () => {
      const MinValorValido = { minValor: '10' };
      const resultado = equipamentoQuerySchema.partial().parse(MinValorValido);
      expect(resultado).toEqual({ minValor: 10 });
    });

    it('deve rejeitar valor mínimo negativo', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ minValor: '-1' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/minValor deve ser um número maior que 0/);
    });

    it('deve rejeitar valor mínimo inválido (não numérico)', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ minValor: 'abc' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/minValor deve ser um número maior que 0/);
    });

    it('deve aceitar ausência de minValor', () => {
      const resultado = equipamentoQuerySchema.partial().parse({});
      expect(resultado.minValor).toBeUndefined();
    });
  });

  describe('MaxValor', () => {
    it('deve validar valor máximo válido', () => {
      const MaxValorValido = { maxValor: '100' };
      const resultado = equipamentoQuerySchema.partial().parse(MaxValorValido);
      expect(resultado).toEqual({ maxValor: 100 });
    });

    it('deve rejeitar valor máximo negativo', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ maxValor: '-1' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/maxValor deve ser um número maior ou igual a 0/);
    });

    it('deve rejeitar valor máximo inválido (não numérico)', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ maxValor: 'abc' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/maxValor deve ser um número maior ou igual a 0/);
    });

    it('deve aceitar ausência de maxValor', () => {
      const resultado = equipamentoQuerySchema.partial().parse({});
      expect(resultado.maxValor).toBeUndefined();
    });
  });

  describe('Page', () => {
    it('deve validar página válida e transformar para number', () => {
      const PaginaValida = { page: '2' };
      const resultado = equipamentoQuerySchema.partial().parse(PaginaValida);
      expect(resultado).toEqual({ page: 2 });
    });

    it('deve rejeitar página zero', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ page: '0' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Page deve ser um número inteiro maior que 0/);
    });

    it('deve rejeitar página não numérica', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ page: 'abc' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Page deve ser um número inteiro maior que 0/);
    });

    it('deve aceitar ausência de page e usar valor padrão', () => {
      const resultado = equipamentoQuerySchema.parse({});
      expect(resultado.page).toBe(1);
    });
  });

  describe('Limit', () => {
    it('deve validar limite válido e transformar para number', () => {
      const LimiteValido = { limit: '50' };
      const resultado = equipamentoQuerySchema.partial().parse(LimiteValido);
      expect(resultado).toEqual({ limit: 50 });
    });

    it('deve rejeitar limite maior que 100', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ limit: '101' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Limit deve ser um número inteiro entre 1 e 100/);
    });

    it('deve rejeitar limite menor que 1', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ limit: '0' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Limit deve ser um número inteiro entre 1 e 100/);
    });

    it('deve rejeitar limite não numérico', () => {
      let erro;
      try {
        equipamentoQuerySchema.partial().parse({ limit: 'abc' });
      } catch (e) {
        erro = e;
      }
      expect(erro.errors[0].message).toMatch(/Limit deve ser um número inteiro entre 1 e 100/);
    });

    it('deve aceitar ausência de limit e usar valor padrão', () => {
      const resultado = equipamentoQuerySchema.parse({});
      expect(resultado.limit).toBe(10);
    });
  });
});
