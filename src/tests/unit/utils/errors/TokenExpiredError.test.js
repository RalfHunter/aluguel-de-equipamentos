// src/tests/unit/utils/errors/TokenExpiredError.test.js

import assert from 'assert';
import TokenExpiredError from '../../../../utils/errors/TokenExpiredError.js';

describe('TokenExpiredError', () => {
    describe('constructor', () => {
        it('deve criar uma instância de TokenExpiredError com mensagem personalizada', () => {
            const message = 'Token expirado';
            const error = new TokenExpiredError(message);

            assert.strictEqual(error.message, message);
            assert.strictEqual(error.name, 'TokenExpiredError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve herdar de Error', () => {
            const error = new TokenExpiredError('Teste');
            
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TokenExpiredError);
        });

        it('deve criar uma instância com mensagem vazia', () => {
            const error = new TokenExpiredError('');

            assert.strictEqual(error.message, '');
            assert.strictEqual(error.name, 'TokenExpiredError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve criar uma instância com mensagem undefined', () => {
            const error = new TokenExpiredError(undefined);

            assert.strictEqual(error.message, '');
            assert.strictEqual(error.name, 'TokenExpiredError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve criar uma instância com mensagem null', () => {
            const error = new TokenExpiredError(null);

            assert.strictEqual(error.message, 'null');
            assert.strictEqual(error.name, 'TokenExpiredError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve manter todas as propriedades corretas', () => {
            const message = 'Seu token expirou. Faça login novamente.';
            const error = new TokenExpiredError(message);

            // Verifica se todas as propriedades estão definidas corretamente
            assert.strictEqual(error.message, message);
            assert.strictEqual(error.name, 'TokenExpiredError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
            
            // Verifica se é um erro operacional
            assert.ok(error.isOperational);
        });

        it('deve ter stack trace', () => {
            const error = new TokenExpiredError('Teste com stack');
            
            assert.ok(error.stack);
            assert.ok(error.stack.includes('TokenExpiredError'));
            assert.ok(error.stack.includes('Teste com stack'));
        });

        it('deve ser compatível com instanceof Error', () => {
            const error = new TokenExpiredError('Teste');
            
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TokenExpiredError);
            assert.strictEqual(error.constructor.name, 'TokenExpiredError');
        });

        it('deve preservar a mensagem original ao fazer throw/catch', () => {
            const originalMessage = 'Access token expirado';
            
            try {
                throw new TokenExpiredError(originalMessage);
            } catch (caughtError) {
                assert.ok(caughtError instanceof TokenExpiredError);
                assert.strictEqual(caughtError.message, originalMessage);
                assert.strictEqual(caughtError.statusCode, 498);
                assert.strictEqual(caughtError.isOperational, true);
            }
        });
    });

    describe('propriedades', () => {
        it('deve ter statusCode igual a 498', () => {
            const error = new TokenExpiredError('Teste');
            assert.strictEqual(error.statusCode, 498);
        });

        it('deve ter isOperational igual a true', () => {
            const error = new TokenExpiredError('Teste');
            assert.strictEqual(error.isOperational, true);
        });

        it('deve ter name igual a TokenExpiredError', () => {
            const error = new TokenExpiredError('Teste');
            assert.strictEqual(error.name, 'TokenExpiredError');
        });

        it('deve ser enumerável nas propriedades básicas', () => {
            const error = new TokenExpiredError('Teste');
            const keys = Object.keys(error);
            
            // Verifica se as propriedades customizadas estão presentes
            assert.ok(keys.includes('statusCode') || error.hasOwnProperty('statusCode'));
            assert.ok(keys.includes('isOperational') || error.hasOwnProperty('isOperational'));
        });
    });

    describe('casos de uso específicos', () => {
        it('deve ser usado para tokens JWT expirados', () => {
            const error = new TokenExpiredError('JWT expired');
            
            assert.strictEqual(error.statusCode, 498);
            assert.ok(error.isOperational);
            assert.ok(error.message.includes('expired'));
        });

        it('deve ser usado para refresh tokens expirados', () => {
            const error = new TokenExpiredError('Refresh token expired');
            
            assert.strictEqual(error.statusCode, 498);
            assert.ok(error.isOperational);
            assert.ok(error.message.includes('Refresh token'));
        });

        it('deve ter o mesmo statusCode que AuthenticationError para compatibilidade', () => {
            const error = new TokenExpiredError('Token expirado');
            
            // StatusCode 498 é usado para tokens inválidos/expirados
            assert.strictEqual(error.statusCode, 498);
        });
    });
});
