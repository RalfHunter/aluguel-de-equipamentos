import { it, describe } from '@jest/globals'
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Grupo from '../../../models/Grupo.js';

let mongoServer;

// Configuração antes de todos os testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        // Opções de conexão não são necessárias no Mongoose 6+
    });
    await mongoose.model('grupos').createIndexes();
});

// Limpeza após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    await Grupo.deleteMany({});
    jest.clearAllMocks();
});

describe('Modelo de Grupo', () => {
    it('Deve criar um grupo com dados válidos', async () => {
        const grupoData = {
            nome: "Administradores",
            descricao: "Grupo com acesso total ao sistema",
            nivelPermissao: 10,
            ativo: true,
            permissoes: [
                {
                    rota: "usuarios",
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true
                },
                {
                    rota: "equipamentos",
                    ativo: true,
                    buscar: true,
                    enviar: false,
                    substituir: false,
                    modificar: true,
                    excluir: false
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.nome).toBe(grupoData.nome);
        expect(savedGrupo.descricao).toBe(grupoData.descricao);
        expect(savedGrupo.nivelPermissao).toBe(grupoData.nivelPermissao);
        expect(savedGrupo.ativo).toBe(grupoData.ativo);
        expect(savedGrupo.permissoes).toHaveLength(2);
        expect(savedGrupo.permissoes[0].rota).toBe("usuarios");
        expect(savedGrupo.permissoes[1].rota).toBe("equipamentos");
        expect(savedGrupo.data_criacao).toBeDefined();
        expect(savedGrupo.data_atualizacao).toBeDefined();
    });

    it('Deve criar um grupo com dados mínimos obrigatórios', async () => {
        const grupoData = {
            nome: "Usuarios Basicos",
            descricao: "Grupo com permissões básicas",
            nivelPermissao: 1
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.nome).toBe(grupoData.nome);
        expect(savedGrupo.descricao).toBe(grupoData.descricao);
        expect(savedGrupo.nivelPermissao).toBe(grupoData.nivelPermissao);
        expect(savedGrupo.ativo).toBe(true); // valor padrão
        expect(savedGrupo.permissoes).toHaveLength(0);
    });

    it('Não deve criar um grupo com nome duplicado', async () => {
        const grupoData1 = {
            nome: "Administradores",
            descricao: "Primeiro grupo de administradores",
            nivelPermissao: 10
        };

        const grupoData2 = {
            nome: "Administradores",
            descricao: "Segundo grupo de administradores",
            nivelPermissao: 5
        };

        const grupo1 = new Grupo(grupoData1);
        await grupo1.save();

        const grupo2 = new Grupo(grupoData2);
        await expect(grupo2.save()).rejects.toThrowErrorMatchingInlineSnapshot(`"E11000 duplicate key error collection: test.grupos index: nome_1 dup key: { nome: "Administradores" }"`);
    });

    it('Não deve criar um grupo sem nome', async () => {
        const grupoData = {
            descricao: "Grupo sem nome",
            nivelPermissao: 1
        };

        const grupo = new Grupo(grupoData);
        await expect(grupo.save()).rejects.toThrow(/Path `nome` is required/);
    });

    it('Não deve criar um grupo sem descrição', async () => {
        const grupoData = {
            nome: "Grupo Sem Descricao",
            nivelPermissao: 1
        };

        const grupo = new Grupo(grupoData);
        await expect(grupo.save()).rejects.toThrow(/Path `descricao` is required/);
    });

    it('Não deve criar um grupo sem nivelPermissao', async () => {
        const grupoData = {
            nome: "Grupo Sem Nivel",
            descricao: "Grupo sem nível de permissão"
        };

        const grupo = new Grupo(grupoData);
        await expect(grupo.save()).rejects.toThrow(/Path `nivelPermissao` is required/);
    });

    it('Deve aplicar trim no campo nome', async () => {
        const grupoData = {
            nome: "  Grupo Com Espacos  ",
            descricao: "Teste de trim",
            nivelPermissao: 1
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.nome).toBe("Grupo Com Espacos");
    });

    it('Deve converter rota para minúsculas automaticamente', async () => {
        const grupoData = {
            nome: "Teste Lowercase",
            descricao: "Teste de conversão para minúsculas",
            nivelPermissao: 1,
            permissoes: [
                {
                    rota: "USUARIOS",
                    buscar: true
                },
                {
                    rota: "Equipamentos",
                    enviar: true
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.permissoes[0].rota).toBe("usuarios");
        expect(savedGrupo.permissoes[1].rota).toBe("equipamentos");
    });

    it('Deve aplicar valores padrão nas permissões', async () => {
        const grupoData = {
            nome: "Teste Padroes",
            descricao: "Teste de valores padrão",
            nivelPermissao: 1,
            permissoes: [
                {
                    rota: "teste"
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        const permissao = savedGrupo.permissoes[0];
        expect(permissao.ativo).toBe(true);
        expect(permissao.buscar).toBe(false);
        expect(permissao.enviar).toBe(false);
        expect(permissao.substituir).toBe(false);
        expect(permissao.modificar).toBe(false);
        expect(permissao.excluir).toBe(false);
    });

    it('Não deve permitir permissões duplicadas (mesma rota)', async () => {
        const grupoData = {
            nome: "Teste Duplicata",
            descricao: "Teste de permissões duplicadas",
            nivelPermissao: 1,
            permissoes: [
                {
                    rota: "usuarios",
                    buscar: true
                },
                {
                    rota: "usuarios",
                    enviar: true
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await expect(grupo.save()).rejects.toThrow('Permissões duplicadas encontradas: cada rota deve ser única dentro de cada grupo.');
    });

    it('Deve permitir rotas diferentes no mesmo grupo', async () => {
        const grupoData = {
            nome: "Teste Rotas Diferentes",
            descricao: "Teste de rotas diferentes",
            nivelPermissao: 1,
            permissoes: [
                {
                    rota: "usuarios",
                    buscar: true
                },
                {
                    rota: "equipamentos",
                    enviar: true
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.permissoes).toHaveLength(2);
        expect(savedGrupo.permissoes[0].rota).toBe("usuarios");
        expect(savedGrupo.permissoes[1].rota).toBe("equipamentos");
    });

    it('Deve permitir rotas diferentes no mesmo grupo', async () => {
        const grupoData = {
            nome: "Teste Rotas Diferentes 2",
            descricao: "Teste de rotas diferentes",
            nivelPermissao: 1,
            permissoes: [
                {
                    rota: "usuarios",
                    buscar: true
                },
                {
                    rota: "equipamentos",
                    enviar: true
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.permissoes).toHaveLength(2);
        expect(savedGrupo.permissoes[0].rota).toBe("usuarios");
        expect(savedGrupo.permissoes[1].rota).toBe("equipamentos");
    });

    it('Não deve permitir permissão sem rota', async () => {
        const grupoData = {
            nome: "Teste Sem Rota",
            descricao: "Teste de permissão sem rota",
            nivelPermissao: 1,
            permissoes: [
                {
                    buscar: true
                }
            ]
        };

        const grupo = new Grupo(grupoData);
        await expect(grupo.save()).rejects.toThrow(/Path `rota` is required/);
    });

    it('Deve funcionar com permissões vazias', async () => {
        const grupoData = {
            nome: "Grupo Vazio",
            descricao: "Grupo sem permissões",
            nivelPermissao: 0,
            permissoes: []
        };

        const grupo = new Grupo(grupoData);
        await grupo.save();

        const savedGrupo = await Grupo.findById(grupo._id);
        expect(savedGrupo.permissoes).toHaveLength(0);
    });

    it('Deve manter a funcionalidade de paginação', async () => {
        // Criando múltiplos grupos para testar paginação
        const grupos = [];
        for (let i = 1; i <= 5; i++) {
            grupos.push({
                nome: `Grupo ${i}`,
                descricao: `Descrição do grupo ${i}`,
                nivelPermissao: i
            });
        }

        await Grupo.insertMany(grupos);

        const options = {
            page: 1,
            limit: 3
        };

        const result = await Grupo.paginate({}, options);
        expect(result.docs).toHaveLength(3);
        expect(result.totalDocs).toBe(5);
        expect(result.totalPages).toBe(2);
        expect(result.page).toBe(1);
        expect(result.hasNextPage).toBe(true);
        expect(result.hasPrevPage).toBe(false);
    });
});
