import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

export const AvaliacaoIdSchema = objectIdSchema;

export const AvaliacaoQuerySchema = z.object({
    notaMinima: z
        .string()
        .optional()
        .transform((val) => val ? parseFloat(val) : undefined)
        .refine((val) => val === undefined || (val >= 1 && val <= 5), {
            message: 'notaMinima deve ser entre 1 e 5',
        }),
    notaMaxima: z
        .string()
        .optional()
        .transform((val) => val ? parseFloat(val) : undefined)
        .refine((val) => val === undefined || (val >= 1 && val <= 5), {
            message: 'notaMaxima deve ser entre 1 e 5',
        }),
    ordenarPorNota: z.enum(['mais-relevantes', 'menos-relevantes']).optional(),
    equipamentoId: objectIdSchema.optional(),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: 'Page deve ser um número inteiro maior que 0',
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, {
            message: 'Limit deve ser um número entre 1 e 100',
        }),
});
