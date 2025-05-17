import { Agent as AgentType, AgentConfig, Task, TaskConfig } from '../types';
import { Transport } from '../types/transport';
import { ProtocolRequest, ProtocolResponse } from '../types/protocol';

export class Agent implements AgentType {
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentType['capabilities'];
  readonly endpoint: string;
  private transport: Transport;

  constructor(config: AgentConfig, transport: Transport) {
    this.name = config.name;
    this.description = config.description;
    this.capabilities = config.capabilities;
    this.endpoint = config.endpoint;
    this.transport = transport;
  }

  async startTask(config: TaskConfig): Promise<Task> {
    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'startTask',
      params: config
    };

    const response = await this.sendRequest(request);
    if (response.error) {
      throw new Error(`Failed to start task: ${response.error.message}`);
    }

    return response.result as Task;
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

    return response.result as Task;
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

    return response.result as Task[];
  }

  private async sendRequest(request: ProtocolRequest): Promise<ProtocolResponse> {
    await this.transport.connect();
    await this.transport.send(request);
    const response = await this.transport.receive();
    await this.transport.disconnect();
    return response as ProtocolResponse;
  }
} 