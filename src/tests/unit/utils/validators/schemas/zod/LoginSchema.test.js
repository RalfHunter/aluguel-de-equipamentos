import { LoginSchema } from '../../../../../../utils/validators/schemas/zod/LoginSchema.js';
import { z } from 'zod';

describe('LoginSchema', () => {
    describe('Validação de email', () => {
        it('deve aceitar email válido', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.email).toBe('usuario@gmail.com');
        });

        it('deve aceitar email com domínio brasileiro', () => {
            const validData = {
                email: 'usuario@exemplo.com.br',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.email).toBe('usuario@exemplo.com.br');
        });

        it('deve aceitar email com subdomínio', () => {
            const validData = {
                email: 'usuario@mail.exemplo.com',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.email).toBe('usuario@mail.exemplo.com');
        });

        it('deve falhar para email inválido - sem @', () => {
            const invalidData = {
                email: 'usuariogmail.com',
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Formato de email inválido.');
        });

        it('deve falhar para email inválido - sem domínio', () => {
            const invalidData = {
                email: 'usuario@',
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Formato de email inválido.');
        });

        it('deve falhar para email inválido - sem nome de usuário', () => {
            const invalidData = {
                email: '@gmail.com',
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Formato de email inválido.');
        });

        it('deve falhar para email vazio', () => {
            const invalidData = {
                email: '',
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Campo email é obrigatório.');
        });

        it('deve falhar quando email não for fornecido', () => {
            const invalidData = {
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Required');
        });

        it('deve falhar para email com espaços', () => {
            const invalidData = {
                email: 'usuario @gmail.com',
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Formato de email inválido.');
        });

        it('deve falhar para email com caracteres especiais inválidos', () => {
            const invalidData = {
                email: 'usuário@gmail.com', // caractere especial não permitido
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Formato de email inválido.');
        });
    });

    describe('Validação de senha', () => {
        it('deve aceitar senha válida com maiúscula, minúscula e número', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('MinhaSenh@123');
        });

        it('deve aceitar senha com 8 caracteres exatos', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'Senha123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('Senha123');
        });

        it('deve aceitar senha com caracteres especiais permitidos', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'Senh@123$'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('Senh@123$');
        });

        it('deve aceitar senha com todos os caracteres especiais permitidos', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'Senh@123$!%*?&'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('Senh@123$!%*?&');
        });

        it('deve aceitar senha longa válida', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSenh@123456789Longa'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('MinhaSenh@123456789Longa');
        });

        it('deve falhar para senha com menos de 8 caracteres', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'Senh@12'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve ter pelo menos 8 caracteres.');
        });

        it('deve falhar para senha sem letra maiúscula', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'minhasen@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });

        it('deve falhar para senha sem letra minúscula', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'MINHASEN@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });

        it('deve falhar para senha sem número', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSen@ha'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });

        it('deve falhar para senha apenas com números', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: '12345678'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });

        it('deve falhar para senha apenas com letras', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSenh'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });

        it('deve falhar para senha vazia', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: ''
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve ter pelo menos 8 caracteres.');
        });

        it('deve falhar quando senha não for fornecida', () => {
            const invalidData = {
                email: 'usuario@gmail.com'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Required');
        });

        it('deve falhar para senha com espaços', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'Minha Sen@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });

        it('deve falhar para senha com caracteres especiais não permitidos', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 'Minha#Sen123' // # não está na lista permitida
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e no mínimo 8 caracteres.');
        });
    });

    describe('Validação de dados combinados', () => {
        it('deve aceitar dados completamente válidos', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('deve falhar quando ambos os campos estão inválidos', () => {
            const invalidData = {
                email: 'email-invalido',
                senha: '123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow();
        });

        it('deve falhar quando nenhum campo é fornecido', () => {
            const invalidData = {};

            expect(() => LoginSchema.parse(invalidData)).toThrow();
        });

        it('deve aceitar dados com email longo válido', () => {
            const validData = {
                email: 'usuario.com.nome.muito.longo@dominio.muito.longo.com.br',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.email).toBe('usuario.com.nome.muito.longo@dominio.muito.longo.com.br');
        });
    });

    describe('Validação de tipos', () => {
        it('deve falhar quando email não for string', () => {
            const invalidData = {
                email: 123,
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Expected string');
        });

        it('deve falhar quando senha não for string', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: 123
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Expected string');
        });

        it('deve falhar quando email for null', () => {
            const invalidData = {
                email: null,
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Expected string');
        });

        it('deve falhar quando senha for null', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: null
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Expected string');
        });

        it('deve falhar quando email for undefined', () => {
            const invalidData = {
                email: undefined,
                senha: 'MinhaSenh@123'
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Required');
        });

        it('deve falhar quando senha for undefined', () => {
            const invalidData = {
                email: 'usuario@gmail.com',
                senha: undefined
            };

            expect(() => LoginSchema.parse(invalidData)).toThrow('Required');
        });
    });

    describe('Casos extremos', () => {
        it('deve aceitar email com números', () => {
            const validData = {
                email: 'usuario123@gmail.com',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.email).toBe('usuario123@gmail.com');
        });

        it('deve aceitar email com pontos e hífens', () => {
            const validData = {
                email: 'usuario.teste-email@gmail.com',
                senha: 'MinhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.email).toBe('usuario.teste-email@gmail.com');
        });

        it('deve aceitar senha com múltiplos números', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'MinhaSenh@123456789'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('MinhaSenh@123456789');
        });

        it('deve aceitar senha com múltiplas maiúsculas', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'MINHA@senha123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('MINHA@senha123');
        });

        it('deve aceitar senha com múltiplas minúsculas', () => {
            const validData = {
                email: 'usuario@gmail.com',
                senha: 'minhaSenh@123'
            };

            const result = LoginSchema.parse(validData);
            expect(result.senha).toBe('minhaSenh@123');
        });
    });

    describe('Validação de expressão regular', () => {
        it('deve validar corretamente o padrão da senha', () => {
            // Teste direto da regex para garantir que está funcionando corretamente
            const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            
            expect(senhaRegex.test('MinhaSenh@123')).toBe(true);
            expect(senhaRegex.test('senha123')).toBe(false); // sem maiúscula
            expect(senhaRegex.test('SENHA123')).toBe(false); // sem minúscula
            expect(senhaRegex.test('SenhaABC')).toBe(false); // sem número
            expect(senhaRegex.test('Senh@12')).toBe(false); // menos de 8 caracteres
        });
    });
});
