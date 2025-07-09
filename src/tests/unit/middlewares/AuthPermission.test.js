import jwt from 'jsonwebtoken';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import AuthPermission from '../../../middlewares/AuthPermission.js';
import { CustomError } from '../../../utils/helpers/index.js';

jest.mock('jsonwebtoken');
jest.mock('../../../repositories/UsuarioRepository.js');

describe('AuthPermission integrado', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer tokenValido'
      },
      method: 'GET',
      route: { path: '/usuarios' },
      url: '/usuarios',
      user_id: 'user123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Setup environment
    process.env.JWT_SECRET_ACCESS_TOKEN = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir a requisição com permissão válida', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'usuarios', buscar: true }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(req.user).toEqual({ id: 'user123' });
    expect(req.nivelPermissao).toBe(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('deve lançar erro se token estiver ausente', async () => {
    req.headers.authorization = null;

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token não encontrado ou inválido.'
    }));
    expect(next).not.toHaveBeenCalledWith();
  });

  it('deve lançar erro se jwt for inválido', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token inválido ou expirado.'
    }));
    expect(next).not.toHaveBeenCalledWith();
  });

  it('deve lançar erro se usuário não for encontrado', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue(null);

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Usuário não encontrado.'
    }));
    expect(next).not.toHaveBeenCalledWith();
  });

  it('deve lançar erro se usuário não tiver permissão', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'outros', buscar: true }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalledWith();
  });

  it('deve lançar erro para método HTTP não suportado', async () => {
    req.method = 'TRACE';
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'usuarios', buscar: true }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Método HTTP não permitido.'
    }));
    expect(next).not.toHaveBeenCalledWith();
  });

  it('deve usar o maior nível de permissão de múltiplos grupos', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [
        { nivelPermissao: 1, permissoes: [{ rota: 'usuarios', buscar: true }] },
        { nivelPermissao: 5, permissoes: [{ rota: 'usuarios', buscar: true }] },
        { nivelPermissao: 3, permissoes: [{ rota: 'usuarios', buscar: true }] }
      ]
    });

    await AuthPermission(req, res, next);

    expect(req.nivelPermissao).toBe(5);
    expect(next).toHaveBeenCalledWith();
  });

  it('deve processar rota com parâmetros intermediários', async () => {
    req.route.path = '/usuarios/:id/foto';
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'usuarios-id-foto', buscar: true }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('deve processar rota com parâmetros finais', async () => {
    req.route.path = '/usuarios/:id';
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'usuarios', buscar: true }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('deve usar req.url quando req.route.path não estiver disponível', async () => {
    req.route = undefined;
    req.url = '/usuarios?page=1';
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'usuarios', buscar: true }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('deve mapear métodos HTTP corretamente', async () => {
    const testCases = [
      { method: 'GET', permission: 'buscar' },
      { method: 'POST', permission: 'enviar' },
      { method: 'PUT', permission: 'substituir' },
      { method: 'PATCH', permission: 'modificar' },
      { method: 'DELETE', permission: 'excluir' }
    ];

    for (const { method, permission } of testCases) {
      jest.clearAllMocks();
      req.method = method;
      
      const permissaoObj = { rota: 'usuarios' };
      permissaoObj[permission] = true;

      jwt.verify.mockReturnValue({ id: 'user123' });
      UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
        grupos: [{
          nivelPermissao: 1,
          permissoes: [permissaoObj]
        }]
      });

      await AuthPermission(req, res, next);

      expect(next).toHaveBeenCalledWith();
    }
  });

  it('deve lançar erro se usuário não tem permissão para método específico', async () => {
    req.method = 'POST';
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockResolvedValue({
      grupos: [{
        nivelPermissao: 1,
        permissoes: [{ rota: 'usuarios', buscar: true, enviar: false }]
      }]
    });

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalledWith();
  });

  it('deve tratar erro do repositório', async () => {
    jwt.verify.mockReturnValue({ id: 'user123' });
    UsuarioRepository.prototype.buscarPorId.mockRejectedValue(new Error('Database error'));

    await AuthPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith();
  });
});
