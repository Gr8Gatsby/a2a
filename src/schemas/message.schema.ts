import { z } from 'zod';

export const FileContentSchema = z.object({
  name: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  bytes: z.string().nullable().optional(),
  uri: z.string().nullable().optional(),
}).refine(
  (val) => {
    const hasBytes = val.bytes != null;
    const hasUri = val.uri != null;
    // If both are null/undefined, that's allowed (reference only)
    // If both are present, not allowed
    // If one is present, the other must be null/undefined
    if (hasBytes && hasUri) return false;
    return true;
  },
  {
    message: 'Exactly one of bytes or uri must be non-null if file content is transmitted',
    path: ['bytes', 'uri'],
  }
);

export const TextPartSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const FilePartSchema = z.object({
  type: z.literal('file'),
  file: FileContentSchema,
  metadata: z.record(z.any()).nullable().optional(),
});

export const DataPartSchema = z.object({
  type: z.literal('data'),
  data: z.union([z.record(z.any()), z.array(z.any())]),
  metadata: z.record(z.any()).nullable().optional(),
});

export const PartSchema = z.discriminatedUnion('type', [
  TextPartSchema,
  FilePartSchema,
  DataPartSchema,
]);

export const MessageSchema = z.object({
  role: z.enum(['user', 'agent']),
  parts: z.array(PartSchema),
  metadata: z.record(z.any()).nullable().optional(),
}); 