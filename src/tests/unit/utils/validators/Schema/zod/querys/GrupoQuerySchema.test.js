import { GrupoQuerySchema, GrupoIdSchema } from "../../../../../../../utils/validators/schemas/zod/querys/GrupoQuerySchema.js";
import mongoose from 'mongoose';

describe('GrupoQuerySchema', () => {
    describe('Validação completa do schema', () => {
        it('deve validar objeto completo válido', () => {
            const dadosValidos = {
                nome: "Grupo Teste",
                descricao: "Descrição do grupo teste",
                ativo: "true",
                page: "2",
                limite: "20"
            };
            
            const resultado = GrupoQuerySchema.parse(dadosValidos);
            
            expect(resultado).toEqual({
                nome: "Grupo Teste",
                descricao: "Descrição do grupo teste",
                ativo: "true",
                page: 2,
                limite: 20
            });
        });

        it('deve validar objeto vazio aplicando valores padrão', () => {
            const dadosVazios = {};
            
            const resultado = GrupoQuerySchema.parse(dadosVazios);
            
            expect(resultado).toEqual({
                page: 1,
                limite: 10
            });
        });

        it('deve validar objeto com apenas alguns campos', () => {
            const dadosParciais = {
                nome: "Grupo Parcial",
                page: "3"
            };
            
            const resultado = GrupoQuerySchema.parse(dadosParciais);
            
            expect(resultado).toEqual({
                nome: "Grupo Parcial",
                page: 3,
                limite: 10
            });
        });

        it('deve validar objeto com todos os campos undefined', () => {
            const dadosUndefined = {
                nome: undefined,
                descricao: undefined,
                ativo: undefined,
                page: undefined,
                limite: undefined
            };
            
            const resultado = GrupoQuerySchema.parse(dadosUndefined);
            
            expect(resultado).toEqual({
                page: 1,
                limite: 10
            });
        });
    });

    describe('Campo nome', () => {
        it('deve validar nome válido', () => {
            const dados = { nome: "Grupo Administrativo" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Grupo Administrativo");
        });

        it('deve validar nome com espaços extras removendo-os', () => {
            const dados = { nome: "  Grupo Teste  " };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Grupo Teste");
        });

        it('deve validar nome com caracteres especiais', () => {
            const dados = { nome: "Grupo Admin-TI & Suporte" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Grupo Admin-TI & Suporte");
        });

        it('deve aceitar nome vazio (opcional)', () => {
            const dados = { nome: "" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBe("");
        });

        it('deve falhar com nome apenas espaços', async () => {
            const dados = { nome: "   " };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Nome não pode ser vazio");
        });

        it('deve falhar com nome apenas tabs e espaços', async () => {
            const dados = { nome: " \t \n " };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Nome não pode ser vazio");
        });

        it('deve aceitar nome undefined', () => {
            const dados = { nome: undefined };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBeUndefined();
        });

        it('deve aceitar ausência do campo nome', () => {
            const dados = {};
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBeUndefined();
        });
    });

    describe('Campo descricao', () => {
        it('deve validar descrição válida', () => {
            const dados = { descricao: "Grupo responsável pela administração do sistema" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBe("Grupo responsável pela administração do sistema");
        });

        it('deve validar descrição com espaços extras removendo-os', () => {
            const dados = { descricao: "  Descrição do grupo  " };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBe("Descrição do grupo");
        });

        it('deve validar descrição com caracteres especiais', () => {
            const dados = { descricao: "Grupo: Admin & TI - Suporte técnico (24/7)" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBe("Grupo: Admin & TI - Suporte técnico (24/7)");
        });

        it('deve aceitar descrição vazia (opcional)', () => {
            const dados = { descricao: "" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBe("");
        });

        it('deve falhar com descrição apenas espaços', async () => {
            const dados = { descricao: "   " };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Descrição não pode ser vazio");
        });

        it('deve falhar com descrição apenas tabs e espaços', async () => {
            const dados = { descricao: " \t \n " };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Descrição não pode ser vazio");
        });

        it('deve aceitar descrição undefined', () => {
            const dados = { descricao: undefined };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBeUndefined();
        });

        it('deve aceitar ausência do campo descrição', () => {
            const dados = {};
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBeUndefined();
        });
    });

    describe('Campo ativo', () => {
        it('deve validar ativo como "true"', () => {
            const dados = { ativo: "true" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.ativo).toBe("true");
        });

        it('deve validar ativo como "false"', () => {
            const dados = { ativo: "false" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.ativo).toBe("false");
        });

        it('deve aceitar ativo undefined', () => {
            const dados = { ativo: undefined };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.ativo).toBeUndefined();
        });

        it('deve aceitar ausência do campo ativo', () => {
            const dados = {};
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.ativo).toBeUndefined();
        });

        it('deve falhar com ativo como "1"', async () => {
            const dados = { ativo: "1" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Ativo deve ser 'true' ou 'false'");
        });

        it('deve falhar com ativo como "0"', async () => {
            const dados = { ativo: "0" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Ativo deve ser 'true' ou 'false'");
        });

        it('deve falhar com ativo como "sim"', async () => {
            const dados = { ativo: "sim" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Ativo deve ser 'true' ou 'false'");
        });

        it('deve falhar com ativo como "não"', async () => {
            const dados = { ativo: "não" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Ativo deve ser 'true' ou 'false'");
        });

        it('deve aceitar ativo como string vazia', () => {
            const dados = { ativo: "" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.ativo).toBe("");
        });

        it('deve falhar com ativo como valor inválido', async () => {
            const dados = { ativo: "invalid" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Ativo deve ser 'true' ou 'false'");
        });
    });

    describe('Campo page', () => {
        it('deve validar página 1', () => {
            const dados = { page: "1" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve validar páginas grandes', () => {
            const dados = { page: "999999" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(999999);
        });

        it('deve aplicar valor padrão 1 quando page é undefined', () => {
            const dados = { page: undefined };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve aplicar valor padrão 1 quando page não é fornecida', () => {
            const dados = {};
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve aplicar valor padrão 1 quando page é string vazia', () => {
            const dados = { page: "" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(1);
        });

        it('deve falhar com page zero', async () => {
            const dados = { page: "0" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Page deve ser um número inteiro maior que 0");
        });

        it('deve falhar com page negativa', async () => {
            const dados = { page: "-1" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Page deve ser um número inteiro maior que 0");
        });

        it('deve falhar com page não numérica', async () => {
            const dados = { page: "abc" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Page deve ser um número inteiro maior que 0");
        });

        it('deve converter page decimal para inteiro', () => {
            const dados = { page: "1.5" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(1); // parseInt converte "1.5" para 1
        });

        it('deve ignorar espaços na page', () => {
            const dados = { page: " 1 " };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(1); // parseInt ignora espaços
        });
    });

    describe('Campo limite', () => {
        it('deve validar limite 1', () => {
            const dados = { limite: "1" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(1);
        });

        it('deve validar limite 100', () => {
            const dados = { limite: "100" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(100);
        });

        it('deve validar limite intermediário', () => {
            const dados = { limite: "50" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(50);
        });

        it('deve aplicar valor padrão 10 quando limite é undefined', () => {
            const dados = { limite: undefined };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10);
        });

        it('deve aplicar valor padrão 10 quando limite não é fornecido', () => {
            const dados = {};
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10);
        });

        it('deve aplicar valor padrão 10 quando limite é string vazia', () => {
            const dados = { limite: "" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10);
        });

        it('deve falhar com limite zero', async () => {
            const dados = { limite: "0" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite negativo', async () => {
            const dados = { limite: "-1" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite maior que 100', async () => {
            const dados = { limite: "101" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite muito grande', async () => {
            const dados = { limite: "999999" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve falhar com limite não numérico', async () => {
            const dados = { limite: "abc" };
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow("Limite deve ser um número inteiro entre 1 e 100");
        });

        it('deve converter limite decimal para inteiro', () => {
            const dados = { limite: "10.5" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10); // parseInt converte "10.5" para 10
        });

        it('deve ignorar espaços no limite', () => {
            const dados = { limite: " 10 " };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(10); // parseInt ignora espaços
        });
    });

    describe('Casos de erro complexos', () => {
        it('deve retornar múltiplos erros quando múltiplos campos são inválidos', async () => {
            const dados = {
                nome: "   ",
                descricao: "   ",
                ativo: "invalid",
                page: "0",
                limite: "101"
            };
            
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow();
        });

        it('deve validar objetos com propriedades extras ignorando-as', () => {
            const dados = {
                nome: "Grupo Teste",
                propriedadeExtra: "valor",
                outroExtra: 123
            };
            
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Grupo Teste");
            expect(resultado.propriedadeExtra).toBeUndefined();
            expect(resultado.outroExtra).toBeUndefined();
        });
    });

    describe('Transformações', () => {
        it('deve transformar string em número para page', () => {
            const dados = { page: "5" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.page).toBe(5);
            expect(typeof resultado.page).toBe('number');
        });

        it('deve transformar string em número para limite', () => {
            const dados = { limite: "25" };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.limite).toBe(25);
            expect(typeof resultado.limite).toBe('number');
        });

        it('deve fazer trim no nome', () => {
            const dados = { nome: "  Grupo com espaços  " };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.nome).toBe("Grupo com espaços");
        });

        it('deve fazer trim na descrição', () => {
            const dados = { descricao: "  Descrição com espaços  " };
            const resultado = GrupoQuerySchema.parse(dados);
            expect(resultado.descricao).toBe("Descrição com espaços");
        });
    });

    describe('Casos edge', () => {
        it('deve falhar com null nos campos obrigatórios', async () => {
            const dados = {
                nome: null,
                descricao: null,
                ativo: null,
                page: null,
                limite: null
            };
            
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow();
        });

        it('deve lidar com string "null" e "undefined"', async () => {
            const dados = {
                nome: "null",
                descricao: "undefined",
                ativo: "null",
                page: "null",
                limite: "undefined"
            };
            
            await expect(GrupoQuerySchema.parseAsync(dados))
                .rejects.toThrow();
        });
    });
});

describe('GrupoIdSchema', () => {
    // Mock de ObjectId para testes
    const validObjectId = new mongoose.Types.ObjectId().toString();
    const invalidObjectId = "invalid-id";

    describe('Validação básica', () => {
        it('deve validar ObjectId válido', () => {
            const resultado = GrupoIdSchema.parse(validObjectId);
            expect(resultado).toBe(validObjectId);
        });

        it('deve validar ObjectId criado manualmente', () => {
            const manualId = "507f1f77bcf86cd799439011";
            const resultado = GrupoIdSchema.parse(manualId);
            expect(resultado).toBe(manualId);
        });

        it('deve validar ObjectId com letras maiúsculas', () => {
            const upperCaseId = "507F1F77BCF86CD799439011";
            const resultado = GrupoIdSchema.parse(upperCaseId);
            expect(resultado).toBe(upperCaseId);
        });

        it('deve validar ObjectId com letras minúsculas', () => {
            const lowerCaseId = "507f1f77bcf86cd799439011";
            const resultado = GrupoIdSchema.parse(lowerCaseId);
            expect(resultado).toBe(lowerCaseId);
        });
    });

    describe('Casos de erro', () => {
        it('deve falhar com ID undefined', async () => {
            await expect(GrupoIdSchema.parseAsync(undefined))
                .rejects.toThrow("Required");
        });

        it('deve falhar com ID vazio', async () => {
            await expect(GrupoIdSchema.parseAsync(""))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com ID apenas espaços', async () => {
            await expect(GrupoIdSchema.parseAsync("   "))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com ID inválido', async () => {
            await expect(GrupoIdSchema.parseAsync(invalidObjectId))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com ID muito curto', async () => {
            await expect(GrupoIdSchema.parseAsync("507f1f77bcf86cd799439"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com ID muito longo', async () => {
            await expect(GrupoIdSchema.parseAsync("507f1f77bcf86cd7994390111"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com caracteres inválidos no ID', async () => {
            await expect(GrupoIdSchema.parseAsync("507f1f77bcf86cd79943901g"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com caracteres especiais no ID', async () => {
            await expect(GrupoIdSchema.parseAsync("507f1f77bcf86cd799439-11"))
                .rejects.toThrow("ID inválido");
        });

        it('deve falhar com null', async () => {
            await expect(GrupoIdSchema.parseAsync(null))
                .rejects.toThrow("Expected string, received null");
        });
    });

    describe('Tipos de entrada', () => {
        it('deve falhar com número', async () => {
            await expect(GrupoIdSchema.parseAsync(12345))
                .rejects.toThrow();
        });

        it('deve falhar com objeto', async () => {
            await expect(GrupoIdSchema.parseAsync({}))
                .rejects.toThrow();
        });

        it('deve falhar com array', async () => {
            await expect(GrupoIdSchema.parseAsync([]))
                .rejects.toThrow();
        });

        it('deve falhar com boolean', async () => {
            await expect(GrupoIdSchema.parseAsync(true))
                .rejects.toThrow();
        });
    });
});
