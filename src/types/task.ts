/**
 * TaskState Enum (A2A 6.3)
 */
export type TaskState =
  | 'submitted'
  | 'working'
  | 'input-required'
  | 'completed'
  | 'canceled'
  | 'failed'
  | 'unknown';

/**
 * TaskStatus Object (A2A 6.2)
 */
export interface TaskStatus {
  state: TaskState;
  message?: Message | null;
  timestamp?: string | null; // ISO 8601
}

/**
 * Task Object (A2A 6.1)
 */
export interface Task {
  id: string;
  sessionId?: string | null;
  status: TaskStatus;
  artifacts?: Artifact[] | null;
  history?: Message[] | null;
  metadata?: Record<string, any> | null;
}

// Forward declarations for types defined in other files
export interface Artifact { /* see artifact.ts */ }
export interface Message { /* see message.ts */ }

/**
 * Authentication configuration for push notifications
 */
export interface PushNotificationAuth {
  schemes: string[];
  credentials?: string | null;
}

/**
 * Push notification configuration for a task
 */
export interface TaskPushNotificationConfig {
  url: string;
  token: string;
  authentication?: PushNotificationAuth | null;
}

/**
 * TaskIdParams for operations that require just a task ID
 */
export interface TaskIdParams {
  id: string;
  metadata?: Record<string, any> | null;
} 