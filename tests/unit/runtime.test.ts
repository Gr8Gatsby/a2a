import { describe, it, expect } from 'vitest';
import { AgentConfigSchema } from '../../src/schemas/agentConfig.schema';
import { TaskConfigSchema } from '../../src/schemas/task.schema';
import { TransportConfigSchema } from '../../src/schemas/transport.schema';
import { ProtocolRequestSchema, ProtocolResponseSchema } from '../../src/schemas/protocol.schema';

describe('Runtime Validation', () => {
  it('should validate agent config at runtime (zod)', () => {
    const valid = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text', 'json'],
      endpoint: 'https://test.example.com',
    };
    const result = AgentConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['invalid'], // not allowed
      endpoint: 'not-a-url',
    };
    const result2 = AgentConfigSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });

  it('should reject agent config with empty capabilities', () => {
    const config = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: [],
      endpoint: 'https://test.example.com',
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should reject agent config with extra fields', () => {
    const config = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text'],
      endpoint: 'https://test.example.com',
      extra: 'not allowed',
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should reject agent config with null or undefined fields', () => {
    const config = {
      name: null,
      description: undefined,
      capabilities: ['text'],
      endpoint: 'https://test.example.com',
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should validate task config at runtime (zod)', () => {
    const valid = {
      content: {
        type: 'text',
        content: 'Hello',
      },
    };
    const result = TaskConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = {
      content: {
        type: 'invalid',
        content: 'Hello',
      },
    };
    const result2 = TaskConfigSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });

  it('should validate transport config at runtime (zod)', () => {
    const valid = {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      path: '/ws',
      timeout: 1000,
    };
    const result = TransportConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = {
      protocol: 'ftp', // not allowed
      host: 'localhost',
    };
    const result2 = TransportConfigSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });

  it('should validate protocol request at runtime (zod)', () => {
    const valid = {
      jsonrpc: '2.0',
      id: 1,
      method: 'startTask',
      params: { foo: 'bar' },
    };
    const result = ProtocolRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = {
      jsonrpc: '2.0',
      id: 1,
      params: { foo: 'bar' }, // missing method
    };
    const result2 = ProtocolRequestSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });

  it('should validate protocol response at runtime (zod)', () => {
    const valid = {
      jsonrpc: '2.0',
      id: 1,
      result: { foo: 'bar' },
    };
    const result = ProtocolResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const errorRes = {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: 123,
        message: 'Something went wrong',
        data: { foo: 'bar' },
      },
    };
    const result2 = ProtocolResponseSchema.safeParse(errorRes);
    expect(result2.success).toBe(true);

    const invalid = {
      jsonrpc: '2.0',
      result: { foo: 'bar' }, // missing id
    };
    const result3 = ProtocolResponseSchema.safeParse(invalid);
    expect(result3.success).toBe(false);
  });
}); 