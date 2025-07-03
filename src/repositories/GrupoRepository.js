import Grupo from '../models/Grupo.js';
import Usuario from '../models/Usuario.js';
import { CustomError, messages } from '../utils/helpers/index.js';
import GrupoFilterBuilder from './filters/GrupoFilterBuilder.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';

class GrupoRepository {
    constructor({
        grupoModel = Grupo,
        usuarioModel = Usuario,
    } = {}) {
        this.model = grupoModel;
        this.usuarioModel = usuarioModel;

    }

    /**
     * Lista grupos com filtros e paginação
     * @param {Object} req - Objeto de requisição
     * @returns {Object} - Resultado paginado
     */
    async listar(req) {
        const { id } = req.params || {};
        
        // Se foi fornecido um ID, busca apenas esse grupo
        if (id) {
            const grupo = await this.model.findById(id).lean();
            if (!grupo) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Grupo',
                    details: [],
                    customMessage: 'Grupo não encontrado'
                });
            }
            return grupo;
        }

        // Construir filtros baseados nas queries
        const { nome, descricao, ativo = 'true', page = 1 } = req.query;

            // Garantir que o limite não ultrapasse 100
            const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);


        const limit = Math.min(parseInt(req.query.limite) || 10, 100);

        const filterBuilder = new GrupoFilterBuilder()
        .comNome(nome || '')
        .comDescricao(descricao || '')
        .comAtivo(ativo || '')

        const filtros = filterBuilder.build()
        const options = {
            page,
            limit,
            sort: { data_criacao: -1 },
            lean: true
        };

        return await this.model.paginate(filtros, options);
    }

    
    async buscarPorNome(nome, idIgnorado = null) {
        const filtro = { nome: { $regex: `^${nome}$`, $options: 'i' } };
        
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }

        return await this.model.findOne(filtro).lean();
    }

    async criar(dadosGrupo) {
        const grupo = new this.model(dadosGrupo);
        return await grupo.save();
    }

    async atualizar(id, dadosAtualizacao) {
        const grupo = await this.model.findByIdAndUpdate(
            id,
            dadosAtualizacao,
            { new: true, runValidators: true }
        );

        if (!grupo) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado'
            });
        }

        return grupo;
    }

    async deletar(id) {
        // Verificar se há usuários associados ao grupo
        const usuarioAssociado = await this.usuarioModel.findOne({ grupos: id }).lean();
        if (usuarioAssociado) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'grupo',
                details: [],
                customMessage: 'Não é possível deletar o grupo pois há usuários associados a ele'
            });
        }

        const resultado = await this.model.findByIdAndDelete(id);
        if (!resultado) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado'
            });
        }

        return true;
    }

    async buscarPorId(id) {
        const grupo = await this.model.findById(id).lean();
        if (!grupo) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado'
            });
        }
        return grupo;
    }
        async verificarUsuariosAssociados(id) {
        try {
            const usuariosAssociados = await this.usuarioModel.findOne({ grupos: id });
            return usuariosAssociados; // Retorna true se houver usuários, false caso contrário
        } catch (error) {
            console.error('Erro ao verificar usuários associados:', error);
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.internalServerError('Grupo')
            });
        }
    }

}

export default GrupoRepository;
