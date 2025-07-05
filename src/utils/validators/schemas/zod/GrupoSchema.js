import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import { RotaSchema } from './RotaSchema.js';

const GrupoSchema = z.object({
    nome: z.string().min(1, 'O campo nome é obrigatório.'),
    descricao: z.string().min(1, 'O campo descrição é obrigatório.'),
    ativo: z.boolean({
        required_error: 'O campo ativo é obrigatório.',
        invalid_type_error: 'O campo ativo deve ser um booleano.'
    }),
    nivelPermissao: z.number({
        required_error: 'O campo nivelPermissao é obrigatório.',
        invalid_type_error: 'O campo nivelPermissao deve ser um número.'
    }).int('O nível de permissão deve ser um número inteiro.')
      .min(0, 'O nível de permissão deve ser maior ou igual a 0.'),
    permissoes: z.array(RotaSchema, {
        required_error: 'O campo permissoes é obrigatório.',
        invalid_type_error: 'O campo permissoes deve ser um array.'
    }).min(1, 'Deve haver pelo menos uma permissão.')
});

const GrupoUpdateSchema = GrupoSchema.partial();

export { GrupoSchema, GrupoUpdateSchema };