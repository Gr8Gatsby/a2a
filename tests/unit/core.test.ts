import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Agent } from '../../src/core/agent';
import { Task } from '../../src/core/task';
import { Transport } from '../../src/core/transport';
import { Protocol } from '../../src/core/protocol';

describe('Core Implementation', () => {
  const now = new Date();
  const defaultCapabilities = {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true
  };

  it('should create an Agent instance with valid config and transport', () => {
    // Mock transport
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: { state: 'pending' }, content: { type: 'text', content: 'foo' }, createdAt: new Date(), updatedAt: new Date() } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;

    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);

    expect(agent.name).toBe('TestAgent');
    expect(agent.capabilities.streaming).toBe(true);
    expect(agent.capabilities.pushNotifications).toBe(false);
    expect(agent.version).toBe('1.0.0');
  });

  it('should create a Task and update its status', () => {
    const task = new Task({});
    expect(task.status.state).toBe('pending');
    task.updateStatus('completed');
    expect(task.status.state).toBe('completed');
    task.updateMetadata({ priority: 'high' });
    expect(task.metadata?.priority).toBe('high');
    expect(typeof task.toJSON()).toBe('object');
  });

  it('should handle push notification configuration', () => {
    const pushConfig = {
      id: 'push-1',
      pushNotificationConfig: {
        url: 'https://client.example.com/webhook',
        token: 'secure-token',
        authentication: { schemes: ['Bearer'] }
      }
    };

    // Test constructor with push notification
    const task = new Task({ pushNotification: pushConfig });
    expect(task.getPushNotification()).toEqual(pushConfig);

    // Test setting push notification after creation
    const task2 = new Task({});
    expect(task2.getPushNotification()).toBeUndefined();
    task2.setPushNotification(pushConfig);
    expect(task2.getPushNotification()).toEqual(pushConfig);

    // Test push notification in JSON output
    const json = task2.toJSON();
    expect(json.pushNotification).toEqual(pushConfig);
  });

  it('should start a task via Agent and return a Task', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: { state: 'pending' }, content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    const task = await agent.startTask({ content: { type: 'text', content: 'foo' } });
    expect(task.id).toBe('1');
    expect(task.status.state).toBe('pending');
  });

  it('should end a task via Agent', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: { state: 'completed' }, content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    await expect(agent.endTask('1')).resolves.toBeUndefined();
  });

  it('should get task status via Agent', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: { state: 'completed' }, content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    const task = await agent.getTaskStatus('1');
    expect(task.status.state).toBe('completed');
  });

  it('should list tasks via Agent', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: [
        { id: '1', status: { state: 'pending' }, content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now },
        { id: '2', status: { state: 'completed' }, content: { type: 'text', content: 'bar' }, createdAt: now, updatedAt: now }
      ] }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    const tasks = await agent.listTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe('1');
    expect(tasks[1].id).toBe('2');
  });

  it('should throw error if Agent receives error response on startTask', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ error: { code: 123, message: 'fail' } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    await expect(agent.startTask({ content: { type: 'text', content: 'foo' } })).rejects.toThrow('Failed to start task: fail');
  });

  it('should throw error if Agent receives error response on endTask', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ error: { code: 123, message: 'fail end' } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    await expect(agent.endTask('1')).rejects.toThrow('Failed to end task: fail end');
  });

  it('should throw error if Agent receives error response on getTaskStatus', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ error: { code: 123, message: 'fail status' } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    await expect(agent.getTaskStatus('1')).rejects.toThrow('Failed to get task status: fail status');
  });

  it('should throw error if Agent receives error response on listTasks', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ error: { code: 123, message: 'fail list' } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);
    await expect(agent.listTasks()).rejects.toThrow('Failed to list tasks: fail list');
  });

  it('should create and validate Protocol requests and responses', () => {
    const req = Protocol.createRequest('startTask', { foo: 'bar' });
    expect(req.jsonrpc).toBe('2.0');
    expect(req.method).toBe('startTask');
    expect(Protocol.validateRequest(req)).toBe(true);
    expect(Protocol.validateRequest({})).toBe(false);

    const res = Protocol.createResponse(1, { foo: 'bar' });
    expect(res.jsonrpc).toBe('2.0');
    expect(res.id).toBe(1);
    expect(res.result).toEqual({ foo: 'bar' });
    expect(Protocol.validateResponse(res)).toBe(true);
    expect(Protocol.validateResponse({})).toBe(false);

    const errRes = Protocol.createErrorResponse(2, 123, 'fail', { foo: 'bar' });
    expect(errRes.error?.code).toBe(123);
    expect(errRes.error?.message).toBe('fail');
    expect(errRes.error?.data).toEqual({ foo: 'bar' });
  });

  it('should throw for invalid protocol in Transport', () => {
    expect(() => {
      new Transport({ protocol: 'ftp' as any, host: 'localhost' });
    }).toThrow('Invalid protocol: ftp. Must be one of: http, https, ws, wss');
  });

  it('should build correct URL in Transport', () => {
    const t1 = new Transport({ protocol: 'ws', host: 'localhost' });
    // @ts-ignore: access private method for test
    expect(t1.buildUrl()).toBe('ws://localhost');
    const t2 = new Transport({ protocol: 'ws', host: 'localhost', port: 1234 });
    // @ts-ignore: access private method for test
    expect(t2.buildUrl()).toBe('ws://localhost:1234');
    const t3 = new Transport({ protocol: 'ws', host: 'localhost', path: 'foo/bar' });
    // @ts-ignore: access private method for test
    expect(t3.buildUrl()).toBe('ws://localhost/foo/bar');
  });

  it('should throw if send/receive/disconnect called when not connected', async () => {
    const t = new Transport({ protocol: 'ws', host: 'localhost' });
    await expect(t.disconnect()).resolves.toBeUndefined();
    await expect(t.send({} as any)).rejects.toThrow('Not connected');
    await expect(t.receive()).rejects.toThrow('Not connected');
  });

  // Additional tests for protocol.ts branch/edge coverage
  it('should return false for validateRequest with missing/invalid fields', () => {
    expect(Protocol.validateRequest(null)).toBe(false);
    expect(Protocol.validateRequest(undefined)).toBe(false);
    expect(Protocol.validateRequest({ jsonrpc: '2.0', id: 1, method: 123, params: {} })).toBe(false); // method not string
    expect(Protocol.validateRequest({ jsonrpc: '2.0', id: 1, method: 'startTask' })).toBe(false); // missing params
    expect(Protocol.validateRequest({ jsonrpc: '1.0', id: 1, method: 'startTask', params: {} })).toBe(false); // wrong jsonrpc
    expect(Protocol.validateRequest({ jsonrpc: '2.0', id: {}, method: 'startTask', params: {} })).toBe(false); // id not string/number
  });

  it('should return false for validateResponse with missing/invalid fields', () => {
    expect(Protocol.validateResponse(null)).toBe(false);
    expect(Protocol.validateResponse(undefined)).toBe(false);
    expect(Protocol.validateResponse({ jsonrpc: '2.0', id: 1 })).toBe(false); // missing result and error
    expect(Protocol.validateResponse({ jsonrpc: '2.0', id: {}, result: {} })).toBe(false); // id not string/number
    expect(Protocol.validateResponse({ jsonrpc: '1.0', id: 1, result: {} })).toBe(false); // wrong jsonrpc
  });

  // Additional tests for transport.ts branch/edge coverage
  it('should not reconnect if already connected in Transport', async () => {
    const t = new Transport({ protocol: 'ws', host: 'localhost' });
    // @ts-ignore: simulate already connected
    t.connection = {} as any;
    await expect(t.connect()).resolves.toBeUndefined();
  });

  it('should handle connection error in Transport.connect', async () => {
    // Mock WebSocket
    class FakeWebSocket {
      onopen: (() => void) | null = null;
      onerror: ((err: any) => void) | null = null;
      constructor() {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('fail connect'));
        }, 0);
      }
    }
    // @ts-ignore: override global
    global.WebSocket = FakeWebSocket;
    const t = new Transport({ protocol: 'ws', host: 'localhost' });
    await expect(t.connect()).rejects.toThrow();
    // Clean up
    // @ts-ignore
    delete global.WebSocket;
  });

  it('should handle onmessage and onerror in Transport.receive', async () => {
    // Mock WebSocket
    let onmessage: ((event: any) => void) | null = null;
    let onerror: ((err: any) => void) | null = null;
    class FakeWebSocket {
      onopen: (() => void) | null = null;
      onerror: ((err: any) => void) | null = null;
      onmessage: ((event: any) => void) | null = null;
      close = vi.fn();
      send = vi.fn();
      constructor() {
        onmessage = null;
        onerror = null;
        setTimeout(() => {
          if (this.onopen) this.onopen();
        }, 0);
      }
    }
    // @ts-ignore: override global
    global.WebSocket = FakeWebSocket;
    const t = new Transport({ protocol: 'ws', host: 'localhost' });
    // @ts-ignore: simulate connected
    t.connection = new FakeWebSocket();
    // Simulate onmessage
    const receivePromise = t.receive();
    // @ts-ignore
    t.connection.onmessage({ data: JSON.stringify({ foo: 'bar' }) });
    await expect(receivePromise).resolves.toEqual({ foo: 'bar' });
    // Simulate onerror
    const receivePromise2 = t.receive();
    // @ts-ignore
    t.connection.onerror(new Error('fail receive'));
    await expect(receivePromise2).rejects.toThrow();
    // Clean up
    // @ts-ignore
    delete global.WebSocket;
  });

  it('should handle WebSocket onopen and onerror in connect', async () => {
    let onopen: (() => void) | null = null;
    let onerror: ((err: any) => void) | null = null;
    class FakeWebSocket {
      constructor() {
        setTimeout(() => {
          if (onopen) onopen();
        }, 0);
      }
      set onopen(fn) { onopen = fn; }
      get onopen() { return onopen; }
      set onerror(fn) { onerror = fn; }
      get onerror() { return onerror; }
    }
    // @ts-ignore
    global.WebSocket = FakeWebSocket;
    const t = new Transport({ protocol: 'ws', host: 'localhost' });
    await expect(t.connect()).resolves.toBeUndefined();
    // Simulate error after connection
    const t2 = new Transport({ protocol: 'ws', host: 'localhost' });
    setTimeout(() => {
      if (onerror) onerror(new Error('fail after connect'));
    }, 0);
    await expect(t2.connect()).rejects.toThrow();
    // @ts-ignore
    delete global.WebSocket;
  });

  it('should not throw if disconnect is called when already disconnected', async () => {
    const t = new Transport({ protocol: 'ws', host: 'localhost' });
    await expect(t.disconnect()).resolves.toBeUndefined();
  });

  describe('Transport SSE support', () => {
    let originalEventSource: any;
    beforeAll(() => {
      originalEventSource = global.EventSource;
    });
    afterAll(() => {
      global.EventSource = originalEventSource;
    });

    it('should connect and disconnect with SSE', async () => {
      let addListenerCalled = false;
      let removeListenerCalled = false;
      class FakeEventSource {
        addEventListener(event: string, cb: any) { addListenerCalled = true; }
        removeEventListener(event: string, cb: any) { removeListenerCalled = true; }
        close() { }
      }
      // @ts-ignore
      global.EventSource = FakeEventSource;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await t.connect();
      await t.disconnect();
      expect(addListenerCalled).toBe(true);
      expect(removeListenerCalled).toBe(true);
    });

    it('should receive and parse SSE messages', async () => {
      let listener: ((event: any) => void) | null = null;
      class FakeEventSource {
        addEventListener(event: string, cb: any) { listener = cb; }
        removeEventListener() { }
        close() { }
      }
      // @ts-ignore
      global.EventSource = FakeEventSource;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await t.connect();
      // Simulate receiving a message
      const receivePromise = t.receive();
      listener!({ data: JSON.stringify({ foo: 'bar' }) });
      await expect(receivePromise).resolves.toEqual({ foo: 'bar' });
      await t.disconnect();
    });

    it('should reject on invalid JSON in SSE message', async () => {
      let listener: ((event: any) => void) | null = null;
      class FakeEventSource {
        addEventListener(event: string, cb: any) { listener = cb; }
        removeEventListener() { }
        close() { }
      }
      // @ts-ignore
      global.EventSource = FakeEventSource;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await t.connect();
      const receivePromise = t.receive();
      listener!({ data: 'not-json' });
      await expect(receivePromise).rejects.toThrow();
      await t.disconnect();
    });

    it('should throw if send is called for SSE', async () => {
      class FakeEventSource {
        addEventListener() { }
        removeEventListener() { }
        close() { }
      }
      // @ts-ignore
      global.EventSource = FakeEventSource;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await t.connect();
      await expect(t.send({} as any)).rejects.toThrow('SSE transport does not support sending messages from client to server');
      await t.disconnect();
    });

    it('should throw if EventSource is not available', async () => {
      // @ts-ignore
      global.EventSource = undefined;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await expect(t.connect()).rejects.toThrow('EventSource is not available in this environment');
    });
  });

  it('should implement event emitter methods', () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: { state: 'pending' }, content: { type: 'text', content: 'foo' }, createdAt: new Date(), updatedAt: new Date() } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;

    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    }, transport);

    // Test event emitter methods
    const listener = vi.fn();
    agent.on('testEvent', listener);
    agent.emit('testEvent', 'testData');
    expect(listener).toHaveBeenCalledWith('testData');
  });

  describe('Push Notification Support', () => {
    it('should set push notification config for a task', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ 
          result: { 
            id: 'push-2',
            pushNotificationConfig: {
              url: 'https://client.example.com/webhook',
              token: 'secure-token',
              authentication: { schemes: ['Bearer'] }
            }
          } 
        }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;

      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: { ...defaultCapabilities, pushNotifications: true },
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);

      const config = {
        id: 'push-2',
        pushNotificationConfig: {
          url: 'https://client.example.com/webhook',
          token: 'secure-token',
          authentication: { schemes: ['Bearer'] }
        }
      };

      const result = await agent.setPushNotification('task-1', config);
      expect(result).toEqual(config);
    });

    it('should get push notification config for a task', async () => {
      const config = {
        id: 'push-3',
        pushNotificationConfig: {
          url: 'https://client.example.com/webhook',
          token: 'secure-token',
          authentication: { schemes: ['Bearer'] }
        }
      };

      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ result: config }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;

      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: { ...defaultCapabilities, pushNotifications: true },
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);

      const result = await agent.getPushNotification('task-1');
      expect(result).toEqual(config);
    });

    it('should throw error if push notifications not supported', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ result: {} }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;

      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: { ...defaultCapabilities, pushNotifications: false },
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);

      const config = {
        id: 'push-4',
        pushNotificationConfig: {
          url: 'https://client.example.com/webhook',
          token: 'secure-token'
        }
      };

      await expect(agent.setPushNotification('task-1', config))
        .rejects.toThrow('Push notifications are not supported by this agent');
      await expect(agent.getPushNotification('task-1'))
        .rejects.toThrow('Push notifications are not supported by this agent');
    });

    it('should cancel a task', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ 
          result: { 
            id: 'task-1',
            status: { state: 'canceled' },
            content: { type: 'text', content: 'foo' },
            createdAt: now,
            updatedAt: now
          } 
        }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;

      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: defaultCapabilities,
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);

      const task = await agent.cancelTask('task-1');
      expect(task.id).toBe('task-1');
      expect(task.status.state).toBe('canceled');
    });
  });

  describe('Error Handling', () => {
    it('should handle different error codes in startTask', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ 
          error: { 
            code: 404, 
            message: 'Task not found',
            data: { taskId: '1' }
          } 
        }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: defaultCapabilities,
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);
      await expect(agent.startTask({ content: { type: 'text', content: 'foo' } }))
        .rejects.toThrow('Failed to start task: Task not found');
    });

    it('should handle different error codes in getTaskStatus', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ 
          error: { 
            code: 403, 
            message: 'Access denied',
            data: { reason: 'insufficient permissions' }
          } 
        }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: defaultCapabilities,
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);
      await expect(agent.getTaskStatus('1'))
        .rejects.toThrow('Failed to get task status: Access denied');
    });

    it('should handle different error codes in listTasks', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ 
          error: { 
            code: 500, 
            message: 'Internal server error',
            data: { details: 'Database connection failed' }
          } 
        }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: defaultCapabilities,
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);
      await expect(agent.listTasks())
        .rejects.toThrow('Failed to list tasks: Internal server error');
    });

    it('should handle transport errors in task operations', async () => {
      const transport = {
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({}),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent({
        name: 'TestAgent',
        description: 'A test agent',
        capabilities: defaultCapabilities,
        endpoint: 'ws://localhost',
        version: '1.0.0'
      }, transport);
      await expect(agent.startTask({ content: { type: 'text', content: 'foo' } }))
        .rejects.toThrow('Connection failed');
    });
  });

  describe('Transport Error Handling', () => {
    it('should handle SSE message parsing errors', async () => {
      let listener: ((event: any) => void) | null = null;
      class FakeEventSource {
        addEventListener(event: string, cb: any) { listener = cb; }
        removeEventListener() { }
        close() { }
      }
      // @ts-ignore
      global.EventSource = FakeEventSource;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await t.connect();
      const receivePromise = t.receive();
      listener!({ data: 'invalid-json' });
      await expect(receivePromise).rejects.toThrow();
      await t.disconnect();
    });

    it('should handle WebSocket message parsing errors', async () => {
      let onmessage: ((event: any) => void) | null = null;
      class FakeWebSocket {
        onopen: (() => void) | null = null;
        onerror: ((err: any) => void) | null = null;
        onmessage: ((event: any) => void) | null = null;
        close = vi.fn();
        send = vi.fn();
        constructor() {
          setTimeout(() => {
            if (this.onopen) this.onopen();
          }, 0);
        }
      }
      // @ts-ignore
      global.WebSocket = FakeWebSocket;
      const t = new Transport({ protocol: 'ws', host: 'localhost' });
      await t.connect();
      // @ts-ignore
      t.connection = new FakeWebSocket();
      const receivePromise = t.receive();
      // @ts-ignore
      t.connection.onmessage({ data: 'invalid-json' });
      await expect(receivePromise).rejects.toThrow();
      // Clean up
      // @ts-ignore
      delete global.WebSocket;
    });

    it('should handle WebSocket send errors', async () => {
      class FakeWebSocket {
        onopen: (() => void) | null = null;
        onerror: ((err: any) => void) | null = null;
        close = vi.fn();
        send = vi.fn().mockImplementation(() => {
          throw new Error('Send failed');
        });
        constructor() {
          setTimeout(() => {
            if (this.onopen) this.onopen();
          }, 0);
        }
      }
      // @ts-ignore
      global.WebSocket = FakeWebSocket;
      const t = new Transport({ protocol: 'ws', host: 'localhost' });
      await t.connect();
      // @ts-ignore
      t.connection = new FakeWebSocket();
      await expect(t.send({} as any)).rejects.toThrow('Send failed');
      // Clean up
      // @ts-ignore
      delete global.WebSocket;
    });

    it('should handle connection state validation', async () => {
      const t = new Transport({ protocol: 'ws', host: 'localhost' });
      await expect(t.send({} as any)).rejects.toThrow('Not connected');
      await expect(t.receive()).rejects.toThrow('Not connected');
      await expect(t.disconnect()).resolves.toBeUndefined();
    });

    it('should handle SSE connection errors', async () => {
      class FakeEventSource {
        addEventListener() { }
        removeEventListener() { }
        close() { }
        constructor() {
          throw new Error('SSE connection failed');
        }
      }
      // @ts-ignore
      global.EventSource = FakeEventSource;
      const t = new Transport({ protocol: 'sse', host: 'localhost' });
      await expect(t.connect()).rejects.toThrow('SSE connection failed');
      // Clean up
      // @ts-ignore
      delete global.EventSource;
    });
  });

  describe('Agent Unknown Response Handling', () => {
    const agentConfig = {
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: defaultCapabilities,
      endpoint: 'ws://localhost',
      version: '1.0.0'
    };

    it('should throw error if Agent receives unknown response on startTask', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ foo: 'bar' }), // neither result nor error
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent(agentConfig, transport);
      await expect(agent.startTask({ content: { type: 'text', content: 'foo' } }))
        .rejects.toThrow('Failed to start task: Unknown error');
    });

    it('should throw error if Agent receives unknown response on getTaskStatus', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ foo: 'bar' }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent(agentConfig, transport);
      await expect(agent.getTaskStatus('1'))
        .rejects.toThrow('Failed to get task status: Unknown error');
    });

    it('should throw error if Agent receives unknown response on listTasks', async () => {
      const transport = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue(undefined),
        receive: vi.fn().mockResolvedValue({ foo: 'bar' }),
        config: { protocol: 'ws', host: 'localhost' }
      } as unknown as Transport;
      const agent = new Agent(agentConfig, transport);
      await expect(agent.listTasks())
        .rejects.toThrow('Failed to list tasks: Unknown error');
    });
  });
}); 