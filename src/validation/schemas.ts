import { z } from 'zod';
import { ProtocolMethod } from '../types/protocol.js';

/**
 * Base JSON-RPC request schema
 */
export const jsonRPCRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.unknown()
});

/**
 * Base JSON-RPC response schema
 */
export const jsonRPCResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  result: z.unknown().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional()
  }).optional()
});

/**
 * Task state schema
 */
export const taskStateSchema = z.enum([
  'submitted',
  'working',
  'input-required',
  'completed',
  'canceled',
  'failed',
  'unknown'
]);

/**
 * Task status schema
 */
export const taskStatusSchema = z.object({
  state: taskStateSchema,
  message: z.any().nullable().optional(),
  timestamp: z.string().nullable().optional()
});

/**
 * Task schema
 */
export const taskSchema = z.object({
  id: z.string(),
  sessionId: z.string().nullable().optional(),
  status: taskStatusSchema,
  artifacts: z.array(z.any()).nullable().optional(),
  history: z.array(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

/**
 * Task send parameters schema
 */
export const taskSendParamsSchema = z.object({
  id: z.string(),
  sessionId: z.string().nullable().optional(),
  message: z.any(),
  pushNotification: z.any().nullable().optional(),
  historyLength: z.number().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

/**
 * Task query parameters schema
 */
export const taskQueryParamsSchema = z.object({
  id: z.string(),
  historyLength: z.number().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

/**
 * Task ID parameters schema
 */
export const taskIdParamsSchema = z.object({
  id: z.string(),
  metadata: z.record(z.any()).nullable().optional()
});

/**
 * Push notification configuration schema
 */
export const pushNotificationConfigSchema = z.object({
  url: z.string().url(),
  token: z.string().nullable().optional(),
  authentication: z.object({
    schemes: z.array(z.string()),
    credentials: z.string().nullable().optional()
  }).nullable().optional()
});

/**
 * Task push notification configuration schema
 */
export const taskPushNotificationConfigSchema = z.object({
  id: z.string(),
  pushNotificationConfig: pushNotificationConfigSchema.nullable()
});

/**
 * Task status update event schema
 */
export const taskStatusUpdateEventSchema = z.object({
  id: z.string(),
  status: taskStatusSchema,
  final: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

/**
 * Task artifact update event schema
 */
export const taskArtifactUpdateEventSchema = z.object({
  id: z.string(),
  artifact: z.any(),
  metadata: z.record(z.any()).nullable().optional()
});

/**
 * Validates a protocol method
 */
export function validateProtocolMethod(method: string): method is ProtocolMethod {
  return [
    'tasks/send',
    'tasks/sendSubscribe',
    'tasks/get',
    'tasks/cancel',
    'tasks/pushNotification/set',
    'tasks/pushNotification/get',
    'tasks/resubscribe'
  ].includes(method);
}

/**
 * Validates a JSON-RPC request
 */
export function validateRequest(request: unknown) {
  return jsonRPCRequestSchema.parse(request);
}

/**
 * Validates a JSON-RPC response
 */
export function validateResponse(response: unknown) {
  return jsonRPCResponseSchema.parse(response);
}

/**
 * Validates task send parameters
 */
export function validateTaskSendParams(params: unknown) {
  return taskSendParamsSchema.parse(params);
}

/**
 * Validates task query parameters
 */
export function validateTaskQueryParams(params: unknown) {
  return taskQueryParamsSchema.parse(params);
}

/**
 * Validates task ID parameters
 */
export function validateTaskIdParams(params: unknown) {
  return taskIdParamsSchema.parse(params);
}

/**
 * Validates push notification configuration
 */
export function validatePushNotificationConfig(config: unknown) {
  return pushNotificationConfigSchema.parse(config);
}

/**
 * Validates task push notification configuration
 */
export function validateTaskPushNotificationConfig(config: unknown) {
  return taskPushNotificationConfigSchema.parse(config);
}

/**
 * Validates task status update event
 */
export function validateTaskStatusUpdateEvent(event: unknown) {
  return taskStatusUpdateEventSchema.parse(event);
}

/**
 * Validates task artifact update event
 */
export function validateTaskArtifactUpdateEvent(event: unknown) {
  return taskArtifactUpdateEventSchema.parse(event);
} 