import { ProtocolRequest, ProtocolResponse, ProtocolMethod, TaskSendParams, TaskQueryParams, TaskIdParams } from './types/protocol.js';
import { HTTPTransport, HTTPTransportConfig } from './transport/http.js';
import { SSEConnection, SSEOptions } from './types/streaming.js';
import { Task, TaskStatus, TaskPushNotificationConfig } from './types/task.js';
import { A2AErrorCode, createA2AError } from './types/errors.js';
import {
  validateRequest,
  validateResponse,
  validateTaskSendParams,
  validateTaskQueryParams,
  validateTaskIdParams,
  validateTaskPushNotificationConfig
} from './validation/schemas.js';

/**
 * A2A client configuration
 */
export interface A2AClientConfig extends HTTPTransportConfig {
  version: string;
}

/**
 * A2A client implementation
 */
export class A2AClient {
  private transport: HTTPTransport;

  constructor(config: A2AClientConfig) {
    this.transport = new HTTPTransport(config);
  }

  /**
   * Sends a task to an agent
   */
  async sendTask(params: TaskSendParams): Promise<Task> {
    validateTaskSendParams(params);
    const response = await this.sendRequest('tasks/send', params);
    return this.validateResponse<Task>(response);
  }

  /**
   * Subscribes to task updates
   */
  subscribeToTask(params: TaskSendParams, options?: SSEOptions): SSEConnection {
    validateTaskSendParams(params);
    return this.transport.createSSEConnection('tasks/sendSubscribe', params, options);
  }

  /**
   * Gets the current state of a task
   */
  async getTask(params: TaskQueryParams): Promise<Task> {
    validateTaskQueryParams(params);
    const response = await this.sendRequest('tasks/get', params);
    return this.validateResponse<Task>(response);
  }

  /**
   * Cancels a task
   */
  async cancelTask(params: TaskIdParams): Promise<TaskStatus> {
    validateTaskIdParams(params);
    const response = await this.sendRequest('tasks/cancel', params);
    return this.validateResponse<TaskStatus>(response);
  }

  /**
   * Sets push notification configuration for a task
   */
  async setPushNotification(params: TaskIdParams & { pushNotification: TaskPushNotificationConfig }): Promise<void> {
    validateTaskIdParams(params);
    validateTaskPushNotificationConfig(params.pushNotification);
    const response = await this.sendRequest('tasks/pushNotification/set', params);
    this.validateResponse<void>(response);
  }

  /**
   * Gets push notification configuration for a task
   */
  async getPushNotification(params: TaskIdParams): Promise<TaskPushNotificationConfig> {
    validateTaskIdParams(params);
    const response = await this.sendRequest('tasks/pushNotification/get', params);
    return this.validateResponse<TaskPushNotificationConfig>(response);
  }

  /**
   * Resubscribes to task updates
   */
  resubscribeToTask(params: TaskQueryParams, options?: SSEOptions): SSEConnection {
    validateTaskQueryParams(params);
    return this.transport.createSSEConnection('tasks/resubscribe', params, options);
  }

  /**
   * Sends a JSON-RPC request and returns the response
   */
  private async sendRequest(method: ProtocolMethod, params: unknown): Promise<ProtocolResponse> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: this.generateRequestId(),
      method,
      params
    };

    validateRequest(request);
    const response = await this.transport.sendRequest(request);
    return validateResponse(response);
  }

  /**
   * Validates a JSON-RPC response and returns the result
   */
  private validateResponse<T>(response: ProtocolResponse): T {
    if (response.error) {
      throw createA2AError(
        response.error.code as A2AErrorCode,
        response.error.data
      );
    }

    if (response.result === undefined) {
      throw createA2AError(A2AErrorCode.InternalError, 'Response missing result');
    }

    return response.result as T;
  }

  /**
   * Generates a unique request ID
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
} 