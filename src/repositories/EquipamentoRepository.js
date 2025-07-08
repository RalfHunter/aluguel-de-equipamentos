import EquipamentoModel from '../models/Equipamento.js';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class EquipamentoRepository {
  constructor({ equipamentoModel = EquipamentoModel } = {}) {
    this.model = equipamentoModel;
  }

  async listar(query, pagina, limite) {
    const options = {
      page: pagina,
      limit: limite,
      sort: { equiNome: 1 },
      populate: [
        {
          path: 'equiAvaliacoes',
          populate: {
            path: 'usuarios',
            select: 'nome',
          },
        },
        {
          path: 'equiUsuario',
          select: 'nome',
        },
      ],
    };
    return await this.model.paginate(query, options);
  }

  async listarPorId(id) {
    return await this.model.findById(id);
  }

  async listarPendentes(pagina = 1, limite = 10) {
    const options = {
      page: pagina,
      limit: limite,
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'equiAvaliacoes',
          populate: {
            path: 'usuarios',
            select: 'nome',
          },
        },
        {
          path: 'equiUsuario',
          select: 'nome',
        },
      ],
    };
    return await this.model.paginate({ equiStatus: 'pendente' }, options);
  }

  async criar(dadosEquipamentos) {
    const novoEquipamento = new this.model(dadosEquipamentos);
    return await novoEquipamento.save();
  }

  async atualizar(id, dados) {
    return await this.model.findByIdAndUpdate(id, dados, { new: true });
  }

  async excluir(id) {
    const resultado = await this.model.deleteOne({ _id: id });
    if (resultado.deletedCount === 0) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        customMessage: 'Equipamento não encontrado para exclusão.',
      });
    }
    return resultado;
  }
}

export default EquipamentoRepository;