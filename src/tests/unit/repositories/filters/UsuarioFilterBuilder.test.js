
import UsuarioFilterBuilder from "../../../../repositories/filters/UsuarioFilterBuilder.js";
import Usuario from "../../../../models/Usuario.js";
import GrupoRepository from "../../../../repositories/GrupoRepository.js";

jest.mock("../../../../models/Usuario.js");
jest.mock("../../../../repositories/GrupoRepository.js");

describe('UsuarioFilterBuilder', () => {
    let usuarioFilterBuilder;
    beforeEach(() => {
        usuarioFilterBuilder = new UsuarioFilterBuilder();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('comNome', () => {
        it('deve setar filtro de nome quando comNome é chamado', () => {
            usuarioFilterBuilder.comNome('Luan');
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).toHaveProperty('nome');
            expect(filtros.nome).toEqual({$regex: 'Luan', $options: 'i'});
        });
        it('não deve setar filtro de nome se nome for vazio ou undefined', () => {
            usuarioFilterBuilder.comNome('');
            usuarioFilterBuilder.comNome(undefined);
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).not.toHaveProperty('nome');
        });
    });
    
    describe('comEmail', () => {
        it('deve setar filtro de email quando comEmail é chamado', () => {
            usuarioFilterBuilder.comEmail('meu@gmail.com');
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).toHaveProperty('email');
            expect(filtros.email).toEqual({$regex: 'meu@gmail.com', $options: 'i'});
        });
        it('não deve setar filtro de email se for vazio ou undefined', () => {
            usuarioFilterBuilder.comEmail('');
            usuarioFilterBuilder.comEmail(undefined);
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).not.toHaveProperty('email');
        });
    });
    
    describe('comAtivo', () => {
        it('deve setar ativo como true quando valor é "true"', () => {
            usuarioFilterBuilder.comAtivo("true");
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).toHaveProperty('ativo');
            expect(filtros.ativo).toEqual(true);
        });
        it('deve setar ativo como false quando valor é "false"', () => {
            usuarioFilterBuilder.comAtivo("false");
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).toHaveProperty('ativo');
            expect(filtros.ativo).toEqual(false);
        });
        it('não deve setar ativo quando valor é vazio ou undefined', () => {
            usuarioFilterBuilder.comAtivo('');
            usuarioFilterBuilder.comAtivo(undefined);
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).not.toHaveProperty('ativo');
        });
    });
    
    describe('comGrupo', () => {
        it('deve setar filtro de grupos quando comGrupo é chamado', async () => {
            const mockGrupo = { _id: 'grupo123', nome: 'Administradores' };
            
            // Mock do GrupoRepository
            const mockGrupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue(mockGrupo)
            };
            usuarioFilterBuilder.grupoRepository = mockGrupoRepository;
            
            await usuarioFilterBuilder.comGrupo('Administradores');
            const filtros = usuarioFilterBuilder.build();
            
            expect(filtros).toHaveProperty('grupos');
            expect(filtros.grupos).toEqual({ $in: ['grupo123'] });
            expect(mockGrupoRepository.buscarPorNome).toHaveBeenCalledWith('Administradores');
        });
        
        it('deve setar filtro de grupos com array de grupos', async () => {
            const mockGrupos = [
                { _id: 'grupo1', nome: 'Admin' },
                { _id: 'grupo2', nome: 'User' }
            ];
            
            const mockGrupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue(mockGrupos)
            };
            usuarioFilterBuilder.grupoRepository = mockGrupoRepository;
            
            await usuarioFilterBuilder.comGrupo('Admin');
            const filtros = usuarioFilterBuilder.build();
            
            expect(filtros).toHaveProperty('grupos');
            expect(filtros.grupos).toEqual({ $in: ['grupo1', 'grupo2'] });
            expect(mockGrupoRepository.buscarPorNome).toHaveBeenCalledWith('Admin');
        });
        
        it('não deve setar filtro de grupos quando valor é vazio', async () => {
            await usuarioFilterBuilder.comGrupo('');
            await usuarioFilterBuilder.comGrupo(undefined);
            const filtros = usuarioFilterBuilder.build();
            
            expect(filtros).not.toHaveProperty('grupos');
        });
        
        it('deve setar filtro vazio quando grupo não é encontrado', async () => {
            const mockGrupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue(null)
            };
            usuarioFilterBuilder.grupoRepository = mockGrupoRepository;
            
            await usuarioFilterBuilder.comGrupo('GrupoInexistente');
            const filtros = usuarioFilterBuilder.build();
            
            expect(filtros).toHaveProperty('grupos');
            expect(filtros.grupos).toEqual({ $in: [] });
            expect(mockGrupoRepository.buscarPorNome).toHaveBeenCalledWith('GrupoInexistente');
        });
    });
    
    describe('build', () => {
        it('deve retornar filtros vazios quando nenhum filtro é setado', () => {
            const filtros = usuarioFilterBuilder.build();
            expect(filtros).toEqual({});
        });
        
        it('deve retornar todos os filtros setados', () => {
            usuarioFilterBuilder.comNome('João');
            usuarioFilterBuilder.comEmail('joao@teste.com');
            usuarioFilterBuilder.comAtivo('true');
            
            const filtros = usuarioFilterBuilder.build();
            
            expect(filtros).toEqual({
                nome: { $regex: 'João', $options: 'i' },
                email: { $regex: 'joao@teste.com', $options: 'i' },
                ativo: true
            });
        });
    });
});

