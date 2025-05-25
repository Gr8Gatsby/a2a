import { z } from 'zod';
import { PartSchema } from './message.schema.js';

export const ArtifactSchema = z.object({
  id: z.string().regex(/^artifact-[0-9a-fA-F-]{36}$/),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  parts: z.array(PartSchema).min(1),
  index: z.number().optional(),
  append: z.boolean().nullable().optional(),
  lastChunk: z.boolean().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
}); 