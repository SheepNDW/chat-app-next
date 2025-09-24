'use client';

import type { ChatWithMessages, Message } from '@/types';
import { useChat as useAIChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Helper to request a generated title from existing API route
async function generateChatTitleRequest(chatId: string, message: string) {
  try {
    const res = await fetch(`/api/chats/${chatId}/title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { chat: ChatWithMessages };
    return data.chat;
  } catch (e) {
    console.error('Failed to generate title:', e);
    return null;
  }
}

interface ChatProviderProps {
  chatId: string;
  initialMessages?: Message[];
  chat?: ChatWithMessages | undefined;
  children: React.ReactNode;
}

interface ChatContextValue {
  messages: Message[];
  sendMessage: (text: string) => void | Promise<void>;
  stop: () => void;
  isStreaming: boolean;
  error?: string;
  chat?: ChatWithMessages | null;
  status: string;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  chatId,
  initialMessages = [],
  chat: initialChat,
  children,
}: ChatProviderProps) {
  const [chat, setChat] = useState<ChatWithMessages | null>(
    initialChat || null
  );

  const uiInitial: UIMessage[] = useMemo(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        parts: [{ type: 'text', text: m.content }],
      })),
    [initialMessages]
  );

  const {
    messages: uiMessages,
    sendMessage: aiSendMessage,
    stop,
    error,
    status,
  } = useAIChat({
    id: chatId,
    messages: uiInitial,
    transport: new DefaultChatTransport({
      api: `/api/chats/${chatId}/messages/stream`,
    }),
  });

  const messages: Message[] = useMemo(
    () =>
      uiMessages.map((m) => {
        const text = m.parts
          .map((p) => (p.type === 'text' ? p.text : ''))
          .join('');
        return {
          id: m.id,
          chatId,
          role: m.role as 'user' | 'assistant',
          content: text,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Message;
      }),
    [uiMessages, chatId]
  );

  useEffect(() => {
    if (
      chat &&
      !chat.title &&
      messages.length === 1 &&
      messages[0].role === 'user'
    ) {
      const firstContent = messages[0].content;
      generateChatTitleRequest(chatId, firstContent).then((updated) => {
        if (updated?.title) setChat(updated);
      });
    }
  }, [messages, chat, chatId]);

  const wrappedSendMessage = (text: string) => {
    if (!text.trim()) return;
    aiSendMessage({ text });
  };

  const isStreaming = status === 'streaming';

  const value: ChatContextValue = {
    messages,
    sendMessage: wrappedSendMessage,
    stop,
    isStreaming,
    error: error?.message,
    chat,
    status,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
