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
import HttpStatusCodes from '../utils/helpers/HttpStatusCodes.js';
// Configuração para ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const diretorio = 'uploads/usuarios';

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
    if (req.user_id == id) {
      throw new CustomError({
        statusCode: 403,
        errorType: "unauthorized",
        details: [],
        customMessage: "Não pode alterar o status de si mesmo."
      })
    }
    const user = await this.repository.buscarPorId(id)
    let permissao = false
    for (const grupo of user.grupos) {
      permissao = grupo.nivelPermissao <= req.nivelPermissao
      if (permissao) {
        break
      }
    }
    // console.log(permissao)
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

  // ...existing code...


  // ...existing code...

  async atualizarFotoUsuario(userId, nomeArquivo, metadadosFoto) {
    try {
      // Verificar se o usuário existe
      const usuarioExistente = await this.repository.buscarPorId(userId);
      if (!usuarioExistente) {
        throw new CustomError({
          statusCode: HttpStatusCodes.NOT_FOUND.code,
          errorType: 'resourceNotFound',
          field: 'Usuario',
          details: [],
          customMessage: 'Usuário não encontrado.'
        });
      }

      // Criar URL completa da foto
      const urlCompleta = `uploads/usuarios/${nomeArquivo}`;

      // Dados para atualização
      const dadosAtualizacao = {
        fotoUsuario: urlCompleta
      };

      // Validar dados com schema
      UsuarioUpdateSchema.parse(dadosAtualizacao);

      // Atualizar no banco de dados
      const usuarioAtualizado = await this.repository.atualizar(userId, dadosAtualizacao);

      return {
        id: usuarioAtualizado._id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        fotoUsuario: usuarioAtualizado.fotoUsuario,
        metadados: metadadosFoto
      };

    } catch (error) {
      console.error('Erro ao atualizar foto do usuário:', error);
      throw error;
    }
  }

  // Função auxiliar para remover foto antiga (opcional)
  async removerFotoAnterior(userId) {
    try {
      const usuario = await this.repository.buscarPorId(userId);
      if (usuario && usuario.fotoUsuario) {
        const caminhoFotoAntiga = path.join(process.cwd(), usuario.fotoUsuario);
        if (fs.existsSync(caminhoFotoAntiga)) {
          fs.unlinkSync(caminhoFotoAntiga);
          console.log('Foto anterior removida:', caminhoFotoAntiga);
        }
      }
    } catch (error) {
      console.warn('Erro ao remover foto anterior:', error.message);
      // Não propagar o erro, apenas logar
    }
  }

  async getFoto(id){
    const data = await this.repository.buscarPorId(id)
    // const objetoJs = await data.toObject()
    const foto  = data.fotoUsuario
    if(fs.existsSync(foto)){
      return foto
    }
     throw new CustomError({
          statusCode: HttpStatusCodes.NOT_FOUND.code,
          errorType: 'resourceNotFound',
          field: 'Foto',
          details: [],
          customMessage: 'Foto não encontrada.'
      })

  }
  async deletarUsuario(id){
    console.log('Estou no deletar em UsuarioService');
    await this.repository.buscarPorId(id)
    const data = await this.repository.deletarUsuario(id);
    return data;
  

  }

}
export default UsuarioService