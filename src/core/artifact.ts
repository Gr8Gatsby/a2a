import { Artifact as ArtifactType } from '../types/artifact.js';
import { v4 as uuidv4 } from 'uuid';

export class Artifact implements ArtifactType {
  readonly id: string;
  name?: string | null;
  description?: string | null;
  parts: any[];
  index?: number;
  append?: boolean | null;
  lastChunk?: boolean | null;
  metadata?: Record<string, any> | null;

  constructor({ name, description, parts, index, append, lastChunk, metadata }: {
    name?: string | null;
    description?: string | null;
    parts: any[];
    index?: number;
    append?: boolean | null;
    lastChunk?: boolean | null;
    metadata?: Record<string, any> | null;
  }) {
    this.id = 'artifact-' + uuidv4();
    this.name = name;
    this.description = description;
    this.parts = parts;
    this.index = index;
    this.append = append;
    this.lastChunk = lastChunk;
    this.metadata = metadata;
  }
} 