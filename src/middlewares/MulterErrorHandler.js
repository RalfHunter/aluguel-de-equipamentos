// src/middlewares/MulterErrorHandler.js
import { CustomError } from '../utils/helpers/index.js';

const MulterErrorHandler = (err, req, res, next) => {
  // Se for um erro do Multer
  if (err && err.name === 'MulterError') {
    switch (err.code) {
      case 'UNEXPECTED_FIELD':
        return next(new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Arquivo inesperado. Use o campo "file" para enviar o arquivo.'
        }));
        
      case 'LIMIT_FILE_SIZE':
        return next(new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Arquivo muito grande. Tamanho máximo permitido é 5MB.'
        }));
        
      case 'LIMIT_FILE_COUNT':
        return next(new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Muitos arquivos enviados. Envie apenas um arquivo.'
        }));
        
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Arquivo inesperado. Use o campo "file" para enviar o arquivo.'
        }));
        
      default:
        return next(new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: `Erro no upload: ${err.message}`
        }));
    }
  }
  
  // Verificar se é um erro do fileFilter do multer (extensão inválida ou tipo MIME)
  if (err && err.message) {
    const errorMessage = err.message.toLowerCase();
    
    // Erro de extensão inválida - captura erros vindos do fileFilter
    if (errorMessage.includes('extensão de imagem inválida') || 
        errorMessage.includes('apenas jpg, jpeg e png são permitidos') ||
        errorMessage.includes('invalid file extension') ||
        errorMessage.includes('invalid image extension')) {
      return next(new CustomError({
        statusCode: 400,
        errorType: 'validationError',
        field: 'file',
        details: [],
        customMessage: 'Formato de arquivo inválido. Apenas arquivos JPG, JPEG e PNG são permitidos.'
      }));
    }
    
    // Erro de tipo MIME inválido
    if (errorMessage.includes('tipo de arquivo inválido') ||
        errorMessage.includes('apenas imagens são permitidas') ||
        errorMessage.includes('invalid file type') ||
        errorMessage.includes('only images are allowed')) {
      return next(new CustomError({
        statusCode: 400,
        errorType: 'validationError',
        field: 'file',
        details: [],
        customMessage: 'Tipo de arquivo inválido. Apenas imagens são permitidas.'
      }));
    }
  }
  
  // Se não for erro do Multer nem do fileFilter, passa adiante
  next(err);
};

export default MulterErrorHandler;
