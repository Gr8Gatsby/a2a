import { describe, it, expect } from 'vitest';
import { AgentConfigSchema } from '../../src/schemas/agentConfig.schema';
import { TaskConfigSchema } from '../../src/schemas/task.schema';
import { TransportConfigSchema } from '../../src/schemas/transport.schema';
import { ProtocolRequestSchema, ProtocolResponseSchema } from '../../src/schemas/protocol.schema';

describe('Runtime Validation', () => {
  const defaultCapabilities = {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true
  };

  it('should validate agent config at runtime (zod)', () => {
    const valid = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'https://test.example.com',
      version: '1.0.0'
    };
    const result = AgentConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: {
        streaming: 'not-a-boolean', // invalid type
        pushNotifications: false,
        stateTransitionHistory: true
      },
      endpoint: 'https://test.example.com',
      version: '1.0.0'
    };
    const result2 = AgentConfigSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });

  it('should accept agent config with minimal capabilities', () => {
    const config = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: {}, // all capabilities optional
      endpoint: 'https://test.example.com',
      version: '1.0.0'
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should reject agent config with extra capability fields', () => {
    const config = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: {
        ...defaultCapabilities,
        extraCapability: true // not allowed
      },
      endpoint: 'https://test.example.com',
      version: '1.0.0'
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should reject agent config with null or undefined fields', () => {
    const config = {
      name: null,
      description: undefined,
      capabilities: defaultCapabilities,
      endpoint: 'https://test.example.com',
      version: '1.0.0'
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

  it('should validate agent config with skills', () => {
    const config = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: { streaming: true },
      endpoint: 'https://test.example.com',
      version: '1.0.0',
      skills: [
        {
          id: 'summarize-text',
          name: 'Text Summarizer',
          description: 'Summarizes input text.',
          tags: ['nlp', 'summarization'],
          examples: ['Summarize this article', 'TL;DR for the following text'],
          inputModes: ['text/plain'],
          outputModes: ['text/plain']
        },
        {
          id: 'currency-converter',
          name: 'Currency Converter',
          tags: ['finance', 'conversion'],
          examples: ['convert 100 USD to EUR'],
          inputModes: ['application/json'],
          outputModes: ['application/json']
        }
      ]
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(true);

    // Invalid: missing id
    const invalid = {
      ...config,
      skills: [{ name: 'No ID' }]
    };
    const result2 = AgentConfigSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });

  it('should validate agent config with authentication', () => {
    const config = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: { streaming: true },
      endpoint: 'https://test.example.com',
      version: '1.0.0',
      authentication: {
        schemes: ['OAuth2', 'ApiKey'],
        credentials: '{"authorizationUrl": "https://auth.example.com", "tokenUrl": "https://token.example.com"}'
      }
    };
    const result = AgentConfigSchema.safeParse(config);
    expect(result.success).toBe(true);

    // Invalid: missing schemes
    const invalid = {
      ...config,
      authentication: { credentials: '{}' }
    };
    const result2 = AgentConfigSchema.safeParse(invalid);
    expect(result2.success).toBe(false);
  });
}); 