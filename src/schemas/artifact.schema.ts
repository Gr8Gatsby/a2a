import { z } from 'zod';
import { PartSchema } from './message.schema';

export const ArtifactSchema = z.object({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  parts: z.array(PartSchema).min(1),
  index: z.number().optional(),
  append: z.boolean().nullable().optional(),
  lastChunk: z.boolean().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
}); 