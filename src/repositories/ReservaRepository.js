import Reserva from '../models/Reserva.js';
import Equipamento from '../models/Equipamento.js';
import Usuario from '../models/Usuario.js';
import mongoose from 'mongoose';
import { CustomError } from '../utils/helpers/index.js';
import ReservaFilterBuilder from './filters/ReservaFilterBuilder.js';

class ReservaRepository {
  constructor({
    reservaModel = Reserva,
    equipamentoModel = Equipamento,
    usuarioModel = Usuario,
  } = {}) {
    this.reservaModel = reservaModel;
    this.equipamentoModel = equipamentoModel;
    this.usuarioModel = usuarioModel;
  }

  async listar(req) {
    const queryParams = req?.query || {};
    const params = req?.params || {};

    if (params.id) {
        return await this.buscarPorID(params.id);
    }

    const filterBuilder = new ReservaFilterBuilder();

    if (queryParams.quantidadeEquipamento) {
      filterBuilder.comQuantidadeEquipamento(queryParams.quantidadeEquipamento);
    }
    if (queryParams.usuarioId) {
      filterBuilder.comUsuarios(queryParams.usuarioId);
    }
    if (queryParams.statusReserva) {
      filterBuilder.comStatus(queryParams.statusReserva);
    }
    if (queryParams.dataInicial) {
      filterBuilder.comDataInicial(queryParams.dataInicial);
    }
    if (queryParams.dataFinal) {
      filterBuilder.comDataFinal(queryParams.dataFinal);
    }
    if (queryParams.enderecoEquipamento) {
      filterBuilder.comEnderecoEquipamento(queryParams.enderecoEquipamento);
    }
    if (queryParams.valorEquipamento) {
      filterBuilder.comValorEquipamento(queryParams.valorEquipamento);
    }

    const query = filterBuilder.build();
    const options = {
        page: parseInt(queryParams.page) || 1,
        limit: Math.min(parseInt(queryParams.limite) || 10, 100),
        populate: [
        { path: 'equipamentos', select: 'equiNome' },
        { path: 'usuarios', select: 'nome' },
        ],
        sort: { createdAt: 1 },
    };

    return await this.reservaModel.paginate(query, options);
  }

  async criar(dadosReserva) {
    return await this.reservaModel.create(dadosReserva);
  }

  async atualizar(id, dadosReserva) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: 400,
        errorType: 'invalidData',
        field: 'id',
        customMessage: `ID inválido: ${id}`,
      });
    }
    const reserva = await this.reservaModel.findByIdAndUpdate(id, dadosReserva, { new: true });
    if (!reserva) {
      throw new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Reserva',
        customMessage: 'Reserva não encontrada.',
      });
    }
    return reserva;
  }

  async buscarPorID(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError({
        statusCode: 400,
        errorType: 'invalidData',
        field: 'id',
        customMessage: `ID inválido: ${id}`,
        });
    }

    const reserva = await this.reservaModel
        .findById(id)
        .populate('equipamentos', 'equiNome')
        .populate('usuarios', 'nome')
        .lean()
        .exec();

    if (!reserva) {
        throw new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Reserva',
        details: [],
        customMessage: 'Reserva não encontrada.',
        });
    }

    return reserva;
  }

  async findReservasAtrasadas(equipamentoId, currentDate) {
    if (!mongoose.Types.ObjectId.isValid(equipamentoId)) {
        throw new CustomError({
        statusCode: 400,
        errorType: 'invalidData',
        field: 'id',
        customMessage: `ID inválido: ${equipamentoId}`,
        });
    }

    const equipamentoObjectId = new mongoose.Types.ObjectId(equipamentoId);
    return await this.reservaModel.find({
        equipamentos: equipamentoObjectId,
        statusReserva: { $in: ['pendente', 'confirmada', 'atrasada'] },
        dataFinalAtrasada: { $lt: currentDate, $ne: null },
    });
  }

  async findReservasSobrepostas(equipamentoId, dataInicial, dataFinal) {
    const equipamentoObjectId = new mongoose.Types.ObjectId(equipamentoId);
    return await this.reservaModel.find({
      equipamentos: equipamentoObjectId,
      statusReserva: { $in: ['pendente', 'confirmada'] },
      $or: [
        { dataInicial: { $lte: dataFinal }, dataFinal: { $gte: dataInicial } },
        { dataInicial: { $lte: dataFinal }, dataFinalAtrasada: { $gte: dataInicial } },
        { dataFinalAtrasada: { $gte: dataInicial, $lte: dataFinal } },
      ],
    });
  }

  async findReservasParaMarcarAtrasada(currentDate) {
    return await this.reservaModel.find({
      statusReserva: { $in: ['pendente', 'confirmada'] },
      dataFinal: { $lt: currentDate },
      dataFinalAtrasada: { $exists: false },
    });
  }

  async marcarReservasComoAtrasadas(reservaIds) {
    return await this.reservaModel.updateMany(
      { _id: { $in: reservaIds } },
      { $set: { statusReserva: 'atrasada' } }
    );
  }
}

export default ReservaRepository;