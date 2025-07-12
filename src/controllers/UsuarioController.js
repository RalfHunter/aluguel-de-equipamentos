import { CommonResponse } from '../utils/helpers/index.js';
import UsuarioService from '../services/UsuarioService.js';
import { UsuarioIdSchema, UsuarioQuerySchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import { CustomError } from '../utils/helpers/index.js';
import { HttpStatusCodes } from '../utils/helpers/index.js';
import path from 'path';
import fs from 'fs';
import sizeOf from 'image-size';


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

class UsuarioController {
    constructor() {
        this.service = new UsuarioService()
    }
    async listar(req, res) {
        // console.log("Estou no listar Controller")

        const { id } = req.params || {}

        if (id) {
            // console.log("Um id foi passado como parametro")
            UsuarioIdSchema.parse(id)
        }

        const query = req.query || {}

        if (Object.keys(query).length !== 0) {
            // console.log("Um array de objetos foi passado")
            UsuarioQuerySchema.parseAsync(query)
        }
        const data = await this.service.listar(req)
        return CommonResponse.success(res, data)
    }
    async cadastrarUsuario(req, res) {
        // console.log("Estou no cadastrarUsuario")
        await UsuarioSchema.parseAsync(req.body)
        const data = await this.service.cadastrarUsuario(req.body)

        return CommonResponse.success(res, data, 201, 'Usuário criado com sucesso!')
    }
    async alterarStatus(req, res) {
        const { id } = req.params || {}
        UsuarioIdSchema.parse(id)
        const parseData = await UsuarioUpdateSchema.parseAsync(req.body)
        const data = await this.service.alterarStatus(id, parseData, req)
        return CommonResponse.success(res, data, 200, `Status alterado com sucesso para ${parseData.ativo}`)
    }
    async criarComSenha(req, res) {
        console.log('Estou no criar em UsuarioController');

        // valida os dados
        const parsedData = UsuarioSchema.parse(req.body);
        let data = await this.service.cadastrarUsuario(parsedData);

        // Converte o documento Mongoose para um objeto simples

        return CommonResponse.created(res, data);

    }

    _validarHeaderImagem(buffer) {
        if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;

        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true; // JPEG
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true; // PNG

        return false;
    }

    // Função auxiliar para validar arquivo de imagem
    _validarArquivoImagem(file) {
        if (!file.mimetype.startsWith('image/')) {
            throw new Error(`Arquivo ${file.originalname} não é uma imagem válida.`);
        }

        if (!file.path || file.size === 0) {
            throw new Error(`Arquivo ${file.originalname} está vazio ou corrompido.`);
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error(`Arquivo ${file.originalname} excede o tamanho máximo de 5MB.`);
        }
    }

    // Função auxiliar para obter dimensões da imagem
    _obterDimensoesImagem(caminhoArquivo) {
        if (!fs.existsSync(caminhoArquivo)) {
            throw new Error('Arquivo não encontrado');
        }

        const stats = fs.statSync(caminhoArquivo);
        if (stats.size === 0) {
            throw new Error('Arquivo está vazio');
        }

        const buffer = fs.readFileSync(caminhoArquivo);

        if (!this._validarHeaderImagem(buffer)) {
            throw new Error('Arquivo não é uma imagem válida');
        }

        const dimensoes = sizeOf(buffer);

        if (!dimensoes?.width || !dimensoes?.height) {
            throw new Error('Não foi possível obter dimensões válidas');
        }

        return dimensoes;
    }

    // Função para processar imagem para foto do usuário
    _processarImagemParaFoto(file, req) {
        this._validarArquivoImagem(file);

        const dimensoes = this._obterDimensoesImagem(file.path);
        const tamanhoMb = +(file.size / (1024 * 1024)).toFixed(2);

        return {
            url: `${req.protocol}://${req.get('host')}/uploads/usuarios/${file.filename}`,
            largura: dimensoes.width,
            altura: dimensoes.height,
            tamanhoMb,
            nomeOriginal: file.originalname
        };
    }

    async fotoUpload(req, res, next) {
        try {
            console.log('Estou no fotoUpload em UsuarioController');

            const { id } = req.params;
            UsuarioIdSchema.parse(id);

            const file = req.file; // multer.single('file') usa req.file

            if (!file) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'file',
                    details: [],
                    customMessage: 'Nenhum arquivo foi enviado.'
                });
            }

            // Processar a imagem e obter metadados
            
            const fotoProcessada = this._processarImagemParaFoto(file, req);

            // Atualizar usuário no banco com a nova foto
            const resultado = await this.service.atualizarFotoUsuario(id, file.filename, fotoProcessada);

            return CommonResponse.success(res, {
                message: 'Foto atualizada com sucesso.',
                dados: resultado,
                metadados: fotoProcessada
            });

        } catch (error) {
            console.error('Erro no fotoUpload:', error);
            return next(error);
        }
    }

    async getFoto(req, res) {
        const { id } = req.params || {}
        UsuarioIdSchema.parse(id)

        const data = await this.service.getFoto(id)
        const partes = data.split("/")
        const nomeArquivo = partes.pop()
        const caminhoPasta = path.resolve(...partes)
        const extensao = nomeArquivo.split(".")
        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            svg: 'image/svg+xml'
        }
        const contentType = mimeTypes[extensao[extensao.length - 1]] || 'application/octet-stream'
        res.setHeader('Content-Type', contentType);
        return res.sendFile(nomeArquivo, {
            root: caminhoPasta
        });
    }
    async deletarUsuario(req, res){
        const {id} = req.params || {}
        UsuarioIdSchema.parse(id)

        const data = await this.service.deletarUsuario(req, id)

        return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
    }
    async removerFoto(req, res){
            const {id} = req.params || {}
            UsuarioIdSchema.parse(id)
            const data = await this.service.removerFoto(id)
            return CommonResponse.success(res, data, 200, 'Foto deletada com sucesso.')
        }
    async getPerfil(req, res){
        const id = req.user_id
        UsuarioIdSchema.parse(id)
        const data = await this.service.getPerfil(id)
        return CommonResponse.success(res, data, 200)
    }
    async updatePerfil(req, res){
        const id = req.user_id
        UsuarioIdSchema.parse(id)
        UsuarioUpdateSchema.parse(req.body)
        const data = await this.service.updateUsuario(id, req.body)
        return CommonResponse.success(res, data, 200)
    }
}

export default UsuarioController;