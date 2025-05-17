import { Transport as TransportType, TransportConfig, TransportProtocol } from '../types/transport';
import { ProtocolRequest, ProtocolResponse } from '../types/protocol';

export class Transport implements TransportType {
  readonly config: TransportConfig;
  private connection: WebSocket | null = null;

  constructor(config: TransportConfig) {
    this.validateProtocol(config.protocol);
    this.config = config;
  }

  private validateProtocol(protocol: string): asserts protocol is TransportProtocol {
    const validProtocols: TransportProtocol[] = ['http', 'https', 'ws', 'wss'];
    if (!validProtocols.includes(protocol as TransportProtocol)) {
      throw new Error(`Invalid protocol: ${protocol}. Must be one of: ${validProtocols.join(', ')}`);
    }
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    const url = this.buildUrl();
    this.connection = new WebSocket(url);
    
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        // istanbul ignore next: defensive, should never happen
        reject(new Error('Connection failed'));
        return;
      }

      this.connection.onopen = () => resolve();
      this.connection.onerror = (error) => reject(error);
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    this.connection.close();
    this.connection = null;
  }

  async send(data: ProtocolRequest): Promise<void> {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      if (!this.connection) {
        // istanbul ignore next: defensive, should never happen
        reject(new Error('Not connected'));
        return;
      }

      this.connection.send(JSON.stringify(data));
      this.connection.onerror = (error) => reject(error);
      resolve();
    });
  }

  async receive(): Promise<ProtocolResponse> {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      if (!this.connection) {
        // istanbul ignore next: defensive, should never happen
        reject(new Error('Not connected'));
        return;
      }

      this.connection.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as ProtocolResponse;
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };

      this.connection.onerror = (error) => reject(error);
    });
  }

  private buildUrl(): string {
    const { protocol, host, port, path } = this.config;
    const baseUrl = `${protocol}://${host}${port ? `:${port}` : ''}`;
    return path ? `${baseUrl}/${path}` : baseUrl;
  }
} 