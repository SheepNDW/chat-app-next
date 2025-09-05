import type { ChatAction, ChatState } from './types';

export function createInitialState(partial: Partial<ChatState>): ChatState {
  return {
    chatId: partial.chatId || '',
    messages: partial.messages || [],
    isSending: false,
    isStreaming: false,
    error: undefined,
  };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'INIT':
      return { ...state, messages: action.payload.messages };
    case 'ADD_USER':
      return {
        ...state,
        isSending: false,
        messages: [...state.messages, action.payload],
      };
    case 'CONFIRM_USER':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.tempId ? action.payload.real : m
        ),
      };
    case 'START_ASSISTANT': {
      const draftAssistant = {
        id: action.payload.id,
        chatId: state.chatId,
        role: 'assistant' as const,
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        isStreaming: true,
        messages: [...state.messages, draftAssistant],
      };
    }
    case 'APPEND_ASSISTANT_CHUNK': {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? {
                ...m,
                content: m.content + action.payload.content,
                updatedAt: new Date(),
              }
            : m
        ),
      };
    }
    case 'COMMIT_ASSISTANT': {
      return { ...state, isStreaming: false };
    }
    case 'CONFIRM_ASSISTANT':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.tempId ? action.payload.real : m
        ),
      };
    case 'ROLLBACK':
      return {
        ...state,
        isSending: false,
        isStreaming: false,
        messages: state.messages.filter((m) => m.id !== action.payload.tempId),
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        isSending: false,
        isStreaming: false,
      };
    case 'RESET':
      return {
        ...state,
        messages: action.payload ?? [],
        isSending: false,
        isStreaming: false,
        error: undefined,
      };
    default:
      return state;
  }
}
