import { Transport as TransportType, TransportConfig, TransportProtocol } from '../types/transport';
import { ProtocolRequest, ProtocolResponse } from '../types/protocol';

// For Node.js, use the 'eventsource' package if needed
let EventSourceImpl: typeof EventSource | undefined = undefined;
if (typeof window === 'undefined') {
  try {
    // @ts-ignore
    EventSourceImpl = (await import('eventsource')).default;
  } catch {}
}

export class Transport implements TransportType {
  readonly config: TransportConfig;
  private connection: WebSocket | EventSource | null = null;
  private sseMessageQueue: any[] = [];
  private sseListener: ((event: Event) => void) | null = null;

  constructor(config: TransportConfig) {
    this.validateProtocol(config.protocol);
    this.config = config;
  }

  private validateProtocol(protocol: string): asserts protocol is TransportProtocol {
    const validProtocols: TransportProtocol[] = ['http', 'https', 'ws', 'wss', 'sse'];
    if (!validProtocols.includes(protocol as TransportProtocol)) {
      throw new Error(`Invalid protocol: ${protocol}. Must be one of: ${validProtocols.join(', ')}`);
    }
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }
    const url = this.buildUrl();
    if (this.config.protocol === 'sse') {
      const EventSourceCtor = (typeof window !== 'undefined' ? window.EventSource : globalThis.EventSource) || EventSourceImpl;
      if (!EventSourceCtor) throw new Error('EventSource is not available in this environment');
      this.connection = new EventSourceCtor(url);
      this.sseMessageQueue = [];
      this.sseListener = (event: Event) => {
        this.sseMessageQueue.push(event as MessageEvent);
      };
      this.connection.addEventListener('message', this.sseListener);
      return;
    }
    this.connection = new WebSocket(url);
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        // istanbul ignore next: defensive, should never happen
        reject(new Error('Connection failed'));
        return;
      }
      (this.connection as WebSocket).onopen = () => resolve();
      (this.connection as WebSocket).onerror = (error) => reject(error);
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }
    if (this.config.protocol === 'sse') {
      (this.connection as EventSource).close();
      if (this.sseListener) {
        this.connection.removeEventListener('message', this.sseListener);
        this.sseListener = null;
      }
      this.connection = null;
      this.sseMessageQueue = [];
      return;
    }
    (this.connection as WebSocket).close();
    this.connection = null;
  }

  async send(data: ProtocolRequest): Promise<void> {
    if (this.config.protocol === 'sse') {
      throw new Error('SSE transport does not support sending messages from client to server');
    }
    if (!this.connection) {
      throw new Error('Not connected');
    }
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        // istanbul ignore next: defensive, should never happen
        reject(new Error('Not connected'));
        return;
      }
      (this.connection as WebSocket).send(JSON.stringify(data));
      (this.connection as WebSocket).onerror = (error) => reject(error);
      resolve();
    });
  }

  async receive(): Promise<ProtocolResponse> {
    if (!this.connection) {
      throw new Error('Not connected');
    }
    if (this.config.protocol === 'sse') {
      // Wait for a message in the queue
      return new Promise((resolve, reject) => {
        const checkQueue = () => {
          if (this.sseMessageQueue.length > 0) {
            const event = this.sseMessageQueue.shift();
            try {
              const response = JSON.parse(event.data) as ProtocolResponse;
              resolve(response);
            } catch (error) {
              reject(error);
            }
          } else {
            setTimeout(checkQueue, 10);
          }
        };
        checkQueue();
      });
    }
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        // istanbul ignore next: defensive, should never happen
        reject(new Error('Not connected'));
        return;
      }
      (this.connection as WebSocket).onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as ProtocolResponse;
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      (this.connection as WebSocket).onerror = (error) => reject(error);
    });
  }

  private buildUrl(): string {
    const { protocol, host, port, path } = this.config;
    const baseUrl = `${protocol}://${host}${port ? `:${port}` : ''}`;
    return path ? `${baseUrl}/${path}` : baseUrl;
  }
} 