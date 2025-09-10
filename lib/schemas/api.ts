import { z } from 'zod';

export const MessageRoleSchema = z.enum(['user', 'assistant']);

const DateTime = z.coerce.date();

// ---------------- Core（對應 Prisma 欄位，無關聯） ----------------
export const UserCoreSchema = z.strictObject({
  id: z.uuid(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  provider: z.string().nullable(),
  providerId: z.string().nullable(),
  createdAt: DateTime,
  updatedAt: DateTime,
});

export const ProjectCoreSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  userId: z.uuid(),
  createdAt: DateTime,
  updatedAt: DateTime,
});

export const ChatCoreSchema = z.strictObject({
  id: z.uuid(),
  title: z.string().nullable(),
  userId: z.uuid(),
  projectId: z.uuid().nullable(),
  createdAt: DateTime,
  updatedAt: DateTime,
});

export const MessageCoreSchema = z.strictObject({
  id: z.uuid(),
  content: z.string(),
  role: MessageRoleSchema,
  chatId: z.uuid(),
  createdAt: DateTime,
  updatedAt: DateTime,
});

// ---------------- API Schemas（包含關聯欄位） ----------------
export const ChatWithProjectAndMessagesSchema = ChatCoreSchema.extend({
  project: ProjectCoreSchema.nullable(),
  messages: z.array(MessageCoreSchema),
});

export const ProjectWithChatsSchema = ProjectCoreSchema.extend({
  chats: z.array(
    ChatCoreSchema.extend({
      messages: z.array(MessageCoreSchema),
    })
  ),
});
