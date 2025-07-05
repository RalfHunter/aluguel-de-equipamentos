import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Grupo from './Grupo.js';

class Usuario {
    constructor(){
        const usuarioSchema = new mongoose.Schema({
            nome: {type: String, required:true},
            email:{type:String, required:true, unique:true},
            telefone:{type:String, required:true, unique:true},
            senha:{type:String, required:true, select:false},
            dataNascimento:{type:Date, required: true},
            CPF:{type:String, required:true, unique:true},
            notaMediaAvaliacao:{type:Number},
            ativo: {type: Boolean, required: true},
            fotoUsuario:{type:String},
            tokenUnico:{type: String, select:false},
            accessToken:{type:String, required: false, select:false},
            refreshToken:{type:String, required: false, select:false},
            codigo_recupera_senha:{type:String, select:false},
            exp_codigo_recupera_senha:{type:String, select:false},
            grupos:[{
                type: mongoose.Schema.Types.ObjectId,
                ref:'grupos'
            }]
        })
        usuarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('usuarios', usuarioSchema);
    }
}

export default new Usuario().model
