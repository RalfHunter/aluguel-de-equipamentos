import mongoose from "mongoose";
import { equipamentoSchema, equipamentoUpdateSchema } from "../utils/validators/schemas/zod/EquipamentoSchema.js";
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
<<<<<<< HEAD
    if (Object.keys(query).length !== 0) {
      await EquipamentoQuerySchema.parseAsync(query);
    }

    if (query.status === 'pendente') {
      const usuario = await Usuario.findById(req.user_id);
      if (!usuario || usuario.tipoUsuario !== 'admin') {
        return CommonResponse.error(
          res,
          HttpStatusCodes.FORBIDDEN.code,
          'forbidden',
          null,
          [],
          'Acesso restrito a administradores para filtrar equipamentos pendentes.'
        );
      }
    }

    const data = await this.service.listar(query);
=======
    const usuarioId = req.user_id;

    if (Object.keys(query).length !== 0) {
      EquipamentoQuerySchema.parseAsync(query);
    }

    const usuario = usuarioId ? await Usuario.findById(usuarioId).populate('grupos') : null;
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    if (query.status === 'pendente') {
      if (!isAdminOrMod) {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores ou moderadores para filtrar equipamentos pendentes.');
      }
      query.equiStatus = 'pendente';
    } else if (query.status === 'inativo') {
      if (!usuarioId) {
        return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
      }
      query.equiUsuario = usuarioId;  
      query.equiStatus = 'inativo';
    } else {
      if (usuarioId && !isAdminOrMod) {
        query.$or = [
          { equiStatus: 'ativo' },
          { equiStatus: 'pendente', equiUsuario: usuarioId },
          { equiStatus: 'inativo', equiUsuario: usuarioId }
        ];
      } else if (isAdminOrMod) {
        query.equiStatus = { $in: ['ativo', 'pendente'] };
      } else {
        query.equiStatus = 'ativo'; 
      }
    }

    const data = await this.service.listar({ ...query, usuarioId });
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
    return CommonResponse.success(res, data);
  }

  async listarPorId(req, res) {
    const { id } = req.params;
<<<<<<< HEAD
    EquipamentoIdSchema.parse(id);

    const usuarioId = req.user_id?.toString();
    const equipamento = await this.service.listarPorId(id, usuarioId);

    if (!equipamento) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.NOT_FOUND.code,
        'notFound',
        null,
        [],
        'Equipamento não encontrado.'
      );
    }

=======
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      const equipamento = await this.service.listarPorId(id, usuarioId);
      if (!equipamento || equipamento.equiStatus !== 'ativo') {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a equipamentos ativos para usuários não autenticados.');
      }
      return CommonResponse.success(res, equipamento);
    }

    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    const isAdminOrMod = usuario && usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao));

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }

    const isOwner = equipamento.equiUsuario?.toString() === usuarioId;
    if (!isOwner && !isAdminOrMod && equipamento.equiStatus !== 'ativo') {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a equipamentos ativos ou próprios.');
    }

>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
    return CommonResponse.success(res, equipamento);
  }

  async criar(req, res) {
<<<<<<< HEAD
    //console.log('req.body:', req.body);
    //console.log('req.files:', req.files);
    const usuarioLogado = req.user_id;
    const files = req.files || [];
    const equiFotos = [];

    for (const file of files) {
      const foto = this._processarImagemParaFoto(file, req);
      equiFotos.push(foto);
    }

    if (equiFotos.length === 0) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.BAD_REQUEST.code,
        'badRequest',
        null,
        [],
        'É obrigatório enviar pelo menos uma foto.'
      );
