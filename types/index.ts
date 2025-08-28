import type { z } from 'zod';
import {
  UserCoreSchema,
  ProjectCoreSchema,
  ChatCoreSchema,
  MessageCoreSchema,
  ChatWithProjectAndMessagesSchema,
} from '@/lib/schemas/api';

// Core Types
export type User = z.infer<typeof UserCoreSchema>;
export type Project = z.infer<typeof ProjectCoreSchema>;
export type Chat = z.infer<typeof ChatCoreSchema>;
export type Message = z.infer<typeof MessageCoreSchema>;

// Endpoint response types
export type ChatWithMessages = z.infer<typeof ChatWithProjectAndMessagesSchema>;
