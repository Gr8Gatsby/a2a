/**
 * AgentProvider Object (A2A 5.5.1)
 */
export interface AgentProvider {
  /** Name of the organization or entity. */
  organization: string;
  /** URL for the provider's organization website or relevant contact page. */
  url: string;
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
 * SecurityScheme Object (A2A 5.5.5, generic for now)
 */
export interface SecurityScheme {
  [key: string]: unknown;
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
  /** Unique identifier for this skill within the agent. */
  id: string;
  /** Human-readable name of the skill. */
  name: string;
  /** Detailed description of the skill. */
  description: string;
  /** Array of keywords or categories for discoverability. */
  tags: string[];
  /** Example prompts, inputs, or use cases. */
  examples?: string[];
  /** Overrides agentCard.defaultInputModes for this skill. */
  inputModes?: string[];
  /** Overrides agentCard.defaultOutputModes for this skill. */
  outputModes?: string[];
}

/**
 * AgentCard Object (A2A 5.5)
 */
export interface AgentCard {
  /** Human-readable name of the agent. */
  name: string;
  /** Human-readable description of the agent. */
  description: string;
  /** The base URL endpoint for the agent's A2A service. */
  url: string;
  /** Information about the organization or entity providing the agent. */
  provider?: AgentProvider;
  /** Version string for the agent or its A2A implementation. */
  version: string;
  /** URL pointing to human-readable documentation for the agent. */
  documentationUrl?: string;
  /** Specifies optional A2A protocol features supported by this agent. */
  capabilities: AgentCapabilities;
  /** Security scheme details used for authenticating with this agent. */
  securitySchemes: { [scheme: string]: SecurityScheme };
  /** Security requirements for contacting the agent. */
  security: { [scheme: string]: string[] }[];
  /** Array of MIME types the agent generally accepts as input. */
  defaultInputModes: string[];
  /** Array of MIME types the agent generally produces as output. */
  defaultOutputModes: string[];
  /** An array of specific skills or capabilities the agent offers. */
  skills: AgentSkill[];
  /** If true, the agent provides an authenticated extended card endpoint. */
  supportsAuthenticatedExtendedCard?: boolean;
} 