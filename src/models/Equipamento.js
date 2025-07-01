import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class Equipamento {
  constructor() {
    const equipamentoSchema = new mongoose.Schema({
      equiNome: { type: String, required: true },
      equiDescricao: { type: String, required: true },
      equiValorDiaria: { type: Number, required: true },
      equiCategoria: { type: String, required: true },

      equiFotos: {
        type: [{
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          url: { type: String, required: true },
          largura: { type: Number, required: true },
          altura: { type: Number, required: true },
          tamanhoMb: { type: Number, required: true },
        }],
        required: true,
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length > 0,
          message: 'O equipamento deve ter pelo menos uma foto',
        },
      },

      equiQuantidadeDisponivel: { type: Number, required: true },
      equiStatus: { 
        type: String, 
        enum: ['pendente', 'ativo', 'inativo'], 
        default: 'pendente' 
      },
      equiUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
      },
      equiNotaMediaAvaliacao: {
        type: Number,
        default: 0,
      },
      equiAvaliacoes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'avaliacoes',
      }],
    }, {
      timestamps: true,
      versionKey: false,
    });

    equipamentoSchema.plugin(mongoosePaginate);
    this.model = mongoose.model('equipamentos', equipamentoSchema);
  }
}

export default new Equipamento().model;
