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
    try {
      const query = req.query || {};

      if (Object.keys(query).length !== 0) {
        await EquipamentoQuerySchema.parseAsync(query);
      }

      if (query.status === 'pendente') {
        const usuario = await Usuario.findById(req.user_id);
        if (!usuario || usuario.tipoUsuario !== 'admin') {
          return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores para filtrar equipamentos pendentes.');
        }
      }

      const data = await this.service.listar(query);
      return CommonResponse.success(res, data);
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }

  async listarPorId(req, res) {
    try {
      const { id } = req.params;
      EquipamentoIdSchema.parse(id);

      const usuarioId = req.user_id?.toString();
      const equipamento = await this.service.listarPorId(id, usuarioId);

      return CommonResponse.success(res, equipamento);
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }

  async criar(req, res) {
    try {
      const usuarioLogado = req.user_id;
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
      };

      const dados = equipamentoSchema.parse(dadosEquipamento);
      const equipamento = await this.service.criar(dados);

      return CommonResponse.created(res, {
        mensagem: 'Equipamento cadastrado. Aguardando aprovação.',
        equipamento,
      });
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      EquipamentoIdSchema.parse(id);

      const dadosAtualizados = equipamentoUpdateSchema.parse(req.body);
      const equipamento = await this.service.atualizar(id, dadosAtualizados);

      return CommonResponse.success(res, equipamento, 200, 'Equipamento atualizado com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }

  async aprovar(req, res) {
    try {
      const usuario = await Usuario.findById(req.user_id);

      if (!usuario || usuario.tipoUsuario !== 'admin') {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores.');
      }

      const { id } = req.params;
      EquipamentoIdSchema.parse(id);

      const equipamento = await this.service.aprovar(id);
      return CommonResponse.success(res, equipamento, 200, 'Equipamento aprovado com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }

  async reprovar(req, res) {
    try {
      const usuario = await Usuario.findById(req.user_id);

      if (!usuario || usuario.tipoUsuario !== 'admin') {
        return CommonResponse.error(res, HttpStatusCodes.FORBIDDEN.code, 'Acesso restrito a administradores.');
      }

      const { id } = req.params;
      EquipamentoIdSchema.parse(id);

      const resultado = await this.service.reprovar(id);
      return CommonResponse.success(res, resultado, 200, 'Equipamento reprovado e excluído com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }

  async adicionarFoto(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;

      EquipamentoIdSchema.parse(id);

      if (!file) {
        return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, 'Nenhuma foto foi enviada.');
      }

      const novaFoto = this._processarImagemParaFoto(file, req);
      const equipamento = await this.service.adicionarFoto(id, novaFoto);

      return CommonResponse.success(res, equipamento, 200, 'Foto adicionada com sucesso.');
    } catch (error) {
      return CommonResponse.error(res, HttpStatusCodes.BAD_REQUEST.code, error.message);
    }
  }
}

export default EquipamentoController;
