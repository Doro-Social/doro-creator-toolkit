import {z} from 'zod';
export const imageSchema=z.object({src:z.string().max(1400000).regex(/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/),alt:z.string().max(200),width:z.number().int().positive().max(2000),height:z.number().int().positive().max(2000)}).strict();
export const photoSchema=imageSchema.extend({fit:z.enum(['cover','contain']).default('cover'),x:z.number().min(0).max(100).default(50),y:z.number().min(0).max(100).default(50)});
export type Photo=z.infer<typeof photoSchema>;
