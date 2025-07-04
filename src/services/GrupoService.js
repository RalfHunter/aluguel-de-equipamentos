import GrupoRepository from '../repositories/GrupoRepository.js';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class GrupoService {
    constructor() {
        this.repository = new GrupoRepository();
    }

    async listar(req) {
        console.log('Estou no listar em GrupoService');
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em GrupoService');
        return data;

    }

    async criar(parsedData) {
        // Verificar se já existe um grupo com o mesmo nome
        console.log('Estou no criar em GrupoService');

        // Realiza validações compartilhadas
        await this.validateGroupName(parsedData.nome);
        // await this.validatePermissions(parsedData.permissoes);

        // Chama o repositório para criar o grupo
        const data = await this.repository.criar(parsedData);
        return data;

    }

    async atualizar(id, parsedData) {
        console.log('Estou no atualizar em GrupoService');

        // Garante que o grupo exista
        await this.ensureGroupExists(id);

        // Realiza validações compartilhadas
        await this.validateGroupName(parsedData.nome, id);
        // await this.validatePermissions(parsedData.permissoes);

        // Chama o repositório para atualizar o grupo
        const data = await this.repository.atualizar(id, parsedData);
        return data;


    }

    async deletar(id) {
        // Verificar se o grupo existe
        console.log('Estou no deletar em GrupoService');

        // Verificar se o grupo existe
        await this.ensureGroupExists(id);

        // Verificar se o grupo está associado a algum usuário
        const usuariosAssociados = await this.repository.verificarUsuariosAssociados(id);

        if (usuariosAssociados) {
            throw new CustomError({
                statusCode: 409,
                errorType: 'resourceConflict',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceConflict('Grupo', 'Usuários associados'),
            });
        }

        // Chamar o repositório para deletar o grupo
        return await this.repository.deletar(id);

    }
    async ensureGroupExists(id) {
        const grupoExistente = await this.repository.buscarPorId(id);
        if (!grupoExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceNotFound('Grupo'),
            });
        }
    }
    async validateGroupName(nome, id = null) {
        const grupoExistente = await this.repository.buscarPorNome(nome, id);
        if (grupoExistente) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já está em uso.',
            });
        }
    }
}

export default GrupoService;