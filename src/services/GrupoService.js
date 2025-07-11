import GrupoRepository from '../repositories/GrupoRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class GrupoService {
    constructor() {
        this.repository = new GrupoRepository();
        this.usuarioRepository = new UsuarioRepository()
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
        const { nivelPermissao } = parsedData
        if (nivelPermissao <= 0) {
            throw new CustomError({
                statusCode: 400, // Código HTTP apropriado para erro de validação
                errorType: "validationError", // Tipo de erro indicando validação
                field: "nivelPermissao", // Campo que causou o erro
                details: [
                    {
                        path: "nivelPermissao",
                        message: "O nível de permissão deve ser maior que zero.",
                    },
                ],
                customMessage: "Não é permitido criar um grupo com nível de permissão menor ou igual a zero.",
            });
        }
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

    async deletar(req, id) {
        // Verificar se o grupo existe
        console.log('Estou no deletar em GrupoService');

        // Verificar se o grupo existe
        await this.ensureGroupExists(id);

        const usuarioAdmin = await this.usuarioRepository.buscarPorId(req.user_id)
        if (!usuarioAdmin) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuario'),
            });
        }

        let pertenceAoGrupo = usuarioAdmin.grupos.some((grupo) =>
             grupo._id.toString() === id.toString())
        if (pertenceAoGrupo) {
            throw new CustomError({
                statusCode: 403,
                errorType: "unauthorized",
                details: [],
                customMessage: "Admin não pode deletar o grupo ao qual pertence"
            })
        }

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