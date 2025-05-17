/**
 * Represents the capabilities of an agent
 */
export type AgentCapability = 'text' | 'json' | 'binary' | 'stream';

/**
 * Configuration for creating a new agent
 */
export interface AgentConfig {
  name: string;
  description: string;
  capabilities: AgentCapability[];
  endpoint: string;
}

/**
 * Represents an A2A agent
 */
export interface Agent {
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapability[];
  readonly endpoint: string;
} 