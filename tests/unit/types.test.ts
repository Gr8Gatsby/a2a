import { describe, it, expect } from 'vitest';
import type {
  AgentConfig,
  TaskConfig,
  TaskContentType,
  TransportConfig,
} from '../../src/types';
import type {
  ProtocolRequest,
  ProtocolResponse,
  ProtocolMethod,
} from '../../src/types/protocol';

describe('Type Definitions', () => {
  it('should allow creating a valid agent config (type)', () => {
    const config: AgentConfig = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text', 'json'],
      endpoint: 'https://test.example.com',
    };
    expect(config).toBeDefined();
  });

  it('should not allow missing required fields (type)', () => {
    // @ts-expect-error
    const config: AgentConfig = {
      name: 'TestAgent',
      // description missing
      capabilities: ['text'],
      endpoint: 'https://test.example.com',
    };
    expect(config).toBeDefined();
  });

  it('should allow all TaskContentType values', () => {
    const types: TaskContentType[] = ['text', 'json', 'binary'];
    expect(types).toHaveLength(3);
  });

  it('should allow creating a valid task config (type)', () => {
    const config: TaskConfig = {
      content: {
        type: 'json',
        content: { foo: 'bar' },
      },
      metadata: { priority: 'high' },
    };
    expect(config).toBeDefined();
  });

  it('should not allow missing content in task config', () => {
    // @ts-expect-error
    const config: TaskConfig = {
      metadata: { priority: 'high' },
    };
    expect(config).toBeDefined();
  });

  it('should allow creating a valid transport config (type)', () => {
    const config: TransportConfig = {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      path: '/ws',
      timeout: 1000,
    };
    expect(config).toBeDefined();
  });

  it('should not allow invalid protocol in transport config', () => {
    const config: TransportConfig = {
      // @ts-expect-error - invalid protocol  
      protocol: 'ftp',
      host: 'localhost',
    };
    expect(config).toBeDefined();
  });

  it('should allow creating a valid protocol request (type)', () => {
    const req: ProtocolRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'startTask',
      params: { foo: 'bar' },
    };
    expect(req).toBeDefined();
  });

  it('should not allow missing method in protocol request', () => {
    // @ts-expect-error
    const req: ProtocolRequest = {
      jsonrpc: '2.0',
      id: 1,
      params: { foo: 'bar' },
    };
    expect(req).toBeDefined();
  });

  it('should allow creating a valid protocol response (type)', () => {
    const res: ProtocolResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: { foo: 'bar' },
    };
    expect(res).toBeDefined();
  });

  it('should allow creating a valid protocol error response (type)', () => {
    const res: ProtocolResponse = {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: 123,
        message: 'Something went wrong',
        data: { foo: 'bar' },
      },
    };
    expect(res).toBeDefined();
  });

  it('should not allow missing id in protocol response', () => {
    // @ts-expect-error
    const res: ProtocolResponse = {
      jsonrpc: '2.0',
      result: { foo: 'bar' },
    };
    expect(res).toBeDefined();
  });

  it('should allow all ProtocolMethod values', () => {
    const methods: ProtocolMethod[] = [
      'startTask',
      'endTask',
      'updateTask',
      'getTaskStatus',
      'listTasks',
    ];
    expect(methods).toHaveLength(5);
  });
}); 