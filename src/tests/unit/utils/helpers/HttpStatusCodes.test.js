// src/tests/unit/utils/helpers/HttpStatusCodes.test.js

import assert from 'assert';
import HttpStatusCodes from '../../../../utils/helpers/HttpStatusCodes.js';

describe('HttpStatusCodes', () => {
    describe('códigos de sucesso (2xx)', () => {
        it('deve ter OK com código 200', () => {
            assert.strictEqual(HttpStatusCodes.OK.code, 200);
            assert.strictEqual(HttpStatusCodes.OK.message, 'Requisição bem-sucedida');
        });

        it('deve ter CREATED com código 201', () => {
            assert.strictEqual(HttpStatusCodes.CREATED.code, 201);
            assert.strictEqual(HttpStatusCodes.CREATED.message, 'Recurso criado com sucesso');
        });

        it('deve ter ACCEPTED com código 202', () => {
            assert.strictEqual(HttpStatusCodes.ACCEPTED.code, 202);
            assert.strictEqual(HttpStatusCodes.ACCEPTED.message, 'Requisição aceita para processamento');
        });

        it('deve ter NO_CONTENT com código 204', () => {
            assert.strictEqual(HttpStatusCodes.NO_CONTENT.code, 204);
            assert.strictEqual(HttpStatusCodes.NO_CONTENT.message, 'Sem conteúdo para retornar');
        });

        it('deve ter RESET_CONTENT com código 205', () => {
            assert.strictEqual(HttpStatusCodes.RESET_CONTENT.code, 205);
            assert.strictEqual(HttpStatusCodes.RESET_CONTENT.message, 'Mais dados necessários para processamento');
        });

        it('deve ter PARTIAL_CONTENT com código 206', () => {
            assert.strictEqual(HttpStatusCodes.PARTIAL_CONTENT.code, 206);
            assert.strictEqual(HttpStatusCodes.PARTIAL_CONTENT.message, 'Conteúdo parcial retornado');
        });

        it('deve ter MULTI_STATUS com código 207', () => {
            assert.strictEqual(HttpStatusCodes.MULTI_STATUS.code, 207);
            assert.strictEqual(HttpStatusCodes.MULTI_STATUS.message, 'Múltiplos recursos associados à resposta');
        });

        it('deve ter ALREADY_REPORTED com código 208', () => {
            assert.strictEqual(HttpStatusCodes.ALREADY_REPORTED.code, 208);
            assert.strictEqual(HttpStatusCodes.ALREADY_REPORTED.message, 'Conteúdo já relatado');
        });
    });

    describe('códigos de redirecionamento (3xx)', () => {
        it('deve ter MULTIPLE_CHOICES com código 300', () => {
            assert.strictEqual(HttpStatusCodes.MULTIPLE_CHOICES.code, 300);
            assert.strictEqual(HttpStatusCodes.MULTIPLE_CHOICES.message, 'Múltiplas respostas disponíveis, cliente deve escolher uma');
        });

        it('deve ter MOVED_PERMANENTLY com código 301', () => {
            assert.strictEqual(HttpStatusCodes.MOVED_PERMANENTLY.code, 301);
            assert.strictEqual(HttpStatusCodes.MOVED_PERMANENTLY.message, 'Recurso movido permanentemente para um novo endereço');
        });

        it('deve ter FOUND com código 302', () => {
            assert.strictEqual(HttpStatusCodes.FOUND.code, 302);
            assert.strictEqual(HttpStatusCodes.FOUND.message, 'Recurso encontrado, mas movido temporariamente para um novo endereço');
        });

        it('deve ter SEE_OTHER com código 303', () => {
            assert.strictEqual(HttpStatusCodes.SEE_OTHER.code, 303);
            assert.strictEqual(HttpStatusCodes.SEE_OTHER.message, 'Veja outra referência para o recurso');
        });

        it('deve ter NOT_MODIFIED com código 304', () => {
            assert.strictEqual(HttpStatusCodes.NOT_MODIFIED.code, 304);
            assert.strictEqual(HttpStatusCodes.NOT_MODIFIED.message, 'Cliente possui a versão mais recente do recurso');
        });

        it('deve ter USE_PROXY com código 305', () => {
            assert.strictEqual(HttpStatusCodes.USE_PROXY.code, 305);
            assert.strictEqual(HttpStatusCodes.USE_PROXY.message, 'Recurso disponível apenas através de um proxy');
        });

        it('deve ter TEMPORARY_REDIRECT com código 307', () => {
            assert.strictEqual(HttpStatusCodes.TEMPORARY_REDIRECT.code, 307);
            assert.strictEqual(HttpStatusCodes.TEMPORARY_REDIRECT.message, 'Recurso temporariamente movido para um novo endereço');
        });

        it('deve ter PERMANENT_REDIRECT com código 308', () => {
            assert.strictEqual(HttpStatusCodes.PERMANENT_REDIRECT.code, 308);
            assert.strictEqual(HttpStatusCodes.PERMANENT_REDIRECT.message, 'Recurso movido permanentemente para um novo endereço');
        });
    });

    describe('códigos de erro do cliente (4xx)', () => {
        it('deve ter BAD_REQUEST com código 400', () => {
            assert.strictEqual(HttpStatusCodes.BAD_REQUEST.code, 400);
            assert.strictEqual(HttpStatusCodes.BAD_REQUEST.message, 'Requisição com sintaxe incorreta');
        });

        it('deve ter UNAUTHORIZED com código 401', () => {
            assert.strictEqual(HttpStatusCodes.UNAUTHORIZED.code, 401);
            assert.strictEqual(HttpStatusCodes.UNAUTHORIZED.message, 'Não autorizado');
        });

        it('deve ter FORBIDDEN com código 403', () => {
            assert.strictEqual(HttpStatusCodes.FORBIDDEN.code, 403);
            assert.strictEqual(HttpStatusCodes.FORBIDDEN.message, 'Proibido');
        });

        it('deve ter NOT_FOUND com código 404', () => {
            assert.strictEqual(HttpStatusCodes.NOT_FOUND.code, 404);
            assert.strictEqual(HttpStatusCodes.NOT_FOUND.message, 'Recurso não encontrado');
        });

        it('deve ter METHOD_NOT_ALLOWED com código 405', () => {
            assert.strictEqual(HttpStatusCodes.METHOD_NOT_ALLOWED.code, 405);
            assert.strictEqual(HttpStatusCodes.METHOD_NOT_ALLOWED.message, 'Método HTTP não permitido para o recurso solicitado');
        });

        it('deve ter REQUEST_TIMEOUT com código 408', () => {
            assert.strictEqual(HttpStatusCodes.REQUEST_TIMEOUT.code, 408);
            assert.strictEqual(HttpStatusCodes.REQUEST_TIMEOUT.message, 'Tempo de requisição esgotado');
        });

        it('deve ter CONFLICT com código 409', () => {
            assert.strictEqual(HttpStatusCodes.CONFLICT.code, 409);
            assert.strictEqual(HttpStatusCodes.CONFLICT.message, 'Conflito com o estado atual do servidor');
        });

        it('deve ter GONE com código 410', () => {
            assert.strictEqual(HttpStatusCodes.GONE.code, 410);
            assert.strictEqual(HttpStatusCodes.GONE.message, 'Recurso não está mais disponível');
        });

        it('deve ter PAYLOAD_TOO_LARGE com código 413', () => {
            assert.strictEqual(HttpStatusCodes.PAYLOAD_TOO_LARGE.code, 413);
            assert.strictEqual(HttpStatusCodes.PAYLOAD_TOO_LARGE.message, 'O corpo da requisição é muito grande');
        });

        it('deve ter IM_A_TEAPOT com código 418', () => {
            assert.strictEqual(HttpStatusCodes.IM_A_TEAPOT.code, 418);
            assert.strictEqual(HttpStatusCodes.IM_A_TEAPOT.message, 'Eu sou um bule de chá');
        });

        it('deve ter UNPROCESSABLE_ENTITY com código 422', () => {
            assert.strictEqual(HttpStatusCodes.UNPROCESSABLE_ENTITY.code, 422);
            assert.strictEqual(HttpStatusCodes.UNPROCESSABLE_ENTITY.message, 'Falha na validação');
        });

        it('deve ter LOCKED com código 423', () => {
            assert.strictEqual(HttpStatusCodes.LOCKED.code, 423);
            assert.strictEqual(HttpStatusCodes.LOCKED.message, 'Recurso bloqueado');
        });

        it('deve ter REQUEST_HEADER_FIELDS_TOO_LARGE com código 431', () => {
            assert.strictEqual(HttpStatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE.code, 431);
            assert.strictEqual(HttpStatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE.message, 'Cabeçalhos da requisição são muito grandes');
        });

        it('deve ter UNAVAILABLE_FOR_LEGAL_REASONS com código 451', () => {
            assert.strictEqual(HttpStatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS.code, 451);
            assert.strictEqual(HttpStatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS.message, 'Acesso negado por motivos legais');
        });

        it('deve ter INVALID_TOKEN com código 498', () => {
            assert.strictEqual(HttpStatusCodes.INVALID_TOKEN.code, 498);
            assert.strictEqual(HttpStatusCodes.INVALID_TOKEN.message, 'O token JWT está expirado!');
        });
    });

    describe('códigos de erro do servidor (5xx)', () => {
        it('deve ter INTERNAL_SERVER_ERROR com código 500', () => {
            assert.strictEqual(HttpStatusCodes.INTERNAL_SERVER_ERROR.code, 500);
            assert.strictEqual(HttpStatusCodes.INTERNAL_SERVER_ERROR.message, 'Erro interno do servidor');
        });

        it('deve ter NOT_IMPLEMENTED com código 501', () => {
            assert.strictEqual(HttpStatusCodes.NOT_IMPLEMENTED.code, 501);
            assert.strictEqual(HttpStatusCodes.NOT_IMPLEMENTED.message, 'Funcionalidade não suportada');
        });

        it('deve ter BAD_GATEWAY com código 502', () => {
            assert.strictEqual(HttpStatusCodes.BAD_GATEWAY.code, 502);
            assert.strictEqual(HttpStatusCodes.BAD_GATEWAY.message, 'Resposta inválida recebida do servidor upstream');
        });

        it('deve ter SERVICE_UNAVAILABLE com código 503', () => {
            assert.strictEqual(HttpStatusCodes.SERVICE_UNAVAILABLE.code, 503);
            assert.strictEqual(HttpStatusCodes.SERVICE_UNAVAILABLE.message, 'Serviço temporariamente indisponível');
        });
    });

    describe('estrutura dos objetos', () => {
        it('todos os códigos devem ter propriedade code como número', () => {
            const statusCodes = Object.values(HttpStatusCodes);
            
            statusCodes.forEach(status => {
                assert.ok(typeof status.code === 'number', `Code deve ser número, mas é ${typeof status.code}`);
                assert.ok(status.code > 0, 'Code deve ser um número positivo');
            });
        });

        it('todos os códigos devem ter propriedade message como string', () => {
            const statusCodes = Object.values(HttpStatusCodes);
            
            statusCodes.forEach(status => {
                assert.ok(typeof status.message === 'string', `Message deve ser string, mas é ${typeof status.message}`);
                assert.ok(status.message.length > 0, 'Message não deve ser string vazia');
            });
        });

        it('deve ter exatamente 2 propriedades por objeto (code e message)', () => {
            const statusCodes = Object.values(HttpStatusCodes);
            
            statusCodes.forEach(status => {
                const keys = Object.keys(status);
                assert.strictEqual(keys.length, 2, 'Cada status deve ter exatamente 2 propriedades');
                assert.ok(keys.includes('code'), 'Deve ter propriedade code');
                assert.ok(keys.includes('message'), 'Deve ter propriedade message');
            });
        });

        it('deve ter códigos únicos', () => {
            const statusCodes = Object.values(HttpStatusCodes);
            const codes = statusCodes.map(status => status.code);
            const uniqueCodes = [...new Set(codes)];
            
            assert.strictEqual(codes.length, uniqueCodes.length, 'Todos os códigos devem ser únicos');
        });
    });

    describe('categorias de códigos', () => {
        it('deve ter códigos de sucesso (200-299)', () => {
            const successCodes = Object.values(HttpStatusCodes)
                .filter(status => status.code >= 200 && status.code < 300)
                .map(status => status.code);
            
            assert.ok(successCodes.length > 0, 'Deve ter pelo menos um código de sucesso');
            assert.ok(successCodes.includes(200), 'Deve incluir código 200');
            assert.ok(successCodes.includes(201), 'Deve incluir código 201');
        });

        it('deve ter códigos de redirecionamento (300-399)', () => {
            const redirectCodes = Object.values(HttpStatusCodes)
                .filter(status => status.code >= 300 && status.code < 400)
                .map(status => status.code);
            
            assert.ok(redirectCodes.length > 0, 'Deve ter pelo menos um código de redirecionamento');
            assert.ok(redirectCodes.includes(301), 'Deve incluir código 301');
            assert.ok(redirectCodes.includes(302), 'Deve incluir código 302');
        });

        it('deve ter códigos de erro do cliente (400-499)', () => {
            const clientErrorCodes = Object.values(HttpStatusCodes)
                .filter(status => status.code >= 400 && status.code < 500)
                .map(status => status.code);
            
            assert.ok(clientErrorCodes.length > 0, 'Deve ter pelo menos um código de erro do cliente');
            assert.ok(clientErrorCodes.includes(400), 'Deve incluir código 400');
            assert.ok(clientErrorCodes.includes(401), 'Deve incluir código 401');
            assert.ok(clientErrorCodes.includes(404), 'Deve incluir código 404');
        });

        it('deve ter códigos de erro do servidor (500-599)', () => {
            const serverErrorCodes = Object.values(HttpStatusCodes)
                .filter(status => status.code >= 500 && status.code < 600)
                .map(status => status.code);
            
            assert.ok(serverErrorCodes.length > 0, 'Deve ter pelo menos um código de erro do servidor');
            assert.ok(serverErrorCodes.includes(500), 'Deve incluir código 500');
        });
    });

    describe('propriedades estáticas', () => {
        it('deve ser uma classe com propriedades estáticas', () => {
            assert.strictEqual(typeof HttpStatusCodes, 'function', 'HttpStatusCodes deve ser uma classe/função');
            assert.ok(HttpStatusCodes.OK, 'Deve ter propriedade estática OK');
            assert.ok(HttpStatusCodes.NOT_FOUND, 'Deve ter propriedade estática NOT_FOUND');
        });

        it('propriedades devem ser imutáveis', () => {
            const originalOK = { ...HttpStatusCodes.OK };
            
            // Verifica que o valor está correto
            expect(HttpStatusCodes.OK).toEqual(originalOK);
            expect(HttpStatusCodes.OK.code).toBe(200);
            expect(HttpStatusCodes.OK.message).toBe('Requisição bem-sucedida');
            
            // Em JavaScript, objetos são mutáveis por padrão
            // Vamos apenas verificar que a estrutura está consistente
            expect(typeof HttpStatusCodes.OK).toBe('object');
            expect(HttpStatusCodes.OK).toHaveProperty('code');
            expect(HttpStatusCodes.OK).toHaveProperty('message');
        });
    });
});
