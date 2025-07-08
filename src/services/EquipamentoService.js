import mongoose from 'mongoose';
import EquipamentoRepository from '../repositories/EquipamentoRepository.js';
import EquipamentoFilterBuilder from '../repositories/filters/EquipamentoFilterBuilder.js';
import { CustomError, HttpStatusCodes, messages } from '../utils/helpers/index.js';
import Reserva from '../models/Reserva.js';
import Usuario from '../models/Usuario.js';

class EquipamentoService {
  constructor() {
    this.repository = new EquipamentoRepository();
    this.reservaModel = Reserva;
  }

  async listar(filtros) {
    if (filtros.status === 'pendente') {
      return await this.repository.listarPendentes();
    }

    const { query, pagina, limite } = this._processarFiltros(filtros);
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
    
    return await this.repository.criar(dados);
  }

  async atualizar(id, dadosAtualizados) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    this._verificarAtualizacaoPermitida(equipamento, dadosAtualizados);

    return await this.repository.atualizar(id, dadosAtualizados);
  }

  async aprovar(id, usuarioId) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    const usuario = await Usuario.findById(usuarioId).populate('grupos');
    console.log('Usuário e Grupos (aprovar no service):', usuario);

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
    console.log('Usuário e Grupos (reprovar no service):', usuario);

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

    const reservasAtivas = await this.reservaModel.countDocuments({
      equipamentos: new mongoose.Types.ObjectId(id),
      statusReserva: { $in: ['pendente', 'confirmada'] },
      $or: [
        { dataInicial: { $lte: new Date() }, dataFinal: { $gte: new Date() } },
        { dataInicial: { $gte: new Date() } }
      ]
    });

    if (reservasAtivas > 0) {
      throw new CustomError({
        statusCode: HttpStatusCodes.CONFLICT.code,
        customMessage: 'Não é possível excluir equipamento com reservas ativas.',
      });
    }

    await this.repository.excluir(id);
    return { id, mensagem: 'Equipamento excluído com sucesso.' };
  }
  
  async adicionarFoto(id, novaFoto) {
    const equipamento = await this._buscarEquipamentoExistente(id);
    equipamento.equiFotos.push(novaFoto);
    await equipamento.save();
    return equipamento;
  }

  _processarFiltros(filtros) {
    const pagina = parseInt(filtros.page) || 1;
    const limite = parseInt(filtros.limit) || 10;
    const builder = new EquipamentoFilterBuilder();

    const status = filtros.status
      ? filtros.status === 'true'
        ? 'ativo'
        : filtros.status === 'false'
          ? 'pendente'
          : filtros.status
      : 'ativo';

    builder
      .comCategoria(filtros.categoria)
      .comStatus(status)
      .comFaixaDeValor(filtros.minValor, filtros.maxValor);

    const query = builder.build();
    return { query, pagina, limite };
  }

  async _buscarEquipamentoExistente(id) {
    const equipamento = await this.repository.listarPorId(id);
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