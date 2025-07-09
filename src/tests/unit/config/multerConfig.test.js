import upload from '../../../config/multerConfig.js';

// Mock do módulo fs para testar cenários de diretório
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock do uuid para ter controle sobre os nomes gerados
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-1234')
}));

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

describe('multerConfig para equipamentos', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
    // Por padrão, simular que o diretório já existe
    fs.existsSync.mockReturnValue(true);
  });

  it('deve ser um módulo válido que pode ser importado', () => {
    expect(upload).toBeDefined();
  });

  it('deve exportar uma configuração de upload', () => {
    expect(upload).toBeDefined();
    expect(typeof upload).toBe('object');
  });

  it('deve ter configurações de multer válidas', () => {
    // Verificar se tem as propriedades básicas esperadas de um multer upload
    expect(upload).toHaveProperty('storage');
    expect(upload).toHaveProperty('limits');
    expect(upload).toHaveProperty('fileFilter');
  });

  it('deve ter limite de arquivo configurado para 25MB', () => {
    expect(upload.limits).toBeDefined();
    expect(upload.limits.fileSize).toBe(25 * 1024 * 1024); // 25MB
  });

  it('deve ter fileFilter como função', () => {
    expect(typeof upload.fileFilter).toBe('function');
  });

  it('deve ter storage configurado', () => {
    expect(upload.storage).toBeDefined();
    expect(typeof upload.storage).toBe('object');
  });

  it('deve aceitar arquivos de imagem válidos no fileFilter', () => {
    const mockReq = {};
    
    const mockFile = {
      originalname: 'equipamento.jpg',
      mimetype: 'image/jpeg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter
    upload.fileFilter(mockReq, mockFile, mockCallback);
    
    // Verificar se aceitou o arquivo
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  it('deve rejeitar arquivos com extensão inválida no fileFilter', () => {
    const mockReq = {};
    
    const mockFile = {
      originalname: 'documento.pdf',
      mimetype: 'application/pdf'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter
    upload.fileFilter(mockReq, mockFile, mockCallback);
    
    // Verificar se rejeitou o arquivo
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Extensão de imagem inválida."
      }), 
      false
    );
  });

  it('deve aceitar diferentes extensões válidas (jpeg, png)', () => {
    const extensoesValidas = [
      { nome: 'foto.jpeg', esperado: true },
      { nome: 'imagem.png', esperado: true },
      { nome: 'arquivo.jpg', esperado: true }
    ];

    extensoesValidas.forEach(({ nome, esperado }) => {
      const mockCallback = jest.fn();
      
      upload.fileFilter({}, { originalname: nome }, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(null, esperado);
      mockCallback.mockClear();
    });
  });

  it('deve gerar nome de arquivo único usando UUID no storage', () => {
    const mockReq = {};
    
    const mockFile = {
      originalname: 'equipamento.jpeg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar a função filename do storage
    upload.storage.getFilename(mockReq, mockFile, mockCallback);
    
    // Verificar se gerou nome com UUID e manteve a extensão
    expect(uuidv4).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(null, 'mocked-uuid-1234.jpeg');
  });

  it('deve definir o diretório correto para equipamentos no storage', () => {
    const mockReq = {};
    const mockFile = {};
    const mockCallback = jest.fn();
    
    // Chamar a função destination do storage
    upload.storage.getDestination(mockReq, mockFile, mockCallback);
    
    // Verificar se definiu o diretório correto
    expect(mockCallback).toHaveBeenCalledWith(null, 'uploads/equipamentos');
  });

  it('deve preservar extensão original do arquivo no nome gerado', () => {
    const extensoes = ['.jpg', '.jpeg', '.png'];
    
    extensoes.forEach(ext => {
      const mockCallback = jest.fn();
      const mockFile = { originalname: `arquivo${ext}` };
      
      upload.storage.getFilename({}, mockFile, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(null, `mocked-uuid-1234${ext}`);
      mockCallback.mockClear();
    });
  });

  it('deve criar o diretório se não existir durante a inicialização', () => {
    // Mock específico para simular que o diretório não existe
    fs.existsSync.mockImplementation((caminho) => {
      if (caminho === 'uploads/equipamentos') {
        return false; // Simular que o diretório não existe
      }
      return false; // Para outros caminhos também retornar false
    });

    // Resetar o mock do mkdirSync para este teste
    fs.mkdirSync.mockClear();
    
    // Re-importar o módulo dinamicamente para forçar a execução da inicialização
    jest.isolateModules(() => {
      // Dentro de isolateModules, o módulo será re-executado com os mocks atuais
      require('../../../config/multerConfig.js');
      
      // Verificar se tentou criar o diretório
      expect(fs.mkdirSync).toHaveBeenCalledWith('uploads/equipamentos', { recursive: true });
    });
  });

  it('deve rejeitar extensões em maiúscula também', () => {
    const extensoesInvalidas = [
      { nome: 'arquivo.PDF', esperado: false },
      { nome: 'documento.DOC', esperado: false },
      { nome: 'planilha.XLS', esperado: false }
    ];

    extensoesInvalidas.forEach(({ nome }) => {
      const mockCallback = jest.fn();
      
      upload.fileFilter({}, { originalname: nome }, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Extensão de imagem inválida."
        }), 
        false
      );
      mockCallback.mockClear();
    });
  });
});
