import { z } from 'zod';

const SecuritySchemeSchema = z.record(z.any());

export const AgentProviderSchema = z.object({
  organization: z.string(),
  url: z.string().url(),
});

export const AgentCapabilitiesSchema = z.object({
  streaming: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  stateTransitionHistory: z.boolean().optional(),
}).strict();

export const AgentSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  examples: z.array(z.string()).optional(),
  inputModes: z.array(z.string()).optional(),
  outputModes: z.array(z.string()).optional(),
});

export const AgentCardSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  provider: AgentProviderSchema.optional(),
  version: z.string(),
  documentationUrl: z.string().url().optional(),
  capabilities: AgentCapabilitiesSchema,
  securitySchemes: z.record(SecuritySchemeSchema),
  security: z.array(z.record(z.array(z.string()))),
  defaultInputModes: z.array(z.string()),
  defaultOutputModes: z.array(z.string()),
  skills: z.array(AgentSkillSchema).min(1),
  supportsAuthenticatedExtendedCard: z.boolean().optional(),
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