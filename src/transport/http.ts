import { ProtocolRequest, ProtocolResponse, ProtocolMethod } from '../types/protocol';
import { SSEConnection, SSEOptions, SSEEventHandler } from '../types/streaming';
import { A2AErrorCode, createA2AError } from '../types/errors';
import { validateResponse } from '../validation/schemas';
import { TransportSecurity, AuthenticationManager, InputSanitizer } from '../security/transport';

/**
 * HTTP transport configuration
 */
export interface HTTPTransportConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  security?: {
    requireHttps: boolean;
    allowedOrigins?: string[];
    allowedMethods?: string[];
    maxRequestSize?: number;
    rateLimit?: {
      windowMs: number;
      maxRequests: number;
    };
  };
  authentication?: {
    schemes: string[];
    validateToken: (token: string) => Promise<boolean>;
    validateCredentials?: (credentials: string) => Promise<boolean>;
  };
}

/**
 * HTTP transport implementation for A2A
 */
export class HTTPTransport {
  private config: HTTPTransportConfig;
  private defaultHeaders: Record<string, string>;
  private transportSecurity: TransportSecurity;
  private authManager: AuthenticationManager | null = null;

  constructor(config: HTTPTransportConfig) {
    this.config = config;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers
    };

    // Initialize transport security if configured
    if (config.security) {
      this.transportSecurity = new TransportSecurity(config.security);
    } else {
      this.transportSecurity = new TransportSecurity({ requireHttps: false });
    }

    // Initialize authentication manager if configured
    if (config.authentication) {
      this.authManager = new AuthenticationManager(config.authentication);
    }
  }

  /**
   * Sends a JSON-RPC request and returns the response
   */
  async sendRequest(request: ProtocolRequest): Promise<ProtocolResponse> {
    const { method } = request;
    const url = this.getMethodUrl(method);

    try {
      // Validate transport security
      this.transportSecurity.validateTransport(url, 'POST');
      this.transportSecurity.validateRequestSize(JSON.stringify(request).length);
      this.transportSecurity.checkRateLimit(request.id.toString());

      // Validate authentication if configured
      if (this.authManager && this.config.headers?.authorization) {
        const [scheme, token] = this.config.headers.authorization.split(' ');
        await this.authManager.validateAuthentication({ scheme, token });
      }

      // Sanitize request
      const sanitizedRequest = InputSanitizer.sanitizeObject(request);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(sanitizedRequest),
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const data = await response.json();
      return validateResponse(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw createA2AError(A2AErrorCode.InternalError, { cause: error.message });
      }
      throw createA2AError(A2AErrorCode.InternalError);
    }
  }

  /**
   * Creates an SSE connection for streaming methods
   */
  createSSEConnection(method: ProtocolMethod, params: unknown, options?: SSEOptions): SSEConnection {
    const url = this.getMethodUrl(method);
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      'Accept': 'text/event-stream',
      ...options?.headers
    };

    const request: ProtocolRequest = {
      jsonrpc: '2.0',
      id: Math.random().toString(36).substring(2, 15),
      method,
      params
    };

    // Validate transport security
    this.transportSecurity.validateTransport(url, 'POST');
    this.transportSecurity.validateRequestSize(JSON.stringify(request).length);
    this.transportSecurity.checkRateLimit(request.id.toString());

    // Validate authentication if configured
    if (this.authManager && headers.authorization) {
      const [scheme, token] = headers.authorization.split(' ');
      this.authManager.validateAuthentication({ scheme, token }).catch(error => {
        throw createA2AError(A2AErrorCode.AuthenticationRequired, { cause: error.message });
      });
    }

    // Sanitize request
    const sanitizedRequest = InputSanitizer.sanitizeObject(request);

    return new EventSourceConnection(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(sanitizedRequest),
      withCredentials: options?.withCredentials ?? this.config.withCredentials,
      timeout: options?.timeout ?? this.config.timeout
    });
  }

  /**
   * Gets the URL for a specific method
   */
  private getMethodUrl(method: ProtocolMethod): string {
    // For streaming methods, we need to handle them differently
    if (method === 'tasks/sendSubscribe' || method === 'tasks/resubscribe') {
      return `${this.config.baseUrl}/stream`;
    }
    return this.config.baseUrl;
  }
}

/**
 * EventSource-based SSE connection implementation
 */
class EventSourceConnection implements SSEConnection {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, Set<SSEEventHandler>> = new Map();
  private readyState: number = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSED

  constructor(
    private url: string,
    private options: {
      method: string;
      headers: Record<string, string>;
      body: string;
      withCredentials?: boolean;
      timeout?: number;
    }
  ) {}

  async connect(): Promise<void> {
    if (this.eventSource) {
      throw new Error('Connection already exists');
    }

    return new Promise((resolve, reject) => {
      const timeout = this.options.timeout ? setTimeout(() => {
        this.close();
        reject(new Error('Connection timeout'));
      }, this.options.timeout) : undefined;

      try {
        // Create EventSource with URL and credentials
        this.eventSource = new EventSource(this.url, {
          withCredentials: this.options.withCredentials
        });

        this.eventSource.onopen = () => {
          this.readyState = 1;
          clearTimeout(timeout);
          resolve();
        };

        this.eventSource.onerror = (error) => {
          this.readyState = 2;
          clearTimeout(timeout);
          reject(error);
        };

        // Set up message handler
        this.eventSource.onmessage = (event) => {
          const handlers = this.eventHandlers.get('message');
          if (handlers) {
            handlers.forEach(handler => handler({
              type: 'message',
              data: event.data,
              id: event.lastEventId
            }));
          }
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.readyState = 2;
    }
  }

  addEventListener(type: string, handler: SSEEventHandler): void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: SSEEventHandler): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  getReadyState(): number {
    return this.readyState;
  }
} 