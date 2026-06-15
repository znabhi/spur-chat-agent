import { z } from 'zod';

export const SendMessageSchema = z.object({
  message: z
    .string({ required_error: 'Message cannot be empty' })
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long. Maximum 4000 characters allowed.')
    .trim(),
  sessionId: z.string().uuid('Invalid session ID format').optional(),
});

export const GetHistorySchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  before: z.string().datetime({ message: 'Invalid cursor format' }).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type GetHistoryInput = z.infer<typeof GetHistorySchema>;
