import mongoose from 'mongoose';
const { Types } = mongoose;

class EquipamentoFilterBuilder {
  constructor() {
    this.filtros = {};
  }

  comCategoria(categoria) {
    if (categoria && typeof categoria === 'string' && categoria.trim() !== '') {
      this.filtros.equiCategoria = categoria;
    }
    return this;
  }

  comStatus(status) {
    const statusValidos = ['ativo', 'inativo', 'pendente'];
    if (typeof status === 'string' && statusValidos.includes(status)) {
      this.filtros.equiStatus = status;
    }
    return this;
  }

  comFaixaDeValor(minValor, maxValor) {
    if (minValor !== undefined || maxValor !== undefined) {
      this.filtros.equiValorDiaria = {};
      if (minValor !== undefined) {
        const minNum = Number(minValor);
        if (!isNaN(minNum)) {
          this.filtros.equiValorDiaria.$gte = minNum;
        }
      }
      if (maxValor !== undefined) {
        const maxNum = Number(maxValor);
        if (!isNaN(maxNum)) {
          this.filtros.equiValorDiaria.$lte = maxNum;
        }
      }
      if (Object.keys(this.filtros.equiValorDiaria).length === 0) {
        delete this.filtros.equiValorDiaria;
      }
    }
    return this;
  }

  build() {
    return this.filtros;
  }
}

export default EquipamentoFilterBuilder;