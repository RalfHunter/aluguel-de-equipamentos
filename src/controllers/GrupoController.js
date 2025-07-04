import GrupoService from '../services/GrupoService.js';
import { CommonResponse } from '../utils/helpers/index.js';
import { GrupoSchema, GrupoUpdateSchema } from '../utils/validators/schemas/zod/GrupoSchema.js';
import { GrupoIdSchema, GrupoQuerySchema } from '../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';

class GrupoController {
    constructor() {
        this.service = new GrupoService();
        this
    }

    /**
     * Lista grupos com filtros e paginação
     */
    async listar(req, res) {
        console.log('Estou no listar em GrupoController');

        const { id } = req.params || {};
        
        // Validar ID se fornecido
        if (id) {
            GrupoIdSchema.parse(id);
        }

        // Validar query params se fornecidos
        const query = req.query || {};
        if (Object.keys(query).length > 0) {
            GrupoQuerySchema.parse(query);
        }

        const data = await this.service.listar(req);
        const message = id ? 'Grupo encontrado com sucesso' : 'Grupos listados com sucesso';
        
        return CommonResponse.success(res, data, 200, message);
    }

    /**
     * Cria um novo grupo
     */
    async criar(req, res) {
           console.log('Estou no criar em GrupoController');

        // Validação dos dados de entrada usando Zod (estrutural)
        const parsedData = GrupoSchema.parse(req.body);

        const data = await this.service.criar(parsedData);

        // Se chegou até aqui, é porque deu tudo certo, retornar 201 Created 
        return CommonResponse.success(res, data, 201, 'Grupo criado com sucesso');
    }

    /**
     * Atualiza um grupo
     */
    async atualizar(req, res) {
        console.log('Estou no atualizar em GrupoController');

        //1ª Validação estrutural - validação do ID passado por parâmetro
        const { id } = req.params || null;
        GrupoIdSchema.parse(id)

        // Validação dos dados de entrada usando Zod (estrutural)
        const parsedData = GrupoUpdateSchema.parse(req.body);

        // Chama o serviço para atualizar o grupo
        const data = await this.service.atualizar(id, parsedData);

        // Se chegou até aqui, é porque deu tudo certo, retornar 200 OK
        return CommonResponse.success(res, data);
    }


    /**
     * Deleta um grupo
     */
    async deletar(req, res) {
        console.log('Estou no deletar em GrupoController');
    
        // Validação estrutural - validação do ID passado por parâmetro
        const { id } = req.params || null;
        if (!id) {
            throw new CustomError('ID do grupo é obrigatório para deletar.', HttpStatusCodes.BAD_REQUEST);
        }
    
        // Chama o serviço para deletar o grupo
        const data = await this.service.deletar(id);
    
        // Se chegou até aqui, é porque deu tudo certo, retornar 200 OK
        return CommonResponse.success(res, data, 200, 'Grupo excluído com sucesso.');

    }
     async verificarUsuariosAssociados(id) {
        try {
            const usuariosAssociados = await this.usuarioModel.findOne({ grupos: id });
            return usuariosAssociados; // Retorna true se houver usuários, false caso contrário
        } catch (error) {
            console.error('Erro ao verificar usuários associados:', error);
            throw new this.customError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.internalServerError('Grupo')
            });
        }
    }
}

export default GrupoController;
