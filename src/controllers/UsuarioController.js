import { CommonResponse } from '../utils/helpers/index.js';
import UsuarioService from '../services/UsuarioService.js';
import { UsuarioIdSchema, UsuarioQuerySchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import fileUpload from 'express-fileupload';
import { CustomError } from '../utils/helpers/index.js';
import { HttpStatusCodes } from '../utils/helpers/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
import TokenUtil from '../utils/TokenUtil.js';
import multer from 'multer';

class UsuarioController {
    constructor(){
        this.service = new UsuarioService()
    }
    async listar(req, res){
        // console.log("Estou no listar Controller")

        const { id } = req.params|| {}
    
        if(id) {
            // console.log("Um id foi passado como parametro")
            UsuarioIdSchema.parse(id)
        }

        const query = req.query || {}

        if(Object.keys(query).length !== 0){
            // console.log("Um array de objetos foi passado")
            UsuarioQuerySchema.parseAsync(query)
        }
        const data = await this.service.listar(req)
        return CommonResponse.success(res, data)
    }
    async updateUsuario(req, res){
        // console.log("Estou no updateUsuario Controller")

        // const {id} = req.params || {}
        const id = req.user_id
        const camposPermitidos = ['nome', 'email','telefone']; // Defina os campos que podem ser alterados
        const dadosRecebidos = req.body;
    
    // Filtrar apenas os campos permitidos
        const dadosFiltrados = Object.keys(dadosRecebidos)
        .filter(chave => camposPermitidos.includes(chave))
        .reduce((obj, chave) => {
            obj[chave] = dadosRecebidos[chave];
            return obj;
        }, {});
        UsuarioIdSchema.parse(id)
        // console.log(dadosFiltrados)
        await UsuarioUpdateSchema.parseAsync(req.body)
        // console.log("BODY:", parseData)
        const data = await this.service.updateUsuario(id, dadosFiltrados)
        return CommonResponse.success(res, data, 200, 'Usuário atualizado com sucesso!')
    }
    async cadastrarUsuario(req, res){
        // console.log("Estou no cadastrarUsuario")
        await UsuarioSchema.parseAsync(req.body)
        const data = await this.service.cadastrarUsuario(req.body)
        
        return CommonResponse.success(res, data, 201, 'Usuário criado com sucesso!')
    }
    async alterarStatus(req, res){
        const {id} = req.params || {}
        UsuarioIdSchema.parse(id)
        const parseData = await UsuarioUpdateSchema.parseAsync(req.body)
        const data = await this.service.alterarStatus(id, parseData, req)
        return CommonResponse.success(res, data, 200, `Status alterado com sucesso para ${parseData.ativo}`)
    }
    async criarComSenha(req, res){
         console.log('Estou no criar em UsuarioController');

        // valida os dados
        const parsedData = UsuarioSchema.parse(req.body);
        let data = await this.service.cadastrarUsuario(parsedData);

        // Converte o documento Mongoose para um objeto simples
        let usuarioLimpo = data.toObject();

        return CommonResponse.created(res, usuarioLimpo);

    }
        async fotoUpload(req, res, next) {
        try {
            console.log('Estou no fotoUpload em UsuarioController');

            const { id } = req.params;
            const file = req.files?.file;
            if (!file) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'file',
                    details: [],
                    customMessage: 'Nenhum arquivo foi enviado.'
                });
            }
            console.log("CHEGAMOS")
            // delega toda a lógica de validação e processamento ao service
            const { fileName, metadata } = await this.service.processarFoto(id, file);

            return CommonResponse.success(res, {
                message: 'Arquivo recebido e usuário atualizado com sucesso.',
                dados: { link_foto: fileName },
                metadados: metadata
            });
        } catch (error) {
            console.error('Erro no fotoUpload:', error);
            return next(error);
        }
    }
     async getFoto(req, res, next) {
        try {
            console.log('Estou no getFoto em UsuarioController');

            const { id } = req.params || {};
            UsuarioIdSchema.parse(id);

            const usuario = await this.service.listar(req);
            const { link_foto } = usuario;

            if (!link_foto) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'notFound',
                    field: 'link_foto',
                    details: [],
                    customMessage: 'Foto do usuário não encontrada.'
                });
            }

            const filename = link_foto;
            const uploadsDir = path.join(getDirname(), '..', '../uploads/users');
            const filePath = path.join(uploadsDir, filename);

            const extensao = path.extname(filename).slice(1).toLowerCase();
            const mimeTypes = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                svg: 'image/svg+xml'
            };
            const contentType = mimeTypes[extensao] || 'application/octet-stream';

            res.setHeader('Content-Type', contentType);
            return res.sendFile(filePath);
        } catch (error) {
            console.error('Erro no getFoto:', error);
            return next(error);
        }
    }

}

export default UsuarioController;