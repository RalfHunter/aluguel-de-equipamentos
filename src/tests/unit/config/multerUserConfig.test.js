import uploadUsuario, { compressUserImage } from '../../../config/multerUserConfig.js';


jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn()
}));

import fs from 'fs';

describe('multerUserConfig integrado', () => {
  beforeEach(() => {

    jest.clearAllMocks();

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

    expect(uploadUsuario).toHaveProperty('storage');
    expect(uploadUsuario).toHaveProperty('limits');
    expect(uploadUsuario).toHaveProperty('fileFilter');
  });

  it('deve ter limite de arquivo configurado', () => {
    expect(uploadUsuario.limits).toBeDefined();
    expect(uploadUsuario.limits.fileSize).toBe(5 * 1024 * 1024); 
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
    
    
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
    
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
    
   
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Extensão de imagem inválida. Apenas JPG, JPEG e PNG são permitidos."
      }), 
      false
    );
  });

  it('deve rejeitar quando não há ID nos parâmetros no fileFilter', () => {
    const mockReq = {
      params: {} 
    };
    
    const mockFile = {
      originalname: 'foto.jpg',
      mimetype: 'image/jpeg'
    };
    
    const mockCallback = jest.fn();
    

    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
 
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
      originalname: 'arquivo.jpg', 
      mimetype: 'text/plain' 
    };
    
    const mockCallback = jest.fn();
    
    
    uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    
    
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
    
    
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    
    expect(mockCallback).toHaveBeenCalledWith(null, '456.jpeg');
  });

  it('deve rejeitar quando não há ID nos parâmetros no storage filename', () => {
    const mockReq = {
      params: {} 
    };
    
    const mockFile = {
      originalname: 'perfil.jpg'
    };
    
    const mockCallback = jest.fn();
    
    
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    
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
    
    
    uploadUsuario.storage.getDestination(mockReq, mockFile, mockCallback);
    
    
    expect(mockCallback).toHaveBeenCalledWith(null, 'uploads/usuarios');
  });

  it('deve remover foto existente quando há arquivo anterior no storage', () => {
    
    fs.existsSync.mockImplementation((caminho) => {
      return caminho.includes('789.jpg'); 
    });

    const mockReq = {
      params: { id: '789' }
    };
    
    const mockFile = {
      originalname: 'nova_foto.jpg'
    };
    
    const mockCallback = jest.fn();
    
    
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    
    expect(fs.unlinkSync).toHaveBeenCalled();
    
    
    expect(mockCallback).toHaveBeenCalledWith(null, '789.jpg');
  });

  it('deve criar o diretório se não existir durante a inicialização', () => {
    
    fs.existsSync.mockImplementation((caminho) => {
      if (caminho === 'uploads/usuarios') {
        return false; 
      }
      return false; 
    });

    
    fs.mkdirSync.mockClear();
    
    
    jest.isolateModules(() => {
      
      require('../../../config/multerUserConfig.js');
      
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('uploads/usuarios', { recursive: true });
    });
  });

  it('deve lidar com erro na função filename do storage', () => {
    const mockReq = {
      params: { id: null } 
    };
    
    const mockFile = {
      originalname: 'teste.jpg'
    };
    
    const mockCallback = jest.fn();
    
    
    uploadUsuario.storage.getFilename(mockReq, mockFile, mockCallback);
    
    
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'ID do usuário não encontrado nos parâmetros.'
      }), 
      null
    );
  });

  it('deve lidar com erro no fileFilter', () => {
    
    const mockReq = {
      params: { id: '123' },
      
      get path() {
        throw new Error('Erro no fileFilter');
      }
    };
    
    const mockFile = {
      originalname: 'teste.jpg',
      mimetype: 'image/jpeg'
    };
    
    const mockCallback = jest.fn();
    
    
    try {
      uploadUsuario.fileFilter(mockReq, mockFile, mockCallback);
    } catch (error) {
      
    }
    
    
    expect(mockCallback).toHaveBeenCalled();
  });
});

describe('compressUserImage', () => {
  it('deve ser uma função válida', () => {
    expect(compressUserImage).toBeDefined();
    expect(typeof compressUserImage).toBe('function');
  });

  it('deve chamar next() quando não há arquivo', async () => {
    const mockReq = { file: null };
    const mockRes = {};
    const mockNext = jest.fn();

    await compressUserImage(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('deve chamar next() quando arquivo é menor que 2MB', async () => {
    const mockReq = { 
      file: { 
        path: '/fake/path/file.jpg' 
      } 
    };
    const mockRes = {};
    const mockNext = jest.fn();

    
    const originalStatSync = fs.statSync;
    fs.statSync = jest.fn().mockReturnValue({ size: 1024 * 1024 }); 

    await compressUserImage(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    
    
    fs.statSync = originalStatSync;
  });
});
