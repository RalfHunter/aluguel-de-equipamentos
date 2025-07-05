import { afterEach, beforeEach, describe, expect, jest, it } from '@jest/globals';
import EquipamentoController from '../../../controllers/EquipamentoController.js';
<<<<<<< HEAD
import EquipamentoService from '../../../services/EquipamentoService.js';
import { CommonResponse, HttpStatusCodes } from '../../../utils/helpers/index.js';
import { equipamentoSchema, equipamentoUpdateSchema } from '../../../utils/validators/schemas/zod/EquipamentoSchema.js';
import { EquipamentoQuerySchema, EquipamentoIdSchema } from '../../../utils/validators/schemas/zod/querys/EquipamentoQuerySchema.js';
import Usuario from '../../../models/Usuario.js';
=======
import EquipamentoService from '../services/EquipamentoService.js.js';
import { CommonResponse, HttpStatusCodes } from '../../../utils/helpers/index.js';
import { equipamentoSchema, equipamentoUpdateSchema } from '../validators/schemas/zod/EquipamentoSchema.js.js';
import { EquipamentoQuerySchema, EquipamentoIdSchema } from '../validators/schemas/zod/querys/EquipamentoQuerySchema.js.js';
import Usuario from '../models/Usuario.js.js';
>>>>>>> a5025f0e6885dbce0263adcd6fd56f9a116eec62
import fs from 'fs';
import sizeOf from 'image-size';

// Mock dependencies
jest.mock('../../../services/EquipamentoService.js');
jest.mock('../../../utils/helpers/index.js', () => ({
  CommonResponse: {
    success: jest.fn(),
    created: jest.fn(),
    error: jest.fn(),
  },
  HttpStatusCodes: {
    FORBIDDEN: { code: 403 },
    BAD_REQUEST: { code: 400 },
  },
}));
jest.mock('../../../utils/validators/schemas/zod/EquipamentoSchema.js', () => ({
  equipamentoSchema: { parse: jest.fn() },
  equipamentoUpdateSchema: { parse: jest.fn() },
}));
jest.mock('../../../utils/validators/schemas/zod/querys/EquipamentoQuerySchema.js', () => ({
  EquipamentoQuerySchema: { parseAsync: jest.fn() },
  EquipamentoIdSchema: { parse: jest.fn() },
}));
jest.mock('../../../models/Usuario.js');
jest.mock('fs');
jest.mock('image-size');

