import type { Message, ChatWithMessages } from '@/types';

export interface ChatState {
  chatId: string;
  messages: Message[];
  isSending: boolean;
  isStreaming: boolean;
  error?: string;
  chat?: ChatWithMessages | null;
}

export type ChatAction =
  | { type: 'INIT'; payload: { messages: Message[] } }
  | { type: 'ADD_USER'; payload: Message }
  | { type: 'CONFIRM_USER'; payload: { tempId: string; real: Message } }
  | { type: 'CONFIRM_ASSISTANT'; payload: { tempId: string; real: Message } }
  | { type: 'START_ASSISTANT'; payload: { id: string } }
  | { type: 'APPEND_ASSISTANT_CHUNK'; payload: { id: string; content: string } }
  | { type: 'COMMIT_ASSISTANT'; payload: { id: string } }
  | { type: 'ROLLBACK'; payload: { tempId: string } }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET'; payload?: Message[] }
  | { type: 'SET_CHAT'; payload: { chat: ChatWithMessages } }
  | { type: 'UPDATE_TITLE'; payload: { title: string } };

export interface UseChatOptions {
  initialMessages?: Message[];
  stream?: boolean;
  chat?: ChatWithMessages;
}
