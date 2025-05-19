import { Task as TaskType, TaskStatus, TaskState, TaskPushNotificationConfig } from '../types/task.js';

export class Task implements TaskType {
  readonly id: string;
  status: TaskStatus;
  metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  updatedAt: Date;
  pushNotification?: TaskPushNotificationConfig;

  constructor({ id, metadata, pushNotification }: { 
    id?: string; 
    metadata?: Record<string, unknown>;
    pushNotification?: TaskPushNotificationConfig;
  }) {
    this.id = id || Math.random().toString(36).slice(2);
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
      status: this.status,
      metadata: this.metadata,
      pushNotification: this.pushNotification,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
} 