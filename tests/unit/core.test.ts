import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../../src/core/agent';
import { Task } from '../../src/core/task';
import { Transport } from '../../src/core/transport';
import { Protocol } from '../../src/core/protocol';

describe('Core Implementation', () => {
  it('should create an Agent instance with valid config and transport', () => {
    // Mock transport
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: 'pending', content: { type: 'text', content: 'foo' }, createdAt: new Date(), updatedAt: new Date() } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;

    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text'],
      endpoint: 'ws://localhost'
    }, transport);

    expect(agent.name).toBe('TestAgent');
    expect(agent.capabilities).toContain('text');
  });

  it('should create a Task and update its status', () => {
    const task = new Task({
      content: { type: 'text', content: 'foo' }
    });
    expect(task.status).toBe('pending');
    task.updateStatus('completed');
    expect(task.status).toBe('completed');
    task.updateContent({ type: 'text', content: 'bar' });
    expect(task.content.content).toBe('bar');
    task.updateMetadata({ priority: 'high' });
    expect(task.metadata?.priority).toBe('high');
    expect(typeof task.toJSON()).toBe('object');
  });

  it('should start a task via Agent and return a Task', async () => {
    const now = new Date();
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: 'pending', content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text'],
      endpoint: 'ws://localhost'
    }, transport);
    const task = await agent.startTask({ content: { type: 'text', content: 'foo' } });
    expect(task.id).toBe('1');
    expect(task.status).toBe('pending');
  });

  it('should end a task via Agent', async () => {
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: undefined }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text'],
      endpoint: 'ws://localhost'
    }, transport);
    await expect(agent.endTask('1')).resolves.toBeUndefined();
  });

  it('should get task status via Agent', async () => {
    const now = new Date();
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: { id: '1', status: 'completed', content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now } }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text'],
      endpoint: 'ws://localhost'
    }, transport);
    const task = await agent.getTaskStatus('1');
    expect(task.status).toBe('completed');
  });

  it('should list tasks via Agent', async () => {
    const now = new Date();
    const transport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue(undefined),
      receive: vi.fn().mockResolvedValue({ result: [
        { id: '1', status: 'pending', content: { type: 'text', content: 'foo' }, createdAt: now, updatedAt: now },
        { id: '2', status: 'completed', content: { type: 'text', content: 'bar' }, createdAt: now, updatedAt: now }
      ] }),
      config: { protocol: 'ws', host: 'localhost' }
    } as unknown as Transport;
    const agent = new Agent({
      name: 'TestAgent',
      description: 'A test agent',
      capabilities: ['text'],
      endpoint: 'ws://localhost'
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
      capabilities: ['text'],
      endpoint: 'ws://localhost'
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
      capabilities: ['text'],
      endpoint: 'ws://localhost'
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
      capabilities: ['text'],
      endpoint: 'ws://localhost'
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
      capabilities: ['text'],
      endpoint: 'ws://localhost'
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
}); 