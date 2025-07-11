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


const diretorio = 'uploads/usuarios';

class UsuarioService {
  constructor() {
    this.model = new UsuarioRepository()
  }
  async listar(req) {
    // console.log("Estou no listar em Usuario")
    const data = await this.model.listar(req)
    
    // Remover CPF dos dados retornados, exceto para getPerfil e updatePerfil
    if (data && data.docs) {
      // Caso seja paginação (com docs)
      data.docs = data.docs.map(usuario => {
        const usuarioObj = usuario.toObject ? usuario.toObject() : usuario
        delete usuarioObj.CPF
        delete usuarioObj.accessToken
        delete usuarioObj.refreshToken
        delete usuarioObj.codigo_recupera_senha
        delete usuarioObj.exp_codigo_recupera_senha
        return usuarioObj
      })
      return data
    } else if (Array.isArray(data)) {
      // Caso seja array simples
      return data.map(usuario => {
        const usuarioObj = usuario.toObject ? usuario.toObject() : usuario
        delete usuarioObj.CPF
        delete usuarioObj.accessToken
        delete usuarioObj.refreshToken
        delete usuarioObj.codigo_recupera_senha
        delete usuarioObj.exp_codigo_recupera_senha
        return usuarioObj
      })
    } else if (data && typeof data === 'object') {
      // Caso seja um objeto único
      const usuarioObj = data.toObject ? data.toObject() : data
      delete usuarioObj.CPF
      delete usuarioObj.accessToken
      delete usuarioObj.refreshToken
      delete usuarioObj.codigo_recupera_senha
      delete usuarioObj.exp_codigo_recupera_senha
      return usuarioObj
    }
    
    // console.log("Estou retornando os dados em UsuarioService")
    return data
  }
  async updateUsuario(id, parseData) {
    // console.log("Estou no updateUsuario Service")
    await this.model.buscarPorEmail(parseData.email, id)
    await this.model.buscarPorTelefone(parseData.telefone, id)
    const data = await this.model.updateUsuario(id, parseData)
    return data
  }

  async cadastrarUsuario(body) {
    await this.model.buscarPorCpf(body.CPF)
    await this.model.buscarPorEmail(body.email)
    await this.model.buscarPorTelefone(body.telefone)
    const user = await this.model.verificaGrupos(body)
    const data = await this.model.cadastrarUsuario(user)
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
    const user = await this.model.buscarPorId(id)
    let permissao = false
    for (const grupo of user.grupos) {
      permissao = grupo.nivelPermissao <= req.nivelPermissao
      if (permissao) {
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
    const data = await this.model.alterarStatus(id, parseData)
    if (data && typeof data.toObject === 'function') {
      const dadosTratados = data.toObject()
      delete dadosTratados.CPF
      return dadosTratados
    }
    // Se não for um documento do Mongoose, tratar como objeto simples
    const dadosTratados = { ...data }
    delete dadosTratados.CPF
    return dadosTratados
  }

  // ...existing code...


  // ...existing code...

  async atualizarFotoUsuario(userId, nomeArquivo, metadadosFoto) {
    try {
      // Verificar se o usuário existe
      const usuarioExistente = await this.model.buscarPorId(userId);
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
      const usuarioAtualizado = await this.model.atualizar(userId, dadosAtualizacao);

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

  async getFoto(id){
    const data = await this.model.buscarPorId(id)
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
  async deletarUsuario(req, id){
    if (req.user_id == id) {
      throw new CustomError({
        statusCode: 403,
        errorType: "unauthorized",
        details: [],
        customMessage: "Não pode alterar o status de si mesmo."
      })
    }
    const user = await this.model.buscarPorId(id)
    let permissao = false
    for (const grupo of user.grupos) {
      permissao = grupo.nivelPermissao <= req.nivelPermissao
      if (permissao) {
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
    const data = await this.model.deletarUsuario(id);
    return data;
  

  }
  async removerFoto(id){
    const data = await this.model.buscarPorId(id)
    const foto = data.fotoUsuario
    if(!fs.existsSync(foto)){
      throw new CustomError({
          statusCode: HttpStatusCodes.NOT_FOUND.code,
          errorType: 'resourceNotFound',
          field: 'Foto',
          details: [],
          customMessage: 'Foto não encontrada.'
      })
    }
    const Foto = {
      fotoUsuario: null
    }
    fs.unlinkSync(foto)
    const dataUpdate = await this.model.updateUsuario(id, Foto)
    return dataUpdate
  }
  async getPerfil(id){
    const data = await this.model.buscarPorId(id)
    const dataObject =  data.toObject()
    delete dataObject.accessToken
    delete dataObject.refreshToken
    const {nome, email, telefone, dataNascimento, CPF, fotoUsuario, notaMedia, grupos} = dataObject
    const nomesGrupos = grupos.map(grupo => grupo.nome);
    return{
      nome,
      email,
      telefone,
      dataNascimento,
      CPF,
      fotoUsuario,
      notaMedia,
      grupos:nomesGrupos
    }
  }
  async updatePerfil(id, parsedData){
    const {nome, telefone} = parsedData
    const data = await this.model.updateUsuario(id, {nome, telefone})
    const usuarioAtualizado = data.toObject()
    delete usuarioAtualizado.accessToken
    delete usuarioAtualizado.refreshToken
    const {email, dataNascimento, CPF, fotoUsuario, notaMedia, grupos} = usuarioAtualizado
    const nomesGrupos = grupos.map(grupo => grupo.nome);
    return{
      nome,
      email,
      telefone,
      dataNascimento,
      CPF,
      fotoUsuario,
      notaMedia,
      grupos:nomesGrupos
    }
  }
}
export default UsuarioService