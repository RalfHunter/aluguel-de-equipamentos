import { z } from "zod";
import objectIdSchema from "./ObjectIdSchema.js";

export const categoriasValidas = z.enum([
  "Furadeira",
  "Serra Elétrica",
  "Multímetro",
  "Parafusadeira",
  "Lixadeira",
  "Compressor de Ar",
  "Soldador",
  "Betoneira",
], {
  errorMap: () => ({ message: "Categoria inválida" }),
});

export const statusValidos = z.enum(["ativo", "pendente", "inativo"]);
export const categoriasValidasArray = categoriasValidas.options;
export const statusValidosArray = statusValidos.options;

export const equipamentoSchema = z.object({
  equiNome: z.string({ required_error: "Nome obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres"),

  equiDescricao: z.string({ required_error: "Descrição obrigatória" }),

  equiValorDiaria: z.number({
    required_error: "Valor da diária é obrigatório",
    invalid_type_error: "Valor da diária deve ser um número",
  }).positive({ message: "Valor da diária deve ser maior que 0" }),

  equiQuantidadeDisponivel: z.number({
    required_error: "Quantidade é obrigatória",
    invalid_type_error: "Quantidade deve ser um número",
  }).int({ message: "Quantidade deve ser um número inteiro" })
    .nonnegative({ message: "Quantidade deve ser maior ou igual a 0" }),

  equiCategoria: categoriasValidas,

  equiUsuario: objectIdSchema,

  equiFotos: z.array(
    z.object({
      url: z.string({ required_error: "URL da foto é obrigatória" }),
      largura: z.number({ required_error: "Largura é obrigatória" }),
      altura: z.number({ required_error: "Altura é obrigatória" }),
      tamanhoMb: z.number({ required_error: "Tamanho em MB é obrigatório" }),
    })
  ).min(1, { message: "Pelo menos uma foto é obrigatória" })
   .max(5, { message: "Não é permitido mais que 5 fotos" }),
});

export const equipamentoStatusSchema = z.object({
  status: z.enum(["ativo", "inativo"], {
    errorMap: () => ({ message: 'Status deve ser "ativo" ou "inativo"' }),
  }),
});

export const equipamentoUpdateSchema = z.object({
  equiValorDiaria: z.number({
    invalid_type_error: "Valor da diária deve ser um número",
  }).positive({ message: "Valor da diária deve ser maior que 0" }).optional(),

  equiQuantidadeDisponivel: z.number({
    invalid_type_error: "Quantidade disponível deve ser um número",
  }).int({ message: "Quantidade disponível deve ser um número inteiro" })
    .nonnegative({ message: "Quantidade disponível deve ser maior ou igual a 0" }).optional(),
}).strict({ message: "Campos não permitidos no objeto" });
