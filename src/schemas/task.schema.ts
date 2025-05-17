import { z } from 'zod';

export const TaskContentTypeSchema = z.enum(['text', 'json', 'binary']);

export const TaskContentSchema = z.object({
  type: TaskContentTypeSchema,
  content: z.union([z.string(), z.record(z.unknown()), z.instanceof(ArrayBuffer)]),
});

export const TaskConfigSchema = z.object({
  content: TaskContentSchema,
  metadata: z.record(z.unknown()).optional(),
}); 