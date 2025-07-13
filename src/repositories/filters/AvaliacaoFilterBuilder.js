class AvaliacaoFilterBuilder {
    constructor(query = {}) {
        this.query = query;
        this.filtros = {};
        this.sort = { createdAt: -1 }; // padrão (caso nada seja enviado)
    }

    comOrdemNota() {
        const criterio = (this.query.ordenarPorNota || '').toLowerCase();
        if (criterio === 'mais-relevantes') {
            this.sort = { nota: -1 }; 
        } else if (criterio === 'menos-relevantes') {
            this.sort = { nota: 1 }; 
        }
        return this;
    }

    build() {
        return {
            filtros: this.filtros,
            ordenacao: this.sort
        };
    }
}

export default AvaliacaoFilterBuilder;
