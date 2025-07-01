import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const AvaliacaoSchema = z.object({
    nota: z.number()
        .min(1, { message: 'A nota mínima é 1' })
        .max(5, { message: 'A nota máxima é 5' }),
    descricao: z.string()
        .min(1, { message: 'A descrição é obrigatória' })
        .transform((val) => val.trim()),
    usuarioId: objectIdSchema,
    equipamentoId: objectIdSchema,
});

const AvaliacaoUpdateSchema = AvaliacaoSchema.partial();

export { AvaliacaoSchema, AvaliacaoUpdateSchema };
