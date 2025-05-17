/**
 * Represents the version of the A2A protocol
 */
export type ProtocolVersion = '1.0.0';

/**
 * Represents the method types in the A2A protocol
 */
export type ProtocolMethod = 
  | 'tasks/send'
  | 'tasks/sendSubscribe'
  | 'tasks/get'
  | 'tasks/cancel'
  | 'tasks/pushNotification/set'
  | 'tasks/pushNotification/get'
  | 'tasks/resubscribe';

/**
 * Base interface for protocol messages
 */
export interface ProtocolMessage {
  jsonrpc: '2.0';
  id: string | number;
  method: ProtocolMethod;
  params: unknown;
}

/**
 * Represents a protocol request
 */
export interface ProtocolRequest extends ProtocolMessage {
  method: ProtocolMethod;
  params: unknown;
}

/**
 * Represents a protocol response
 */
export interface ProtocolResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: JSONRPCError;
}

/**
 * Standard JSON-RPC error object
 */
export interface JSONRPCError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Parameters for tasks/send and tasks/sendSubscribe
 */
export interface TaskSendParams {
  id: string;
  sessionId?: string | null;
  message: import('./message').Message;
  pushNotification?: import('./task').PushNotificationConfig | null;
  historyLength?: number | null;
  metadata?: Record<string, any> | null;
}

/**
 * Parameters for tasks/get and tasks/resubscribe
 */
export interface TaskQueryParams {
  id: string;
  historyLength?: number | null;
  metadata?: Record<string, any> | null;
}

/**
 * Parameters for tasks/cancel and tasks/pushNotification/get
 */
export interface TaskIdParams {
  id: string;
  metadata?: Record<string, any> | null;
}

/**
 * Response for streaming methods (tasks/sendSubscribe and tasks/resubscribe)
 */
export type SendTaskStreamingResponse =
  | ({ jsonrpc: '2.0'; id: string | number; result: import('./task').TaskStatusUpdateEvent; error?: null })
  | ({ jsonrpc: '2.0'; id: string | number; result: import('./task').TaskArtifactUpdateEvent; error?: null })
  | ({ jsonrpc: '2.0'; id: string | number; error: JSONRPCError; result?: null }); 