import AvaliacaoFilterBuilder from "../../../../repositories/filters/AvaliacaoFilterBuilder.js";

describe('AvaliacaoFilterBuilder', () => {
  let avaliacaoFilterBuilder;

  beforeEach(() => {
    avaliacaoFilterBuilder = new AvaliacaoFilterBuilder();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('deve inicializar com filtros vazios e ordenação padrão por createdAt decrescente', () => {
      const result = avaliacaoFilterBuilder.build();
      expect(result).toEqual({
        filtros: {},
        ordenacao: { createdAt: -1 }
      });
    });

    it('deve inicializar com query fornecida', () => {
      const query = { notaMinima: '4', ordenarPorNota: 'mais-relevantes' };
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder(query);
      expect(avaliacaoFilterBuilder.query).toEqual(query);
    });
  });

  describe('comOrdemNota', () => {
    it('deve setar ordenação por nota decrescente quando ordenarPorNota é "mais-relevantes"', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ ordenarPorNota: 'mais-relevantes' });
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result.ordenacao).toEqual({ nota: -1 });
    });

    it('deve setar ordenação por nota crescente quando ordenarPorNota é "menos-relevantes"', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ ordenarPorNota: 'menos-relevantes' });
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result.ordenacao).toEqual({ nota: 1 });
    });

    it('deve manter ordenação padrão quando ordenarPorNota não é fornecido', () => {
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result.ordenacao).toEqual({ createdAt: -1 });
    });

    it('deve ignorar ordenarPorNota com valor inválido', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ ordenarPorNota: 'invalido' });
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result.ordenacao).toEqual({ createdAt: -1 });
    });
  });

  describe('comNotaMinima', () => {
    it('deve setar filtro de nota mínima quando valor numérico válido é fornecido', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMinima: '4.5' });
      avaliacaoFilterBuilder.comNotaMinima();
      const result = avaliacaoFilterBuilder.build();
      expect(result.filtros).toHaveProperty('nota');
      expect(result.filtros.nota).toEqual({ $gte: 4.5 });
    });

    it('não deve setar filtro de nota mínima quando valor não numérico é fornecido', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMinima: 'abc' });
      avaliacaoFilterBuilder.comNotaMinima();
      const result = avaliacaoFilterBuilder.build();
      expect(result.filtros).not.toHaveProperty('nota');
    });

    it('não deve setar filtro de nota mínima quando vazio ou undefined', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMinima: '' });
      avaliacaoFilterBuilder.comNotaMinima();
      let result = avaliacaoFilterBuilder.build();
      expect(result.filtros).not.toHaveProperty('nota');

      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMinima: undefined });
      avaliacaoFilterBuilder.comNotaMinima();
      result = avaliacaoFilterBuilder.build();
      expect(result.filtros).not.toHaveProperty('nota');
    });
  });

  describe('comNotaMaxima', () => {
    it('deve setar filtro de nota máxima quando valor numérico válido é fornecido', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMaxima: '5.0' });
      avaliacaoFilterBuilder.comNotaMaxima();
      const result = avaliacaoFilterBuilder.build();
      expect(result.filtros).toHaveProperty('nota');
      expect(result.filtros.nota).toEqual({ $lte: 5.0 });
    });

    it('não deve setar filtro de nota máxima quando valor não numérico é fornecido', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMaxima: 'abc' });
      avaliacaoFilterBuilder.comNotaMaxima();
      const result = avaliacaoFilterBuilder.build();
      expect(result.filtros).not.toHaveProperty('nota');
    });

    it('não deve setar filtro de nota máxima quando vazio ou undefined', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMaxima: '' });
      avaliacaoFilterBuilder.comNotaMaxima();
      let result = avaliacaoFilterBuilder.build();
      expect(result.filtros).not.toHaveProperty('nota');

      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ notaMaxima: undefined });
      avaliacaoFilterBuilder.comNotaMaxima();
      result = avaliacaoFilterBuilder.build();
      expect(result.filtros).not.toHaveProperty('nota');
    });
  });

  describe('build', () => {
    it('deve retornar objeto de filtros e ordenação vazios quando nenhum filtro é adicionado', () => {
      const result = avaliacaoFilterBuilder.build();
      expect(result).toEqual({
        filtros: {},
        ordenacao: { createdAt: -1 }
      });
    });

    it('deve retornar objeto com todos os filtros e ordenação adicionados', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({
        notaMinima: '4.0',
        notaMaxima: '5.0',
        ordenarPorNota: 'mais-relevantes'
      });

      avaliacaoFilterBuilder
        .comNotaMinima()
        .comNotaMaxima()
        .comOrdemNota();

      const result = avaliacaoFilterBuilder.build();

      expect(result).toEqual({
        filtros: { nota: { $gte: 4.0, $lte: 5.0 } },
        ordenacao: { nota: -1 }
      });
    });
  });
});