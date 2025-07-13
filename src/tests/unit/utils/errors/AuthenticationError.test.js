// src/tests/unit/utils/errors/AuthenticationError.test.js

import assert from 'assert';
import AuthenticationError from '../../../../utils/errors/AuthenticationError.js';

describe('AuthenticationError', () => {
    describe('constructor', () => {
        it('deve criar uma instância de AuthenticationError com mensagem personalizada', () => {
            const message = 'Credenciais inválidas';
            const error = new AuthenticationError(message);

            assert.strictEqual(error.message, message);
            assert.strictEqual(error.name, 'AuthenticationError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve herdar de Error', () => {
            const error = new AuthenticationError('Teste');
            
            assert.ok(error instanceof Error);
            assert.ok(error instanceof AuthenticationError);
        });

        it('deve criar uma instância com mensagem vazia', () => {
            const error = new AuthenticationError('');

            assert.strictEqual(error.message, '');
            assert.strictEqual(error.name, 'AuthenticationError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve criar uma instância com mensagem undefined', () => {
            const error = new AuthenticationError(undefined);

            assert.strictEqual(error.message, '');
            assert.strictEqual(error.name, 'AuthenticationError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve criar uma instância com mensagem null', () => {
            const error = new AuthenticationError(null);

            assert.strictEqual(error.message, 'null');
            assert.strictEqual(error.name, 'AuthenticationError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
        });

        it('deve manter todas as propriedades corretas', () => {
            const message = 'Token de autenticação inválido';
            const error = new AuthenticationError(message);

            // Verifica se todas as propriedades estão definidas corretamente
            assert.strictEqual(error.message, message);
            assert.strictEqual(error.name, 'AuthenticationError');
            assert.strictEqual(error.statusCode, 498);
            assert.strictEqual(error.isOperational, true);
            
            // Verifica se é um erro operacional
            assert.ok(error.isOperational);
        });

        it('deve ter stack trace', () => {
            const error = new AuthenticationError('Teste com stack');
            
            assert.ok(error.stack);
            assert.ok(error.stack.includes('AuthenticationError'));
            assert.ok(error.stack.includes('Teste com stack'));
        });

        it('deve ser compatível com instanceof Error', () => {
            const error = new AuthenticationError('Teste');
            
            assert.ok(error instanceof Error);
            assert.ok(error instanceof AuthenticationError);
            assert.strictEqual(error.constructor.name, 'AuthenticationError');
        });

        it('deve preservar a mensagem original ao fazer throw/catch', () => {
            const originalMessage = 'Usuário não autenticado';
            
            try {
                throw new AuthenticationError(originalMessage);
            } catch (caughtError) {
                assert.ok(caughtError instanceof AuthenticationError);
                assert.strictEqual(caughtError.message, originalMessage);
                assert.strictEqual(caughtError.statusCode, 498);
                assert.strictEqual(caughtError.isOperational, true);
            }
        });
    });

    describe('propriedades', () => {
        it('deve ter statusCode igual a 498', () => {
            const error = new AuthenticationError('Teste');
            assert.strictEqual(error.statusCode, 498);
        });

        it('deve ter isOperational igual a true', () => {
            const error = new AuthenticationError('Teste');
            assert.strictEqual(error.isOperational, true);
        });

        it('deve ter name igual a AuthenticationError', () => {
            const error = new AuthenticationError('Teste');
            assert.strictEqual(error.name, 'AuthenticationError');
        });

        it('deve ser enumerável nas propriedades básicas', () => {
            const error = new AuthenticationError('Teste');
            const keys = Object.keys(error);
            
            // Verifica se as propriedades customizadas estão presentes
            assert.ok(keys.includes('statusCode') || error.hasOwnProperty('statusCode'));
            assert.ok(keys.includes('isOperational') || error.hasOwnProperty('isOperational'));
        });
    });
});
