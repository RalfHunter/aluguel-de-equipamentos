import mongoose from "mongoose";
import { equipamentoSchema, equipamentoUpdateSchema, equipamentoStatusSchema } from "../utils/validators/schemas/zod/EquipamentoSchema.js";
import { EquipamentoIdSchema, EquipamentoQuerySchema } from "../utils/validators/schemas/zod/querys/EquipamentoQuerySchema.js";
import EquipamentoService from "../services/EquipamentoService.js";
import { CommonResponse, HttpStatusCodes } from "../utils/helpers/index.js";
import Usuario from '../models/Usuario.js';
import sizeOf from 'image-size';
import fs from 'fs';
import path from 'path';

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

    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return true;

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

<<<<<<< HEAD
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
=======
    const usuario = usuarioId ? await Usuario.findById(usuarioId).populate('grupos') : null;
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    if (query.status === 'pendente') {
      if (!isAdminOrMod) {
<<<<<<< HEAD
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores ou moderadores para filtrar equipamentos pendentes.');
      }
    } else if (query.status === 'inativo') {
      if (!usuarioId) {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Usuário não autenticado.');
      }
      // Apenas o dono pode listar inativos
      query.equiUsuario = usuarioId;
    } else if (!query.status || query.status === 'ativo') {
      // Usuários comuns veem apenas ativos e os próprios pendentes/inativos
      if (!isAdminOrMod && usuarioId) {
=======
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Acesso restrito a administradores ou moderadores para filtrar equipamentos pendentes.');
      }
      query.equiStatus = 'pendente';
    } else if (query.status === 'inativo') {
      if (!usuarioId) {
        return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'unauthorized', null, [], 'Usuário não autenticado.');
      }
      query.equiUsuario = usuarioId;
      query.equiStatus = 'inativo';
    } else {
      if (usuarioId && !isAdminOrMod) {
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
        query.$or = [
          { equiStatus: 'ativo' },
          { equiStatus: 'pendente', equiUsuario: usuarioId },
          { equiStatus: 'inativo', equiUsuario: usuarioId }
        ];
      } else if (isAdminOrMod) {
<<<<<<< HEAD
        query.equiStatus = { $in: ['ativo', 'pendente'] }; // Admins/mods veem apenas ativos e pendentes
      } else {
        query.equiStatus = 'ativo'; // Padrão para não autenticados
=======
        query.equiStatus = { $in: ['ativo', 'pendente'] };
      } else {
        query.equiStatus = 'ativo';
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
      }
    }

    const data = await this.service.listar({ ...query, usuarioId });
    return CommonResponse.success(res, data);
  }

<<<<<<< HEAD
  async listarPorId(req, res) {
    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

    const usuarioId = req.user_id?.toString();
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    const equipamento = await this.service.listarPorId(id, usuarioId);

    if (equipamento && usuarioId) {
      const isOwner = equipamento.equiUsuario?.toString() === usuarioId;
      if (!isOwner && !isAdminOrMod) {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a equipamentos do próprio usuário.');
      }
      if (isAdminOrMod && !isOwner && !['ativo', 'pendente'].includes(equipamento.equiStatus)) {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Administradores e moderadores só podem acessar equipamentos ativos ou pendentes, exceto os próprios.');
      }
    }

    return CommonResponse.success(res, equipamento);
=======
 async listarPorId(req, res) {
  const { id } = req.params;
  const usuarioId = req.user_id?.toString();

  EquipamentoIdSchema.parse(id);

  const equipamento = await this.service.listarPorId(id, usuarioId);
  if (!equipamento) {
    return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'not_found', null, [], 'Equipamento não encontrado.');
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
  }

  if (!usuarioId) {
    if (equipamento.equiStatus.toLowerCase() !== 'ativo') {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Acesso restrito a equipamentos ativos para usuários não autenticados.');
    }
    return CommonResponse.success(res, equipamento);
  }

  const usuario = await Usuario.findById(usuarioId).populate('grupos');
  const isAdminOrMod = usuario && usuario.grupos.some(g => [0, 50].includes(g.nivelPermissao));
  const isOwner = equipamento.equiUsuario?.toString() === usuarioId;

  if (equipamento.equiStatus.toLowerCase() !== 'ativo' && !isOwner && !isAdminOrMod) {
    return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Acesso restrito a equipamentos ativos ou próprios.');
  }

  return CommonResponse.success(res, equipamento);
}
  async criar(req, res) {
    const usuarioLogado = req.user_id;
<<<<<<< HEAD
    const usuario = await Usuario.findById(usuarioLogado).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito para criar equipamentos.');
=======
    if (!usuarioLogado) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'unauthorized', null, [], 'Usuário não autenticado.');
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
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
<<<<<<< HEAD
=======
      equiStatus: 'pendente'
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
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
<<<<<<< HEAD
    EquipamentoIdSchema.parse(id);

    const usuario = await Usuario.findById(req.user_id).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito para atualizar equipamentos.');
    }

    const dadosAtualizados = equipamentoUpdateSchema.parse(req.body);
    const equipamento = await this.service.atualizar(id, dadosAtualizados);

    return CommonResponse.success(res, equipamento, 200, 'Equipamento atualizado com sucesso.');
