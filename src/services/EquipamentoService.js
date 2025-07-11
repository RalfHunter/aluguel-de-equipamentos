import mongoose from 'mongoose';
import EquipamentoRepository from '../repositories/EquipamentoRepository.js';
import EquipamentoFilterBuilder from '../repositories/filters/EquipamentoFilterBuilder.js';
import { CustomError, HttpStatusCodes, messages } from '../utils/helpers/index.js';
import Reserva from '../models/Reserva.js';
import Usuario from '../models/Usuario.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

class EquipamentoService {
  constructor() {
    this.repository = new EquipamentoRepository();
    this.reservaModel = Reserva;
  }

  async listar(filtros) {
    const usuarioId = filtros.usuarioId;
    delete filtros.usuarioId;

    if (filtros.status === 'pendente') {
      return await this.repository.listarPendentes();
    }

    const { query, pagina, limite } = this._processarFiltros(filtros, usuarioId);
    return await this.repository.listar(query, pagina, limite);
  }

  async listarPendentes() {
    return await this.repository.listarPendentes();
  }

  async listarPorId(id, usuarioId) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    return equipamento;
  }

  async criar(dados) {
    this._validarCamposObrigatorios(dados);
    this._validarFotosObrigatorias(dados);

    const dadosComStatus = {
      ...dados,
      equiStatus: 'pendente'
    };

    console.log('Dados antes de criar:', dadosComStatus); // Adicione este log

    return await this.repository.criar(dadosComStatus);
  }

  async atualizar(id, dadosAtualizados) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    this._verificarAtualizacaoPermitida(equipamento, dadosAtualizados);

    return await this.repository.atualizar(id, dadosAtualizados);
  }

  async aprovar(id, usuarioId) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    const usuario = await Usuario.findById(usuarioId).populate('grupos');

    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: 'Acesso restrito a administradores ou moderadores.',
      });
    }

    if (equipamento.equiStatus !== 'pendente') {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: 'Apenas equipamentos pendentes podem ser aprovados.',
      });
    }

    equipamento.equiStatus = 'ativo';
    await equipamento.save();
    return equipamento;
  }

  async reprovar(id, usuarioId) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    const usuario = await Usuario.findById(usuarioId).populate('grupos');

    if (!usuario || !usuario.grupos.some(group => [0, 50].includes(group.nivelPermissao))) {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: 'Acesso restrito a administradores ou moderadores.',
      });
    }

    if (equipamento.equiStatus !== 'pendente') {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: 'Apenas equipamentos pendentes podem ser reprovados.',
      });
    }

    await this.repository.excluir(id);
    return { id, mensagem: 'Equipamento excluído com sucesso.' };
  }

  async atualizarStatus(id, usuarioId, novoStatus) {
    console.log(`AtualizarStatus chamado para equipamento ${id} por usuário ${usuarioId} com novoStatus: ${novoStatus}`);
    const equipamento = await this.repository.listarPorId(id);
    if (!equipamento) throw new CustomError({ statusCode: HttpStatusCodes.NOT_FOUND.code, customMessage: 'Equipamento não encontrado.' });
    console.log(`Equipamento antes de atualizar: ${equipamento.equiStatus}`);
    const donoId = equipamento.equiUsuario?._id?.toString() || equipamento.equiUsuario?.toString();
    if (!donoId || donoId !== usuarioId) throw new CustomError({ statusCode: HttpStatusCodes.FORBIDDEN.code, customMessage: 'Apenas o dono do equipamento pode alterar seu status.' });
    if (equipamento.equiStatus === 'pendente') throw new CustomError({ statusCode: HttpStatusCodes.FORBIDDEN.code, customMessage: 'Não é possível alterar o status de um equipamento pendente.' });
    if (equipamento.equiStatus === novoStatus) throw new CustomError({ statusCode: HttpStatusCodes.CONFLICT.code, customMessage: `O equipamento já está ${novoStatus}.` });
    if (novoStatus === 'inativo') {
      const reservasAtivas = await this.reservaModel.countDocuments({
        equipamentos: new mongoose.Types.ObjectId(id),
        statusReserva: { $in: ['pendente', 'confirmada'] },
        $or: [{ dataInicial: { $lte: new Date() }, dataFinal: { $gte: new Date() } }, { dataInicial: { $gte: new Date() } }],
      });
      console.log(`Reservas ativas encontradas: ${reservasAtivas}`);
      if (reservasAtivas > 0) throw new CustomError({ statusCode: HttpStatusCodes.CONFLICT.code, customMessage: 'Não é possível inativar equipamento com reservas ativas.' });
    }
    if ((novoStatus === 'ativo' && equipamento.equiStatus !== 'inativo') || (novoStatus === 'inativo' && equipamento.equiStatus !== 'ativo')) {
      throw new CustomError({ statusCode: HttpStatusCodes.BAD_REQUEST.code, customMessage: `Transição inválida: de ${equipamento.equiStatus} para ${novoStatus}.` });
    }
    equipamento.equiStatus = novoStatus;
    await equipamento.save();
    console.log(`Equipamento após atualizar: ${equipamento.equiStatus}`);
    return equipamento;
  }

  async adicionarFotos(id, novasFotos) {
    const equipamento = await this._buscarEquipamentoExistente(id);

    if (!Array.isArray(novasFotos) || novasFotos.length === 0) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: 'Nenhuma foto válida fornecida.',
      });
    }

    equipamento.equiFotos.push(...novasFotos);
    await equipamento.save();
    return equipamento;
  }


  async ListarFoto(id, fotoId) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    const foto = await this.repository.buscarFotoPorId(id, fotoId);

    if (!foto) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: 'Foto não encontrada.',
      });
    }

    const filename = path.basename(foto.url);
    const uploadsDir = path.join(getDirname(), '..', '..', 'Uploads', 'equipamentos');
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: 'Arquivo da foto não encontrado no servidor.',
      });
    }

    const extensao = path.extname(filename).slice(1).toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    const contentType = mimeTypes[extensao] || 'application/octet-stream';

    return { filePath, contentType };
  }

  _processarFiltros(filtros, usuarioId) {
    const pagina = parseInt(filtros.page) || 1;
    const limite = parseInt(filtros.limit) || 10;
    const builder = new EquipamentoFilterBuilder();

    const status = filtros.status
      ? filtros.status === 'true'
        ? 'ativo'
        : filtros.status === 'false'
          ? 'pendente'
          : filtros.status
      : null;

    builder
      .comCategoria(filtros.categoria)
      .comFaixaDeValor(filtros.minValor, filtros.maxValor);

    if (status === 'pendente') {
      builder.comStatus('pendente');
    } else if (status === 'inativo' && usuarioId) {
      builder.comStatus('inativo');
      builder.filtros.equiUsuario = usuarioId;
    } else if (usuarioId) {
      builder.filtros.$or = [
        { equiStatus: 'ativo' },
        { equiStatus: 'pendente', equiUsuario: usuarioId },
        { equiStatus: 'inativo', equiUsuario: usuarioId }
      ];
    } else {
      builder.comStatus('ativo');
    }

    const query = builder.build();
    return { query, pagina, limite };
  }

  async _buscarEquipamentoExistente(id) {
    const equipamento = await this.repository.listarPorId(id);
    console.log('Equipamento buscado:', { id, equiUsuario: equipamento?.equiUsuario?.toString(), equiStatus: equipamento?.equiStatus });
    if (!equipamento) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: messages.error.resourceNotFound('Equipamento'),
      });
    }
    return equipamento;
  }

  _verificarAtualizacaoPermitida(equipamento, dadosAtualizados) {
    const camposPermitidos = ['equiValorDiaria', 'equiQuantidadeDisponivel'];
    const camposAtualizados = Object.keys(dadosAtualizados);

    if (equipamento.equiStatus === 'pendente') {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        customMessage: 'Não é possível atualizar! Equipamento pendente, espere por uma aprovação.',
      });
    }

    const camposInvalidos = camposAtualizados.filter((campo) => !camposPermitidos.includes(campo));
    if (camposInvalidos.length > 0) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: `Não é permitido alterar os seguintes campos: ${camposInvalidos.join(', ')}`,
      });
    }
  }

  _validarCamposObrigatorios(dados) {
    if (!dados.equiNome || !dados.equiCategoria) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: 'Campos obrigatórios não preenchidos.',
      });
    }
  }

  _validarFotosObrigatorias(dados) {
    if (!dados.equiFotos || !Array.isArray(dados.equiFotos) || dados.equiFotos.length === 0) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        customMessage: 'Pelo menos uma foto é obrigatória',
      });
    }
  }
}

export default EquipamentoService;
