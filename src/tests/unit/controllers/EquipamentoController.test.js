import EquipamentoController from '../../../controllers/EquipamentoController.js';
import EquipamentoService from '../../../services/EquipamentoService.js';
import { equipamentoSchema, equipamentoUpdateSchema, equipamentoStatusSchema } from '../../../utils/validators/schemas/zod/EquipamentoSchema.js';
import { EquipamentoQuerySchema, EquipamentoIdSchema } from '../../../utils/validators/schemas/zod/querys/EquipamentoQuerySchema.js';
import { CommonResponse, HttpStatusCodes } from '../../../utils/helpers/index.js';
import Usuario from '../../../models/Usuario.js';

jest.mock('../../../services/EquipamentoService.js');
jest.mock('../../../utils/validators/schemas/zod/EquipamentoSchema.js');
jest.mock('../../../utils/validators/schemas/zod/querys/EquipamentoQuerySchema.js');
jest.mock('../../../utils/helpers/index.js', () => ({
    CommonResponse: {
        created: jest.fn().mockImplementation((res, data) => {
            res.status(201).json(data);
            return res;
        }),
        success: jest.fn().mockImplementation((res, data, status = 200, mensagem = '') => {
            res.status(status).json({ data, mensagem });
            return res;
        }),
        error: jest.fn().mockImplementation((res, code, mensagem) => {
            res.status(code).json({ mensagem });
            return res;
        }),
    },
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        UNAUTHORIZED: { code: 401 },
        FORBIDDEN: { code: 403 },
        NOT_FOUND: { code: 404 },
        INTERNAL_SERVER_ERROR: { code: 500 },
    },
}));
jest.mock('../../../models/Usuario.js');

