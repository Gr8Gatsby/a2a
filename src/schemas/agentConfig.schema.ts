import { z } from 'zod';

export const AgentCapabilitiesSchema = z.object({
  streaming: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  stateTransitionHistory: z.boolean().optional(),
}).strict();

export const AgentSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  examples: z.array(z.string()).nullable().optional(),
  inputModes: z.array(z.string()).nullable().optional(),
  outputModes: z.array(z.string()).nullable().optional(),
});

export const AgentAuthenticationSchema = z.object({
  schemes: z.array(z.string()),
  credentials: z.string().nullable().optional(),
});

export const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  capabilities: AgentCapabilitiesSchema,
  endpoint: z.string(),
  version: z.string(),
  metadata: z
    .object({
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .catchall(z.unknown())
    .optional(),
  skills: z.array(AgentSkillSchema).optional(),
  authentication: AgentAuthenticationSchema.optional(),
}); 