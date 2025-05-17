import { z } from 'zod';

export const AgentCapabilitySchema = z.enum(['text', 'json', 'binary', 'stream']);

export const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  capabilities: z.array(AgentCapabilitySchema).min(1, 'At least one capability is required'),
  endpoint: z.string().url(),
}).strict(); 