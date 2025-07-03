import Grupo from '../models/Grupo.js';
import Usuario from '../models/Usuario.js';
import { CustomError, messages } from '../utils/helpers/index.js';

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
        const filtros = {};
        
        if (req.query.nome) {
            filtros.nome = { $regex: req.query.nome, $options: 'i' };
        }
        
        if (req.query.ativo !== undefined) {
            filtros.ativo = req.query.ativo === 'true';
        }

        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limite) || 10, 100);

        const options = {
            page,
            limit,
            sort: { data_criacao: -1 },
            lean: true
        };

        return await this.model.paginate(filtros, options);
    }

    /**
     * Busca grupo por nome
     * @param {String} nome - Nome do grupo
     * @param {String} idIgnorado - ID a ser ignorado na busca (para updates)
     * @returns {Object|null} - Dados do grupo ou null
     */
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

    /**
     * Busca grupo por ID
     * @param {String} id - ID do grupo
     * @returns {Object} - Dados do grupo
     */
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
}

export default GrupoRepository;
