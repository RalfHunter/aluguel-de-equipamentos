// src/middlewares/FileMiddleware.js
import { CustomError } from '../utils/helpers/index.js';

class FileMiddleware {
  constructor() {
    // Garante que o 'this' do método se mantenha ao usá-lo como callback
    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      console.log('FileMiddleware - Content-Type:', req.headers['content-type']);
      
      // Verificar se é uma requisição multipart/form-data
      const contentType = req.headers['content-type'] || '';
      const isMultipart = contentType.includes('multipart/form-data');
      
      if (!isMultipart) {
        throw new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Requisição deve ser multipart/form-data com arquivo.'
        });
      }
      
      // Verificar se há boundary no content-type (indica que há dados multipart)
      const hasBoundary = contentType.includes('boundary=');
      
      if (!hasBoundary) {
        throw new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Dados multipart inválidos.'
        });
      }
      
      // Verificar Content-Length para garantir que há dados sendo enviados
      const contentLength = parseInt(req.headers['content-length'] || '0');
      
      if (contentLength === 0) {
        throw new CustomError({
          statusCode: 400,
          errorType: 'validationError',
          field: 'file',
          details: [],
          customMessage: 'Nenhum arquivo foi enviado.'
        });
      }
      
      // Wrapper do multer para capturar erros específicos
      const originalNext = next;
      req._fileMiddlewareChecked = true;
      
      // Se chegou até aqui, passa para o multer, mas vai interceptar erros
      next();
      
    } catch (err) {
      console.error('FileMiddleware - Erro:', err);
      return next(err);
    }
  }
}

// Exporta apenas a função middleware já vinculada
export default new FileMiddleware().handle;
