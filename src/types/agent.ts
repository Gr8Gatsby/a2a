/**
 * Agent capabilities as defined in the A2A spec
 */
export interface AgentCapabilities {
  /**
   * If true, the agent supports tasks/sendSubscribe and tasks/resubscribe for real-time updates via SSE
   * @default false
   */
  streaming?: boolean;
  
  /**
   * If true, the agent supports tasks/pushNotification/set and tasks/pushNotification/get for async updates
   * @default false
   */
  pushNotifications?: boolean;
  
  /**
   * If true, the agent may include detailed history of status changes within the Task object
   * @default false
   */
  stateTransitionHistory?: boolean;
}

/**
 * AgentSkill Object (A2A 5.5.4)
 */
export interface AgentSkill {
  id: string;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  examples?: string[] | null;
  inputModes?: string[] | null;
  outputModes?: string[] | null;
}

/**
 * AgentAuthentication Object (A2A 5.5.3)
 */
export interface AgentAuthentication {
  schemes: string[];
  credentials?: string | null;
}

/**
 * Enhanced AgentConfig
 */
export interface AgentConfig {
  name: string;
  description: string;
  capabilities: AgentCapabilities;
  endpoint: string;
  version: string; // Add version for protocol compatibility
  metadata?: {
    author?: string;
    tags?: string[];
    [key: string]: unknown; // Allow custom metadata
  };
  skills?: AgentSkill[];
  authentication?: AgentAuthentication;
}

/**
 * Enhanced Agent interface
 */
export interface Agent {
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapabilities;
  readonly endpoint: string;
  readonly version: string;
  readonly metadata?: Record<string, unknown>;

  // Task management methods
  startTask(params: unknown): Promise<import('./task').Task>;
  getTaskStatus(taskId: string): Promise<import('./task').Task>;
  listTasks(): Promise<import('./task').Task[]>;

  // Event handling
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
} 