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
  }).positive({ message: "Valor da diária deve ser maior que 0" })
    .max(100000, { message: "Valor da diária muito alto" }),

  equiQuantidadeDisponivel: z.number({
    required_error: "Quantidade é obrigatória",
    invalid_type_error: "Quantidade deve ser um número",
  }).int({ message: "Quantidade deve ser um número inteiro" })
    .nonnegative({ message: "Quantidade deve ser maior ou igual a 0" })
    .max(1000, { message: "Quantidade muito grande" }),

  equiCategoria: categoriasValidas,

  equiUsuario: objectIdSchema,

equiFotos: z.array(
  z.object({
    url: z.string().url({ message: "Deve ser uma URL válida" }),
    largura: z.number({ required_error: "Largura é obrigatória" })
      .positive({ message: "Largura deve ser maior que 0" })
      .max(10000, { message: "Largura muito grande" }),
    altura: z.number({ required_error: "Altura é obrigatória" })
      .positive({ message: "Altura deve ser maior que 0" })
      .max(10000, { message: "Altura muito grande" }),
    tamanhoMb: z.number({ required_error: "Tamanho em MB é obrigatório" })
      .positive({ message: "Tamanho em MB deve ser maior que 0" })
      .max(50, { message: "Tamanho em MB muito grande" }),
  }),
  {
    required_error: "Pelo menos uma foto é obrigatória", 
  }
)
.nonempty({ message: "Pelo menos uma foto é obrigatória" })  
.max(5, { message: "Não é permitido mais que 5 fotos" }),

});

export const equipamentoStatusSchema = z.object({
  status: z.enum(["ativo", "inativo"], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_type && issue.received === 'undefined') {
        return { message: 'Required' }; 
      }
     return { message: 'Status inválido' };
 
    },
  }),
});

export const equipamentoUpdateSchema = z.object({
  equiValorDiaria: z.number({
    invalid_type_error: "Valor da diária deve ser um número",
  }).positive({ message: "Valor da diária deve ser maior que 0" })
    .max(100000, { message: "Valor da diária muito alto" })
    .optional(),

  equiQuantidadeDisponivel: z.number({
    invalid_type_error: "Quantidade disponível deve ser um número",
  }).int({ message: "Quantidade disponível deve ser um número inteiro" })
    .nonnegative({ message: "Quantidade disponível deve ser maior ou igual a 0" })
    .max(1000, { message: "Quantidade muito grande" })
    .optional(),
}).strict({ message: "Campos não permitidos no objeto" });