import MulterErrorHandler from '../../../middlewares/MulterErrorHandler.js';
import { CustomError } from '../../../utils/helpers/index.js';

describe('MulterErrorHandler integrado', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      file: null,
      files: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Erros do Multer', () => {
    it('deve tratar erro UNEXPECTED_FIELD', () => {
      const multerError = {
        name: 'MulterError',
        code: 'UNEXPECTED_FIELD',
        message: 'Unexpected field'
      };

      MulterErrorHandler(multerError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Arquivo inesperado. Use o campo "file" para enviar o arquivo.');
    });

    it('deve tratar erro LIMIT_FILE_SIZE', () => {
      const multerError = {
        name: 'MulterError',
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large'
      };

      MulterErrorHandler(multerError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Arquivo muito grande. Tamanho máximo permitido é 5MB.');
    });

    it('deve tratar erro LIMIT_FILE_COUNT', () => {
      const multerError = {
        name: 'MulterError',
        code: 'LIMIT_FILE_COUNT',
        message: 'Too many files'
      };

      MulterErrorHandler(multerError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Muitos arquivos enviados. Envie apenas um arquivo.');
    });

    it('deve tratar erro LIMIT_UNEXPECTED_FILE', () => {
      const multerError = {
        name: 'MulterError',
        code: 'LIMIT_UNEXPECTED_FILE',
        message: 'Unexpected file'
      };

      MulterErrorHandler(multerError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Arquivo inesperado. Use o campo "file" para enviar o arquivo.');
    });

    it('deve tratar erro do Multer desconhecido', () => {
      const multerError = {
        name: 'MulterError',
        code: 'UNKNOWN_ERROR',
        message: 'Unknown multer error'
      };

      MulterErrorHandler(multerError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Erro no upload: Unknown multer error');
    });
  });

  describe('Erros do fileFilter - Extensão inválida', () => {
    it('deve tratar erro de extensão inválida (português)', () => {
      const fileFilterError = new Error('Extensão de imagem inválida');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
    });

    it('deve tratar erro de extensão com mensagem específica (português)', () => {
      const fileFilterError = new Error('Apenas JPG, JPEG e PNG são permitidos');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
    });

    it('deve tratar erro de extensão inválida (inglês)', () => {
      const fileFilterError = new Error('Invalid file extension');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
    });

    it('deve tratar erro de extensão de imagem inválida (inglês)', () => {
      const fileFilterError = new Error('Invalid image extension');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
    });
  });

  describe('Erros do fileFilter - Tipo MIME inválido', () => {
    it('deve tratar erro de tipo de arquivo inválido (português)', () => {
      const fileFilterError = new Error('Tipo de arquivo inválido');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('validationError');
      expect(error.field).toBe('file');
      expect(error.customMessage).toBe('Tipo de arquivo inválido. Apenas imagens são permitidas.');
    });

    it('deve tratar erro com mensagem específica sobre imagens (português)', () => {
      const fileFilterError = new Error('Apenas imagens são permitidas');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Tipo de arquivo inválido. Apenas imagens são permitidas.');
    });

    it('deve tratar erro de tipo de arquivo inválido (inglês)', () => {
      const fileFilterError = new Error('Invalid file type');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Tipo de arquivo inválido. Apenas imagens são permitidas.');
    });

    it('deve tratar erro com mensagem sobre imagens (inglês)', () => {
      const fileFilterError = new Error('Only images are allowed');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Tipo de arquivo inválido. Apenas imagens são permitidas.');
    });
  });

  describe('Erros não relacionados ao Multer', () => {
    it('deve passar erro não relacionado ao Multer adiante', () => {
      const genericError = new Error('Erro genérico');

      MulterErrorHandler(genericError, req, res, next);

      expect(next).toHaveBeenCalledWith(genericError);
      expect(next).not.toHaveBeenCalledWith(expect.any(CustomError));
    });

    it('deve passar erro sem mensagem adiante', () => {
      const errorWithoutMessage = { code: 'SOME_ERROR' };

      MulterErrorHandler(errorWithoutMessage, req, res, next);

      expect(next).toHaveBeenCalledWith(errorWithoutMessage);
      expect(next).not.toHaveBeenCalledWith(expect.any(CustomError));
    });

    it('deve continuar se não houver erro', () => {
      MulterErrorHandler(null, req, res, next);

      expect(next).toHaveBeenCalledWith(null);
      expect(next).not.toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('Casos Edge', () => {
    it('deve tratar erro do Multer sem código', () => {
      const multerError = {
        name: 'MulterError',
        message: 'Erro sem código'
      };

      MulterErrorHandler(multerError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Erro no upload: Erro sem código');
    });

    it('deve ser case-insensitive para mensagens de erro', () => {
      const fileFilterError = new Error('EXTENSÃO DE IMAGEM INVÁLIDA');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
    });

    it('deve tratar mensagens mistas (português/inglês)', () => {
      const fileFilterError = new Error('Invalid file extension - extensão inválida');

      MulterErrorHandler(fileFilterError, req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      const error = next.mock.calls[0][0];
      expect(error.customMessage).toBe('Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.');
    });
  });
});
