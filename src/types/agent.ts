/**
 * Agent capability type
 */
export type AgentCapability = 'text' | 'image' | 'audio' | string;

/**
 * Enhanced AgentConfig
 */
export interface AgentConfig {
  name: string;
  description: string;
  capabilities: AgentCapability[];
  endpoint: string;
  version: string; // Add version for protocol compatibility
  metadata?: {
    author?: string;
    tags?: string[];
    [key: string]: unknown; // Allow custom metadata
  };
}

/**
 * Enhanced Agent interface
 */
export interface Agent {
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapability[];
  readonly endpoint: string;
  readonly version: string;
  readonly metadata?: Record<string, unknown>;

  // Task management methods
  startTask(params: unknown): Promise<import('./task').Task>;
  getTaskStatus(taskId: string): Promise<import('./task').TaskStatus>;
  listTasks(): Promise<import('./task').Task[]>;

  // Event handling
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
} 