=======
    const usuarioLogado = req.user_id;
    if (!usuarioLogado) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    const files = req.files || [];
    const equiFotos = [];

    for (const file of files) {
      const foto = this._processarImagemParaFoto(file, req);
      equiFotos.push(foto);
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
    }

    const dadosProcessados = this._processarDadosFormulario(req.body);

    const dadosEquipamento = {
      ...dadosProcessados,
      equiUsuario: usuarioLogado,
      equiFotos,
<<<<<<< HEAD
=======
      equiStatus: 'pendente'  
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
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

    const dadosAtualizados = equipamentoUpdateSchema.parse(req.body);
    const equipamento = await this.service.atualizar(id, dadosAtualizados);

    if (!equipamento) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.NOT_FOUND.code,
        'notFound',
        null,
        [],
        'Equipamento não encontrado para atualização.'
      );
    }

    return CommonResponse.success(res, equipamento, 200, 'Equipamento atualizado com sucesso.');
  }

  async aprovar(req, res) {
    const usuario = await Usuario.findById(req.user_id);

    if (!usuario || usuario.tipoUsuario !== 'admin') {
      return CommonResponse.error(
        res,
        HttpStatusCodes.FORBIDDEN.code,
        'forbidden',
        null,
        [],
        'Acesso restrito a administradores.'
      );
=======
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
    const usuario = await Usuario.findById(req.user_id).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores ou moderadores.');
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
    }

    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

<<<<<<< HEAD
    const equipamento = await this.service.aprovar(id);

    if (!equipamento) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.NOT_FOUND.code,
        'notFound',
        null,
        [],
        'Equipamento não encontrado para aprovação.'
      );
    }

=======
    const equipamento = await this.service.aprovar(id, req.user_id);
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
    return CommonResponse.success(res, equipamento, 200, 'Equipamento aprovado com sucesso.');
  }

  async reprovar(req, res) {
<<<<<<< HEAD
    const usuario = await Usuario.findById(req.user_id);

    if (!usuario || usuario.tipoUsuario !== 'admin') {
      return CommonResponse.error(
        res,
        HttpStatusCodes.FORBIDDEN.code,
        'forbidden',
        null,
        [],
        'Acesso restrito a administradores.'
      );
=======
    const usuario = await Usuario.findById(req.user_id).populate('grupos');
    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores ou moderadores.');
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
    }

    const { id } = req.params;
    EquipamentoIdSchema.parse(id);

<<<<<<< HEAD
    const resultado = await this.service.reprovar(id);

    if (!resultado) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.NOT_FOUND.code,
        'notFound',
        null,
        [],
        'Equipamento não encontrado para reprovação.'
      );
    }

    return CommonResponse.success(res, resultado, 200, 'Equipamento reprovado e excluído com sucesso.');
=======
    const resultado = await this.service.reprovar(id, req.user_id);
    return CommonResponse.success(res, resultado, 200, 'Equipamento reprovado e excluído com sucesso.');
  }

  async inativar(req, res) {
    const { id } = req.params;
    const usuarioId = req.user_id?.toString();
    console.log('Tentando inativar:', { id, usuarioId });

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }

    const resultado = await this.service.inativar(id, usuarioId);
    console.log('Resultado da inativação:', resultado);
    return CommonResponse.success(res, resultado, 200, 'Equipamento inativado com sucesso.');
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
  }

  async adicionarFoto(req, res) {
    const { id } = req.params;
    const file = req.file;
<<<<<<< HEAD

    EquipamentoIdSchema.parse(id);

    if (!file) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.BAD_REQUEST.code,
        'badRequest',
        null,
        [],
        'Nenhuma foto foi enviada.'
      );
    }

    const novaFoto = this._processarImagemParaFoto(file, req);
    const equipamento = await this.service.adicionarFoto(id, novaFoto);

    if (!equipamento) {
      return CommonResponse.error(
        res,
        HttpStatusCodes.NOT_FOUND.code,
        'notFound',
        null,
        [],
        'Equipamento não encontrado para adicionar foto.'
      );
    }

    return CommonResponse.success(res, equipamento, 200, 'Foto adicionada com sucesso.');
=======
    const usuarioId = req.user_id?.toString();

    EquipamentoIdSchema.parse(id);

    if (!usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.UNAUTHORIZED.code, 'Usuário não autenticado.');
    }

    if (!file) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, 'Nenhuma foto foi enviada.');
    }

    const equipamento = await this.service.listarPorId(id, usuarioId);
    if (!equipamento) {
      return CommonResponse.error(res, HttpStatusCodes.NOT_FOUND.code, 'Equipamento não encontrado.');
    }
    if (equipamento.equiUsuario?.toString() !== usuarioId) {
      return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Apenas o dono do equipamento pode adicionar fotos.');
    }

    const novaFoto = this._processarImagemParaFoto(file, req);
    const equipamentoAtualizado = await this.service.adicionarFoto(id, novaFoto);

    return CommonResponse.success(res, equipamentoAtualizado, 200, 'Foto adicionada com sucesso.');
>>>>>>> 5cb03acf9d5aeb3364671e1c6db225379fc67683
  }
}

export default EquipamentoController;