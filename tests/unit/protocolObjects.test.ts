import { describe, it, expect } from 'vitest';
import { TaskSchema, TaskStatusSchema, TaskStateSchema } from '../../src/schemas/task.schema';
import { MessageSchema, PartSchema, FileContentSchema } from '../../src/schemas/message.schema';
import { ArtifactSchema } from '../../src/schemas/artifact.schema';
import { PushNotificationConfigSchema, AuthenticationInfoSchema, TaskPushNotificationConfigSchema } from '../../src/schemas/pushNotification.schema';

describe('Protocol Data Object Schemas', () => {
  it('validates TaskState', () => {
    expect(TaskStateSchema.safeParse('submitted').success).toBe(true);
    expect(TaskStateSchema.safeParse('working').success).toBe(true);
    expect(TaskStateSchema.safeParse('invalid').success).toBe(false);
  });

  it('validates TaskStatus', () => {
    const valid = { state: 'working', message: null, timestamp: '2023-10-27T10:00:00Z' };
    expect(TaskStatusSchema.safeParse(valid).success).toBe(true);
    const invalid = { state: 'foo', message: null };
    expect(TaskStatusSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates Task', () => {
    const valid = {
      id: 'abc',
      status: { state: 'completed' },
      artifacts: null,
      history: null,
      metadata: null,
    };
    expect(TaskSchema.safeParse(valid).success).toBe(true);
    const invalid = { id: 123, status: { state: 'completed' } };
    expect(TaskSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates Message', () => {
    const valid = {
      role: 'user',
      parts: [{ type: 'text', text: 'hello' }],
      metadata: null,
    };
    expect(MessageSchema.safeParse(valid).success).toBe(true);
    const invalid = { role: 'bot', parts: [] };
    expect(MessageSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates Part (TextPart, FilePart, DataPart)', () => {
    const text = { type: 'text', text: 'hi' };
    const file = { type: 'file', file: { name: 'a.txt', bytes: 'abc' } };
    const data = { type: 'data', data: { foo: 'bar' } };
    expect(PartSchema.safeParse(text).success).toBe(true);
    expect(PartSchema.safeParse(file).success).toBe(true);
    expect(PartSchema.safeParse(data).success).toBe(true);
    const invalid = { type: 'text', foo: 'bar' };
    expect(PartSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates FileContent', () => {
    const valid = { name: 'file.pdf', mimeType: 'application/pdf', bytes: 'abc', uri: null };
    expect(FileContentSchema.safeParse(valid).success).toBe(true);
    const invalid = { name: 'file.pdf', mimeType: 123 };
    expect(FileContentSchema.safeParse(invalid).success).toBe(false);
  });

  it('FileContent: fails if both bytes and uri are present', () => {
    const invalid = { name: 'foo', bytes: 'abc', uri: 'https://example.com/file' };
    const result = FileContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Exactly one of bytes or uri/);
    }
  });

  it('validates Artifact', () => {
    const valid = {
      name: 'Report',
      description: 'desc',
      parts: [{ type: 'text', text: 'done' }],
      index: 0,
      append: false,
      lastChunk: true,
      metadata: null,
    };
    expect(ArtifactSchema.safeParse(valid).success).toBe(true);
    const invalid = { name: 'Report', parts: [] };
    expect(ArtifactSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates PushNotificationConfig', () => {
    const valid = { url: 'https://webhook.com', token: 'abc', authentication: { schemes: ['ApiKey'], credentials: 'foo' } };
    expect(PushNotificationConfigSchema.safeParse(valid).success).toBe(true);
    const invalid = { url: 123 };
    expect(PushNotificationConfigSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates AuthenticationInfo', () => {
    const valid = { schemes: ['Bearer'], credentials: null };
    expect(AuthenticationInfoSchema.safeParse(valid).success).toBe(true);
    const invalid = { schemes: 'Bearer' };
    expect(AuthenticationInfoSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates TaskPushNotificationConfig', () => {
    const valid = { id: 'task1', pushNotificationConfig: { url: 'https://webhook.com', authentication: { schemes: ['ApiKey'] } } };
    expect(TaskPushNotificationConfigSchema.safeParse(valid).success).toBe(true);
    const invalid = { id: 123 };
    expect(TaskPushNotificationConfigSchema.safeParse(invalid).success).toBe(false);
  });
}); 