describe('EquipamentoController', () => {
  let controller;
  let req, res;

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    controller = new EquipamentoController();
    req = { params: {}, body: {}, query: {}, user_id: 'userId', protocol: 'http', get: jest.fn().mockReturnValue('localhost') };
    res = mockResponse();

    controller.service = new EquipamentoService();
    controller._processarImagemParaFoto = jest.fn(() => ({
      url: 'http://localhost/uploads/equipamentos/foto.jpg',
      largura: 100,
      altura: 100,
      tamanhoMb: 0.1,
    }));
  });

  afterEach(() => jest.clearAllMocks());

  describe('listar', () => {
    it('deve listar equipamentos com query válida', async () => {
      req.query = { categoria: 'câmera' };
      EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
      const dados = [{ _id: '1', nome: 'Câmera' }];
      controller.service.listar.mockResolvedValue(dados);

      await controller.listar(req, res);

      expect(controller.service.listar).toHaveBeenCalledWith(req.query);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, dados);
    });

    it('deve listar equipamentos sem query', async () => {
      const dados = [{ _id: '1', nome: 'Câmera' }];
      controller.service.listar.mockResolvedValue(dados);

      await controller.listar(req, res);

      expect(controller.service.listar).toHaveBeenCalledWith({});
      expect(CommonResponse.success).toHaveBeenCalledWith(res, dados);
    });

    it('deve rejeitar se query inválida', async () => {
      req.query = { categoria: 123 };
      EquipamentoQuerySchema.parseAsync.mockRejectedValue({ name: 'ZodError' });

      await expect(controller.listar(req, res)).rejects.toEqual(expect.objectContaining({ name: 'ZodError' }));
    });

    it('deve retornar erro 403 se filtrar pendentes e usuário não for admin', async () => {
      req.query = { status: 'pendente' };
      EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'comum' });

      await controller.listar(req, res);

      expect(EquipamentoQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
      expect(Usuario.findById).toHaveBeenCalledWith('userId');
      expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a administradores para filtrar equipamentos pendentes.');
      expect(controller.service.listar).not.toHaveBeenCalled();
    });

    it('deve listar pendentes se usuário for admin', async () => {
      req.query = { status: 'pendente' };
      EquipamentoQuerySchema.parseAsync.mockResolvedValue(req.query);
      const equipamentos = [{ _id: '1', nome: 'Câmera', status: 'pendente' }];
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'admin' });
      controller.service.listar.mockResolvedValue(equipamentos);

      await controller.listar(req, res);

      expect(EquipamentoQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
      expect(Usuario.findById).toHaveBeenCalledWith('userId');
      expect(controller.service.listar).toHaveBeenCalledWith(req.query);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, equipamentos);
    });
  });

  describe('listarPorId', () => {
    it('deve listar equipamento por ID válido', async () => {
      const id = 'abc123';
      req.params.id = id;
      EquipamentoIdSchema.parse.mockReturnValue(id);
      const equipamento = { _id: id, nome: 'Câmera' };
      controller.service.listarPorId.mockResolvedValue(equipamento);

      await controller.listarPorId(req, res);

      expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith(id);
      expect(controller.service.listarPorId).toHaveBeenCalledWith(id, 'userId');
      expect(CommonResponse.success).toHaveBeenCalledWith(res, equipamento);
    });


    it('deve lançar erro se ID for inválido', async () => {
      req.params.id = 'idInvalido';
      const error = new Error('ID inválido');
      error.name = 'ZodError';

      EquipamentoIdSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.listarPorId(req, res)).rejects.toEqual(expect.objectContaining({ name: 'ZodError' }));
    });
  });

  describe('criar', () => {
    it('deve criar equipamento com fotos', async () => {
      req.body = { equiValorDiaria: '100.50', equiQuantidadeDisponivel: '5' };
      req.files = [
        { mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' },
      ];
      const dadosProcessados = {
        equiValorDiaria: 100.50,
        equiQuantidadeDisponivel: 5,
      };
      const equipamento = { _id: 'abc123', ...dadosProcessados };
      equipamentoSchema.parse.mockReturnValue({ ...dadosProcessados, equiUsuario: 'userId', equiFotos: [controller._processarImagemParaFoto()] });
      controller.service.criar.mockResolvedValue(equipamento);

      await controller.criar(req, res);

      expect(controller._processarImagemParaFoto).toHaveBeenCalledWith(req.files[0], req);
      expect(equipamentoSchema.parse).toHaveBeenCalledWith({
        ...dadosProcessados,
        equiUsuario: 'userId',
        equiFotos: [controller._processarImagemParaFoto()],
      });
      expect(controller.service.criar).toHaveBeenCalledWith({
        ...dadosProcessados,
        equiUsuario: 'userId',
        equiFotos: [controller._processarImagemParaFoto()],
      });
      expect(CommonResponse.created).toHaveBeenCalledWith(res, {
        mensagem: 'Equipamento cadastrado. Aguardando aprovação.',
        equipamento,
      });
    });

    it('deve lançar erro se dados forem inválidos', async () => {
      req.body = { equiValorDiaria: 'invalido', equiQuantidadeDisponivel: 'invalido' };
      req.files = [];

      const error = new Error('Dados inválidos');
      error.name = 'ZodError';

      equipamentoSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.criar(req, res)).rejects.toThrow(error);
    });

  });

  describe('atualizar', () => {
    it('deve atualizar equipamento com dados válidos', async () => {
      const id = 'abc123';
      req.params.id = id;
      req.body = { nome: 'Câmera Atualizada' };
      EquipamentoIdSchema.parse.mockReturnValue(id);
      equipamentoUpdateSchema.parse.mockReturnValue(req.body);
      const equipamento = { _id: id, nome: 'Câmera Atualizada' };
      controller.service.atualizar.mockResolvedValue(equipamento);

      await controller.atualizar(req, res);

      expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith(id);
      expect(equipamentoUpdateSchema.parse).toHaveBeenCalledWith(req.body);
      expect(controller.service.atualizar).toHaveBeenCalledWith(id, req.body);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, equipamento, 200, 'Equipamento atualizado com sucesso.');
    });

    it('deve lançar erro se ID for inválido', async () => {
      req.params.id = 'idInvalido';

      const error = new Error('ID inválido');
      error.name = 'ZodError';

      EquipamentoIdSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.atualizar(req, res)).rejects.toThrow(error);
    });


    it('deve lançar erro se dados forem inválidos', async () => {
      const id = '123';
      req.params.id = id;
      req.body = { nome: 123 }; 

      EquipamentoIdSchema.parse.mockReturnValue(id);

      const error = new Error('Dados inválidos');
      error.name = 'ZodError';
      equipamentoUpdateSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.atualizar(req, res)).rejects.toThrow(error);
    });
  });

  describe('aprovar', () => {
    it('deve aprovar equipamento se usuário for admin', async () => {
      const id = 'abc123';
      req.params.id = id;
      EquipamentoIdSchema.parse.mockReturnValue(id);
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'admin' });
      const equipamento = { _id: id, status: 'aprovado' };
      controller.service.aprovar.mockResolvedValue(equipamento);

      await controller.aprovar(req, res);

      expect(Usuario.findById).toHaveBeenCalledWith('userId');
      expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith(id);
      expect(controller.service.aprovar).toHaveBeenCalledWith(id);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, equipamento, 200, 'Equipamento aprovado com sucesso.');
    });

    it('deve retornar erro se usuário não for admin', async () => {
      req.params.id = 'abc123';
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'comum' });

      await controller.aprovar(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a administradores.');
      expect(controller.service.aprovar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se ID for inválido', async () => {
      req.params.id = 'idInvalido';
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'admin' });

      const error = new Error('ID inválido');
      error.name = 'ZodError';
      EquipamentoIdSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.aprovar(req, res)).rejects.toThrow(error);
    });
  });

  describe('reprovar', () => {
    it('deve reprovar equipamento se usuário for admin', async () => {
      const id = 'abc123';
      req.params.id = id;
      EquipamentoIdSchema.parse.mockReturnValue(id);
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'admin' });
      const resultado = { _id: id, status: 'reprovado' };
      controller.service.reprovar.mockResolvedValue(resultado);

      await controller.reprovar(req, res);

      expect(Usuario.findById).toHaveBeenCalledWith('userId');
      expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith(id);
      expect(controller.service.reprovar).toHaveBeenCalledWith(id);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, resultado, 200, 'Equipamento reprovado e excluído com sucesso.');
    });

    it('deve retornar erro se usuário não for admin', async () => {
      req.params.id = 'abc123';
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'comum' });

      await controller.reprovar(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, 403, 'Acesso restrito a administradores.');
      expect(controller.service.reprovar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se ID for inválido', async () => {
      req.params.id = 'idInvalido';
      Usuario.findById.mockResolvedValue({ tipoUsuario: 'admin' });

      const error = new Error('ID inválido');
      error.name = 'ZodError';
      EquipamentoIdSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.reprovar(req, res)).rejects.toThrow(error);
    });

  });

  describe('adicionarFoto', () => {
    it('deve adicionar foto com id válido e arquivo válido', async () => {
      const id = 'abc123';
      req.params.id = id;
      req.file = { mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' };
      EquipamentoIdSchema.parse.mockReturnValue(id);
      const novaFoto = controller._processarImagemParaFoto(req.file, req);
      const equipamento = { _id: id, equiFotos: [novaFoto] };
      controller.service.adicionarFoto.mockResolvedValue(equipamento);

      await controller.adicionarFoto(req, res);

      expect(EquipamentoIdSchema.parse).toHaveBeenCalledWith(id);
      expect(controller._processarImagemParaFoto).toHaveBeenCalledWith(req.file, req);
      expect(controller.service.adicionarFoto).toHaveBeenCalledWith(id, novaFoto);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, equipamento, 200, 'Foto adicionada com sucesso.');
    });

    it('deve retornar erro se nenhuma foto for enviada', async () => {
      req.params.id = 'abc123';
      req.file = null;

      await controller.adicionarFoto(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, 400, 'Nenhuma foto foi enviada.');
    });

    it('deve lançar erro se id for inválido', async () => {
      req.params.id = 'idInvalido';
      req.file = { mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024, filename: 'foto.jpg' };

      const error = new Error('ID inválido');
      error.name = 'ZodError';
      EquipamentoIdSchema.parse.mockImplementation(() => { throw error; });

      await expect(controller.adicionarFoto(req, res)).rejects.toThrow(error);
    });

  });

  describe('_obterDimensoesImagem', () => {
    it('deve retornar dimensões de uma imagem válida', () => {
      controller._validarHeaderImagem = jest.fn(() => true);
      const caminhoArquivo = 'path/to/valid/image.jpg';
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]));
      sizeOf.mockReturnValue({ width: 100, height: 100 });

      const dimensoes = controller._obterDimensoesImagem(caminhoArquivo);

      expect(dimensoes).toEqual({ width: 100, height: 100 });
    });

    it('deve lançar erro se arquivo não existir', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => controller._obterDimensoesImagem('path/to/invalid/image.jpg')).toThrow('Arquivo não encontrado');
    });

    it('deve lançar erro se arquivo estiver vazio', () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 0 });

      expect(() => controller._obterDimensoesImagem('path/to/empty/image.jpg')).toThrow('Arquivo está vazio');
    });

    it('deve lançar erro se imagem não for válida', () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from([0x00, 0x00, 0x00]));

      expect(() => controller._obterDimensoesImagem('path/to/invalid/image.jpg')).toThrow('Arquivo não é uma imagem válida');
    });
    it('deve lançar erro se dimensões não forem obtidas', () => {
      controller._validarHeaderImagem = jest.fn(() => true);
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });
      fs.readFileSync.mockReturnValue(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]));
      sizeOf.mockReturnValue({});

      expect(() => controller._obterDimensoesImagem('path/to/image.jpg'))
        .toThrow('Não foi possível obter dimensões válidas');
    });

  });

  describe('_validarHeaderImagem', () => {
    it('deve validar header JPEG', () => {
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      expect(controller._validarHeaderImagem(buffer)).toBe(true);
    });

    it('deve validar header PNG', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      expect(controller._validarHeaderImagem(buffer)).toBe(true);
    });

    it('deve validar header RIFF', () => {
      const buffer = Buffer.from([0x52, 0x49, 0x46, 0x46]);
      expect(controller._validarHeaderImagem(buffer)).toBe(true);
    });


    it('deve retornar false para buffer inválido', () => {
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(controller._validarHeaderImagem(buffer)).toBe(false);
    });

    it('deve retornar false para buffer muito curto', () => {
      const buffer = Buffer.from([0xFF, 0xD8]);
      expect(controller._validarHeaderImagem(buffer)).toBe(false);
    });

    it('deve retornar false para não-buffer', () => {
      expect(controller._validarHeaderImagem('not a buffer')).toBe(false);
    });
  });

  describe('_validarArquivoImagem', () => {
    it('deve validar arquivo de imagem válido', () => {
      const file = { mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024 };
      expect(() => controller._validarArquivoImagem(file)).not.toThrow();
    });

    it('deve lançar erro se mimetype não for imagem', () => {
      const file = { mimetype: 'text/plain', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 1024 };
      expect(() => controller._validarArquivoImagem(file)).toThrow('Arquivo foto.jpg não é uma imagem válida.');
    });

    it('deve lançar erro se arquivo estiver vazio', () => {
      const file = { mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 0 };
      expect(() => controller._validarArquivoImagem(file)).toThrow('Arquivo foto.jpg está vazio ou corrompido.');
    });

    it('deve lançar erro se arquivo exceder tamanho máximo', () => {
      const file = { mimetype: 'image/jpeg', path: 'path/to/foto.jpg', originalname: 'foto.jpg', size: 6 * 1024 * 1024 };
      expect(() => controller._validarArquivoImagem(file)).toThrow('Arquivo foto.jpg excede o tamanho máximo de 5MB.');
    });
  });

  describe('_processarDadosFormulario', () => {
    it('deve processar dados do formulário corretamente', () => {
      const body = { equiValorDiaria: '100.50', equiQuantidadeDisponivel: '5', nome: 'Câmera' };
      const resultado = controller._processarDadosFormulario(body);

      expect(resultado).toEqual({
        equiValorDiaria: 100.50,
        equiQuantidadeDisponivel: 5,
        nome: 'Câmera',
      });
    });
  });
});
