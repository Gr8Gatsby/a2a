/**
 * Artifact Object (A2A 6.7)
 */
export interface Artifact {
  id: string; // artifact-<uuidv4>
  name?: string | null;
  description?: string | null;
  parts: import('./message').Part[];
  index?: number;
  append?: boolean | null;
  lastChunk?: boolean | null;
  metadata?: Record<string, any> | null;
} 