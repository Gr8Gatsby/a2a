import { Task as TaskType, TaskStatus, TaskState, TaskPushNotificationConfig } from '../types/task.js';
import { v4 as uuidv4 } from 'uuid';

export class Task implements TaskType {
  readonly id: string;
  readonly contextId: string;
  status: TaskStatus;
  metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  updatedAt: Date;
  pushNotification?: TaskPushNotificationConfig;
  static knownContextIds = new Set<string>();

  constructor({ metadata, pushNotification, contextId }: {
    metadata?: Record<string, unknown>;
    pushNotification?: TaskPushNotificationConfig;
    contextId?: string;
  }) {
    this.id = 'task-' + uuidv4();
    if (contextId && Task.knownContextIds.has(contextId)) {
      this.contextId = contextId;
    } else {
      this.contextId = 'ctx-' + uuidv4();
      Task.knownContextIds.add(this.contextId);
    }
    this.status = { state: 'pending' as TaskState };
    this.metadata = metadata;
    this.pushNotification = pushNotification;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(state: TaskState) {
    this.status = { state };
    this.updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, unknown>) {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = new Date();
  }

  setPushNotification(config: TaskPushNotificationConfig) {
    this.pushNotification = config;
    this.updatedAt = new Date();
  }

  getPushNotification(): TaskPushNotificationConfig | undefined {
    return this.pushNotification;
  }

  toJSON() {
    return {
      id: this.id,
      contextId: this.contextId,
      status: this.status,
      metadata: this.metadata,
      pushNotification: this.pushNotification,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
} 