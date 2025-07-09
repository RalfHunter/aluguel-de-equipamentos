const { gerarDataAleatoria } = require('../../../../utils/helpers/randomPastDate.js');

describe('randomPastDate', () => {
  describe('gerarDataAleatoria', () => {
    beforeEach(() => {
      // Mock Date.now para ter controle sobre a data atual
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('deve retornar uma data válida', () => {
      const data = gerarDataAleatoria();
      expect(data).toBeInstanceOf(Date);
      expect(data.toString()).not.toBe('Invalid Date');
    });

    it('deve usar valores padrão de idade (18-90 anos)', () => {
      const data = gerarDataAleatoria();
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBeGreaterThanOrEqual(anoHoje - 90);
      expect(anoData).toBeLessThanOrEqual(anoHoje - 18);
    });

    it('deve retornar data dentro do intervalo especificado', () => {
      const idadeMinima = 25;
      const idadeMaxima = 60;
      const data = gerarDataAleatoria(idadeMinima, idadeMaxima);
      
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBeGreaterThanOrEqual(anoHoje - idadeMaxima);
      expect(anoData).toBeLessThanOrEqual(anoHoje - idadeMinima);
    });

    it('deve aceitar idadeMinima customizada', () => {
      const idadeMinima = 30;
      const data = gerarDataAleatoria(idadeMinima);
      
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBeGreaterThanOrEqual(anoHoje - 90); // valor padrão idadeMaxima
      expect(anoData).toBeLessThanOrEqual(anoHoje - idadeMinima);
    });

    it('deve aceitar idadeMaxima customizada', () => {
      const idadeMaxima = 50;
      const data = gerarDataAleatoria(undefined, idadeMaxima);
      
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBeGreaterThanOrEqual(anoHoje - idadeMaxima);
      expect(anoData).toBeLessThanOrEqual(anoHoje - 18); // valor padrão idadeMinima
    });

    it('deve retornar data com horário zerado (apenas data)', () => {
      const data = gerarDataAleatoria();
      
      expect(data.getHours()).toBe(0);
      expect(data.getMinutes()).toBe(0);
      expect(data.getSeconds()).toBe(0);
      expect(data.getMilliseconds()).toBe(0);
    });

    it('deve gerar datas diferentes em chamadas sucessivas', () => {
      const datas = [];
      for (let i = 0; i < 10; i++) {
        datas.push(gerarDataAleatoria().getTime());
      }
      
      // Verifica se há pelo menos algumas datas diferentes
      const datasUnicas = new Set(datas);
      expect(datasUnicas.size).toBeGreaterThan(1);
    });

    it('deve funcionar com intervalo de idade pequeno', () => {
      const idadeMinima = 25;
      const idadeMaxima = 26;
      const data = gerarDataAleatoria(idadeMinima, idadeMaxima);
      
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBeGreaterThanOrEqual(anoHoje - idadeMaxima);
      expect(anoData).toBeLessThanOrEqual(anoHoje - idadeMinima);
    });

    it('deve funcionar com idades iguais', () => {
      const idade = 30;
      const data = gerarDataAleatoria(idade, idade);
      
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBe(anoHoje - idade);
    });

    it('deve funcionar com valores de idade zero', () => {
      const data = gerarDataAleatoria(0, 1);
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const anoData = data.getFullYear();
      
      expect(anoData).toBeGreaterThanOrEqual(anoHoje - 1);
      expect(anoData).toBeLessThanOrEqual(anoHoje);
    });

    it('deve retornar data no passado', () => {
      const data = gerarDataAleatoria();
      const hoje = new Date();
      
      expect(data.getTime()).toBeLessThan(hoje.getTime());
    });

    it('deve gerar datas consistentes com Math.random mockado', () => {
      const mathRandomSpy = jest.spyOn(Math, 'random');
      
      // Mock Math.random para retornar valor fixo
      mathRandomSpy.mockReturnValue(0.5);
      
      const data1 = gerarDataAleatoria(20, 40);
      const data2 = gerarDataAleatoria(20, 40);
      
      expect(data1.getTime()).toBe(data2.getTime());
      
      mathRandomSpy.mockRestore();
    });

    it('deve usar limites extremos corretamente', () => {
      const mathRandomSpy = jest.spyOn(Math, 'random');
      
      // Teste com Math.random = 0 (data mais antiga)
      mathRandomSpy.mockReturnValue(0);
      const dataMinima = gerarDataAleatoria(20, 40);
      const hoje = new Date();
      expect(dataMinima.getFullYear()).toBe(hoje.getFullYear() - 40);
      
      // Teste com Math.random = 1 (data mais recente)
      mathRandomSpy.mockReturnValue(1);
      const dataMaxima = gerarDataAleatoria(20, 40);
      expect(dataMaxima.getFullYear()).toBe(hoje.getFullYear() - 20);
      
      mathRandomSpy.mockRestore();
    });

    it('deve preservar a estrutura da data gerada', () => {
      const data = gerarDataAleatoria();
      
      // Verifica se a data tem todas as propriedades esperadas
      expect(typeof data.getFullYear).toBe('function');
      expect(typeof data.getMonth).toBe('function');
      expect(typeof data.getDate).toBe('function');
      expect(typeof data.getTime).toBe('function');
      
      // Verifica se os valores são números válidos
      expect(typeof data.getFullYear()).toBe('number');
      expect(typeof data.getMonth()).toBe('number');
      expect(typeof data.getDate()).toBe('number');
      expect(typeof data.getTime()).toBe('number');
    });

    it('deve funcionar com diferentes fusos horários', () => {
      // Salva o fuso horário original
      const originalTimezone = process.env.TZ;
      
      try {
        // Testa com diferentes fusos horários
        process.env.TZ = 'UTC';
        const dataUTC = gerarDataAleatoria();
        
        process.env.TZ = 'America/New_York';
        const dataNY = gerarDataAleatoria();
        
        // Ambas devem ser datas válidas
        expect(dataUTC).toBeInstanceOf(Date);
        expect(dataNY).toBeInstanceOf(Date);
        expect(dataUTC.toString()).not.toBe('Invalid Date');
        expect(dataNY.toString()).not.toBe('Invalid Date');
        
      } finally {
        // Restaura o fuso horário original
        process.env.TZ = originalTimezone;
      }
    });
  });
});
