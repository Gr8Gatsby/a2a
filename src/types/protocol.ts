/**
 * Represents the version of the A2A protocol
 */
export type ProtocolVersion = '1.0.0';

/**
 * Represents the method types in the A2A protocol
 */
export type ProtocolMethod = 
  | 'startTask'
  | 'endTask'
  | 'updateTask'
  | 'getTaskStatus'
  | 'listTasks'
  | 'tasks/pushNotification/set'
  | 'tasks/pushNotification/get'
  | 'tasks/cancel';

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
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
} 