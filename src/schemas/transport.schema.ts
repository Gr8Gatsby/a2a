import { z } from 'zod';

export const TransportProtocolSchema = z.enum(['http', 'https', 'ws', 'wss']);

export const TransportConfigSchema = z.object({
  protocol: TransportProtocolSchema,
  host: z.string(),
  port: z.number().optional(),
  path: z.string().optional(),
  timeout: z.number().optional(),
}); 