// src/tests/unit/utils/errors/TokenInvalidError.test.js

import assert from 'assert';
import TokenInvalidError from '../../../../utils/errors/TokenInvalidError.js';
import CustomError from '../../../../utils/helpers/CustomError.js';

// Mock do messages
jest.mock('../../../../utils/helpers/messages.js', () => ({
    error: {
        resourceNotFound: jest.fn((resource) => `${resource} não encontrado ou inválido.`)
    }
}));

describe('TokenInvalidError', () => {
    describe('constructor', () => {
        it('deve criar uma instância de TokenInvalidError', () => {
            const error = new TokenInvalidError();

            assert.ok(error instanceof TokenInvalidError);
            assert.ok(error instanceof CustomError);
            assert.ok(error instanceof Error);
        });

        it('deve herdar de CustomError', () => {
            const error = new TokenInvalidError();
            
            assert.ok(error instanceof CustomError);
            assert.ok(error instanceof TokenInvalidError);
        });

        it('deve ter statusCode igual a 401', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.statusCode, 401);
        });

        it('deve ter errorType igual a invalidToken', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.errorType, 'invalidToken');
        });

        it('deve ter field igual a Token', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.field, 'Token');
        });

        it('deve ter details como array vazio', () => {
            const error = new TokenInvalidError();
            
            assert.ok(Array.isArray(error.details));
            assert.strictEqual(error.details.length, 0);
        });

        it('deve ter customMessage usando messages.error.resourceNotFound', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.customMessage, 'Token não encontrado ou inválido.');
        });

        it('deve ser um erro operacional', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.isOperational, true);
        });

        it('deve ignorar o parâmetro message do constructor', () => {
            const message = 'Esta mensagem deve ser ignorada';
            const error = new TokenInvalidError(message);
            
            // O TokenInvalidError não usa o parâmetro message, usa sempre o customMessage
            assert.strictEqual(error.customMessage, 'Token não encontrado ou inválido.');
            assert.notStrictEqual(error.message, message);
        });

        it('deve ter stack trace', () => {
            const error = new TokenInvalidError();
            
            assert.ok(error.stack);
            assert.ok(error.stack.includes('TokenInvalidError'));
        });

        it('deve ser compatível com instanceof Error', () => {
            const error = new TokenInvalidError();
            
            assert.ok(error instanceof Error);
            assert.ok(error instanceof CustomError);
            assert.ok(error instanceof TokenInvalidError);
            assert.strictEqual(error.constructor.name, 'TokenInvalidError');
        });

        it('deve preservar as propriedades ao fazer throw/catch', () => {
            try {
                throw new TokenInvalidError();
            } catch (caughtError) {
                assert.ok(caughtError instanceof TokenInvalidError);
                assert.ok(caughtError instanceof CustomError);
                assert.strictEqual(caughtError.statusCode, 401);
                assert.strictEqual(caughtError.errorType, 'invalidToken');
                assert.strictEqual(caughtError.field, 'Token');
                assert.strictEqual(caughtError.isOperational, true);
            }
        });
    });

    describe('propriedades herdadas de CustomError', () => {
        it('deve manter todas as propriedades do CustomError', () => {
            const error = new TokenInvalidError();
            
            // Propriedades básicas do CustomError
            assert.strictEqual(error.statusCode, 401);
            assert.strictEqual(error.errorType, 'invalidToken');
            assert.strictEqual(error.field, 'Token');
            assert.ok(Array.isArray(error.details));
            assert.strictEqual(error.customMessage, 'Token não encontrado ou inválido.');
            assert.strictEqual(error.isOperational, true);
        });

        it('deve ter propriedades não enumeráveis do Error', () => {
            const error = new TokenInvalidError();
            
            assert.ok(error.name);
            assert.ok(error.stack);
            assert.ok(error.message);
        });
    });

    describe('casos de uso específicos', () => {
        it('deve ser usado para tokens JWT malformados', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.statusCode, 401);
            assert.strictEqual(error.errorType, 'invalidToken');
            assert.ok(error.customMessage.includes('Token'));
        });

        it('deve ser usado para tokens com assinatura inválida', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.statusCode, 401);
            assert.strictEqual(error.field, 'Token');
            assert.ok(error.isOperational);
        });

        it('deve ser usado para tokens não fornecidos', () => {
            const error = new TokenInvalidError();
            
            assert.strictEqual(error.statusCode, 401);
            assert.ok(error.customMessage.includes('não encontrado'));
        });

        it('deve ter statusCode diferente de TokenExpiredError', () => {
            const error = new TokenInvalidError();
            
            // TokenInvalidError usa 401, enquanto TokenExpiredError usa 498
            assert.strictEqual(error.statusCode, 401);
            assert.notStrictEqual(error.statusCode, 498);
        });
    });

    describe('integração com sistema de erros', () => {
        it('deve ser tratado como erro operacional pelo sistema', () => {
            const error = new TokenInvalidError();
            
            assert.ok(error.isOperational);
            assert.strictEqual(error.errorType, 'invalidToken');
        });

        it('deve ter informações suficientes para resposta da API', () => {
            const error = new TokenInvalidError();
            
            assert.ok(error.statusCode);
            assert.ok(error.errorType);
            assert.ok(error.customMessage);
            assert.ok(error.field);
            assert.ok(Array.isArray(error.details));
        });

        it('deve ser serializable para JSON', () => {
            const error = new TokenInvalidError();
            
            const serialized = JSON.stringify({
                statusCode: error.statusCode,
                errorType: error.errorType,
                field: error.field,
                customMessage: error.customMessage,
                details: error.details,
                isOperational: error.isOperational
            });
            
            const parsed = JSON.parse(serialized);
            
            assert.strictEqual(parsed.statusCode, 401);
            assert.strictEqual(parsed.errorType, 'invalidToken');
            assert.strictEqual(parsed.field, 'Token');
            assert.strictEqual(parsed.isOperational, true);
        });
    });
});
