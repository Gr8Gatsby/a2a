import { ProtocolRequest, ProtocolResponse, ProtocolMethod } from '../types/protocol.js';

export class Protocol {
  static createRequest(method: ProtocolMethod, params: unknown): ProtocolRequest {
    return {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };
  }

  static createResponse(id: string | number, result?: unknown, error?: ProtocolResponse['error']): ProtocolResponse {
    return {
      jsonrpc: '2.0',
      id,
      ...(result !== undefined && { result }),
      ...(error && { error }),
    };
  }

  static createErrorResponse(id: string | number, code: number, message: string, data?: unknown): ProtocolResponse {
    return this.createResponse(id, undefined, {
      code,
      message,
      ...(data !== undefined && { data }),
    });
  }

  static validateRequest(request: unknown): request is ProtocolRequest {
    if (!request || typeof request !== 'object') {
      return false;
    }

    const req = request as ProtocolRequest;
    return (
      req.jsonrpc === '2.0' &&
      (typeof req.id === 'string' || typeof req.id === 'number') &&
      typeof req.method === 'string' &&
      req.params !== undefined
    );
  }

  static validateResponse(response: unknown): response is ProtocolResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const res = response as ProtocolResponse;
    return (
      res.jsonrpc === '2.0' &&
      (typeof res.id === 'string' || typeof res.id === 'number') &&
      (res.result !== undefined || res.error !== undefined)
    );
  }
} 