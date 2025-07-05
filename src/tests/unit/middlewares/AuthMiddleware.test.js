import jwt from 'jsonwebtoken';
import AuthService from '../../../services/AuthService.js';
import AuthMiddleware from '../../../middlewares/AuthMiddleware.js';
import TokenExpiredError from '../../../utils/errors/TokenExpiredError.js';
import AuthenticationError from '../../../utils/errors/AuthenticationError.js';
import { CustomError } from '../../../utils/helpers/index.js';

jest.mock('jsonwebtoken');
jest.mock('../../../services/AuthService.js');

describe('AuthMiddleware integrado', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer tokenValido'
      }
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir a requisição com token válido e refreshToken válido', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: '123' }));
    AuthService.prototype.carregatokens.mockResolvedValue({ data: { refreshToken: 'ref123' } });

    await AuthMiddleware(req, res, next);

    expect(req.user_id).toBe('123');
    expect(next).toHaveBeenCalledWith();
  });

  it('deve lançar AuthenticationError se token estiver ausente', async () => {
    req.headers.authorization = null;

    await AuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toBe('Token não informado!');
  });

  it('deve lançar erro se jwt for inválido', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      const err = new Error('Token inválido');
      err.name = 'JsonWebTokenError';
      cb(err);
    });

    await AuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toBe('Token JWT inválido!');
  });

  it('deve lançar erro se jwt estiver expirado', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      const err = new Error('Token expirado');
      err.name = 'TokenExpiredError';
      cb(err);
    });

    await AuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
    expect(next.mock.calls[0][0].message).toBe('Token JWT expirado, faça login novamente.');
  });

  it('deve lançar erro se decoded for falsy', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, null));

    await AuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
    expect(next.mock.calls[0][0].message).toBe('Token JWT expirado, faça login novamente.');
  });

  it('deve lançar CustomError se refreshToken estiver ausente no banco', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: '123' }));
    AuthService.prototype.carregatokens.mockResolvedValue({ data: null });

    await AuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(CustomError));
    expect(next.mock.calls[0][0].message).toBe('Refresh token inválido, autentique-se novamente!');
  });
});
