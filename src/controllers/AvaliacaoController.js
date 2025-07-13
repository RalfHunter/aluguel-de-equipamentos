import { CommonResponse } from '../utils/helpers/index.js';
import AvaliacaoService from '../services/AvaliacaoService.js';

class AvaliacaoController {
    constructor() {
        this.service = new AvaliacaoService();
    }

    async listar(req, res) {
        const data = await this.service.listar(req);
        return CommonResponse.success(res, data, 200, 'Avaliações listadas com sucesso.');
    }

    async criar(req, res) {
        const usuarioId = req.user?.id || req.query.usuarioId; 
        const equipamentoId = req.query.equipamentoId; 

        console.log('req.user:', req.user);
        console.log('req.query:', req.query);

        const data = await this.service.criar({
            nota: req.body.nota,
            descricao: req.body.descricao,
            equipamentoId,
            usuarioId,
        });

        return CommonResponse.success(res, data, 201, 'Avaliação criada com sucesso.');
    }

    async atualizar(req, res) {
        const avaliacaoId = req.params.id;
        const usuarioId = req.user?.id || req.query.usuarioId;

        console.log('req.params:', req.params);
        console.log('req.user:', req.user);
        console.log('req.query:', req.query);

        const data = await this.service.atualizar(avaliacaoId, usuarioId, {
            nota: req.body.nota,
            descricao: req.body.descricao,
        });

        return CommonResponse.success(res, data, 200, 'Avaliação atualizada com sucesso.');
    }

    async remover(req, res) {
        const avaliacaoId = req.params.id;
        const usuarioId = req.user?.id || req.body.usuarioId || req.query.usuarioId;

        const data = await this.service.remover(avaliacaoId, usuarioId);

        return CommonResponse.success(res, data, 200, 'Avaliação removida com sucesso.');
    }
}

export default AvaliacaoController;
