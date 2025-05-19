import { JSONRPCError } from './protocol.js';

/**
 * A2A-specific error codes (A2A 8.2)
 */
export enum A2AErrorCode {
  // Standard JSON-RPC errors
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,

  // A2A-specific errors
  TaskNotFound = -32001,
  TaskNotCancelable = -32002,
  PushNotificationNotSupported = -32003,
  OperationNotSupported = -32004,
  ContentTypeNotSupported = -32005,
  StreamingNotSupported = -32006,
  AuthenticationRequired = -32007,
  AuthorizationFailed = -32008,
  InvalidTaskState = -32009,
  RateLimitExceeded = -32010,
  ResourceUnavailable = -32011
}

/**
 * Creates a JSON-RPC error object with the specified code and message
 */
export function createError(code: A2AErrorCode, message: string, data?: unknown): JSONRPCError {
  return {
    code,
    message,
    data
  };
}

/**
 * Standard A2A error messages
 */
export const A2AErrorMessages: Record<A2AErrorCode, string> = {
  // Standard JSON-RPC errors
  [A2AErrorCode.ParseError]: 'Invalid JSON payload',
  [A2AErrorCode.InvalidRequest]: 'Invalid JSON-RPC Request',
  [A2AErrorCode.MethodNotFound]: 'Method not found',
  [A2AErrorCode.InvalidParams]: 'Invalid method parameters',
  [A2AErrorCode.InternalError]: 'Internal server error',

  // A2A-specific errors
  [A2AErrorCode.TaskNotFound]: 'Task not found',
  [A2AErrorCode.TaskNotCancelable]: 'Task cannot be canceled',
  [A2AErrorCode.PushNotificationNotSupported]: 'Push Notification is not supported',
  [A2AErrorCode.OperationNotSupported]: 'This operation is not supported',
  [A2AErrorCode.ContentTypeNotSupported]: 'Incompatible content types',
  [A2AErrorCode.StreamingNotSupported]: 'Streaming is not supported',
  [A2AErrorCode.AuthenticationRequired]: 'Authentication required',
  [A2AErrorCode.AuthorizationFailed]: 'Authorization failed',
  [A2AErrorCode.InvalidTaskState]: 'Invalid task state for operation',
  [A2AErrorCode.RateLimitExceeded]: 'Rate limit exceeded',
  [A2AErrorCode.ResourceUnavailable]: 'A required resource is unavailable'
};

/**
 * Creates a standard A2A error object
 */
export function createA2AError(code: A2AErrorCode, data?: unknown): JSONRPCError {
  return createError(code, A2AErrorMessages[code], data);
} 