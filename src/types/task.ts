/**
 * TaskState Enum (A2A 6.3)
 */
export const TaskStates = {
  Pending: 'pending',
  Submitted: 'submitted',
  Working: 'working',
  InputRequired: 'input-required',
  Completed: 'completed',
  Canceled: 'canceled',
  Failed: 'failed',
  Unknown: 'unknown',
} as const;

export type TaskState = typeof TaskStates[keyof typeof TaskStates];

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
  contextId: string;
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
 * PushNotificationConfig Object (A2A 6.8)
 */
export interface PushNotificationConfig {
  url: string;
  token?: string | null;
  authentication?: AuthenticationInfo | null;
}

/**
 * AuthenticationInfo Object (A2A 6.9)
 */
export interface AuthenticationInfo {
  schemes: string[];
  credentials?: string | null;
}

/**
 * TaskPushNotificationConfig Object (A2A 6.10)
 */
export interface TaskPushNotificationConfig {
  id: string;
  pushNotificationConfig: PushNotificationConfig | null;
}

/**
 * Parameters for tasks/cancel and tasks/pushNotification/get
 */
export interface TaskIdParams {
  id: string;
  metadata?: Record<string, any> | null;
}

/**
 * TaskStatusUpdateEvent Object (A2A 7.2.2)
 */
export interface TaskStatusUpdateEvent {
  id: string;
  status: TaskStatus;
  final?: boolean;
  metadata?: Record<string, any> | null;
}

/**
 * TaskArtifactUpdateEvent Object (A2A 7.2.3)
 */
export interface TaskArtifactUpdateEvent {
  id: string;
  artifact: Artifact;
  metadata?: Record<string, any> | null;
} 