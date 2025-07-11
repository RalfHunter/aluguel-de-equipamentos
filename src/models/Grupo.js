import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

class Grupo {
    constructor() {
        const grupoSchema = new mongoose.Schema(
            {
                nome: { 
                    type: String, 
                    required: true,
                    unique: true,
                    index: true,
                    trim: true
                },
                descricao: { 
                    type: String, 
                    required: true 
                },
                ativo: { 
                    type: Boolean, 
                    default: true 
                },
                /**
                 * Permissões personalizadas para cada rota do sistema
                 * Cada permissão define o que o grupo pode fazer em uma rota específica
                 */
                nivelPermissao:{
                    type:Number, 
                    required: true
                },
                permissoes: [
                    {
                        rota: { 
                            type: String, 
                            required: true,
                            index: true,
                            trim: true,
                            lowercase: true
                        }, // produtos, usuarios, fornecedores, etc
                        ativo: { 
                            type: Boolean, 
                            default: true 
                        },
                        // Permissões CRUD mapeadas para métodos HTTP
                        buscar: { 
                            type: Boolean, 
                            default: false 
                        },    // GET
                        enviar: { 
                            type: Boolean, 
                            default: false 
                        },   // POST
                        substituir: { 
                            type: Boolean, 
                            default: false 
                        },    // PUT
                        modificar: { 
                            type: Boolean, 
                            default: false 
                        },  // PATCH
                        excluir: { 
                            type: Boolean, 
                            default: false 
                        }, // DELETE
                    }
                ],
            },
            {
                timestamps: {
                    createdAt: "data_criacao",
                    updatedAt: "data_atualizacao",
                },
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rotas sejam únicas dentro do grupo
        grupoSchema.pre('save', function (next) {
            const permissoes = this.permissoes;
            const rotas = permissoes.map(p => p.rota);
            const setRotas = new Set(rotas);

            if (rotas.length !== setRotas.size) {
                return next(new Error('Permissões duplicadas encontradas: cada rota deve ser única dentro de cada grupo.'));
            }

            next();
        });

        // Hook para garantir que o campo 'rota' está em minúsculas antes de salvar
        grupoSchema.pre('save', function (next) {
            if (this.permissoes && this.permissoes.length > 0) {
                this.permissoes.forEach(permissao => {
                    if (permissao.rota) {
                        permissao.rota = permissao.rota.toLowerCase();
                    }
                });
            }
            next();
        });

        grupoSchema.plugin(mongoosePaginate);

        this.model = mongoose.model('grupos', grupoSchema);
    }
}

export default new Grupo().model;
