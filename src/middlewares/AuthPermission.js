// middlewares/AuthPermission.js

import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import { CustomError, errorHandler, messages } from '../utils/helpers/index.js';

// Certifique-se de que as variáveis de ambiente estejam carregadas
const JWT_SECRET_ACCESS_TOKEN = process.env.JWT_SECRET_ACCESS_TOKEN;

class AuthPermission {
  constructor() {
    this.jwt = jwt;
    this.usuario = new UsuarioRepository()
    this.JWT_SECRET_ACCESS_TOKEN = JWT_SECRET_ACCESS_TOKEN;
    this.messages = messages;

    // Vincula o método handle ao contexto da instância
    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      // 1. Extrair o token do cabeçalho Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Authorization',
          details: [],
          customMessage: 'Token não encontrado ou inválido.'
        });
      }

      const token = authHeader.split(' ')[1];

      // 2. Decodificar o token para obter o ID do usuário
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET_ACCESS_TOKEN);
      } catch (err) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Token',
          details: [],
          customMessage: 'Token inválido ou expirado.'
        });
      }
      const userId = decoded.id;

      // 3. Buscar o usuário no banco de dados
      const usuario = await this.usuario.buscarPorId(req.user_id)
      if (!usuario) {
        throw new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Usuario',
          details: [],
          customMessage: 'Usuário não encontrado.'
        });
      }


      // 4. Extrair a rota e o método da requisição
      // Remove query params
      const rotaCompleta = req.route?.path || req.url.split('?')[0];

      // Processar a rota distinguindo rotas com parâmetros intermediários
      const segmentos = rotaCompleta.split('/').filter(Boolean);
      let rotaProcessada = '';

      // Verificar se há parâmetros intermediários (não no final)
      const temParametroIntermediario = segmentos.some((segmento, index) =>
        segmento.startsWith(':') && index < segmentos.length - 1
      );

      if (temParametroIntermediario) {
        // Para rotas como /usuarios/:id/foto -> usuarios-id-foto
        rotaProcessada = segmentos
          .map(segmento => segmento.startsWith(':') ? 'id' : segmento)
          .join('-');
      } else {
        // Para rotas como /usuarios/foto ou /usuarios/:id -> usuarios-foto ou usuarios
        rotaProcessada = segmentos
          .filter(segmento => !segmento.startsWith(':'))
          .join('-');
      }

      const rotaReq = rotaProcessada.toLowerCase();
      const metodoReq = req.method;

      // 5. Verificar se algum grupo do usuário tem permissão para acessar a rota
      const metodoMap = {
        'GET': 'buscar',
        'POST': 'enviar',
        'PUT': 'substituir',
        'PATCH': 'modificar',
        'DELETE': 'excluir'
      };

      const metodoPermissao = metodoMap[metodoReq];
      if (!metodoPermissao) {
        throw new CustomError({
          statusCode: 405,
          errorType: 'methodNotAllowed',
          field: 'Método',
          details: [],
          customMessage: 'Método HTTP não permitido.'
        });
      }

      let hasPermission = false;

      for (const grupo of usuario.grupos) {
        const permissao = grupo.permissoes.find(
          (p) => p.rota === rotaReq && p[metodoPermissao] === true
        );
        if (permissao) {
          hasPermission = true;
          break;
        }
      }
      if (!hasPermission) {
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Permissão',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Permissão')
        });
      }

      // 8. Anexa o usuário ao objeto de requisição para uso posterior
      req.user = { id: userId };
      let nivelPermissao = null
      for (const grupo of usuario.grupos) {
        nivelPermissao = nivelPermissao >= grupo.nivelPermissao ? nivelPermissao : grupo.nivelPermissao
      }
      req.nivelPermissao = nivelPermissao
      // 9. Permite a continuação da requisição
      next();
    } catch (error) {
      // Utilize o handler de erros personalizado
      errorHandler(error, req, res, next);
    }
  }
}

// Instanciar e exportar apenas o método 'handle' como função de middleware
export default new AuthPermission().handle;
