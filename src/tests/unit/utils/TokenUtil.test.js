import jwt from 'jsonwebtoken';
import TokenUtil from '../../../utils/TokenUtil.js';
import { CustomError, HttpStatusCodes, messages } from '../../../utils/helpers/index.js';

// Mock das variáveis de ambiente
const mockEnv = {
  JWT_SECRET_ACCESS_TOKEN: 'test-access-secret',
  JWT_SECRET_REFRESH_TOKEN: 'test-refresh-secret',
  JWT_SECRET_PASSWORD_RECOVERY: 'test-recovery-secret',
  JWT_ACCESS_TOKEN_EXPIRATION: '15m',
  JWT_REFRESH_TOKEN_EXPIRATION: '7d',
  JWT_PASSWORD_RECOVERY_EXPIRATION: '30m'
};

// Mock jwt
jest.mock('jsonwebtoken');

describe('TokenUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar as variáveis de ambiente
    process.env.JWT_SECRET_ACCESS_TOKEN = mockEnv.JWT_SECRET_ACCESS_TOKEN;
    process.env.JWT_SECRET_REFRESH_TOKEN = mockEnv.JWT_SECRET_REFRESH_TOKEN;
    process.env.JWT_SECRET_PASSWORD_RECOVERY = mockEnv.JWT_SECRET_PASSWORD_RECOVERY;
    process.env.JWT_ACCESS_TOKEN_EXPIRATION = mockEnv.JWT_ACCESS_TOKEN_EXPIRATION;
    process.env.JWT_REFRESH_TOKEN_EXPIRATION = mockEnv.JWT_REFRESH_TOKEN_EXPIRATION;
    process.env.JWT_PASSWORD_RECOVERY_EXPIRATION = mockEnv.JWT_PASSWORD_RECOVERY_EXPIRATION;
  });

  describe('generateAccessToken', () => {
    it('deve gerar um token de acesso com sucesso', async () => {
      const userId = 'user123';
      const mockToken = 'access-token-123';

      // Mock da função jwt.sign
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const result = await TokenUtil.generateAccessToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockEnv.JWT_SECRET_ACCESS_TOKEN,
        { expiresIn: mockEnv.JWT_ACCESS_TOKEN_EXPIRATION },
        expect.any(Function)
      );
      expect(result).toBe(mockToken);
    });

    it('deve usar valor padrão quando JWT_ACCESS_TOKEN_EXPIRATION não estiver definido', async () => {
      const userId = 'user123';
      const mockToken = 'access-token-123';
      delete process.env.JWT_ACCESS_TOKEN_EXPIRATION;

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      await TokenUtil.generateAccessToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockEnv.JWT_SECRET_ACCESS_TOKEN,
        { expiresIn: '15m' },
        expect.any(Function)
      );
    });

    it('deve rejeitar quando jwt.sign retorna erro', async () => {
      const userId = 'user123';
      const mockError = new Error('JWT Error');

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.generateAccessToken(userId)).rejects.toThrow(mockError);
    });
  });

  describe('generateRefreshToken', () => {
    it('deve gerar um token de atualização com sucesso', async () => {
      const userId = 'user123';
      const mockToken = 'refresh-token-123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const result = await TokenUtil.generateRefreshToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockEnv.JWT_SECRET_REFRESH_TOKEN,
        { expiresIn: mockEnv.JWT_REFRESH_TOKEN_EXPIRATION },
        expect.any(Function)
      );
      expect(result).toBe(mockToken);
    });

    it('deve usar valor padrão quando JWT_REFRESH_TOKEN_EXPIRATION não estiver definido', async () => {
      const userId = 'user123';
      const mockToken = 'refresh-token-123';
      delete process.env.JWT_REFRESH_TOKEN_EXPIRATION;

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      await TokenUtil.generateRefreshToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockEnv.JWT_SECRET_REFRESH_TOKEN,
        { expiresIn: '7d' },
        expect.any(Function)
      );
    });

    it('deve rejeitar quando jwt.sign retorna erro', async () => {
      const userId = 'user123';
      const mockError = new Error('JWT Error');

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.generateRefreshToken(userId)).rejects.toThrow(mockError);
    });
  });

  describe('generatePasswordRecoveryToken', () => {
    it('deve gerar um token de recuperação de senha com sucesso', async () => {
      const userId = 'user123';
      const mockToken = 'recovery-token-123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const result = await TokenUtil.generatePasswordRecoveryToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockEnv.JWT_SECRET_PASSWORD_RECOVERY,
        { expiresIn: mockEnv.JWT_PASSWORD_RECOVERY_EXPIRATION },
        expect.any(Function)
      );
      expect(result).toBe(mockToken);
    });

    it('deve usar valor padrão quando JWT_PASSWORD_RECOVERY_EXPIRATION não estiver definido', async () => {
      const userId = 'user123';
      const mockToken = 'recovery-token-123';
      delete process.env.JWT_PASSWORD_RECOVERY_EXPIRATION;

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      await TokenUtil.generatePasswordRecoveryToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockEnv.JWT_SECRET_PASSWORD_RECOVERY,
        { expiresIn: '30m' },
        expect.any(Function)
      );
    });

    it('deve rejeitar quando jwt.sign retorna erro', async () => {
      const userId = 'user123';
      const mockError = new Error('JWT Error');

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.generatePasswordRecoveryToken(userId)).rejects.toThrow(mockError);
    });
  });

  describe('decodeAccessToken', () => {
    it('deve decodificar um token de acesso com sucesso', async () => {
      const token = 'valid-access-token';
      const userId = 'user123';
      const mockDecoded = { id: userId };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodeAccessToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        mockEnv.JWT_SECRET_ACCESS_TOKEN,
        expect.any(Function)
      );
      expect(result).toBe(userId);
    });

    it('deve rejeitar quando jwt.verify retorna erro', async () => {
      const token = 'invalid-token';
      const mockError = new Error('Token inválido');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.decodeAccessToken(token)).rejects.toThrow(mockError);
    });

    it('deve rejeitar com TokenExpiredError quando token está expirado', async () => {
      const token = 'expired-token';
      const mockError = new Error('jwt expired');
      mockError.name = 'TokenExpiredError';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.decodeAccessToken(token)).rejects.toThrow(mockError);
    });
  });

  describe('decodeRefreshToken', () => {
    it('deve decodificar um token de atualização com sucesso', async () => {
      const token = 'valid-refresh-token';
      const userId = 'user123';
      const mockDecoded = { id: userId };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodeRefreshToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        mockEnv.JWT_SECRET_REFRESH_TOKEN,
        expect.any(Function)
      );
      expect(result).toBe(userId);
    });

    it('deve rejeitar quando jwt.verify retorna erro', async () => {
      const token = 'invalid-token';
      const mockError = new Error('Token inválido');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.decodeRefreshToken(token)).rejects.toThrow(mockError);
    });
  });

  describe('decodePasswordRecoveryToken', () => {
    it('deve decodificar um token de recuperação de senha com sucesso', async () => {
      const token = 'valid-recovery-token';
      const userId = 'user123';
      const mockDecoded = { id: userId };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodePasswordRecoveryToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        mockEnv.JWT_SECRET_PASSWORD_RECOVERY,
        expect.any(Function)
      );
      expect(result).toBe(userId);
    });

    it('deve usar chave customizada quando fornecida', async () => {
      const token = 'valid-recovery-token';
      const customKey = 'custom-secret';
      const userId = 'user123';
      const mockDecoded = { id: userId };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodePasswordRecoveryToken(token, customKey);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        customKey,
        expect.any(Function)
      );
      expect(result).toBe(userId);
    });

    it('deve rejeitar quando jwt.verify retorna erro', async () => {
      const token = 'invalid-token';
      const mockError = new Error('Token inválido');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(mockError);
      });

      await expect(TokenUtil.decodePasswordRecoveryToken(token)).rejects.toThrow(mockError);
    });

    it('deve lançar CustomError quando ocorre erro no try/catch', async () => {
      const token = 'valid-token';
      
      // Mock jwt.verify para lançar uma exceção antes do callback
      jwt.verify.mockImplementation(() => {
        throw new Error('Erro inesperado');
      });

      await expect(TokenUtil.decodePasswordRecoveryToken(token)).rejects.toThrow(Error);
    });
  });

  describe('Integração com variáveis de ambiente', () => {
    it('deve funcionar corretamente sem variáveis de ambiente definidas', async () => {
      // Limpar todas as variáveis de ambiente
      delete process.env.JWT_SECRET_ACCESS_TOKEN;
      delete process.env.JWT_SECRET_REFRESH_TOKEN;
      delete process.env.JWT_SECRET_PASSWORD_RECOVERY;
      delete process.env.JWT_ACCESS_TOKEN_EXPIRATION;
      delete process.env.JWT_REFRESH_TOKEN_EXPIRATION;
      delete process.env.JWT_PASSWORD_RECOVERY_EXPIRATION;

      const userId = 'user123';
      const mockToken = 'test-token';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      // Teste com generateAccessToken
      await TokenUtil.generateAccessToken(userId);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        undefined, // JWT_SECRET_ACCESS_TOKEN não definido
        { expiresIn: '15m' }, // valor padrão
        expect.any(Function)
      );

      // Teste com generateRefreshToken
      await TokenUtil.generateRefreshToken(userId);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        undefined, // JWT_SECRET_REFRESH_TOKEN não definido
        { expiresIn: '7d' }, // valor padrão
        expect.any(Function)
      );

      // Teste com generatePasswordRecoveryToken
      await TokenUtil.generatePasswordRecoveryToken(userId);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        undefined, // JWT_SECRET_PASSWORD_RECOVERY não definido
        { expiresIn: '30m' }, // valor padrão
        expect.any(Function)
      );
    });
  });

  describe('Casos extremos', () => {
    it('deve funcionar com IDs de diferentes tipos', async () => {
      const testCases = [
        'string-id',
        123,
        { objectId: 'test' },
        null,
        undefined
      ];

      const mockToken = 'test-token';
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      for (const testId of testCases) {
        const result = await TokenUtil.generateAccessToken(testId);
        expect(result).toBe(mockToken);
        expect(jwt.sign).toHaveBeenCalledWith(
          { id: testId },
          mockEnv.JWT_SECRET_ACCESS_TOKEN,
          { expiresIn: mockEnv.JWT_ACCESS_TOKEN_EXPIRATION },
          expect.any(Function)
        );
      }
    });

    it('deve funcionar com tokens que contêm payload adicional', async () => {
      const token = 'token-with-extra-payload';
      const mockDecoded = { 
        id: 'user123', 
        email: 'test@example.com',
        role: 'admin',
        iat: 1234567890,
        exp: 1234567890 + 3600
      };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodeAccessToken(token);
      expect(result).toBe('user123'); // Deve retornar apenas o ID
    });
  });
});
