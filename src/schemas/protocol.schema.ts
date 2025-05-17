import { z } from 'zod';

export const ProtocolVersionSchema = z.literal('1.0.0');

export const ProtocolMethodSchema = z.enum([
  'startTask',
  'endTask',
  'updateTask',
  'getTaskStatus',
  'listTasks',
]);

export const ProtocolMessageSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: ProtocolMethodSchema,
  params: z.unknown(),
});

export const ProtocolRequestSchema = ProtocolMessageSchema.extend({});

export const ProtocolResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  result: z.unknown().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.unknown().optional(),
    })
    .optional(),
}); 