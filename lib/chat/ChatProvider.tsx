'use client';
import React, { createContext, useContext } from 'react';
import type { Message, ChatWithMessages } from '@/types';
import { useChat } from './useChat';

interface ChatProviderProps {
  chatId: string;
  initialMessages?: Message[];
  chat?: ChatWithMessages | undefined;
  stream?: boolean;
  children: React.ReactNode;
}

type ChatContextValue = ReturnType<typeof useChat> & {
  chat?: ChatWithMessages;
};
const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  chatId,
  initialMessages,
  chat,
  stream,
  children,
}: ChatProviderProps) {
  const chatHook = useChat(chatId, { initialMessages, stream });
  const value: ChatContextValue = { ...chatHook, chat };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
