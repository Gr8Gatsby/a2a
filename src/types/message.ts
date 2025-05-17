/**
 * Message Object (A2A 6.4)
 */
export interface Message {
  role: 'user' | 'agent';
  parts: Part[];
  metadata?: Record<string, any> | null;
}

/**
 * Part Union Type (A2A 6.5)
 */
export type Part = TextPart | FilePart | DataPart;

/**
 * TextPart Object (A2A 6.5.1)
 */
export interface TextPart {
  type: 'text';
  text: string;
  metadata?: Record<string, any> | null;
}

/**
 * FilePart Object (A2A 6.5.2)
 */
export interface FilePart {
  type: 'file';
  file: FileContent;
  metadata?: Record<string, any> | null;
}

/**
 * DataPart Object (A2A 6.5.3)
 */
export interface DataPart {
  type: 'data';
  data: Record<string, any> | any[];
  metadata?: Record<string, any> | null;
}

/**
 * FileContent Object (A2A 6.6)
 */
export interface FileContent {
  name?: string | null;
  mimeType?: string | null;
  bytes?: string | null;
  uri?: string | null;
  // Constraint: If file content is being transmitted, exactly one of `bytes` or `uri` MUST be non-null.
} 