/**
 * Represents the transport protocol used for communication
 */
export type TransportProtocol = 'http' | 'https' | 'ws' | 'wss';

/**
 * Configuration for transport layer
 */
export interface TransportConfig {
  protocol: TransportProtocol;
  host: string;
  port?: number;
  path?: string;
  timeout?: number;
}

/**
 * Represents a transport layer for agent communication
 */
export interface Transport {
  readonly config: TransportConfig;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(data: unknown): Promise<void>;
  receive(): Promise<unknown>;
} 