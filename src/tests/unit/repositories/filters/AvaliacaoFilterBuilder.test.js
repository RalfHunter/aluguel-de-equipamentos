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
      const query = { ordenarPorNota: 'mais-relevantes' };
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

    it('deve manter ordenação padrão quando ordenarPorNota é diferente de "mais-relevantes" ou "menos-relevantes"', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ ordenarPorNota: 'outro-criterio' });
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result.ordenacao).toEqual({ createdAt: -1 });
    });

    it('deve manter ordenação padrão quando ordenarPorNota não for informado', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({});
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result.ordenacao).toEqual({ createdAt: -1 });
    });
  });

  describe('build', () => {
    it('deve retornar objeto com filtros vazios e ordenação padrão se não usar comOrdemNota', () => {
      const result = avaliacaoFilterBuilder.build();
      expect(result).toEqual({
        filtros: {},
        ordenacao: { createdAt: -1 }
      });
    });

    it('deve retornar objeto com ordenação por nota decrescente quando usar comOrdemNota com "mais-relevantes"', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ ordenarPorNota: 'mais-relevantes' });
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result).toEqual({
        filtros: {},
        ordenacao: { nota: -1 }
      });
    });

    it('deve retornar objeto com ordenação por nota crescente quando usar comOrdemNota com "menos-relevantes"', () => {
      avaliacaoFilterBuilder = new AvaliacaoFilterBuilder({ ordenarPorNota: 'menos-relevantes' });
      avaliacaoFilterBuilder.comOrdemNota();
      const result = avaliacaoFilterBuilder.build();
      expect(result).toEqual({
        filtros: {},
        ordenacao: { nota: 1 }
      });
    });
  });
});
