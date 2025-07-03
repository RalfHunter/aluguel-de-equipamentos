import GrupoService from '../services/GrupoService.js';
import { CommonResponse } from '../utils/helpers/index.js';
import { GrupoSchema, GrupoUpdateSchema } from '../utils/validators/schemas/zod/GrupoSchema.js';
import { GrupoIdSchema, GrupoQuerySchema } from '../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';

class GrupoController {
    constructor() {
        this.service = new GrupoService();
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

        const { id } = req.params;
        GrupoIdSchema.parse(id);

        // Validação dos dados de entrada
        console.log("Validando")
        const dadosValidados = GrupoUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, dadosValidados);



        return CommonResponse.success(res, data, 200, 'Grupo atualizado com sucesso');
    }

    /**
     * Deleta um grupo
     */
    async deletar(req, res) {
        console.log('Estou no deletar em GrupoController');

        const { id } = req.params;
        GrupoIdSchema.parse(id);

        await this.service.deletar(id);
        
        return CommonResponse.success(res, null, 200, 'Grupo deletado com sucesso');
    }
}

export default GrupoController;
