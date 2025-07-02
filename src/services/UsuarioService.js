// import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CustomError from '../utils/helpers/CustomError.js';
import messages from '../utils/helpers/messages.js';

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
        const data = await this.repository.cadastrarUsuario(body)
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
            permissao = grupo.nivelPermissao >= req.nivelPermissao
            if(permissao){
                break
            }
        }
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
}
export default UsuarioService