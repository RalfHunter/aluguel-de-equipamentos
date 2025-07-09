// src/tests/unit/utils/validators/Schema/zod/GrupoSchema.test.js

import assert from 'assert';
import { GrupoSchema, GrupoUpdateSchema } from '../../../../../../../src/utils/validators/schemas/zod/GrupoSchema.js';

describe('GrupoSchema', () => {
    describe('parse', () => {
        it('deve validar todos os dados do grupo sem retornar erro', () => {
            const dadosValidos = {
                nome: 'Administradores',
                descricao: 'Grupo com permissões administrativas',
                ativo: true,
                nivelPermissao: 10,
                permissoes: [
                    {
                        rota: 'usuarios',
                        dominio: 'usuarios',
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: true,
                        modificar: true,
                        excluir: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dadosValidos);
            assert.strictEqual(resultado.success, true);
            assert.deepStrictEqual(resultado.data, dadosValidos);
        });
    });

    describe('nome', () => {
        it('deve validar um nome válido', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve retornar erro para nome vazio', () => {
            const dados = {
                nome: '',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nome')));
        });

        it('deve retornar erro se nome não for string', () => {
            const dados = {
                nome: 123,
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nome')));
        });

        it('deve retornar erro se nome estiver ausente', () => {
            const dados = {
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nome')));
        });
    });

    describe('descricao', () => {
        it('deve validar uma descrição válida', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Esta é uma descrição válida do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve retornar erro para descrição vazia', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: '',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('descricao')));
        });

        it('deve retornar erro se descrição não for string', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 123,
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('descricao')));
        });

        it('deve retornar erro se descrição estiver ausente', () => {
            const dados = {
                nome: 'Grupo Teste',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('descricao')));
        });
    });

    describe('ativo', () => {
        it('deve validar ativo como true', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve validar ativo como false', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: false,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve retornar erro se ativo não for boolean', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: 'true',
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('ativo')));
        });

        it('deve retornar erro se ativo estiver ausente', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('ativo')));
        });
    });

    describe('nivelPermissao', () => {
        it('deve validar nível de permissão válido', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 10,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve validar nível de permissão zero', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 0,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve retornar erro para nível de permissão negativo', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: -1,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nivelPermissao')));
        });

        it('deve retornar erro se nível de permissão não for inteiro', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5.5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nivelPermissao')));
        });

        it('deve retornar erro se nível de permissão não for número', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: '5',
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nivelPermissao')));
        });

        it('deve retornar erro se nível de permissão estiver ausente', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('nivelPermissao')));
        });
    });

    describe('permissoes', () => {
        it('deve validar array de permissões válido', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'usuarios',
                        dominio: 'usuarios',
                        ativo: true,
                        buscar: true,
                        enviar: false,
                        substituir: true,
                        modificar: false,
                        excluir: true
                    },
                    {
                        rota: 'grupos',
                        dominio: 'grupos',
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: false,
                        modificar: true,
                        excluir: false
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
        });

        it('deve validar permissão com valores padrão', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: 'test'
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, true);
            // Verifica se os valores padrão foram aplicados
            assert.strictEqual(resultado.data.permissoes[0].ativo, true);
            assert.strictEqual(resultado.data.permissoes[0].buscar, false);
            assert.strictEqual(resultado.data.permissoes[0].enviar, false);
            assert.strictEqual(resultado.data.permissoes[0].substituir, false);
            assert.strictEqual(resultado.data.permissoes[0].modificar, false);
            assert.strictEqual(resultado.data.permissoes[0].excluir, false);
        });

        it('deve retornar erro para array de permissões vazio', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: []
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('permissoes')));
        });

        it('deve retornar erro se permissões não for array', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: 'não é array'
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('permissoes')));
        });

        it('deve retornar erro se permissões estiverem ausentes', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('permissoes')));
        });

        it('deve retornar erro se rota da permissão for inválida', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: '',
                        dominio: 'test',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('rota')));
        });

        it('deve retornar erro se domínio da permissão for inválido', () => {
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo',
                ativo: true,
                nivelPermissao: 5,
                permissoes: [
                    {
                        rota: 'test',
                        dominio: '',
                        ativo: true
                    }
                ]
            };

            const resultado = GrupoSchema.safeParse(dados);
            assert.strictEqual(resultado.success, false);
            assert.ok(resultado.error.errors.some(err => err.path.includes('dominio')));
        });
    });
});

describe('GrupoUpdateSchema', () => {
    it('deve validar atualização parcial com apenas nome', () => {
        const dados = {
            nome: 'Novo Nome'
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.strictEqual(resultado.data.nome, 'Novo Nome');
    });

    it('deve validar atualização parcial com apenas descrição', () => {
        const dados = {
            descricao: 'Nova descrição'
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.strictEqual(resultado.data.descricao, 'Nova descrição');
    });

    it('deve validar atualização parcial com apenas ativo', () => {
        const dados = {
            ativo: false
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.strictEqual(resultado.data.ativo, false);
    });

    it('deve validar atualização parcial com apenas nivelPermissao', () => {
        const dados = {
            nivelPermissao: 8
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.strictEqual(resultado.data.nivelPermissao, 8);
    });

    it('deve validar atualização parcial com apenas permissões', () => {
        const dados = {
            permissoes: [
                {
                    rota: 'nova-rota',
                    dominio: 'novo-dominio',
                    ativo: true
                }
            ]
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.strictEqual(resultado.data.permissoes.length, 1);
    });

    it('deve validar objeto vazio para atualização', () => {
        const dados = {};

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.deepStrictEqual(resultado.data, {});
    });

    it('deve validar atualização parcial com múltiplos campos', () => {
        const dados = {
            nome: 'Nome Atualizado',
            ativo: false,
            nivelPermissao: 3
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, true);
        assert.strictEqual(resultado.data.nome, 'Nome Atualizado');
        assert.strictEqual(resultado.data.ativo, false);
        assert.strictEqual(resultado.data.nivelPermissao, 3);
    });

    it('deve retornar erro se nome for inválido na atualização', () => {
        const dados = {
            nome: ''
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, false);
        assert.ok(resultado.error.errors.some(err => err.path.includes('nome')));
    });

    it('deve retornar erro se nível de permissão for negativo na atualização', () => {
        const dados = {
            nivelPermissao: -5
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, false);
        assert.ok(resultado.error.errors.some(err => err.path.includes('nivelPermissao')));
    });

    it('deve retornar erro se permissões for array vazio na atualização', () => {
        const dados = {
            permissoes: []
        };

        const resultado = GrupoUpdateSchema.safeParse(dados);
        assert.strictEqual(resultado.success, false);
        assert.ok(resultado.error.errors.some(err => err.path.includes('permissoes')));
    });
});
