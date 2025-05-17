/**
 * AuthenticationInfo Object (A2A 6.9)
 */
export interface AuthenticationInfo {
  schemes: string[];
  credentials?: string | null;
}

/**
 * PushNotificationConfig Object (A2A 6.8)
 */
export interface PushNotificationConfig {
  url: string;
  token?: string | null;
  authentication?: AuthenticationInfo | null;
}

/**
 * TaskPushNotificationConfig Object (A2A 6.10)
 */
export interface TaskPushNotificationConfig {
  id: string;
  pushNotificationConfig: PushNotificationConfig | null;
} 