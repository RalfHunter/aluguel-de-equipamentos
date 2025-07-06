// import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CustomError from '../utils/helpers/CustomError.js';
import messages from '../utils/helpers/messages.js';
import TokenUtil from '../utils/TokenUtil.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import AuthHelper from '../utils/AuthHelper.js';
import { UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import sizeOf from 'image-size';
// Configuração para ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository()
    }
    async listar(req) {
        // console.log("Estou no listar em Usuario")
        const data = await this.repository.listar(req)
        // console.log("Estou retornando os dados em UsuarioService")
        return data
    }
    async updateUsuario(id, parseData) {
        // console.log("Estou no updateUsuario Service")
        await this.repository.buscarPorEmail(parseData.email, id)
        await this.repository.buscarPorTelefone(parseData.telefone, id)
        const data = await this.repository.updateUsuario(id, parseData)
        return data
    }

    async cadastrarUsuario(body) {
        await this.repository.buscarPorCpf(body.CPF)
        await this.repository.buscarPorEmail(body.email)
        await this.repository.buscarPorTelefone(body.telefone)
        const user = await this.repository.verificaGrupos(body)
        const data = await this.repository.cadastrarUsuario(user)
        return data
    }
    async alterarStatus(id, parseData, req) {
        if(req.user_id == id){
            throw new CustomError({
                statusCode: 403,
                errorType: "unauthorized",
                details: [],
                customMessage: "Não pode alterar o status de si mesmo."
            })
        }
        const user = await this.repository.buscarPorId(id)
        let permissao = false
        for (const grupo of user.grupos){
            permissao = grupo.nivelPermissao <= req.nivelPermissao
            if(permissao){
                break
            }
        }
        console.log(permissao)
        if (permissao) {
            throw new CustomError({
                statusCode: 403,
                errorType: "unauthorized",
                details: [],
                customMessage: messages.error.unauthorized("Permissão")
            })
        }
        const data = await this.repository.alterarStatus(id, parseData)
        return data
    }
    
    async processarFoto(userId, file) {
    // 1) valida extensão
    const ext = path.extname(file.name).slice(1).toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'svg'];
    if (!validExts.includes(ext)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'file',
        details: [],
        customMessage: 'Extensão de arquivo inválida. Permitido: jpg, jpeg, png, svg.',
      });
    }

    // 2) valida tamanho (max 50MB)
    const MAX_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'validationError',
        field: 'file',
        details: [],
        customMessage: `Arquivo não pode exceder ${MAX_BYTES / (1024 * 1024)} MB.`,
      });
    }

    // 3) prepara paths
    // const fileName = `${uuidv4()}.${ext}`;
    const fileName = `${userId}.${ext}`;
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'usuarios');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const uploadPath = path.join(uploadsDir, fileName);

    // 4) redimensiona/comprime
    const transformer = sharp(file.data)
      .resize(400, 400, { fit: sharp.fit.cover, position: sharp.strategy.entropy });
    if (['jpg', 'jpeg'].includes(ext)) {
      transformer.jpeg({ quality: 80 });
    }
    const buffer = await transformer.toBuffer();
    if(fs.existsSync(uploadPath)){
      fs.unlinkSync(uploadPath)
    }
    await fs.promises.writeFile(uploadPath, buffer);

    // 5) atualiza usuário no banco
    const dados = { fotoUsuario: fileName };
    UsuarioUpdateSchema.parse(dados);
    await this.updateUsuario(userId, dados);

    // 6) retorna metadados adicionais
    return {
      fileName,
      metadata: {
        fileExtension: ext,
        fileSize: file.size,
        md5: file.md5, // vem do express-fileupload
      },
    };
  }
  async validarFoto(){
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;

    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true; // JPEG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true; // PNG
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return true; // RIFF

    return false;
  }
  async obterDimensoesFoto(caminhoArquivo) {
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
    async _processarImagemParaFoto(file, req) {
    await this._validarArquivoImagem(file);

    const dimensoes = this._obterDimensoesImagem(file.path);
    const tamanhoMb = +(file.size / (1024 * 1024)).toFixed(2);

    return {
      url: `${req.protocol}://${req.get('host')}/uploads/equipamentos/${file.filename}`,
      largura: dimensoes.width,
      altura: dimensoes.height,
      tamanhoMb,
    };
  }

}
export default UsuarioService