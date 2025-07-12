import mongoose from 'mongoose';
import AvaliacaoRepository from '../repositories/AvaliacaoRepository.js';
import CustomError from '../utils/helpers/CustomError.js';
import Usuario from '../models/Usuario.js';

class AvaliacaoService {
    constructor() {
        this.repository = new AvaliacaoRepository();
    }

    async listar(req) {
        const { equipamentoId } = req.query;

        if (!equipamentoId) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'missingData',
                field: 'equipamentoId',
                customMessage: 'O ID do equipamento é obrigatório',
            });
        }

        const data = await this.repository.listar(req);

        if (!data.docs || data.docs.length === 0) {
            return {
                ...data,
                message: 'Nenhuma avaliação encontrada para este equipamento.',
            };
        }

        return data;
    }

    async criar({ nota, descricao, equipamentoId, usuarioId }) {
        if (!mongoose.Types.ObjectId.isValid(usuarioId) || !mongoose.Types.ObjectId.isValid(equipamentoId)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'invalidData',
                field: 'IDs',
                customMessage: 'ID de usuário ou equipamento inválido.',
            });
        }

        if (typeof nota !== 'number' || nota < 1 || nota > 5) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'invalidData',
                field: 'nota',
                customMessage: 'A nota deve ser um número entre 1 e 5.',
            });
        }

        const avaliacaoExistente = await this.repository.verificarSeJaAvaliou(usuarioId, equipamentoId);
        if (avaliacaoExistente) {
            throw new CustomError({
                statusCode: 409,
                errorType: 'conflict',
                field: 'avaliacao',
                customMessage: 'Usuário já avaliou este equipamento.',
            });
        }

        const novaAvaliacao = await this.repository.criar({
            nota,
            descricao,
            equipamentoId,
            usuarioId,
        });

        return novaAvaliacao;
    }

    async atualizar(avaliacaoId, usuarioId, { nota, descricao }) {
        if (!mongoose.Types.ObjectId.isValid(avaliacaoId) || !mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'invalidData',
                field: 'IDs',
                customMessage: 'ID inválido.',
            });
        }

        if (nota !== undefined && (typeof nota !== 'number' || nota < 1 || nota > 5)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'invalidData',
                field: 'nota',
                customMessage: 'A nota deve ser um número entre 1 e 5.',
            });
        }

        const avaliacaoAtualizada = await this.repository.atualizar(avaliacaoId, usuarioId, {
            nota,
            descricao,
        });

        return avaliacaoAtualizada;
    }

    async remover(avaliacaoId, usuarioId) {
        if (!mongoose.Types.ObjectId.isValid(avaliacaoId) || !mongoose.Types.ObjectId.isValid(usuarioId)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'invalidData',
                field: 'IDs',
                customMessage: 'ID inválido.',
            });
        }
    
        // const usuario = await Usuario.findById(usuarioId);
        // if (!usuario) {
        //     throw new CustomError({
        //         statusCode: 403,
        //         errorType: 'unauthorized',
        //         field: 'Usuario',
        //         customMessage: 'Apenas administradores podem remover avaliações.',
        //     });
        // }
    
        const resultado = await this.repository.remover(avaliacaoId, usuarioId);
        return resultado;
    }
}

export default AvaliacaoService;
