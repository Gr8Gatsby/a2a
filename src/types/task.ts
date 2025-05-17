/**
 * Represents the type of content in a task
 */
export type TaskContentType = 'text' | 'json' | 'binary';

/**
 * Base interface for task content
 */
export interface TaskContent {
  type: TaskContentType;
  content: string | object | ArrayBuffer;
}

/**
 * Configuration for creating a new task
 */
export interface TaskConfig {
  content: TaskContent;
  metadata?: Record<string, unknown>;
}

/**
 * Represents the status of a task
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Represents an A2A task
 */
export interface Task {
  readonly id: string;
  readonly status: TaskStatus;
  readonly content: TaskContent;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
} 