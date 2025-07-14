import mongoose from "mongoose";
import { equipamentoSchema, equipamentoUpdateSchema, equipamentoStatusSchema } from "../utils/validators/schemas/zod/EquipamentoSchema.js";
import { EquipamentoIdSchema, EquipamentoQuerySchema } from "../utils/validators/schemas/zod/querys/EquipamentoQuerySchema.js";
import EquipamentoService from "../services/EquipamentoService.js";
import { CommonResponse, HttpStatusCodes } from "../utils/helpers/index.js";
import Usuario from '../models/Usuario.js';
import sizeOf from 'image-size';
import fs from 'fs';

class EquipamentoController {
  constructor() {
    this.service = new EquipamentoService();
  }

  _obterDimensoesImagem(caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) {
      throw new Error('Arquivo não encontrado');
    }

    const stats = fs.statSync(caminhoArquivo);
    if (stats.size === 0) {
      throw new Error('Arquivo está vazio');
    }

    const buffer = fs.readFileSync(caminhoArquivo);

    if (!this._validarHeaderImagem(buffer)) {
      throw new Error('Arquivo não é uma imagem válida');
    }

    const dimensoes = sizeOf(buffer);

    if (!dimensoes?.width || !dimensoes?.height) {
      throw new Error('Não foi possível obter dimensões válidas');
    }

    return dimensoes;
  }

  _validarHeaderImagem(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;

    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true; // JPEG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true; // PNG
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return true; // RIFF

    return false;
  }

  _validarArquivoImagem(file) {
    if (!file.mimetype.startsWith('image/')) {
      throw new Error(`Arquivo ${file.originalname} não é uma imagem válida.`);
    }

    if (!file.path || file.size === 0) {
      throw new Error(`Arquivo ${file.originalname} está vazio ou corrompido.`);
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Arquivo ${file.originalname} excede o tamanho máximo de 5MB.`);
    }
  }

 _processarImagemParaFoto(file, req) {
  this._validarArquivoImagem(file);

  const dimensoes = this._obterDimensoesImagem(file.path);
  const tamanhoMb = +(file.size / (1024 * 1024)).toFixed(2);

  return {
    _id: new mongoose.Types.ObjectId(), 
    url: `${req.protocol}://${req.get('host')}/uploads/equipamentos/${file.filename}`,
    largura: dimensoes.width,
    altura: dimensoes.height,
    tamanhoMb,
  };
}

  _processarDadosFormulario(body) {
    return {
      ...body,
      equiValorDiaria: parseFloat(body.equiValorDiaria),
      equiQuantidadeDisponivel: parseInt(body.equiQuantidadeDisponivel),
    };
  }

  async listar(req, res) {
    const query = req.query || {};
    const usuarioId = req.user_id;

    if (Object.keys(query).length !== 0) {
      await EquipamentoQuerySchema.parseAsync(query);
    }

    const usuario = usuarioId ? await Usuario.findById(usuarioId).populate('grupos') : null;
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    if (query.status === 'pendente' && !isAdminOrMod) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para listar equipamentos pendentes.');
    }

    if (!usuarioId && query.status && query.status !== 'ativo') {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para listar equipamentos com este status.');
    }

    const data = await this.service.listar(query, usuarioId, isAdminOrMod);
    return CommonResponse.success(res, data);
  }

  async listarPorId(req, res) {
    const { id } = req.params;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }

    if (!usuarioId) {
      if (equipamento.equiStatus !== 'ativo') {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para acessar equipamentos não ativos.');
      }
      return CommonResponse.success(res, equipamento);
    }

    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));
    const isOwner = equipamento.equiUsuario?.toString() === usuarioId;

    if (!isOwner && !isAdminOrMod && equipamento.equiStatus !== 'ativo') {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para acessar equipamentos não ativos ou não próprios.');
    }

    return CommonResponse.success(res, equipamento);
  }

  async criar(req, res) {
    const usuarioLogado = req.user_id;
    if (!usuarioLogado) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    const files = req.files || [];
    const equiFotos = [];

    for (const file of files) {
      const foto = this._processarImagemParaFoto(file, req);
      equiFotos.push(foto);
    }

    const dadosProcessados = this._processarDadosFormulario(req.body);

    const dadosEquipamento = {
      ...dadosProcessados,
      equiUsuario: usuarioLogado,
      equiFotos,
      equiStatus: 'pendente'
    };

    const dados = equipamentoSchema.parse(dadosEquipamento);
    const equipamento = await this.service.criar(dados);
    return CommonResponse.created(res, {
      mensagem: 'Equipamento cadastrado. Aguardando aprovação.',
      equipamento,
    });
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }
    if (equipamento.equiUsuario?.toString() !== usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Apenas o dono do equipamento pode atualizá-lo.');
    }

    const dadosAtualizados = equipamentoUpdateSchema.parse(req.body);
    const equipamentoAtualizado = await this.service.atualizar(id, dadosAtualizados);

    return CommonResponse.success(res, equipamentoAtualizado, 200, 'Equipamento atualizado com sucesso.');
  }

  async aprovar(req, res) {
    const usuarioId = req.user_id;
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para aprovar equipamentos.');
    }

    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

    const equipamento = await this.service.aprovar(id, usuarioId);
    return CommonResponse.success(res, equipamento, 200, 'Equipamento aprovado com sucesso.');
  }

  async reprovar(req, res) {
    const usuarioId = req.user_id;
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para reprovar equipamentos.');
    }

    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

    const resultado = await this.service.reprovar(id, usuarioId);
    return CommonResponse.success(res, resultado, 200, 'Equipamento reprovado e excluído com sucesso.');
  }

  async atualizarStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);
    equipamentoStatusSchema.parse({ status });

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    const equipamento = await this.service.atualizarStatus(id, usuarioId, status);
    return CommonResponse.success(res, equipamento, 200, `Equipamento ${status === 'ativo' ? 'ativado' : 'inativado'} com sucesso.`);
  }

  async adicionarFotos(req, res) {
    const { id } = req.params;
    const files = req.files;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, 'Nenhuma foto foi enviada.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }

    if (equipamento.equiUsuario?.toString() !== usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Apenas o dono do equipamento pode adicionar fotos.');
    }

    const novasFotos = files.map(file => this._processarImagemParaFoto(file, req));
    const equipamentoAtualizado = await this.service.adicionarFotos(id, novasFotos);

    return CommonResponse.success(res, equipamentoAtualizado, 200, 'Fotos adicionadas com sucesso.');
  }

  async listarFoto(req, res) {
    const { id, fotoId } = req.params;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);
    EquipamentoIdSchema.parse(fotoId);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }

    const isOwner = equipamento.equiUsuario?.toString() === usuarioId;
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    if (!isOwner && !isAdminOrMod && equipamento.equiStatus !== 'ativo') {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Você não tem permissão para acessar fotos de equipamentos não ativos ou não próprios.');
    }

    const { filePath, contentType } = await this.service.listarFoto(id, fotoId);
    res.setHeader('Content-Type', contentType);
    return res.sendFile(filePath);
  }
}

export default EquipamentoController;
