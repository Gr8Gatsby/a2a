import { z } from 'zod';

export const AuthenticationInfoSchema = z.object({
  schemes: z.array(z.string()),
  credentials: z.string().nullable().optional(),
});

export const PushNotificationConfigSchema = z.object({
  url: z.string(),
  token: z.string().nullable().optional(),
  authentication: AuthenticationInfoSchema.nullable().optional(),
});

export const TaskPushNotificationConfigSchema = z.object({
  id: z.string(),
  pushNotificationConfig: PushNotificationConfigSchema.nullable(),
}); 