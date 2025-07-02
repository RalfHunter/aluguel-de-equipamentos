import UsuarioModel from "../../models/Usuario.js"

class UsuarioFilterBuilder {
    constructor(){
        this.filtros = {}
        this.usuarioModel = UsuarioModel
    }
    comNome(nome){
        if(nome){
            this.filtros.nome = {$regex: nome, $options: "i"}
        }
        return this
    }
    comEmail(email){
        if(email){
            this.filtros.email = {$regex: email, $options: 'i'}
        }
        return this
    }
    comStatus(ativo = true){
        if(ativo){
            this.filtros.ativo = ativo
        }
        return this
    }
    comTipoUsuario(tipo){
        if(tipo){
            this.filtros.tipoUsuario = {$eq: tipo}
        }
        return this
    }
    build(){
        // console.log(this.filtros)
        return this.filtros
    }
}
export default UsuarioFilterBuilder