<<<<<<<< HEAD:src/tests/unit/repositories/filters/EquipamentoFilterBuilder.test.js
import EquipamentoFilterBuilder from '../../../../repositories/filters/EquipamentoFilterBuilder';
========
import EquipamentoFilterBuilder from '../repositories/filters/EquipamentoFilterBuilderder';
>>>>>>>> a5025f0e6885dbce0263adcd6fd56f9a116eec62:src/tests/unit/filters/EquipamentoFilterBuilder.test.js
import mongoose from 'mongoose';

jest.mock('../../../../models/Equipamento.js', () => 'mock-equipamento-model');

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
  Schema: {
    Types: {
      ObjectId: 'ObjectId',
    },
  },
}));

describe('EquipamentoFilterBuilder', () => {
  let equipamentoFilterBuilder;

  beforeEach(() => {
    jest.clearAllMocks();
    equipamentoFilterBuilder = new EquipamentoFilterBuilder();
  });

  describe('constructor', () => {
    test('deve inicializar com filtros vazios', () => {
      expect(equipamentoFilterBuilder.filtros).toEqual({});
    });
  });

  describe('comCategoria', () => {
    test('deve adicionar filtro de categoria quando categoria é fornecida', () => {
      const categoria = 'Furadeira';
      const resultado = equipamentoFilterBuilder.comCategoria(categoria);

      expect(equipamentoFilterBuilder.filtros.equiCategoria).toBe('Furadeira');
      expect(resultado).toBe(equipamentoFilterBuilder);
    });

    test.each([undefined, null, ''])(
      'não deve adicionar filtro quando categoria é %p',
      (categoria) => {
        const resultado = equipamentoFilterBuilder.comCategoria(categoria);

        expect(equipamentoFilterBuilder.filtros.equiCategoria).toBeUndefined();
        expect(resultado).toBe(equipamentoFilterBuilder);
      }
    );
  });

  describe('comStatus', () => {
    test.each(['ativo', 'inativo', 'pendente'])(
      'deve adicionar filtro de status quando status é %p',
      (status) => {
        const resultado = equipamentoFilterBuilder.comStatus(status);

        expect(equipamentoFilterBuilder.filtros.equiStatus).toBe(status);
        expect(resultado).toBe(equipamentoFilterBuilder);
      }
    );

    test.each([
      'true',
      'false',
      true,
      false,
      123,
      undefined,
      null,
      '',
      'invalid',
    ])(
      'não deve adicionar filtro quando status é %p',
      (status) => {
        const resultado = equipamentoFilterBuilder.comStatus(status);

        expect(equipamentoFilterBuilder.filtros.equiStatus).toBeUndefined();
        expect(resultado).toBe(equipamentoFilterBuilder);
      }
    );
  });

  describe('comFaixaDeValor', () => {
    test('deve adicionar filtro com apenas minValor quando maxValor é undefined', () => {
      const resultado = equipamentoFilterBuilder.comFaixaDeValor(50, undefined);

      expect(equipamentoFilterBuilder.filtros.equiValorDiaria).toEqual({ $gte: 50 });
      expect(resultado).toBe(equipamentoFilterBuilder);
    });

    test('deve adicionar filtro com apenas maxValor quando minValor é undefined', () => {
      const resultado = equipamentoFilterBuilder.comFaixaDeValor(undefined, 100);

      expect(equipamentoFilterBuilder.filtros.equiValorDiaria).toEqual({ $lte: 100 });
      expect(resultado).toBe(equipamentoFilterBuilder);
    });

    test('deve adicionar filtro com minValor e maxValor quando ambos são fornecidos', () => {
      const resultado = equipamentoFilterBuilder.comFaixaDeValor(50, 100);

      expect(equipamentoFilterBuilder.filtros.equiValorDiaria).toEqual({ $gte: 50, $lte: 100 });
      expect(resultado).toBe(equipamentoFilterBuilder);
    });

    test('não deve adicionar filtro quando minValor e maxValor são undefined', () => {
      const resultado = equipamentoFilterBuilder.comFaixaDeValor(undefined, undefined);

      expect(equipamentoFilterBuilder.filtros.equiValorDiaria).toBeUndefined();
      expect(resultado).toBe(equipamentoFilterBuilder);
    });

    test.each([
      ['50', '100'],
      [' 50 ', ' 100 '],
    ])('deve converter strings numéricas com espaços: %p e %p', (min, max) => {
      const resultado = equipamentoFilterBuilder.comFaixaDeValor(min, max);

      expect(equipamentoFilterBuilder.filtros.equiValorDiaria).toEqual({ $gte: 50, $lte: 100 });
      expect(resultado).toBe(equipamentoFilterBuilder);
    });
  });

  describe('build', () => {
    test('deve retornar filtros vazios quando nenhum filtro foi adicionado', () => {
      const filtros = equipamentoFilterBuilder.build();

      expect(filtros).toEqual({});
    });

    test('deve retornar filtro de categoria quando foi adicionado', () => {
      equipamentoFilterBuilder.comCategoria('Furadeira');
      const filtros = equipamentoFilterBuilder.build();

      expect(filtros).toEqual({ equiCategoria: 'Furadeira' });
    });

    test('deve retornar filtro de status quando foi adicionado', () => {
      equipamentoFilterBuilder.comStatus('ativo');
      const filtros = equipamentoFilterBuilder.build();

      expect(filtros).toEqual({ equiStatus: 'ativo' });
    });

    test('deve retornar filtro de faixa de valor quando foi adicionado', () => {
      equipamentoFilterBuilder.comFaixaDeValor(50, 100);
      const filtros = equipamentoFilterBuilder.build();

      expect(filtros).toEqual({ equiValorDiaria: { $gte: 50, $lte: 100 } });
    });

    test('deve retornar todos os filtros adicionados corretamente', () => {
      equipamentoFilterBuilder
        .comCategoria('Furadeira')
        .comStatus('ativo')
        .comFaixaDeValor(50, 100);

      const filtros = equipamentoFilterBuilder.build();

      expect(filtros).toEqual({
        equiCategoria: 'Furadeira',
        equiStatus: 'ativo',
        equiValorDiaria: { $gte: 50, $lte: 100 },
      });
    });
  });

  describe('Encadeamento de métodos', () => {
    test('deve permitir encadear múltiplos métodos e construir filtros corretamente', () => {
      const filtros = equipamentoFilterBuilder
        .comCategoria('Furadeira')
        .comStatus('ativo')
        .comFaixaDeValor(50, 100)
        .build();

      expect(filtros).toEqual({
        equiCategoria: 'Furadeira',
        equiStatus: 'ativo',
        equiValorDiaria: { $gte: 50, $lte: 100 },
      });
    });
  });
});
