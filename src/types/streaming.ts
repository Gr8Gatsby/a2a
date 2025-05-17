import { SendTaskStreamingResponse } from './protocol';

/**
 * SSE event types for A2A streaming
 */
export type SSEEventType = 'message' | 'error' | 'open' | 'close';

/**
 * SSE event interface
 */
export interface SSEEvent {
  type: SSEEventType;
  data?: string;
  id?: string;
  retry?: number;
}

/**
 * SSE event handler type
 */
export type SSEEventHandler = (event: SSEEvent) => void;

/**
 * SSE connection options
 */
export interface SSEOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
}

/**
 * SSE connection interface
 */
export interface SSEConnection {
  /**
   * Opens the SSE connection
   */
  connect(): Promise<void>;

  /**
   * Closes the SSE connection
   */
  close(): void;

  /**
   * Adds an event listener
   */
  addEventListener(type: SSEEventType, handler: SSEEventHandler): void;

  /**
   * Removes an event listener
   */
  removeEventListener(type: SSEEventType, handler: SSEEventHandler): void;

  /**
   * Gets the current ready state
   */
  getReadyState(): number;
}

/**
 * Parses an SSE event data field into a SendTaskStreamingResponse
 */
export function parseSSEResponse(data: string): SendTaskStreamingResponse {
  try {
    return JSON.parse(data) as SendTaskStreamingResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse SSE response: ${errorMessage}`);
  }
}

/**
 * Creates an SSE event from a SendTaskStreamingResponse
 */
export function createSSEEvent(response: SendTaskStreamingResponse): SSEEvent {
  return {
    type: 'message',
    data: JSON.stringify(response),
    id: response.id.toString()
  };
}

/**
 * Creates an SSE error event
 */
export function createSSEErrorEvent(error: Error): SSEEvent {
  return {
    type: 'error',
    data: error.message
  };
} 