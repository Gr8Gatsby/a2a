import { Task as TaskType, TaskConfig, TaskContent, TaskStatus } from '../types/task';

export class Task implements TaskType {
  readonly id: string;
  readonly status: TaskStatus;
  readonly content: TaskContent;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(config: TaskConfig) {
    this.id = crypto.randomUUID();
    this.status = 'pending';
    this.content = config.content;
    this.metadata = config.metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(status: TaskStatus): void {
    (this as any).status = status;
    (this as any).updatedAt = new Date();
  }

  updateContent(content: TaskContent): void {
    (this as any).content = content;
    (this as any).updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, unknown>): void {
    (this as any).metadata = { ...this.metadata, ...metadata };
    (this as any).updatedAt = new Date();
  }

  toJSON(): TaskType {
    return {
      id: this.id,
      status: this.status,
      content: this.content,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
} 