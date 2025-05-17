import { z } from 'zod';
import { ArtifactSchema } from './artifact.schema';
import { MessageSchema } from './message.schema';

export const TaskContentTypeSchema = z.enum(['text', 'json', 'binary']);

export const TaskContentSchema = z.object({
  type: TaskContentTypeSchema,
  content: z.union([z.string(), z.record(z.unknown()), z.instanceof(ArrayBuffer)]),
});

export const TaskConfigSchema = z.object({
  content: TaskContentSchema,
  metadata: z.record(z.unknown()).optional(),
});

export const TaskStateSchema = z.enum([
  'pending',
  'submitted',
  'working',
  'input-required',
  'completed',
  'canceled',
  'failed',
  'unknown',
]);

export const TaskStatusSchema = z.object({
  state: TaskStateSchema,
  message: z.lazy(() => MessageSchema).nullable().optional(),
  timestamp: z.string().nullable().optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  sessionId: z.string().nullable().optional(),
  status: TaskStatusSchema,
  artifacts: z.array(z.lazy(() => ArtifactSchema)).nullable().optional(),
  history: z.array(z.lazy(() => MessageSchema)).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
}); 