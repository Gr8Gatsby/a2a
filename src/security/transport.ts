import { A2AErrorCode, createA2AError } from '../types/errors';

/**
 * Transport security configuration
 */
export interface TransportSecurityConfig {
  requireHttps: boolean;
  allowedOrigins?: string[];
  allowedMethods?: string[];
  maxRequestSize?: number;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Authentication configuration
 */
export interface AuthenticationConfig {
  schemes: string[];
  validateToken: (token: string) => Promise<boolean>;
  validateCredentials?: (credentials: string) => Promise<boolean>;
}

/**
 * Transport security manager
 */
export class TransportSecurity {
  private config: TransportSecurityConfig;
  private requestCounts: Map<string, number> = new Map();
  private lastReset: number = Date.now();
  private isDevelopment: boolean;

  constructor(config: TransportSecurityConfig) {
    this.config = config;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Validates the transport security requirements
   */
  validateTransport(url: string, method: string, origin?: string): void {
    // Check HTTPS requirement (skip in development)
    if (this.config.requireHttps && !this.isDevelopment && !url.startsWith('https://')) {
      throw createA2AError(A2AErrorCode.InternalError, 'HTTPS is required in production');
    }

    // Check allowed origins
    if (this.config.allowedOrigins && origin) {
      const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:');
      if (!this.config.allowedOrigins.includes(origin) && !(this.isDevelopment && isLocalhost)) {
        throw createA2AError(A2AErrorCode.AuthorizationFailed, 'Origin not allowed');
      }
    }

    // Check allowed methods
    if (this.config.allowedMethods && !this.config.allowedMethods.includes(method)) {
      throw createA2AError(A2AErrorCode.OperationNotSupported, 'Method not allowed');
    }
  }

  /**
   * Validates request size
   */
  validateRequestSize(size: number): void {
    if (this.config.maxRequestSize && size > this.config.maxRequestSize) {
      throw createA2AError(A2AErrorCode.InvalidRequest, 'Request too large');
    }
  }

  /**
   * Checks rate limit
   */
  checkRateLimit(clientId: string): void {
    if (!this.config.rateLimit) return;

    const now = Date.now();
    const { windowMs, maxRequests } = this.config.rateLimit;

    // Reset counters if window has passed
    if (now - this.lastReset > windowMs) {
      this.requestCounts.clear();
      this.lastReset = now;
    }

    // Get current count
    const count = this.requestCounts.get(clientId) || 0;

    // Check if limit exceeded
    if (count >= maxRequests) {
      throw createA2AError(A2AErrorCode.RateLimitExceeded);
    }

    // Increment counter
    this.requestCounts.set(clientId, count + 1);
  }
}

/**
 * Authentication manager
 */
export class AuthenticationManager {
  private config: AuthenticationConfig;

  constructor(config: AuthenticationConfig) {
    this.config = config;
  }

  /**
   * Validates authentication
   */
  async validateAuthentication(auth: { scheme: string; token?: string; credentials?: string }): Promise<void> {
    // Check if scheme is supported
    if (!this.config.schemes.includes(auth.scheme)) {
      throw createA2AError(A2AErrorCode.AuthenticationRequired, 'Unsupported authentication scheme');
    }

    // Validate token if provided
    if (auth.token) {
      const isValid = await this.config.validateToken(auth.token);
      if (!isValid) {
        throw createA2AError(A2AErrorCode.AuthenticationRequired, 'Invalid token');
      }
    }

    // Validate credentials if provided and validator exists
    if (auth.credentials && this.config.validateCredentials) {
      const isValid = await this.config.validateCredentials(auth.credentials);
      if (!isValid) {
        throw createA2AError(A2AErrorCode.AuthenticationRequired, 'Invalid credentials');
      }
    }
  }
}

/**
 * Input sanitizer
 */
export class InputSanitizer {
  /**
   * Sanitizes a string input
   */
  static sanitizeString(input: string): string {
    // Remove control characters
    return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  }

  /**
   * Sanitizes an object input
   */
  static sanitizeObject<T>(input: T): T {
    if (Array.isArray(input)) {
      return input.map(item => 
        typeof item === 'string' 
          ? this.sanitizeString(item) 
          : typeof item === 'object' && item !== null 
            ? this.sanitizeObject(item) 
            : item
      ) as unknown as T;
    }

    if (typeof input !== 'object' || input === null) {
      return input;
    }

    const result = { ...input } as Record<string, any>;

    for (const key in result) {
      const value = result[key];
      if (typeof value === 'string') {
        result[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        result[key] = this.sanitizeObject(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.sanitizeObject(value);
      }
    }

    return result as T;
  }
} 