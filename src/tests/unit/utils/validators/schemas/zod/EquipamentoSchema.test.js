import { equipamentoSchema, equipamentoUpdateSchema, equipamentoStatusSchema, categoriasValidasArray } from '../../../../../../utils/validators/schemas/zod/EquipamentoSchema.js';
import mongoose from 'mongoose';

jest.mock('../../../../../../utils/validators/schemas/zod/ObjectIdSchema.js', () => {
  const { z } = require('zod');
  return {
    __esModule: true,
    default: z.string({
      required_error: 'Usuário inválido'
    }).length(24, 'Usuário inválido'),
  };
});


jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
      prototype: {
        toString: jest.fn(),
      },
    },
  },
}));

// Função auxiliar para capturar erros do Zod
const parseWithError = (schema, data) => {
  try {
    schema.parse(data);
    return null;
  } catch (error) {
    return error;
  }
};

// Dados válidos
const baseValidData = (objectId) => ({
  equiNome: 'Furadeira Bosch',
  equiDescricao: 'Furadeira de impacto 700W',
  equiValorDiaria: 50,
  equiQuantidadeDisponivel: 5,
  equiCategoria: 'Furadeira',
  equiUsuario: objectId,
  equiFotos: [
    {
      url: 'https://example.com/foto1.jpg',
      largura: 100,
      altura: 200,
      tamanhoMb: 0.5,
    },
  ],
});

describe('equipamentoSchema', () => {
  let objectId;

  beforeEach(() => {
    jest.clearAllMocks();
    objectId = '507f1f77bcf86cd799439011';
    mongoose.Types.ObjectId.isValid.mockImplementation((id) => /^[0-9a-fA-F]{24}$/.test(id));
    mongoose.Types.ObjectId.prototype.toString.mockReturnValue(objectId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('valida dados válidos corretamente', () => {
    const dadosValidos = baseValidData(objectId);
    const resultado = equipamentoSchema.parse(dadosValidos);
    expect(resultado).toEqual(dadosValidos);
  });

  it('erro quando "equiNome" está ausente', () => {
    const dados = { ...baseValidData(objectId), equiNome: undefined };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Nome obrigatório');
  });

  it('erro quando "equiNome" é muito curto', () => {
    const dados = { ...baseValidData(objectId), equiNome: 'F' };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Nome deve ter pelo menos 2 caracteres');
  });

  it('erro quando "equiDescricao" está ausente', () => {
    const dados = { ...baseValidData(objectId), equiDescricao: undefined };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Descrição obrigatória');
  });

  it('erro quando "equiValorDiaria" está ausente', () => {
    const dados = { ...baseValidData(objectId), equiValorDiaria: undefined };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Valor da diária é obrigatório');
  });

  it('erro quando "equiValorDiaria" não é número', () => {
    const dados = { ...baseValidData(objectId), equiValorDiaria: 'abc' };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Valor da diária deve ser um número');
  });

  it('erro quando "equiValorDiaria" é negativo', () => {
    const dados = { ...baseValidData(objectId), equiValorDiaria: -1 };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Valor da diária deve ser maior que 0');
  });

  it('erro quando "equiValorDiaria" excede limite máximo', () => {
    const dados = { ...baseValidData(objectId), equiValorDiaria: 100001 };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Valor da diária muito alto');
  });

  it('erro quando "equiQuantidadeDisponivel" está ausente', () => {
    const dados = { ...baseValidData(objectId), equiQuantidadeDisponivel: undefined };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Quantidade é obrigatória');
  });

  it('erro quando "equiQuantidadeDisponivel" não é número', () => {
    const dados = { ...baseValidData(objectId), equiQuantidadeDisponivel: 'abc' };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Quantidade deve ser um número');
  });

  it('erro quando "equiQuantidadeDisponivel" não é inteiro', () => {
    const dados = { ...baseValidData(objectId), equiQuantidadeDisponivel: 1.5 };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Quantidade deve ser um número inteiro');
  });

  it('erro quando "equiQuantidadeDisponivel" é negativo', () => {
    const dados = { ...baseValidData(objectId), equiQuantidadeDisponivel: -1 };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Quantidade deve ser maior ou igual a 0');
  });

  it('erro quando "equiQuantidadeDisponivel" excede limite', () => {
    const dados = { ...baseValidData(objectId), equiQuantidadeDisponivel: 1001 };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Quantidade muito grande');
  });

  it('erro quando "equiCategoria" está ausente', () => {
    const dados = { ...baseValidData(objectId), equiCategoria: undefined };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Categoria inválida');
  });

  it('erro quando "equiCategoria" é inválida', () => {
    const dados = { ...baseValidData(objectId), equiCategoria: 'Invalida' };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Categoria inválida');
  });

  it('erro quando "equiUsuario" está ausente', () => {
    const dados = { ...baseValidData(objectId), equiUsuario: undefined };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Usuário inválido');
  });

  it('erro quando "equiUsuario" não é um ObjectId válido', () => {
    const dados = { ...baseValidData(objectId), equiUsuario: 'invalid-id' };
    const erro = parseWithError(equipamentoSchema, dados);
    expect(erro.errors[0].message).toBe('Usuário inválido');
  });
it('erro quando "equiFotos" está ausente', () => {
  const dados = { ...baseValidData(objectId), equiFotos: undefined };
  const erro = parseWithError(equipamentoSchema, dados);
  expect(erro).not.toBeNull();
  expect(erro.errors[0].message).toBe('Pelo menos uma foto é obrigatória');
});

it('erro quando "equiFotos" está vazio', () => {
  const dados = { ...baseValidData(objectId), equiFotos: [] };
  const erro = parseWithError(equipamentoSchema, dados);
  expect(erro).not.toBeNull();
  expect(erro.errors[0].message).toBe('Pelo menos uma foto é obrigatória');
});

it('passa quando "equiFotos" tem fotos válidas', () => {
  const dados = baseValidData(objectId); 
  const erro = parseWithError(equipamentoSchema, dados);
  expect(erro).toBeNull();
});


it('erro quando "equiFotos" excede limite máximo de 5 fotos', () => {
  const fotos = Array(6).fill({
    url: 'https://example.com/foto.jpg',
    largura: 100,
    altura: 200,
    tamanhoMb: 0.5,
  });
  const dados = { ...baseValidData(objectId), equiFotos: fotos };
  const erro = parseWithError(equipamentoSchema, dados);
  expect(erro).not.toBeNull();
  expect(erro.errors[0].message).toBe('Não é permitido mais que 5 fotos');
});

});

describe('equipamentoUpdateSchema', () => {
  it('valida atualização parcial', () => {
    const dados = { equiValorDiaria: 100 };
    const resultado = equipamentoUpdateSchema.parse(dados);
    expect(resultado).toEqual({ equiValorDiaria: 100 });
  });
});

describe('equipamentoStatusSchema', () => {
  it('valida status "ativo"', () => {
    const resultado = equipamentoStatusSchema.parse({ status: 'ativo' });
    expect(resultado).toEqual({ status: 'ativo' });
  });

  it('erro quando status inválido', () => {
    const erro = parseWithError(equipamentoStatusSchema, { status: 'inexistente' });
    expect(erro.errors[0].message).toBe('Status inválido');
  });
});
