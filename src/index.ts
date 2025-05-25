// Export implementations as the default exports
export { Agent } from './core/agent.js';
export { Task } from './core/task.js';
export { Transport } from './core/transport.js';
export { Protocol } from './core/protocol.js';

// Re-export types under a /types subpath
export * as Types from './types';

// Top-level exports for protocol and task types
export * from './types/protocol.js';
export * from './types/errors.js';
export * from './types/message.js';
export * from './types/streaming.js';
export * from './types/transport.js';
export type {
  Task as TaskType,
  TaskStatus,
  TaskPushNotificationConfig,
  PushNotificationConfig,
  TaskState,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
  TaskStates
} from './types/task.js';
export type { TaskIdParams as ProtocolTaskIdParams } from './types/protocol.js';

export { AgentConfigSchema } from './schemas/agentConfig.schema.js';
export { TaskStatusSchema, TaskSchema, TaskStateSchema } from './schemas/task.schema.js';
export { ArtifactSchema } from './schemas/artifact.schema.js';
export {
  ProtocolVersionSchema,
  ProtocolMethodSchema,
  ProtocolMessageSchema,
  ProtocolRequestSchema,
  ProtocolResponseSchema,
  JSONRPCErrorSchema,
  TaskStatusUpdateEventSchema,
  TaskArtifactUpdateEventSchema,
  SendTaskStreamingResponseSchema
} from './schemas/protocol.schema.js';
export { MessageSchema } from './schemas/message.schema.js';
export {
  AuthenticationInfoSchema,
  PushNotificationConfigSchema,
  TaskPushNotificationConfigSchema
} from './schemas/pushNotification.schema.js';
export {
  TransportProtocolSchema,
  TransportConfigSchema
} from './schemas/transport.schema.js';

export type { AgentCapabilities } from './types/agent.js';

export type { AgentCard, AgentProvider, AgentSkill, AgentAuthentication } from './types/agent-card.js';
export type { AuthenticationInfo } from './types/pushNotification.js';
export type { Artifact } from './types/artifact.js';
export type { Message, Part, TextPart, FilePart, DataPart, FileContent } from './types/message.js';