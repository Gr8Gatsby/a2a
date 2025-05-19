import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { HTTPTransport, HTTPTransportConfig } from '../../transport/http.js';
import { ProtocolRequest, ProtocolResponse } from '../../types/protocol.js';

describe('HTTPTransport', () => {
  let transport: HTTPTransport;
  let mockFetch: any;
  let mockEventSource: any;

  const baseConfig: HTTPTransportConfig = {
    baseUrl: 'https://api.example.com',
    headers: {
      'X-Custom-Header': 'test'
    }
  };

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock EventSource
    mockEventSource = vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      readyState: 0
    }));
    global.EventSource = mockEventSource;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with basic configuration', () => {
      transport = new HTTPTransport(baseConfig);
      expect(transport).toBeDefined();
    });

    it('should initialize with security configuration', () => {
      const configWithSecurity: HTTPTransportConfig = {
        ...baseConfig,
        security: {
          requireHttps: true,
          allowedOrigins: ['https://example.com'],
          maxRequestSize: 1024,
          rateLimit: {
            windowMs: 1000,
            maxRequests: 10
          }
        }
      };
      transport = new HTTPTransport(configWithSecurity);
      expect(transport).toBeDefined();
    });

    it('should initialize with authentication configuration', () => {
      const configWithAuth: HTTPTransportConfig = {
        ...baseConfig,
        authentication: {
          schemes: ['bearer'],
          validateToken: vi.fn().mockResolvedValue(true)
        }
      };
      transport = new HTTPTransport(configWithAuth);
      expect(transport).toBeDefined();
    });
  });

  describe('sendRequest', () => {
    beforeEach(() => {
      transport = new HTTPTransport(baseConfig);
    });

    it('should send a successful request', async () => {
      const mockResponse: ProtocolResponse = {
        jsonrpc: '2.0',
        id: '1',
        result: { success: true }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      const response = await transport.sendRequest(request);
      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Custom-Header': 'test'
          }),
          body: JSON.stringify(request)
        })
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await expect(transport.sendRequest(request)).rejects.toThrow();
    });

    it('should handle invalid content type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        json: () => Promise.resolve({})
      });

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await expect(transport.sendRequest(request)).rejects.toThrow('Internal server error');
    });

    it('should handle request timeout', async () => {
      const configWithTimeout: HTTPTransportConfig = {
        ...baseConfig,
        timeout: 1000
      };
      transport = new HTTPTransport(configWithTimeout);

      mockFetch.mockRejectedValueOnce(new Error('timeout'));

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await expect(transport.sendRequest(request)).rejects.toThrow();
    });
  });

  describe('createSSEConnection', () => {
    beforeEach(() => {
      transport = new HTTPTransport(baseConfig);
    });

    it('should create an SSE connection for streaming methods', async () => {
      // Mock EventSource to resolve immediately
      mockEventSource.mockImplementation(() => {
        const eventSource = {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          close: vi.fn(),
          readyState: 1, // OPEN
          onopen: null as (() => void) | null,
          onerror: null as ((error: any) => void) | null,
          onmessage: null as ((event: any) => void) | null
        };
        // Trigger onopen immediately
        setTimeout(() => eventSource.onopen?.(), 0);
        return eventSource;
      });

      const connection = transport.createSSEConnection('tasks/sendSubscribe', { id: 'task-1' });
      expect(connection).toBeDefined();
      
      await connection.connect();
      expect(mockEventSource).toHaveBeenCalledWith(
        'https://api.example.com/stream',
        { withCredentials: undefined }
      );
    });

    it('should create an SSE connection with custom options', async () => {
      // Mock EventSource to resolve immediately
      mockEventSource.mockImplementation(() => {
        const eventSource = {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          close: vi.fn(),
          readyState: 1, // OPEN
          onopen: null as (() => void) | null,
          onerror: null as ((error: any) => void) | null,
          onmessage: null as ((event: any) => void) | null
        };
        // Trigger onopen immediately
        setTimeout(() => eventSource.onopen?.(), 0);
        return eventSource;
      });

      const connection = transport.createSSEConnection(
        'tasks/sendSubscribe',
        { id: 'task-1' },
        {
          withCredentials: true,
          timeout: 5000,
          headers: { 'X-Custom-Header': 'test' }
        }
      );
      expect(connection).toBeDefined();
      
      await connection.connect();
      expect(mockEventSource).toHaveBeenCalledWith(
        'https://api.example.com/stream',
        { withCredentials: true }
      );
    });

    it('should handle connection timeout', async () => {
      // Mock EventSource to never resolve
      mockEventSource.mockImplementation(() => ({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        close: vi.fn(),
        readyState: 0, // CONNECTING
        onopen: null,
        onerror: null,
        onmessage: null
      }));

      const connection = transport.createSSEConnection(
        'tasks/sendSubscribe',
        { id: 'task-1' },
        { timeout: 100 }
      );

      await expect(connection.connect()).rejects.toThrow('Connection timeout');
    });
  });

  describe('security validation', () => {
    it('should validate HTTPS requirement', async () => {
      const configWithSecurity: HTTPTransportConfig = {
        ...baseConfig,
        baseUrl: 'http://api.example.com',
        security: {
          requireHttps: true
        }
      };
      transport = new HTTPTransport(configWithSecurity);

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await expect(transport.sendRequest(request)).rejects.toThrow();
    });

    it('should validate request size', async () => {
      const configWithSecurity: HTTPTransportConfig = {
        ...baseConfig,
        security: {
          requireHttps: false,
          maxRequestSize: 10
        }
      };
      transport = new HTTPTransport(configWithSecurity);

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await expect(transport.sendRequest(request)).rejects.toThrow();
    });
  });

  describe('authentication', () => {
    it('should validate authentication token', async () => {
      const validateToken = vi.fn().mockResolvedValue(true);
      const configWithAuth: HTTPTransportConfig = {
        ...baseConfig,
        authentication: {
          schemes: ['bearer'],
          validateToken
        },
        headers: {
          ...baseConfig.headers,
          'authorization': 'bearer test-token'
        }
      };
      transport = new HTTPTransport(configWithAuth);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ jsonrpc: '2.0', id: '1', result: {} })
      });

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await transport.sendRequest(request);
      expect(validateToken).toHaveBeenCalledWith('test-token');
    });

    it('should reject invalid authentication token', async () => {
      const validateToken = vi.fn().mockResolvedValue(false);
      const configWithAuth: HTTPTransportConfig = {
        ...baseConfig,
        authentication: {
          schemes: ['bearer'],
          validateToken
        },
        headers: {
          ...baseConfig.headers,
          'authorization': 'bearer invalid-token'
        }
      };
      transport = new HTTPTransport(configWithAuth);

      const request: ProtocolRequest = {
        jsonrpc: '2.0',
        id: '1',
        method: 'tasks/send',
        params: { id: 'task-1' }
      };

      await expect(transport.sendRequest(request)).rejects.toThrow();
    });
  });
}); 