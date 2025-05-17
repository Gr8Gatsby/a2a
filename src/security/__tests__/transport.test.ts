import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { TransportSecurity, AuthenticationManager, InputSanitizer } from '../transport';

describe('TransportSecurity', () => {
  let transportSecurity: TransportSecurity;
  const isDevelopment = process.env.NODE_ENV === 'development';

  beforeEach(() => {
    transportSecurity = new TransportSecurity({
      requireHttps: !isDevelopment,
      allowedOrigins: ['https://example.com', 'http://localhost:3000'],
      allowedMethods: ['POST'],
      maxRequestSize: 1024,
      rateLimit: {
        windowMs: 1000,
        maxRequests: 2
      }
    });
  });

  describe('validateTransport', () => {
    it('should allow HTTPS URLs', () => {
      expect(() => {
        transportSecurity.validateTransport('https://example.com', 'POST');
      }).not.toThrow();
    });

    it('should allow HTTP URLs in development', () => {
      if (isDevelopment) {
        expect(() => {
          transportSecurity.validateTransport('http://localhost:3000', 'POST');
        }).not.toThrow();
      }
    });

    it('should reject non-HTTPS URLs in production', () => {
      if (!isDevelopment) {
        expect(() => {
          transportSecurity.validateTransport('http://example.com', 'POST');
        }).toThrow();
      }
    });

    it('should allow requests from allowed origins', () => {
      expect(() => {
        transportSecurity.validateTransport('https://example.com', 'POST', 'https://example.com');
      }).not.toThrow();
    });

    it('should allow localhost in development', () => {
      if (isDevelopment) {
        expect(() => {
          transportSecurity.validateTransport('http://localhost:3000', 'POST', 'http://localhost:3000');
        }).not.toThrow();
      }
    });

    it('should reject requests from non-allowed origins', () => {
      expect(() => {
        transportSecurity.validateTransport('https://example.com', 'POST', 'https://malicious.com');
      }).toThrow();
    });

    it('should allow allowed methods', () => {
      expect(() => {
        transportSecurity.validateTransport('https://example.com', 'POST');
      }).not.toThrow();
    });

    it('should reject non-allowed methods', () => {
      expect(() => {
        transportSecurity.validateTransport('https://example.com', 'GET');
      }).toThrow();
    });
  });

  describe('validateRequestSize', () => {
    it('should allow requests within size limit', () => {
      expect(() => {
        transportSecurity.validateRequestSize(512);
      }).not.toThrow();
    });

    it('should reject requests exceeding size limit', () => {
      expect(() => {
        transportSecurity.validateRequestSize(2048);
      }).toThrow();
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      expect(() => {
        transportSecurity.checkRateLimit('client1');
        transportSecurity.checkRateLimit('client1');
      }).not.toThrow();
    });

    it('should reject requests exceeding rate limit', () => {
      expect(() => {
        transportSecurity.checkRateLimit('client2');
        transportSecurity.checkRateLimit('client2');
        transportSecurity.checkRateLimit('client2');
      }).toThrow();
    });

    it('should reset rate limit after window', async () => {
      transportSecurity.checkRateLimit('client3');
      transportSecurity.checkRateLimit('client3');

      // Wait for rate limit window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(() => {
        transportSecurity.checkRateLimit('client3');
        transportSecurity.checkRateLimit('client3');
      }).not.toThrow();
    });
  });
});

describe('AuthenticationManager', () => {
  let authManager: AuthenticationManager;
  const mockValidateToken = vi.fn();
  const mockValidateCredentials = vi.fn();

  beforeEach(() => {
    authManager = new AuthenticationManager({
      schemes: ['bearer', 'basic'],
      validateToken: mockValidateToken,
      validateCredentials: mockValidateCredentials
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAuthentication', () => {
    it('should validate supported schemes', async () => {
      mockValidateToken.mockResolvedValue(true);

      await expect(authManager.validateAuthentication({
        scheme: 'bearer',
        token: 'valid-token'
      })).resolves.not.toThrow();
    });

    it('should reject unsupported schemes', async () => {
      await expect(authManager.validateAuthentication({
        scheme: 'unsupported',
        token: 'token'
      })).rejects.toThrow();
    });

    it('should validate tokens', async () => {
      mockValidateToken.mockResolvedValue(true);

      await expect(authManager.validateAuthentication({
        scheme: 'bearer',
        token: 'valid-token'
      })).resolves.not.toThrow();

      expect(mockValidateToken).toHaveBeenCalledWith('valid-token');
    });

    it('should reject invalid tokens', async () => {
      mockValidateToken.mockResolvedValue(false);

      await expect(authManager.validateAuthentication({
        scheme: 'bearer',
        token: 'invalid-token'
      })).rejects.toThrow();
    });

    it('should validate credentials when provided', async () => {
      mockValidateCredentials.mockResolvedValue(true);

      await expect(authManager.validateAuthentication({
        scheme: 'basic',
        credentials: 'valid-credentials'
      })).resolves.not.toThrow();

      expect(mockValidateCredentials).toHaveBeenCalledWith('valid-credentials');
    });

    it('should reject invalid credentials', async () => {
      mockValidateCredentials.mockResolvedValue(false);

      await expect(authManager.validateAuthentication({
        scheme: 'basic',
        credentials: 'invalid-credentials'
      })).rejects.toThrow();
    });
  });
});

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F\x7F\x9F';
      expect(InputSanitizer.sanitizeString(input)).toBe('HelloWorld');
    });

    it('should preserve valid characters', () => {
      const input = 'Hello World!';
      expect(InputSanitizer.sanitizeString(input)).toBe('Hello World!');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values', () => {
      const input = {
        name: 'John\x00Doe',
        age: 30,
        email: 'john\x1F@example.com'
      };

      expect(InputSanitizer.sanitizeObject(input)).toEqual({
        name: 'JohnDoe',
        age: 30,
        email: 'john@example.com'
      });
    });

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: 'John\x00Doe',
          address: {
            street: '123\x1FMain St'
          }
        }
      };

      expect(InputSanitizer.sanitizeObject(input)).toEqual({
        user: {
          name: 'JohnDoe',
          address: {
            street: '123Main St'
          }
        }
      });
    });

    it('should preserve non-string values', () => {
      const input = {
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { key: 'value' }
      };

      expect(InputSanitizer.sanitizeObject(input)).toEqual(input);
    });
  });
}); 