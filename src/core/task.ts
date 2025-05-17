import { Task as TaskType, TaskStatus, TaskState } from '../types/task';

export class Task implements TaskType {
  readonly id: string;
  status: TaskStatus;
  metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor({ id, metadata }: { id?: string; metadata?: Record<string, unknown> }) {
    this.id = id || Math.random().toString(36).slice(2);
    this.status = { state: 'pending' as TaskState };
    this.metadata = metadata;
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

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
} 