describe('EquipamentoController', () => {
    let controller, req, res, serviceMock;

    beforeEach(() => {
        controller = new EquipamentoController();
        req = {
            body: {},
            params: {},
            query: {},
            user_id: 'userId',
            files: [],
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost'),
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn().mockReturnThis(),
            sendFile: jest.fn(),
        };
        serviceMock = {
            listar: jest.fn(),
            listarPorId: jest.fn(),
            criar: jest.fn(),
            atualizar: jest.fn(),
            aprovar: jest.fn(),
            reprovar: jest.fn(),
            atualizarStatus: jest.fn(),
            adicionarVariasFotos: jest.fn(),
            ListarFoto: jest.fn(),
        };
        EquipamentoService.mockImplementation(() => serviceMock);
        controller = new EquipamentoController(); 
        controller._processarImagemParaFoto = jest.fn(() => ({
            url: 'http://localhost/uploads/equipamentos/foto.jpg',
            largura: 100,
            altura: 100,
            tamanhoMb: 0.1,
        }));
        Usuario.findById.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 10 }] }),
        }));
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar equipamentos sem filtros', async () => {
            serviceMock.listar.mockResolvedValue([{ nome: 'Câmera' }]);
            await controller.listar(req, res);
            expect(serviceMock.listar).toHaveBeenCalledWith({
                usuarioId: 'userId',
                $or: [
                    { equiStatus: 'ativo' },
                    { equiStatus: 'pendente', equiUsuario: 'userId' },
                    { equiStatus: 'inativo', equiUsuario: 'userId' },
                ],
            });
            expect(CommonResponse.success).toHaveBeenCalledWith(res, [{ nome: 'Câmera' }]);
        });

        it('deve validar query se presente', async () => {
            req.query = { categoria: 'câmera' };
            EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
            serviceMock.listar.mockResolvedValue([{ nome: 'Câmera' }]);
            await controller.listar(req, res);
            expect(EquipamentoQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
            expect(serviceMock.listar).toHaveBeenCalledWith({
                categoria: 'câmera',
                usuarioId: 'userId',
                $or: [
                    { equiStatus: 'ativo' },
                    { equiStatus: 'pendente', equiUsuario: 'userId' },
                    { equiStatus: 'inativo', equiUsuario: 'userId' },
                ],
            });
            expect(CommonResponse.success).toHaveBeenCalledWith(res, [{ nome: 'Câmera' }]);
        });

        it('deve retornar erro 400 para query inválida', async () => {
            req.query = { categoria: 123 };
            EquipamentoQuerySchema.parseAsync.mockRejectedValue({ name: 'ZodError' });
            await expect(controller.listar(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 403 para pendentes sem permissão', async () => {
            req.query = { status: 'pendente' };
            EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
            await controller.listar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(
                res,
                403,
                'Acesso restrito a administradores ou moderadores para filtrar equipamentos pendentes.'
            );
        });

        it('deve listar pendentes para admin', async () => {
            req.query = { status: 'pendente' };
            EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            serviceMock.listar.mockResolvedValue([{ nome: 'Câmera', equiStatus: 'pendente' }]);
            await controller.listar(req, res);
            expect(serviceMock.listar).toHaveBeenCalledWith({ status: 'pendente', equiStatus: 'pendente', usuarioId: 'userId' });
            expect(CommonResponse.success).toHaveBeenCalledWith(res, [{ nome: 'Câmera', equiStatus: 'pendente' }]);
        });

        it('deve retornar erro 401 para inativos sem autenticação', async () => {
            req.query = { status: 'inativo' };
            req.user_id = null;
            EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
            await controller.listar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 401, 'Usuário não autenticado.');
        });
    });

    describe('listarPorId', () => {
        it('deve listar equipamento por id válido', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', nome: 'Câmera', equiStatus: 'ativo', equiUsuario: 'userId' });
            await controller.listarPorId(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(serviceMock.listarPorId).toHaveBeenCalledWith('1', 'userId');
            expect(CommonResponse.success).toHaveBeenCalledWith(res, { _id: '1', nome: 'Câmera', equiStatus: 'ativo', equiUsuario: 'userId' });
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido' };
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.listarPorId(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 404 para equipamento inexistente', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue(null);
            await controller.listarPorId(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 404, 'Equipamento não encontrado.');
        });

        it('deve retornar erro 403 para equipamento não ativo e usuário não dono', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiStatus: 'pendente', equiUsuario: 'outroUserId' });
            await controller.listarPorId(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a equipamentos ativos ou próprios.');
        });

        it('deve retornar erro 403 para usuário não autenticado e equipamento não ativo', async () => {
            req.params = { id: '1' };
            req.user_id = null;
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiStatus: 'pendente' });
            await controller.listarPorId(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a equipamentos ativos para usuários não autenticados.');
        });
    });

    describe('criar', () => {
        it('deve criar equipamento com dados válidos e fotos', async () => {
            req.body = { nome: 'Câmera', equiValorDiaria: '100.50', equiQuantidadeDisponivel: '5', categoria: '1' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            const parsedData = {
                nome: 'Câmera',
                equiValorDiaria: 100.5,
                equiQuantidadeDisponivel: 5,
                categoria: '1',
                equiUsuario: 'userId',
                equiFotos: [{ url: 'http://localhost/uploads/equipamentos/foto.jpg', largura: 100, altura: 100, tamanhoMb: 0.1 }],
                equiStatus: 'pendente',
            };
            equipamentoSchema.parse.mockReturnValue(parsedData);
            serviceMock.criar.mockResolvedValue({ _id: '1', ...parsedData });
            await controller.criar(req, res);
            expect(equipamentoSchema.parse).toHaveBeenCalledWith(expect.objectContaining({
                nome: 'Câmera',
                equiUsuario: 'userId',
                equiFotos: expect.any(Array),
                equiStatus: 'pendente',
            }));
            expect(serviceMock.criar).toHaveBeenCalledWith(parsedData);
            expect(CommonResponse.created).toHaveBeenCalledWith(res, {
                mensagem: 'Equipamento cadastrado. Aguardando aprovação.',
                equipamento: { _id: '1', ...parsedData },
            });
        });

        it('deve criar equipamento sem fotos', async () => {
            req.body = { nome: 'Câmera', equiValorDiaria: '100.50', equiQuantidadeDisponivel: '5', categoria: '1' };
            const parsedData = {
                nome: 'Câmera',
                equiValorDiaria: 100.5,
                equiQuantidadeDisponivel: 5,
                categoria: '1',
                equiUsuario: 'userId',
                equiFotos: [],
                equiStatus: 'pendente',
            };
            equipamentoSchema.parse.mockReturnValue(parsedData);
            serviceMock.criar.mockResolvedValue({ _id: '1', ...parsedData });
            await controller.criar(req, res);
            expect(equipamentoSchema.parse).toHaveBeenCalledWith(expect.objectContaining({
                nome: 'Câmera',
                equiUsuario: 'userId',
                equiFotos: [],
                equiStatus: 'pendente',
            }));
            expect(serviceMock.criar).toHaveBeenCalledWith(parsedData);
            expect(CommonResponse.created).toHaveBeenCalledWith(res, {
                mensagem: 'Equipamento cadastrado. Aguardando aprovação.',
                equipamento: { _id: '1', ...parsedData },
            });
        });

        it('deve retornar erro 400 para dados inválidos', async () => {
            req.body = { equiValorDiaria: 'invalido' };
            equipamentoSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.criar(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 401 para usuário não autenticado', async () => {
            req.user_id = null;
            await controller.criar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 401, 'Usuário não autenticado.');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar equipamento com dados válidos', async () => {
            req.params = { id: '1' };
            req.body = { nome: 'Câmera Atualizada' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoUpdateSchema.parse.mockReturnValue({ nome: 'Câmera Atualizada' });
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId' });
            serviceMock.atualizar.mockResolvedValue({ _id: '1', nome: 'Câmera Atualizada' });
            await controller.atualizar(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(equipamentoUpdateSchema.parse).toHaveBeenCalledWith(req.body);
            expect(serviceMock.atualizar).toHaveBeenCalledWith('1', { nome: 'Câmera Atualizada' });
            expect(CommonResponse.success).toHaveBeenCalledWith(res, { _id: '1', nome: 'Câmera Atualizada' }, 200, 'Equipamento atualizado com sucesso.');
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido' };
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.atualizar(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 401 para usuário não autenticado', async () => {
            req.params = { id: '1' };
            req.user_id = null;
            EquipamentoIdSchema.parse.mockReturnValue('1');
            await controller.atualizar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 401, 'Usuário não autenticado.');
        });

        it('deve retornar erro 404 para equipamento inexistente', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue(null);
            await controller.atualizar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 404, 'Equipamento não encontrado.');
        });

        it('deve retornar erro 403 para usuário não dono', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'outroUserId' });
            await controller.atualizar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Apenas o dono do equipamento pode atualizá-lo.');
        });

        it('deve retornar erro 400 para dados inválidos', async () => {
            req.params = { id: '1' };
            req.body = { nome: 123 };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoUpdateSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId' });
            await expect(controller.atualizar(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });
    });

    describe('aprovar', () => {
        it('deve aprovar equipamento com usuário admin', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            serviceMock.aprovar.mockResolvedValue({ _id: '1', equiStatus: 'aprovado' });
            await controller.aprovar(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(serviceMock.aprovar).toHaveBeenCalledWith('1', 'userId');
            expect(CommonResponse.success).toHaveBeenCalledWith(res, { _id: '1', equiStatus: 'aprovado' }, 200, 'Equipamento aprovado com sucesso.');
        });

        it('deve retornar erro 403 para usuário não admin', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            await controller.aprovar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a administradores ou moderadores.');
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido' };
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            await expect(controller.aprovar(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });
    });

    describe('reprovar', () => {
        it('deve reprovar equipamento com usuário admin', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            serviceMock.reprovar.mockResolvedValue({ _id: '1', equiStatus: 'reprovado' });
            await controller.reprovar(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(serviceMock.reprovar).toHaveBeenCalledWith('1', 'userId');
            expect(CommonResponse.success).toHaveBeenCalledWith(res, { _id: '1', equiStatus: 'reprovado' }, 200, 'Equipamento reprovado e excluído com sucesso.');
        });

        it('deve retornar erro 403 para usuário não admin', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            await controller.reprovar(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a administradores ou moderadores.');
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido' };
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            await expect(controller.reprovar(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });
    });

    describe('atualizarStatus', () => {
        it('deve atualizar status com dados válidos', async () => {
            req.params = { id: '1' };
            req.body = { status: 'ativo' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoStatusSchema.parse.mockReturnValue({ status: 'ativo' });
            serviceMock.atualizarStatus.mockResolvedValue({ _id: '1', equiStatus: 'ativo' });
            await controller.atualizarStatus(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(equipamentoStatusSchema.parse).toHaveBeenCalledWith({ status: 'ativo' });
            expect(serviceMock.atualizarStatus).toHaveBeenCalledWith('1', 'userId', 'ativo');
            expect(CommonResponse.success).toHaveBeenCalledWith(res, { _id: '1', equiStatus: 'ativo' }, 200, 'Equipamento ativado com sucesso.');
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido' };
            req.body = { status: 'ativo' };
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.atualizarStatus(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 400 para status inválido', async () => {
            req.params = { id: '1' };
            req.body = { status: 'invalido' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoStatusSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.atualizarStatus(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 401 para usuário não autenticado', async () => {
            req.params = { id: '1' };
            req.body = { status: 'ativo' };
            req.user_id = null;
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoStatusSchema.parse.mockReturnValue({ status: 'ativo' });
            await controller.atualizarStatus(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 401, 'Usuário não autenticado.');
        });
    });

    describe('adicionarFotos', () => {
        it('deve adicionar fotos com dados válidos', async () => {
            req.params = { id: '1' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId' });
            serviceMock.adicionarVariasFotos.mockResolvedValue({
                _id: '1',
                equiFotos: [{ url: 'http://localhost/uploads/equipamentos/foto.jpg', largura: 100, altura: 100, tamanhoMb: 0.1 }],
            });
            await controller.adicionarFotos(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(serviceMock.adicionarVariasFotos).toHaveBeenCalledWith('1', expect.any(Array));
            expect(CommonResponse.success).toHaveBeenCalledWith(res, expect.any(Object), 200, 'Fotos adicionadas com sucesso.');
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.adicionarFotos(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 400 para nenhuma foto enviada', async () => {
            req.params = { id: '1' };
            req.files = [];
            EquipamentoIdSchema.parse.mockReturnValue('1');
            await controller.adicionarFotos(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 400, 'Nenhuma foto foi enviada.');
        });

        it('deve retornar erro 401 para usuário não autenticado', async () => {
            req.params = { id: '1' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            req.user_id = null;
            EquipamentoIdSchema.parse.mockReturnValue('1');
            await controller.adicionarFotos(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 401, 'Usuário não autenticado.');
        });

        it('deve retornar erro 404 para equipamento inexistente', async () => {
            req.params = { id: '1' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue(null);
            await controller.adicionarFotos(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 404, 'Equipamento não encontrado.');
        });

        it('deve retornar erro 403 para usuário não dono', async () => {
            req.params = { id: '1' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'outroUserId' });
            await controller.adicionarFotos(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Apenas o dono do equipamento pode adicionar fotos.');
        });
    });

    describe('ListarFoto', () => {
        it('deve listar foto com dados válidos', async () => {
            req.params = { id: '1', fotoId: 'foto1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId', equiStatus: 'ativo' });
            serviceMock.ListarFoto.mockResolvedValue({ filePath: '/path/to/foto.jpg', contentType: 'image/jpeg' });
            await controller.ListarFoto(req, res);
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('1');
            expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith('foto1');
            expect(serviceMock.ListarFoto).toHaveBeenCalledWith('1', 'foto1');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
            expect(res.sendFile).toHaveBeenCalledWith('/path/to/foto.jpg');
        });

        it('deve retornar erro 400 para id inválido', async () => {
            req.params = { id: 'invalido', fotoId: 'foto1' };
            EquipamentoIdSchema.parse.mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.ListarFoto(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 400 para fotoId inválido', async () => {
            req.params = { id: '1', fotoId: 'invalido' };
            EquipamentoIdSchema.parse.mockImplementationOnce(() => '1').mockImplementation(() => { throw { name: 'ZodError' }; });
            await expect(controller.ListarFoto(req, res)).rejects.toMatchObject({ name: 'ZodError' });
            expect(CommonResponse.error).not.toHaveBeenCalled();
        });

        it('deve retornar erro 401 para usuário não autenticado', async () => {
            req.params = { id: '1', fotoId: 'foto1' };
            req.user_id = null;
            EquipamentoIdSchema.parse.mockReturnValue('1');
            await controller.ListarFoto(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 401, 'Usuário não autenticado.');
        });

        it('deve retornar erro 404 para equipamento inexistente', async () => {
            req.params = { id: '1', fotoId: 'foto1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue(null);
            await controller.ListarFoto(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 404, 'Equipamento não encontrado.');
        });

        it('deve retornar erro 403 para equipamento não ativo e usuário não dono', async () => {
            req.params = { id: '1', fotoId: 'foto1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'outroUserId', equiStatus: 'pendente' });
            await controller.ListarFoto(req, res);
            expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a equipamentos ativos ou próprios.');
        });
    });

    describe('erros inesperados', () => {
        it('deve retornar erro 500 para falha inesperada em criar', async () => {
            req.body = { nome: 'Câmera', equiValorDiaria: '100.50', equiQuantidadeDisponivel: '5', categoria: '1' };
            equipamentoSchema.parse.mockReturnValue({ nome: 'Câmera', equiValorDiaria: 100.5, equiQuantidadeDisponivel: 5, categoria: '1', equiUsuario: 'userId', equiFotos: [], equiStatus: 'pendente' });
            serviceMock.criar.mockRejectedValue({ status: 500 });
            await expect(controller.criar(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em listar', async () => {
            serviceMock.listar.mockRejectedValue({ status: 500 });
            await expect(controller.listar(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em atualizar', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoUpdateSchema.parse.mockReturnValue({ nome: 'Câmera' });
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId' });
            serviceMock.atualizar.mockRejectedValue({ status: 500 });
            await expect(controller.atualizar(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em aprovar', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            serviceMock.aprovar.mockRejectedValue({ status: 500 });
            await expect(controller.aprovar(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em reprovar', async () => {
            req.params = { id: '1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            Usuario.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ grupos: [{ nivelPermissao: 0 }] }),
            });
            serviceMock.reprovar.mockRejectedValue({ status: 500 });
            await expect(controller.reprovar(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em atualizarStatus', async () => {
            req.params = { id: '1' };
            req.body = { status: 'ativo' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            equipamentoStatusSchema.parse.mockReturnValue({ status: 'ativo' });
            serviceMock.atualizarStatus.mockRejectedValue({ status: 500 });
            await expect(controller.atualizarStatus(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em adicionarFotos', async () => {
            req.params = { id: '1' };
            req.files = [{ mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' }];
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId' });
            serviceMock.adicionarVariasFotos.mockRejectedValue({ status: 500 });
            await expect(controller.adicionarFotos(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });

        it('deve retornar erro 500 para falha inesperada em ListarFoto', async () => {
            req.params = { id: '1', fotoId: 'foto1' };
            EquipamentoIdSchema.parse.mockReturnValue('1');
            serviceMock.listarPorId.mockResolvedValue({ _id: '1', equiUsuario: 'userId', equiStatus: 'ativo' });
            serviceMock.ListarFoto.mockRejectedValue({ status: 500 });
            await expect(controller.ListarFoto(req, res)).rejects.toEqual(expect.objectContaining({ status: 500 }));
        });
    });
});