=======
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'unauthorized', null, [], 'Usuário não autenticado.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'not_found', null, [], 'Equipamento não encontrado.');
    }
    if (equipamento.equiUsuario?.toString() !== usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Apenas o dono do equipamento pode atualizá-lo.');
    }

    const dadosAtualizados = equipamentoUpdateSchema.parse(req.body);
    const equipamentoAtualizado = await this.service.atualizar(id, dadosAtualizados);

    return CommonResponse.success(res, equipamentoAtualizado, 200, 'Equipamento atualizado com sucesso.');
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
  }

  async aprovar(req, res) {
    const usuario = await Usuario.findById(req.user_id).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
<<<<<<< HEAD
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores ou moderadores.');
=======
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Acesso restrito a administradores ou moderadores.');
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
    }

    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

    const equipamento = await this.service.aprovar(id, req.user_id);
    return CommonResponse.success(res, equipamento, 200, 'Equipamento aprovado com sucesso.');
  }

  async reprovar(req, res) {
    const usuario = await Usuario.findById(req.user_id).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
<<<<<<< HEAD
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores ou moderadores.');
=======
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Acesso restrito a administradores ou moderadores.');
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
    }

    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

    const resultado = await this.service.reprovar(id, req.user_id);
    return CommonResponse.success(res, resultado, 200, 'Equipamento reprovado e excluído com sucesso.');
  }

<<<<<<< HEAD
  async adicionarFoto(req, res) {
    const { id } = req.params;
    const file = req.file;

    EquipamentoIdSchema.parse(id);

    if (!file) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, 'Nenhuma foto foi enviada.');
    }

    const usuario = await Usuario.findById(req.user_id).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito para adicionar fotos.');
    }

    const novaFoto = this._processarImagemParaFoto(file, req);
    const equipamento = await this.service.adicionarFoto(id, novaFoto);

    return CommonResponse.success(res, equipamento, 200, 'Foto adicionada com sucesso.');
=======
  async atualizarStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const usuarioId = req.user_id?.toString();
    EquipamentoIdSchema.parse(id);
    equipamentoStatusSchema.parse({ status });
    if (!usuarioId) return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'unauthorized', null, [], 'Usuário não autenticado.');
    const equipamento = await this.service.atualizarStatus(id, usuarioId, status);
    return CommonResponse.success(res, equipamento, 200, `Equipamento ${status === 'ativo' ? 'ativado' : 'inativado'} com sucesso.`);
  }

  async adicionarFotos(req, res) {
    const { id } = req.params;
    const files = req.files;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'unauthorized', null, [], 'Usuário não autenticado.');
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, 'bad_request', null, [], 'Nenhuma foto foi enviada.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'not_found', null, [], 'Equipamento não encontrado.');
    }

    if (equipamento.equiUsuario?.toString() !== usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Apenas o dono do equipamento pode adicionar fotos.');
    }

    const novasFotos = files.map(file => this._processarImagemParaFoto(file, req));

    const equipamentoAtualizado = await this.service.adicionarVariasFotos(id, novasFotos);

    return CommonResponse.success(res, equipamentoAtualizado, 200, 'Fotos adicionadas com sucesso.');
  }

  async ListarFoto(req, res) {
    const { id, fotoId } = req.params;
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);
    EquipamentoIdSchema.parse(fotoId);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'unauthorized', null, [], 'Usuário não autenticado.');
    }

    const equipamento = await this.service.listarPorId(id, null);

    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'not_found', null, [], 'Equipamento não encontrado.');
    }

    const isOwner = equipamento.equiUsuario?.toString() === usuarioId;
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    if (!isOwner && !isAdminOrMod && equipamento.equiStatus !== 'ativo') {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'forbidden', null, [], 'Acesso restrito a equipamentos ativos ou próprios.');
    }

    const { filePath, contentType } = await this.service.ListarFoto(id, fotoId);

    res.setHeader('Content-Type', contentType);
    return res.sendFile(filePath);
>>>>>>> b5af130a652d409fe04a03ac2c3bb00c52e4bb1c
  }
}

export default EquipamentoController;