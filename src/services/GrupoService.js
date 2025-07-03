import GrupoRepository from '../repositories/GrupoRepository.js';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class GrupoService {
    constructor() {
        this.repository = new GrupoRepository();
    }

    async listar(req) {
        return await this.repository.listar(req);
    }

    async criar(dadosGrupo) {
        // Verificar se já existe um grupo com o mesmo nome
        const grupoExistente = await this.repository.buscarPorNome(dadosGrupo.nome);
        if (grupoExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorType: 'validationError',
                field: 'nome',
                details: [],
                customMessage: 'Já existe um grupo com este nome'
            });
        }

        return await this.repository.criar(dadosGrupo);
    }

    async atualizar(id, dadosAtualizacao) {
        // Verificar se o grupo existe
        await this.repository.buscarPorId(id);
        
        // Se o nome está sendo atualizado, verificar se não existe outro grupo com o mesmo nome
        if (dadosAtualizacao.nome) {
            const grupoExistente = await this.repository.buscarPorNome(dadosAtualizacao.nome, id);
            if (grupoExistente) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.CONFLICT.code,
                    errorType: 'validationError',
                    field: 'nome',
                    details: [],
                    customMessage: 'Já existe um grupo com este nome'
                });
            }
        }

        return await this.repository.atualizar(id, dadosAtualizacao);
    }

    async deletar(id) {
        // Verificar se o grupo existe
        await this.repository.buscarPorId(id);
        
        return await this.repository.deletar(id);
    }
}

export default GrupoService;