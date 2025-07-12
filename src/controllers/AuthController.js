// /src/controllers/AuthController.js

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { LoginSchema } from '../utils/validators/schemas/zod/LoginSchema.js';
import {UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { RequestAuthorizationSchema } from '../utils/validators/schemas/zod/querys/RequestAuthorizationSchema.js';

import AuthService from '../services/AuthService.js';
/**
   * Validação nesta aplicação segue este artigo:
   * https://docs.google.com/document/d/1m2Ns1rIxpUzG5kRsgkbaQFdm7od0e7HSHfaSrrwegmM/edit?usp=sharing
   * Configuração atualizada para reinicialização automática com nodemon no Windows.
   * Teste de reinicialização automática funcionando!
*/
class AuthController {
  constructor() {
    this.service = new AuthService();
  }
  /**
   * Método para fazer o login do usuário
   */
  login = async (req, res) => {
    // 1º validação estrutural - validar os campos passados por body
    const body = req.body || {};
    const validatedBody = LoginSchema.parse(body);
    const data = await this.service.login(validatedBody);
    return CommonResponse.success(res, data);
  }

  /**
   *  Metodo para recuperar a senha do usuário
   */
  recuperaSenha = async (req, res) => {
    // 1º validação estrutural - validar os campos passados por body
    // Validar apenas o email
    const validatedBody = UsuarioUpdateSchema.parse(req.body);
    const data = await this.service.recuperaSenha(validatedBody);
    return CommonResponse.success(res, data);
  }

  /**
   * Método para fazer o refresh do token 
   */
  revoke = async (req, res) => {
    // Extrai ID do usuario a ter o token revogado do body
    const id = req.body.id;
  UsuarioIdSchema.parse(id)
    // remove o token do banco de dados e retorna uma resposta de sucesso
    const data = await this.service.revoke(id);
    return CommonResponse.success(res);
  }

  /**
   * Método para fazer o refresh do token 
   */
  refresh = async (req, res) => {
    try {
      // Extrai do body o token
      const token = req.body.refresh_token;

      // Verifica se o cabeçalho Authorization está presente
      if (!token || token === 'null' || token === 'undefined') {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: 'invalidRefresh',
          field: 'Refresh',
          details: [],
          customMessage: 'Refresh token is missing.'
        });
      }

      // Verifica e decodifica o token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_REFRESH_TOKEN);

      // encaminha o token para o serviço
      const data = await this.service.refresh(decoded.id, token);
      return CommonResponse.success(res, data);
    } catch (err) {
      // Tratamento específico para erros de JWT
      if (err.name === 'JsonWebTokenError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'Token',
          details: [],
          customMessage: 'Token JWT inválido!'
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.INVALID_TOKEN.code,
          errorType: 'tokenExpired',
          field: 'Token',
          details: [],
          customMessage: 'Token JWT expirado!'
        });
      }

      if (err.name === 'NotBeforeError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'Token',
          details: [],
          customMessage: 'Token JWT ainda não é válido!'
        });
      }

      // Se for um CustomError, apenas repassa
      if (err instanceof CustomError) {
        throw err;
      }

      // Para outros erros, lança um erro genérico
      throw new CustomError({
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
        errorType: 'serverError',
        field: 'refresh',
        details: [],
        customMessage: 'Erro interno durante renovação do token.'
      });
    }
  }



  /**
   * Método para fazer o logout do usuário
   */
  logout = async (req, res) => {
    try {
      // Extrai o cabeçalho Authorization
      const token = req.body.access_token || req.headers.authorization?.split(' ')[1];

      // Verifica se o token está presente e não é uma string inválida
      if (!token || token === 'null' || token === 'undefined') {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: 'invalidLogout',
          field: 'Logout',
          details: [],
          customMessage: HttpStatusCodes.BAD_REQUEST.message
        });
      }

      // Verifica e decodifica o access token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_ACCESS_TOKEN);

      // Verifica se o token decodificado contém o ID do usuário
      if (!decoded || !decoded.id) {
        throw new CustomError({
          statusCode: HttpStatusCodes.INVALID_TOKEN.code,
          errorType: 'notAuthorized',
          field: 'NotAuthorized',
          details: [],
          customMessage: HttpStatusCodes.INVALID_TOKEN.message
        });
      }

      // Encaminha o token para o serviço de logout
      const data = await this.service.logout(decoded.id, token);

      // Retorna uma resposta de sucesso
      return CommonResponse.success(res, null, messages.success.logout);
    } catch (err) {
      // Tratamento específico para erros de JWT
      if (err.name === 'JsonWebTokenError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'NotAuthorized',
          details: [],
          customMessage: 'Token de acesso inválido ou malformado.'
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.INVALID_TOKEN.code,
          errorType: 'tokenExpired',
          field: 'NotAuthorized',
          details: [],
          customMessage: 'Token de acesso expirado.'
        });
      }

      if (err.name === 'NotBeforeError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'NotAuthorized',
          details: [],
          customMessage: 'Token de acesso ainda não é válido.'
        });
      }

      // Se for um CustomError, apenas repassa
      if (err instanceof CustomError) {
        throw err;
      }

      // Para outros erros, lança um erro genérico
      throw new CustomError({
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
        errorType: 'serverError',
        field: 'logout',
        details: [],
        customMessage: 'Erro interno durante logout.'
      });
    }
  }

  /**
   * Método para validar o token
   */

  pass = async (req, res) => {
    // 1. Validação estrutural (fora do try/catch para permitir erro 400)
    const bodyrequest = req.body || {};
    
    try {
      const validatedBody = RequestAuthorizationSchema.parse(bodyrequest);
    } catch (zodError) {
      throw zodError; // Re-lança o erro para que seja tratado pelo errorHandler
    }
    
    const validatedBody = RequestAuthorizationSchema.parse(bodyrequest);

    try {
      // Verifica se o token está presente e não é uma string inválida
      if (!validatedBody.accessToken || validatedBody.accessToken === 'null' || validatedBody.accessToken === 'undefined') {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: 'invalidToken',
          field: 'accessToken',
          details: [],
          customMessage: 'Token de acesso é obrigatório para validação.'
        });
      }

      // 2. Decodifica e verifica o JWT
      const decoded = /** @type {{ id: string, exp?: number, iat?: number, nbf?: number, client_id?: string, aud?: string }} */ (
        await promisify(jwt.verify)(validatedBody.accessToken, process.env.JWT_SECRET_ACCESS_TOKEN)
      );

      // Verifica se o token decodificado contém informações válidas
      if (!decoded) {
        throw new CustomError({
          statusCode: HttpStatusCodes.INVALID_TOKEN.code,
          errorType: 'invalidToken',
          field: 'accessToken',
          details: [],
          customMessage: 'Token de acesso inválido ou malformado.'
        });
      }

      // 3. Valida ID de usuário
      // UsuarioIdSchema.parse(decoded.id);

      // 4. Prepara campos de introspecção
      const now = Math.floor(Date.now() / 1000);
      const exp = decoded.exp ?? null; // timestamp UNIX de expiração
      const iat = decoded.iat ?? null; // timestamp UNIX de emissão 
      const nbf =  decoded.nbf ?? iat; // não válido antes deste timestamp
      const active = exp > now;

      // tenta extrair o client_id do próprio token; cai em aud se necessário
      const clientId = decoded.client_id || decoded.id || decoded.aud || null;

      /**
       * 5. Prepara resposta de introspecção
       */
      const introspection = {
        active,               // token ainda válido (não expirado)
        client_id: clientId,  // ID do cliente OAuth
        token_type: 'Bearer', // conforme RFC 6749
        exp,                  // timestamp UNIX de expiração
        iat,                  // timestamp UNIX de emissão
        nbf,                  // não válido antes deste timestamp
        // …adicione aqui quaisquer campos de extensão necessários…
      };
      // console.log(introspection)
      // 5. Retorna resposta no padrão CommonResponse
      return CommonResponse.success(
        res,
        introspection,
        HttpStatusCodes.OK.code,
        messages.authorized.default
      );
    } catch (err) {
      // Tratamento específico para erros de JWT
      if (err.name === 'JsonWebTokenError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'accessToken',
          details: [],
          customMessage: 'Token de acesso inválido ou malformado.'
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.INVALID_TOKEN.code,
          errorType: 'tokenExpired',
          field: 'accessToken',
          details: [],
          customMessage: 'Token de acesso expirado.'
        });
      }

      if (err.name === 'NotBeforeError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'accessToken',
          details: [],
          customMessage: 'Token de acesso ainda não é válido.'
        });
      }

      // Se for um CustomError, apenas repassa
      if (err instanceof CustomError) {
        throw err;
      }

      // Para outros erros, lança um erro genérico
      throw new CustomError({
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
        errorType: 'serverError',
        field: 'introspection',
        details: [],
        customMessage: 'Erro interno durante validação do token.'
      });
    }
  };
  
  async atualizarSenhaToken(req, res, next) {
    try {
      const tokenRecuperacao = req.query.token || req.params.token || null; // token de recuperação passado na URL
      const senha = req.body.senha || null; // nova senha passada no body

      // 1) Verifica se veio o token de recuperação
      if (!tokenRecuperacao) {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'unauthorized',
          field: 'authentication',
          details: [],
          customMessage:
            'Token de recuperação na URL como parâmetro ou query é obrigatório para troca da senha.'
        });
      }

      // Validar a senha com o schema
      const senhaSchema = UsuarioUpdateSchema.parse({ "senha": senha });

      // atualiza a senha 
      await this.service.atualizarSenhaToken(tokenRecuperacao, senhaSchema);

      return CommonResponse.success(
        res,
        null,
        HttpStatusCodes.OK.code, 'Senha atualizada com sucesso.',
        { message: 'Senha atualizada com sucesso via token de recuperação.' },
      );
    } catch (err) {
      // Tratamento específico para erros de JWT
      if (err.name === 'JsonWebTokenError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.UNAUTHORIZED.code,
          errorType: 'invalidToken',
          field: 'token',
          details: [],
          customMessage: 'Token de recuperação inválido ou malformado.'
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        throw new CustomError({
          statusCode: HttpStatusCodes.INVALID_TOKEN.code,
          errorType: 'tokenExpired',
          field: 'token',
          details: [],
          customMessage: 'Token de recuperação expirado.'
        });
      }

      // Se for um CustomError, apenas repassa
      if (err instanceof CustomError) {
        throw err;
      }

      // Para outros erros, lança um erro genérico
      throw new CustomError({
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
        errorType: 'serverError',
        field: 'passwordReset',
        details: [],
        customMessage: 'Erro interno durante alteração da senha.'
      });
    }
  }

}

export default AuthController;
