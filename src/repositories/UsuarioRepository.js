import { populate } from "dotenv"
import UsuarioModel from "../models/Usuario.js"
// import AvaliacaoModel from "../models/Avaliacao.js"
import CustomError from "../utils/helpers/CustomError.js"
import messages from "../utils/helpers/messages.js"
import UsuarioFilterBuilder from "./filters/UsuarioFilterBuilder.js"
import bcrypt from 'bcrypt'
import Grupo from "../models/Grupo.js"
import Usuario from "../models/Usuario.js"
import { UsuarioIdSchema } from "../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js"

class UsuarioRepository {
    constructor({
        usuarioModel = UsuarioModel
    } = {}) {
        this.model = usuarioModel
    }
    async listar(req) {
        // console.log("Estou no listar em UsuarioRepository")
        const id = req.params.id || null
        if (id) {
            const data = await this.model.findById(id)
            return data
        }
        // TODO: Fazer opções de consulta com filtros
        const { nome, email, ativo, page = 1, grupo } = req.query
        const limite = Math.min(parseInt(req.query.limit, 10) || 10, 100);
        const filterBuilder = new UsuarioFilterBuilder()
            .comNome(nome, '')
            .comEmail(email, '')
            .comAtivo(ativo, '')
        if (grupo) {
            await filterBuilder.comGrupo(grupo)
        }

        let filtros = filterBuilder.build()
        const options = {
            page: parseInt(page),
            limit: parseInt(limite),
            populate: [
                {
                    path: 'grupos'
                }
            ],
            sort: { nome: 1 }
        }
        // console.log("Filtros",filtros)
        const data = await this.model.paginate(filtros, options)
        // console.log(data)
        return data

    }
    async updateUsuario(id, parseData) {
        // console.log("Estou no updateUsuario em UsuarioRepository")


        const usuarioAtualizado = await this.model.findByIdAndUpdate(id, { $set: parseData }, { new: true })
        if (!usuarioAtualizado) {
            throw new CustomError({
                statusCode: 404,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Usuário")
            })
        }
        return usuarioAtualizado

    }
    async buscarPorId(id, includeTokens = false) {
        console.log("SERVICE", id)
        // console.log("Estou no bucarPorId no UsuarioRepository")
        let query = this.model.findById(id).populate('grupos')
        if (includeTokens) {
            console.log(includeTokens)
            query.select('+refreshToken +accessToken +CPF')
        }
        const user = await query
        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Usuário")
            })
        }
        return user
    }
    async buscarPorEmail(email, idIgnorado = null) {
        // console.log("Estou na buscarPorEmail Repository")
        const documento = await this.model.findOne({ email: email, _id: { $ne: idIgnorado } })

        // console.log("Pesquisa conluida com sucesso")
        if (documento) {
            console.log(idIgnorado)
            console.log("ESTE É O DOCUMENTO", documento)
            throw new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "Email")

            })
        }
    }
    async buscarPorEmailCadastrado(email) {
        const documento = await this.model.findOne({ email: email }, '+senha')
        // console.log(documento.senha)
        return documento
    }
    async buscarPorTelefone(telefone, id = null) {
        // console.log("Estou no buscarPorTelefone no UsuarioRepository")
        const documento = await this.model.findOne({ telefone: telefone, _id: { $ne: id } }, '+senha')
        // console.log("Pesquisa conluida com sucesso")
        // console.log("Telefone encontrado:",documento)
        if (documento) {
            throw new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "Telefone")

            })
        }
    }
    async buscarPorCpf(cpf, id = null) {
        // console.log("Estou no buscarPorCpf no UsuarioRepository")
        const documento = await this.model.findOne({ CPF: cpf, _id: { $ne: id } })
        // console.log(documento)
        if (documento) {
            throw new CustomError({
                statusCode: 409,
                errorType: "Conflict",
                details: [],
                customMessage: messages.error.resourceConflict("Usuário", "CPF")

            })
        }
    }
    async cadastrarUsuario(body) {
        body.senha = await bcrypt.hash(body.senha, 8)
        const data = await this.model.create(body)
        const dataObjeto = data.toObject()
        delete dataObjeto.senha
        return dataObjeto
    }
    async alterarStatus(id, parseData) {

        const documento = await this.model.findByIdAndUpdate(id, { $set: parseData })
        return documento
    }
    async buscarPorCodigoRecuperacao(codigo) {
        console.log('Estou no buscarPorPorCodigoRecuperacao em UsuarioRepository');
        const filtro = { codigo_recupera_senha: codigo };
        const documento = await this.model.findOne(filtro, ['+senha', '+codigo_recupera_senha', '+exp_codigo_recupera_senha'])
        return documento;
    }
    async atualizar(id, parsedData) {
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true })
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return usuario;
    }
    async verificaGrupos(body) {
        let grupos = body.grupos
        if (!grupos || grupos.length === 0) {
            const grupoPadrao = await Grupo.findOne().sort({ nivelPermissao: -1 })
            if (!grupoPadrao) {
                throw new Error("Nenhum grupo encontrado para atribuição automática.");
            }
            grupos = [grupoPadrao._id]
        }
        const novoUsuario = new Usuario({
            ...body,
            grupos
        })
        return novoUsuario
    }
    async deletarUsuario(id) {
        const usuario = await this.model.findByIdAndDelete(id);
        return usuario;
    }
    async armazenarTokens(id, accesstoken, refreshtoken) {
        const documento = await this.model.findById(id);
        if (!documento) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        documento.accessToken = accesstoken;
        documento.refreshToken = refreshtoken;
        const data = await documento.save();
        return data;
    }

    /**
     * Atualizar usuário removendo accesstoken e refreshtoken
     */
    async removeToken(id) {
        // Criar objeto com os campos a serem atualizados
        const parsedData = {
            accessToken: null,
            refreshToken: null
        };
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true }).exec();

        // Validar se o usuário atualizado foi retornado
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return usuario;
    }
    async atualizarSenha(id, senha) {
        const usuario = await this.model.findByIdAndUpdate(
            id,
            {
                // atualiza a senha
                $set: { senha: senha },
                // remove os campos de código de recuperação e token único
                $unset: {
                    tokenUnico: "",
                    exp_tokenUnico_recuperacao: ""
                }
            },
            { new: true } // Retorna o documento atualizado
        ).exec();

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return usuario;
    }
    async alterar(id, parsedData) {
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true })

        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return usuario;
    }
    async atualizarSenha(id, senha) {
        const usuario = await this.model.findByIdAndUpdate(
            id,
            {
                // atualiza a senha
                $set: { senha: senha },
                // remove os campos de código de recuperação e token único
                $unset: {
                    tokenUnico: "",
                    exp_tokenUnico_recuperacao: ""
                }
            },
            { new: true } // Retorna o documento atualizado
        ).exec();

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return usuario;
    }
    async buscarPorTokenUnico(tokenUnico) {
        const filtro = { tokenUnico };
        const documento = await this.model.findOne(filtro, ['+senha', '+tokenUnico', '+exp_tokenUnico_recuperacao']);
        return documento;
    }

    // PATCH /usuarios/:id
    async alterar(id, parsedData) {
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true })

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return usuario;
    }




}
export default UsuarioRepository