import { UsuarioIdSchema, UsuarioQuerySchema } from "../../../../../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js";
import mongoose from "mongoose";
import { ZodError } from "zod";

describe('UsuarioQuerySchema', () => {
    describe('Validação completa do schema', () => {
        it('deve validar objeto completo válido', () => {
            const dadosValidos = {
                nome: "João Silva",
                email: "joao@example.com",
                page: "2",
                limite: "20"
            };
            
            const resultado = UsuarioQuerySchema.parse(dadosValidos);
            
            expect(resultado).toEqual({
                nome: "João Silva",
                email: "joao@example.com",
                page: 2,
                limite: 20
            });
        });

        it('deve validar objeto vazio aplicando valores padrão', () => {
            const dadosVazios = {};
            
            const resultado = UsuarioQuerySchema.parse(dadosVazios);
            
            expect(resultado).toEqual({
                page: 1,
                limite: 10
            });
        });

        it('deve validar objeto com apenas alguns campos', () => {
            const dadosParciais = {
                nome: "Maria",
                page: "3"
            };
            
            const resultado = UsuarioQuerySchema.parse(dadosParciais);
            
            expect(resultado).toEqual({
                nome: "Maria",
                page: 3,
                limite: 10
            });
        });

        it('deve validar objeto com todos os campos undefined', () => {
            const dadosUndefined = {
                nome: undefined,
                email: undefined,
                page: undefined,
                limite: undefined
            };
            
            const resultado = UsuarioQuerySchema.parse(dadosUndefined);
            
            expect(resultado).toEqual({
                page: 1,
                limite: 10
            });
        });
    });

    describe('Campo nome', () => {
        it('deve validar nome válido', () => {
            const dados = { nome: "Usuario Teste" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Usuario Teste");
        });

        it('deve validar nome com espaços extras removendo-os', () => {
            const dados = { nome: "  Usuario Teste  " };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Usuario Teste");
        });

        it('deve validar nome com caracteres especiais', () => {
            const dados = { nome: "José da Silva-Santos" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBe("José da Silva-Santos");
        });

        it('deve aceitar nome vazio (opcional)', () => {
            const dados = { nome: "" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBe("");
        });

        it('deve falhar com nome apenas espaços', async () => {
            const dados = { nome: "   " };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Nome não pode ser vazio ou apenas espaços");
        });

        it('deve falhar com nome apenas tabs e espaços', async () => {
            const dados = { nome: " \t \n " };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Nome não pode ser vazio ou apenas espaços");
        });

        it('deve aceitar nome undefined', () => {
            const dados = { nome: undefined };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBeUndefined();
        });

        it('deve aceitar ausência do campo nome', () => {
            const dados = {};
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBeUndefined();
        });
    });

    describe('Campo email', () => {
        it('deve validar email válido simples', () => {
            const dados = { email: "usuario@gmail.com" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.email).toBe("usuario@gmail.com");
        });

        it('deve validar email com subdomínio', () => {
            const dados = { email: "usuario@mail.google.com" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.email).toBe("usuario@mail.google.com");
        });

        it('deve validar email com números', () => {
            const dados = { email: "usuario123@test123.com" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.email).toBe("usuario123@test123.com");
        });

        it('deve validar email com caracteres especiais permitidos', () => {
            const dados = { email: "usuario.teste+tag@example-site.com.br" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.email).toBe("usuario.teste+tag@example-site.com.br");
        });

        it('deve falhar com email sem @', async () => {
            const dados = { email: "email-invalido" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Formato de email inválido");
        });

        it('deve falhar com email sem domínio', async () => {
            const dados = { email: "usuario@" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Formato de email inválido");
        });

        it('deve falhar com email sem usuário', async () => {
            const dados = { email: "@gmail.com" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Formato de email inválido");
        });

        it('deve falhar com email com espaços', async () => {
            const dados = { email: "usuario @gmail.com" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Formato de email inválido");
        });

        it('deve falhar com email vazio', async () => {
            const dados = { email: "" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Formato de email inválido");
        });

        it('deve aceitar email undefined', () => {
            const dados = { email: undefined };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.email).toBeUndefined();
        });

        it('deve aceitar ausência do campo email', () => {
            const dados = {};
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.email).toBeUndefined();
        });
    });

    describe('Campo page', () => {
        it('deve validar página 1', () => {
            const dados = { page: "1" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve validar páginas grandes', () => {
            const dados = { page: "999999" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(999999);
        });

        it('deve aplicar valor padrão 1 quando page é undefined', () => {
            const dados = { page: undefined };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve aplicar valor padrão 1 quando page não é fornecida', () => {
            const dados = {};
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve aplicar valor padrão 1 quando page é string vazia', () => {
            const dados = { page: "" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve falhar com page zero', async () => {
            const dados = { page: "0" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Page deve ser um número inteiro maior que 0");
        });

        it('deve falhar com page negativa', async () => {
            const dados = { page: "-1" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Page deve ser um número inteiro maior que 0");
        });

        it('deve falhar com page não numérica', async () => {
            const dados = { page: "abc" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Page deve ser um número inteiro maior que 0");
        });

        it('deve aplicar valor padrão com page decimal', () => {
            const dados = { page: "1.5" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(1); // parseInt converte "1.5" para 1
        });

        it('deve aplicar valor padrão com page com espaços', () => {
            const dados = { page: " 1 " };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(1); // parseInt ignora espaços
        });
    });

    describe('Campo limite', () => {
        it('deve validar limite 1', () => {
            const dados = { limite: "1" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(1);
        });

        it('deve validar limite 100', () => {
            const dados = { limite: "100" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(100);
        });

        it('deve validar limite intermediário', () => {
            const dados = { limite: "50" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(50);
        });

        it('deve aplicar valor padrão 10 quando limite é undefined', () => {
            const dados = { limite: undefined };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10);
        });

        it('deve aplicar valor padrão 10 quando limite não é fornecido', () => {
            const dados = {};
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10);
        });

        it('deve aplicar valor padrão 10 quando limite é string vazia', () => {
            const dados = { limite: "" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10);
        });

        it('deve falhar com limite zero', async () => {
            const dados = { limite: "0" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite negativo', async () => {
            const dados = { limite: "-1" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite maior que 100', async () => {
            const dados = { limite: "101" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite muito grande', async () => {
            const dados = { limite: "999999" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite não numérico', async () => {
            const dados = { limite: "abc" };
            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve aplicar valor padrão com limite decimal', () => {
            const dados = { limite: "10.5" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10); // parseInt converte "10.5" para 10
        });

        it('deve aplicar valor padrão com limite com espaços', () => {
            const dados = { limite: " 10 " };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10); // parseInt ignora espaços
        });
    });

    describe('Casos de erro complexos', () => {
        it('deve retornar múltiplos erros quando múltiplos campos são inválidos', async () => {
            const dados = {
                nome: "  ",
                email: "email-invalido",
                page: "0",
                limite: "101"
            };

            try {
                await UsuarioQuerySchema.parseAsync(dados);
                fail('Deveria ter lançado erro');
            } catch (error) {
                expect(error).toBeInstanceOf(ZodError);
                expect(error.errors).toHaveLength(4);
                expect(error.errors.map(e => e.message)).toContain("Nome não pode ser vazio ou apenas espaços");
                expect(error.errors.map(e => e.message)).toContain("Formato de email inválido");
                expect(error.errors.map(e => e.message)).toContain("Page deve ser um número inteiro maior que 0");
                expect(error.errors.map(e => e.message)).toContain("Limite deve ser um número inteiro entre 1 e 100");
            }
        });

        it('deve validar objetos com propriedades extras ignorando-as', () => {
            const dados = {
                nome: "Usuario",
                email: "usuario@test.com",
                page: "1",
                limite: "10",
                propriedadeExtra: "valor extra",
                outraPropriedade: 123
            };

            const resultado = UsuarioQuerySchema.parse(dados);
            
            expect(resultado).toEqual({
                nome: "Usuario",
                email: "usuario@test.com",
                page: 1,
                limite: 10
            });
            expect(resultado).not.toHaveProperty('propriedadeExtra');
            expect(resultado).not.toHaveProperty('outraPropriedade');
        });
    });

    describe('Transformações', () => {
        it('deve transformar string em número para page', () => {
            const dados = { page: "42" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.page).toBe(42);
            expect(typeof resultado.page).toBe('number');
        });

        it('deve transformar string em número para limite', () => {
            const dados = { limite: "25" };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.limite).toBe(25);
            expect(typeof resultado.limite).toBe('number');
        });

        it('deve fazer trim no nome', () => {
            const dados = { nome: "  Usuario com espaços  " };
            const resultado = UsuarioQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Usuario com espaços");
        });
    });

    describe('Casos edge', () => {
        it('deve falhar com null nos campos obrigatórios', async () => {
            const dados = {
                nome: null,
                email: null,
                page: null,
                limite: null
            };

            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow();
        });

        it('deve lidar com string "null" e "undefined"', async () => {
            const dados = {
                page: "null",
                limite: "undefined"
            };

            await expect(UsuarioQuerySchema.parseAsync(dados))
                .rejects.toThrow();
        });
    });
});

describe('UsuarioIdSchema', () => {
    // Mock de ObjectId para testes
    const validObjectId = new mongoose.Types.ObjectId().toString();
    const invalidObjectId = "invalid-id";

    describe('Validação básica', () => {
        it('deve validar ObjectId válido', () => {
            const resultado = UsuarioIdSchema.parse(validObjectId);
            expect(resultado).toBe(validObjectId);
        });

        it('deve validar ObjectId criado manualmente', () => {
            const manualId = "507f1f77bcf86cd799439011";
            const resultado = UsuarioIdSchema.parse(manualId);
            expect(resultado).toBe(manualId);
        });
    });

    describe('Casos de erro', () => {
        it('deve falhar com ID undefined', async () => {
            await expect(UsuarioIdSchema.parseAsync(undefined))
                .rejects.toThrow();
        });

        it('deve falhar com ID vazio', async () => {
            await expect(UsuarioIdSchema.parseAsync(""))
                .rejects.toThrow("ID não pode ser undefined ou vazio");
        });

        it('deve falhar com ID apenas espaços', async () => {
            await expect(UsuarioIdSchema.parseAsync("   "))
                .rejects.toThrow("ID não pode ser undefined ou vazio");
        });

        it('deve falhar com ID inválido', async () => {
            await expect(UsuarioIdSchema.parseAsync(invalidObjectId))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com ID muito curto', async () => {
            await expect(UsuarioIdSchema.parseAsync("123"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com ID muito longo', async () => {
            await expect(UsuarioIdSchema.parseAsync("507f1f77bcf86cd799439011999"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com caracteres inválidos no ID', async () => {
            await expect(UsuarioIdSchema.parseAsync("507f1f77bcf86cd79943901g"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com null', async () => {
            await expect(UsuarioIdSchema.parseAsync(null))
                .rejects.toThrow();
        });
    });

    describe('Tipos de entrada', () => {
        it('deve falhar com número', async () => {
            await expect(UsuarioIdSchema.parseAsync(123))
                .rejects.toThrow();
        });

        it('deve falhar com objeto', async () => {
            await expect(UsuarioIdSchema.parseAsync({}))
                .rejects.toThrow();
        });

        it('deve falhar com array', async () => {
            await expect(UsuarioIdSchema.parseAsync([]))
                .rejects.toThrow();
        });
    });
});