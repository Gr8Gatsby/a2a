/**
 * AgentProvider Object (A2A 5.5.1)
 */
export interface AgentProvider {
  organization: string;
  url?: string | null;
}

/**
 * AgentCapabilities Object (A2A 5.5.2)
 */
export interface AgentCapabilities {
  streaming?: boolean;
  pushNotifications?: boolean;
  stateTransitionHistory?: boolean;
}

/**
 * AgentAuthentication Object (A2A 5.5.3)
 */
export interface AgentAuthentication {
  schemes: string[];
  credentials?: string | null;
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
 * AgentCard Object (A2A 5.5)
 */
export interface AgentCard {
  name: string;
  description?: string | null;
  url: string;
  provider?: AgentProvider | null;
  version: string;
  documentationUrl?: string | null;
  capabilities: AgentCapabilities;
  authentication?: AgentAuthentication | null;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  skills: AgentSkill[];
} 