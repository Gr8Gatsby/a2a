import { Agent as AgentType, AgentConfig, Task, AgentCapabilities } from '../types';
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