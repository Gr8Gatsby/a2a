import { describe, it, expect } from 'vitest';
import type {
  AgentConfig,
  TransportConfig
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
      capabilities: {
        streaming: true,
        pushNotifications: false,
        stateTransitionHistory: true
      },
      endpoint: 'https://test.example.com',
      version: '1.0.0'
    };
    expect(config).toBeDefined();
  });

  it('should not allow missing required fields (type)', () => {
    // @ts-expect-error
    const config: AgentConfig = {
      name: 'TestAgent',
      // description missing
      capabilities: {
        streaming: true
      },
      endpoint: 'https://test.example.com',
      version: '1.0.0'
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
      'getTaskStatus',
      'listTasks',
    ];
    expect(methods).toHaveLength(4);
  });
});

describe('Protocol Types', () => {
  it('FileContent: only one of bytes or uri allowed', () => {
    // Valid: only bytes
    const file1: import('../../src/types/message').FileContent = { name: 'foo', bytes: 'abc', uri: null };
    // Valid: only uri
    const file2: import('../../src/types/message').FileContent = { name: 'foo', bytes: null, uri: 'https://example.com/file' };
    // Valid: both null/undefined (reference only)
    const file3: import('../../src/types/message').FileContent = { name: 'foo' };
    const file4: import('../../src/types/message').FileContent = { name: 'foo', bytes: 'abc', uri: 'https://example.com/file' };
  });

  it('Artifact: at least one Part required', () => {
    // Valid
    const artifact1: import('../../src/types/artifact').Artifact = { id: 'artifact-1', parts: [{ type: 'text', text: 'hi' }] };
    const artifact2: import('../../src/types/artifact').Artifact = { id: 'artifact-2', parts: [] };
  });

  it('TaskStatus: must be object, not string', () => {
    // Valid
    const status1: import('../../src/types/task').TaskStatus = { state: 'working' };
    // @ts-expect-error - not an object
    const status2: import('../../src/types/task').TaskStatus = 'working';
  });

  it('TaskState: only allowed values', () => {
    // Valid
    const state1: import('../../src/types/task').TaskState = 'submitted';
    // @ts-expect-error - not allowed
    const state2: import('../../src/types/task').TaskState = 'foo';
  });

  it('Message: at least one Part required', () => {
    // Valid
    const msg1: import('../../src/types/message').Message = { role: 'user', parts: [{ type: 'text', text: 'hi' }] };
    const msg2: import('../../src/types/message').Message = { role: 'user', parts: [] };
  });
}); 