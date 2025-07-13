// @ts-nocheck
import GrupoFilterBuilder from "../../../../repositories/filters/GrupoFilterBuilder.js";

describe('GrupoFilterBuilder', () => {
    let grupoFilterBuilder;
    
    beforeEach(() => {
        grupoFilterBuilder = new GrupoFilterBuilder();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('comNome', () => {
        it('deve setar filtro de nome quando comNome é chamado', () => {
            grupoFilterBuilder.comNome('Administradores');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('nome');
            expect(filtros.nome).toEqual({ $regex: 'Administradores', $options: 'i' });
        });
        
        it('não deve setar filtro de nome se nome for vazio ou undefined', () => {
            grupoFilterBuilder.comNome('');
            grupoFilterBuilder.comNome(undefined);
            grupoFilterBuilder.comNome(null);
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('nome');
        });
    });
    
    describe('comAtivo', () => {
        it('deve setar ativo como true quando valor é "true"', () => {
            grupoFilterBuilder.comAtivo('true');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('ativo');
            expect(filtros.ativo).toEqual(true);
        });
        
        it('deve setar ativo como false quando valor é "false"', () => {
            grupoFilterBuilder.comAtivo('false');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('ativo');
            expect(filtros.ativo).toEqual(false);
        });
        
        it('não deve setar ativo quando valor é vazio ou undefined', () => {
            grupoFilterBuilder.comAtivo('');
            grupoFilterBuilder.comAtivo(undefined);
            grupoFilterBuilder.comAtivo(null);
            grupoFilterBuilder.comAtivo('outro_valor');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('ativo');
        });
    });
    
    describe('comDescricao', () => {
        it('deve setar filtro de descrição quando comDescricao é chamado', () => {
            grupoFilterBuilder.comDescricao('Grupo de administração');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('descricao');
            expect(filtros.descricao).toEqual({ $regex: 'Grupo de administração', $options: 'i' });
        });
        
        it('não deve setar filtro de descrição se for vazio ou undefined', () => {
            grupoFilterBuilder.comDescricao('');
            grupoFilterBuilder.comDescricao(undefined);
            grupoFilterBuilder.comDescricao(null);
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('descricao');
        });
    });
    
    describe('comNivelPermissao', () => {
        it('deve setar nível de permissão quando valor é um número válido', () => {
            grupoFilterBuilder.comNivelPermissao('5');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('nivelPermissao');
            expect(filtros.nivelPermissao).toEqual(5);
        });
        
        it('deve setar nível de permissão quando valor é um número inteiro', () => {
            grupoFilterBuilder.comNivelPermissao(10);
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('nivelPermissao');
            expect(filtros.nivelPermissao).toEqual(10);
        });
        
        it('deve setar nível de permissão 0 quando valor é "0"', () => {
            grupoFilterBuilder.comNivelPermissao('0');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('nivelPermissao');
            expect(filtros.nivelPermissao).toEqual(0);
        });
        
        it('não deve setar nível de permissão quando valor é vazio', () => {
            grupoFilterBuilder.comNivelPermissao('');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('nivelPermissao');
        });
        
        it('não deve setar nível de permissão quando valor é undefined', () => {
            grupoFilterBuilder.comNivelPermissao(undefined);
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('nivelPermissao');
        });
        
        it('não deve setar nível de permissão quando valor é null', () => {
            grupoFilterBuilder.comNivelPermissao(null);
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('nivelPermissao');
        });
        
        it('não deve setar nível de permissão quando valor não é um número válido', () => {
            grupoFilterBuilder.comNivelPermissao('abc');
            grupoFilterBuilder.comNivelPermissao('texto');
            grupoFilterBuilder.comNivelPermissao('!@#');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('nivelPermissao');
        });
        
        it('deve setar nível de permissão mesmo com texto após números (parseInt para no primeiro caractere não numérico)', () => {
            grupoFilterBuilder.comNivelPermissao('123abc');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('nivelPermissao');
            expect(filtros.nivelPermissao).toEqual(123);
        });
        
        it('deve setar nível de permissão mesmo com decimais (parseInt remove a parte decimal)', () => {
            grupoFilterBuilder.comNivelPermissao('12.5');
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toHaveProperty('nivelPermissao');
            expect(filtros.nivelPermissao).toEqual(12);
        });
    });
    
    describe('build', () => {
        it('deve retornar filtros vazios quando nenhum filtro é setado', () => {
            const filtros = grupoFilterBuilder.build();
            expect(filtros).toEqual({});
        });
        
        it('deve retornar todos os filtros setados', () => {
            grupoFilterBuilder.comNome('Administradores');
            grupoFilterBuilder.comDescricao('Grupo admin');
            grupoFilterBuilder.comAtivo('true');
            grupoFilterBuilder.comNivelPermissao('5');
            
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toEqual({
                nome: { $regex: 'Administradores', $options: 'i' },
                descricao: { $regex: 'Grupo admin', $options: 'i' },
                ativo: true,
                nivelPermissao: 5
            });
        });
        
        it('deve permitir construção encadeada de filtros', () => {
            const filtros = grupoFilterBuilder
                .comNome('Users')
                .comAtivo('false')
                .comNivelPermissao('1')
                .build();
            
            expect(filtros).toEqual({
                nome: { $regex: 'Users', $options: 'i' },
                ativo: false,
                nivelPermissao: 1
            });
        });
        
        it('deve retornar apenas filtros válidos quando alguns valores são inválidos', () => {
            grupoFilterBuilder.comNome('Grupo Teste');
            grupoFilterBuilder.comAtivo('invalid');  // valor inválido
            grupoFilterBuilder.comDescricao('');     // valor vazio
            grupoFilterBuilder.comNivelPermissao('abc'); // valor inválido
            
            const filtros = grupoFilterBuilder.build();
            
            expect(filtros).toEqual({
                nome: { $regex: 'Grupo Teste', $options: 'i' }
            });
        });
    });
});
