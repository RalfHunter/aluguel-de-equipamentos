class GrupoFilterBuilder {
    constructor() {
        this.filtros = {};
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' };
        }
        return this;
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

    comDescricao(descricao) {
        if (descricao) {
            this.filtros.descricao = { $regex: descricao, $options: 'i' };
        }
        return this;
    }

    comNivelPermissao(nivelPermissao) {
        if (nivelPermissao !== undefined && nivelPermissao !== null && nivelPermissao !== '') {
            const nivel = parseInt(nivelPermissao);
            if (!isNaN(nivel)) {
                this.filtros.nivelPermissao = nivel;
            }
        }
        return this;
    }

    build() {
        return this.filtros;
    }
}

export default GrupoFilterBuilder;