import { z } from 'zod';
import { TaskStatusSchema } from './task.schema.js';
import { ArtifactSchema } from './artifact.schema.js';

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

export const JSONRPCErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.any().optional(),
});

export const TaskStatusUpdateEventSchema = z.object({
  id: z.string(),
  status: TaskStatusSchema,
  final: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const TaskArtifactUpdateEventSchema = z.object({
  id: z.string(),
  artifact: ArtifactSchema,
  metadata: z.record(z.any()).nullable().optional(),
});

export const SendTaskStreamingResponseSchema = z.union([
  z.object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    result: TaskStatusUpdateEventSchema,
    error: z.null().optional(),
  }),
  z.object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    result: TaskArtifactUpdateEventSchema,
    error: z.null().optional(),
  }),
  z.object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]),
    error: JSONRPCErrorSchema,
    result: z.undefined().optional(),
  }),
]); 