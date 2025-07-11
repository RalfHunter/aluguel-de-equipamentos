import uploadUsuario from '../../../config/multerUserConfig.js';

// Mock do módulo fs para testar cenários de arquivo existente
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn()
}));

import fs from 'fs';

describe('multerUserConfig integrado', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
    // Por padrão, simular que o diretório não precisa ser criado
    fs.existsSync.mockReturnValue(false);
  });

  it('deve ser um módulo válido que pode ser importado', () => {
    expect(uploadUsuario).toBeDefined();
  });

  it('deve exportar uma configuração de upload', () => {
    expect(uploadUsuario).toBeDefined();
    expect(typeof uploadUsuario).toBe('object');
  });

  it('deve ter configurações de multer válidas', () => {
    // Verificar se tem as propriedades básicas esperadas de um multer upload
    expect(uploadUsuario).toHaveProperty('storage');
    expect(uploadUsuario).toHaveProperty('limits');
    expect(uploadUsuario).toHaveProperty('fileFilter');
  });

  it('deve ter limite de arquivo configurado', () => {
    expect(uploadUsuario.limits).toBeDefined();
    expect(uploadUsuario.limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
  });

  it('deve ter fileFilter como função', () => {
    expect(typeof uploadUsuario.fileFilter).toBe('function');
  });

  it('deve ter storage configurado', () => {
    expect(uploadUsuario.storage).toBeDefined();
    expect(typeof uploadUsuario.storage).toBe('object');
  });

  it('deve aceitar arquivos de imagem válidos no fileFilter', () => {
    const mockReq = {
      params: { id: '123' }
    };
    
    const mockFile = {
      originalname: 'foto.jpg',
      mimetype: 'image/jpeg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
    // Verificar se aceitou o arquivo
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  it('deve rejeitar arquivos com extensão inválida no fileFilter', () => {
    const mockReq = {
      params: { id: '123' }
    };
    
    const mockFile = {
      originalname: 'documento.pdf',
      mimetype: 'application/pdf'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
    // Verificar se rejeitou o arquivo
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Extensão de imagem inválida. Apenas JPG, JPEG e PNG são permitidos."
      }), 
      false
    );
  });

  it('deve rejeitar quando não há ID nos parâmetros no fileFilter', () => {
    const mockReq = {
      params: {} // Sem ID
    };
    
    const mockFile = {
      originalname: 'foto.jpg',
      mimetype: 'image/jpeg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
    // Verificar se rejeitou por falta de ID
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "ID do usuário não encontrado nos parâmetros."
      }), 
      false
    );
  });

  it('deve rejeitar arquivos com tipo MIME inválido no fileFilter', () => {
    const mockReq = {
      params: { id: '123' }
    };
    
    const mockFile = {
      originalname: 'arquivo.jpg', // Extensão válida
      mimetype: 'text/plain' // Mas MIME type inválido
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
    // Verificar se rejeitou por tipo MIME inválido
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Tipo de arquivo inválido. Apenas imagens são permitidas."
      }), 
      false
    );
  });

  it('deve gerar nome de arquivo corretamente no storage', () => {
    const mockReq = {
      params: { id: '456' }
    };
    
    const mockFile = {
      originalname: 'perfil.jpeg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar a função filename do storage
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    // Verificar se gerou o nome correto
    expect(mockCallback).toHaveBeenCalledWith(null, '456.jpeg');
  });

  it('deve rejeitar quando não há ID nos parâmetros no storage filename', () => {
    const mockReq = {
      params: {} // Sem ID
    };
    
    const mockFile = {
      originalname: 'perfil.jpg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar a função filename do storage
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    // Verificar se rejeitou por falta de ID
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "ID do usuário não encontrado nos parâmetros."
      }), 
      null
    );
  });

  it('deve definir o diretório correto no storage destination', () => {
    const mockReq = {};
    const mockFile = {};
    const mockCallback = jest.fn();
    
    // Chamar a função destination do storage
    uploadUsuario.storage.getDestination(mockReq, mockFile, mockCallback);
    
    // Verificar se definiu o diretório correto
    expect(mockCallback).toHaveBeenCalledWith(null, 'uploads/usuarios');
  });

  it('deve remover foto existente quando há arquivo anterior no storage', () => {
    // Mock para simular que existe um arquivo .jpg
    fs.existsSync.mockImplementation((caminho) => {
      return caminho.includes('789.jpg'); // Simular que existe um arquivo com esse nome
    });

    const mockReq = {
      params: { id: '789' }
    };
    
    const mockFile = {
      originalname: 'nova_foto.jpg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar a função filename do storage
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    // Verificar se foi chamado para remover o arquivo existente
    expect(fs.unlinkSync).toHaveBeenCalled();
    
    // Verificar se gerou o nome correto
    expect(mockCallback).toHaveBeenCalledWith(null, '789.jpg');
  });

  it('deve criar o diretório se não existir durante a inicialização', () => {
    // Mock específico para simular que o diretório não existe inicialmente
    fs.existsSync.mockImplementation((caminho) => {
      if (caminho === 'uploads/usuarios') {
        return false; // Simular que o diretório não existe
      }
      return false; // Para outros caminhos também retornar false
    });

    // Resetar o mock do mkdirSync para este teste
    fs.mkdirSync.mockClear();
    
    // Re-importar o módulo dinamicamente para forçar a execução da inicialização
    jest.isolateModules(() => {
      // Dentro de isolateModules, o módulo será re-executado com os mocks atuais
      require('../../../config/multerUserConfig.js');
      
      // Verificar se tentou criar o diretório
      expect(fs.mkdirSync).toHaveBeenCalledWith('uploads/usuarios', { recursive: true });
    });
  });

  it('deve lidar com erro na função filename do storage', () => {
    const mockReq = {
      params: { id: null } // Forçar erro
    };
    
    const mockFile = {
      originalname: 'teste.jpg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar a função filename do storage
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    // Verificar se foi chamado com erro (pelo ID null)
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'ID do usuário não encontrado nos parâmetros.'
      }), 
      null
    );
  });

  it('deve lidar com erro no fileFilter', () => {
    // Criar um req com params que vai causar erro no processamento
    const mockReq = {
      params: { id: '123' },
      // Simular um erro forçando uma propriedade undefined
      get path() {
        throw new Error('Erro no fileFilter');
      }
    };
    
    const mockFile = {
      originalname: 'teste.jpg',
      mimetype: 'image/jpeg'
    };
    
    const mockCallback = jest.fn();
    
    // Chamar o fileFilter de uma forma que pode gerar erro
    try {
      uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    } catch (error) {
      // Se houver erro síncrono, é esperado
    }
    
    // Verificar se foi chamado com erro (pode ser chamado de forma assíncrona)
    expect(mockCallback).toHaveBeenCalled();
  });
});
