import { Agent as AgentType, AgentConfig, Task, AgentCapabilities, TaskPushNotificationConfig } from '../types';
import { Transport } from '../types/transport';
import { ProtocolRequest, ProtocolResponse } from '../types/protocol';
import { EventEmitter } from 'events';

export class Agent extends EventEmitter implements AgentType {
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapabilities;
  readonly endpoint: string;
  readonly version: string;
  private transport: Transport;

  constructor(config: AgentConfig, transport: Transport) {
    super();
    this.name = config.name;
    this.description = config.description;
    this.capabilities = config.capabilities;
    this.endpoint = config.endpoint;
    this.version = config.version;
    this.transport = transport;
  }

  async startTask(params: unknown): Promise<Task> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'startTask',
      params
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to start task: ${response.error.message}`);
    }
    if (response.result) {
      return response.result as Task;
    }
    throw new Error('Failed to start task: Unknown error');
  }

  async endTask(taskId: string): Promise<void> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'endTask',
      params: { taskId }
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to end task: ${response.error.message}`);
    }
  }

  async getTaskStatus(taskId: string): Promise<Task> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'getTaskStatus',
      params: { taskId }
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to get task status: ${response.error.message}`);
    }
    if (response.result) {
      return response.result as Task;
    }
    throw new Error('Failed to get task status: Unknown error');
  }

  async listTasks(): Promise<Task[]> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'listTasks',
      params: {}
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to list tasks: ${response.error.message}`);
    }
    if (response.result) {
      return response.result as Task[];
    }
    throw new Error('Failed to list tasks: Unknown error');
  }

  async setPushNotification(taskId: string, config: TaskPushNotificationConfig): Promise<TaskPushNotificationConfig> {
    if (!this.capabilities.pushNotifications) {
      throw new Error('Push notifications are not supported by this agent');
    }

    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tasks/pushNotification/set',
      params: {
        id: taskId,
        ...config
      }
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to set push notification: ${response.error.message}`);
    }

    return response.result as TaskPushNotificationConfig;
  }

  async getPushNotification(taskId: string): Promise<TaskPushNotificationConfig | null> {
    if (!this.capabilities.pushNotifications) {
      throw new Error('Push notifications are not supported by this agent');
    }

    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tasks/pushNotification/get',
      params: { id: taskId }
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to get push notification: ${response.error.message}`);
    }

    return response.result as TaskPushNotificationConfig | null;
  }

  async cancelTask(taskId: string): Promise<Task> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tasks/cancel',
      params: { id: taskId }
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to cancel task: ${response.error.message}`);
    }

    return response.result as Task;
  }

  private async sendRequest(request: ProtocolRequest): Promise<ProtocolResponse> {
    await this.transport.connect();
    await this.transport.send(request);
    return await this.transport.receive() as ProtocolResponse;
  }
} 