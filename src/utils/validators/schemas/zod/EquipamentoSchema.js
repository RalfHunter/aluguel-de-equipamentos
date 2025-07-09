import { z } from "zod";
import objectIdSchema from "./ObjectIdSchema.js";

const categoriasValidas = [
  "Furadeira",
  "Serra Elétrica",
  "Multímetro",
  "Parafusadeira",
  "Lixadeira",
  "Compressor de Ar",
  "Soldador",
  "Betoneira",
];

const statusValidos = ["ativo", "pendente", "inativo"];

export const equipamentoSchema = z.object({
  equiNome: z.string({ required_error: 'Nome obrigatório' }).min(2, 'Nome deve ter pelo menos 2 caracteres'),
  equiDescricao: z.string({ required_error: 'Descrição obrigatória' }),
  equiValorDiaria: z.number({
    required_error: "Valor da diária é obrigatório",
    invalid_type_error: "Valor da diária deve ser um número",
  }).positive({ message: "Valor da diária deve ser maior que 0" }),
  equiQuantidadeDisponivel: z.number({
    required_error: "Quantidade é obrigatória",
    invalid_type_error: "Quantidade deve ser um número",
  }).int({ message: "Quantidade deve ser um número inteiro" }).nonnegative({ message: "Quantidade deve ser maior ou igual a 0" }),
  equiCategoria: z.enum(categoriasValidas, {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  equiUsuario: objectIdSchema,
  equiFotos: z.array(
    z.object({
      url: z.string().url({ message: "Deve ser uma URL válida" }),
      largura: z.number().positive(),
      altura: z.number().positive(),
      tamanhoMb: z.number().positive(),
    })
  ).min(1, "Pelo menos uma foto é obrigatória"),
  equiStatus: z.enum(statusValidos, {
    errorMap: () => ({ message: 'Status inválido' }),
  }).default('pendente'),
});

export const equipamentoStatusSchema = z.object({
  status: z.enum(['ativo', 'inativo'], { errorMap: () => ({ message: 'Status deve ser "ativo" ou "inativo"' }) }),
});

export const equipamentoUpdateSchema = z.object({
  equiValorDiaria: z.number({
    invalid_type_error: "Valor da diária deve ser um número",
  }).positive({ message: "Valor da diária deve ser maior que 0" }).optional(),
  equiQuantidadeDisponivel: z.number({
    invalid_type_error: "Quantidade disponível deve ser um número",
  }).int({ message: "Quantidade disponível deve ser um número inteiro" }).nonnegative({ message: "Quantidade disponível deve ser maior ou igual a 0" }).optional(),
}).strict({ message: "Campos não permitidos no objeto" });