import { describe, expect, it, vi, beforeEach } from 'vitest';
import { A2AClient } from '../client.js';
import { HTTPTransport } from '../transport/http.js';
import { Task, TaskStatus, TaskPushNotificationConfig } from '../types/task.js';
import { TextPart } from '../types/message.js';
import { A2AErrorCode } from '../types/errors.js';

// Mock HTTPTransport
vi.mock('../transport/http', () => ({
  HTTPTransport: vi.fn().mockImplementation(() => ({
    sendRequest: vi.fn(),
    createSSEConnection: vi.fn()
  }))
}));

describe('A2AClient', () => {
  let client: A2AClient;
  let mockTransport: HTTPTransport;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new A2AClient({
      baseUrl: 'http://localhost:3000',
      version: '1.0.0'
    });
    mockTransport = (client as any).transport;
  });

  describe('sendTask', () => {
    it('should send a task and return the response', async () => {
      const mockTask: Task = {
        id: 'task-1',
        status: {
          state: 'submitted',
          message: {
            role: 'user',
            parts: [{ type: 'text', text: 'test' } as TextPart]
          }
        }
      };

      (mockTransport.sendRequest as any).mockResolvedValue({
        jsonrpc: '2.0',
        id: '1',
        result: mockTask
      });

      const result = await client.sendTask({
        id: 'task-1',
        message: {
          role: 'user',
          parts: [{ type: 'text', text: 'test' } as TextPart]
        }
      });

      expect(result).toEqual(mockTask);
      expect(mockTransport.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'tasks/send',
        params: expect.objectContaining({
          id: 'task-1',
          message: expect.objectContaining({
            role: 'user',
            parts: [{ type: 'text', text: 'test' }]
          })
        })
      }));
    });

    it('should throw an error if the response contains an error', async () => {
      (mockTransport.sendRequest as any).mockResolvedValue({
        jsonrpc: '2.0',
        id: '1',
        error: {
          code: A2AErrorCode.TaskNotFound,
          message: 'Task not found'
        }
      });

      await expect(client.sendTask({
        id: 'task-1',
        message: {
          role: 'user',
          parts: [{ type: 'text', text: 'test' } as TextPart]
        }
      })).rejects.toThrow();
    });
  });

  describe('subscribeToTask', () => {
    it('should create an SSE connection', () => {
      const mockConnection = { connect: vi.fn() };
      (mockTransport.createSSEConnection as any).mockReturnValue(mockConnection);

      const connection = client.subscribeToTask({
        id: 'task-1',
        message: {
          role: 'user',
          parts: [{ type: 'text', text: 'test' } as TextPart]
        }
      });

      expect(connection).toBe(mockConnection);
      expect(mockTransport.createSSEConnection).toHaveBeenCalledWith(
        'tasks/sendSubscribe',
        expect.objectContaining({
          id: 'task-1',
          message: expect.objectContaining({
            role: 'user',
            parts: [{ type: 'text', text: 'test' }]
          })
        }),
        undefined
      );
    });
  });

  describe('getTask', () => {
    it('should get a task and return the response', async () => {
      const mockTask: Task = {
        id: 'task-1',
        status: {
          state: 'completed',
          message: {
            role: 'user',
            parts: [{ type: 'text', text: 'test' } as TextPart]
          }
        }
      };

      (mockTransport.sendRequest as any).mockResolvedValue({
        jsonrpc: '2.0',
        id: '1',
        result: mockTask
      });

      const result = await client.getTask({
        id: 'task-1'
      });

      expect(result).toEqual(mockTask);
      expect(mockTransport.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'tasks/get',
        params: expect.objectContaining({
          id: 'task-1'
        })
      }));
    });
  });

  describe('cancelTask', () => {
    it('should cancel a task and return the status', async () => {
      const mockStatus: TaskStatus = {
        state: 'canceled',
        message: null
      };

      (mockTransport.sendRequest as any).mockResolvedValue({
        jsonrpc: '2.0',
        id: '1',
        result: mockStatus
      });

      const result = await client.cancelTask({
        id: 'task-1'
      });

      expect(result).toEqual(mockStatus);
      expect(mockTransport.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'tasks/cancel',
        params: expect.objectContaining({
          id: 'task-1'
        })
      }));
    });
  });

  describe('setPushNotification', () => {
    it('should set push notification configuration', async () => {
      const pushNotification: TaskPushNotificationConfig = {
        id: 'task-1',
        pushNotificationConfig: {
          url: 'http://example.com/webhook',
          token: 'token',
          authentication: {
            schemes: ['bearer']
          }
        }
      };

      (mockTransport.sendRequest as any).mockResolvedValue({
        jsonrpc: '2.0',
        id: '1',
        result: null
      });

      await client.setPushNotification({
        id: 'task-1',
        pushNotification
      });

      expect(mockTransport.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'tasks/pushNotification/set',
        params: expect.objectContaining({
          id: 'task-1',
          pushNotification
        })
      }));
    });
  });

  describe('getPushNotification', () => {
    it('should get push notification configuration', async () => {
      const mockPushNotification: TaskPushNotificationConfig = {
        id: 'task-1',
        pushNotificationConfig: {
          url: 'http://example.com/webhook',
          token: 'token',
          authentication: {
            schemes: ['bearer']
          }
        }
      };

      (mockTransport.sendRequest as any).mockResolvedValue({
        jsonrpc: '2.0',
        id: '1',
        result: mockPushNotification
      });

      const result = await client.getPushNotification({
        id: 'task-1'
      });

      expect(result).toEqual(mockPushNotification);
      expect(mockTransport.sendRequest).toHaveBeenCalledWith(expect.objectContaining({
        method: 'tasks/pushNotification/get',
        params: expect.objectContaining({
          id: 'task-1'
        })
      }));
    });
  });

  describe('resubscribeToTask', () => {
    it('should create an SSE connection for resubscription', () => {
      const mockConnection = { connect: vi.fn() };
      (mockTransport.createSSEConnection as any).mockReturnValue(mockConnection);

      const connection = client.resubscribeToTask({
        id: 'task-1'
      });

      expect(connection).toBe(mockConnection);
      expect(mockTransport.createSSEConnection).toHaveBeenCalledWith(
        'tasks/resubscribe',
        expect.objectContaining({
          id: 'task-1'
        }),
        undefined
      );
    });
  });
}); 