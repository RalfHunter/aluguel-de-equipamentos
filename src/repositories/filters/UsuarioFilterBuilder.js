import UsuarioModel from "../../models/Usuario.js"
import GrupoModel from "../../models/Grupo.js"
import GrupoRepository from "../GrupoRepository.js"
class UsuarioFilterBuilder {
    constructor(){
        this.filtros = {}
        this.usuarioModel = UsuarioModel
        this.grupoModel = GrupoModel
        this.grupoRepository = new GrupoRepository()
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
    comAtivo(ativo) {
        if (ativo === 'true') {
            this.filtros.ativo = true;
        }
        if (ativo === 'false') {
            this.filtros.ativo = false;
        }
        return this;
    }
    async comGrupo(grupo) {
        if (grupo) {
            // Não re-instancie o grupoRepository aqui.
            const gruposEncontrados = await this.grupoRepository.buscarPorNome(grupo);

            const grupoIds = gruposEncontrados
                ? Array.isArray(gruposEncontrados)
                    ? gruposEncontrados.map(g => g._id)
                    : [gruposEncontrados._id]
                : [];

            this.filtros.grupos = { $in: grupoIds };
        }
        return this;
    }

    build(){
        // console.log(this.filtros)
        return this.filtros
    }
}
export default UsuarioFilterBuilder