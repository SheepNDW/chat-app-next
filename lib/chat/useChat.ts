import type { Message } from '@/types';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { createMessageForChat } from '../actions/chat.actions';
import { chatReducer, createInitialState } from './reducer';
import type { ChatAction, UseChatOptions } from './types';

async function fetchStream(chatId: string, signal?: AbortSignal) {
  const res = await fetch(`/api/chats/${chatId}/messages/stream`, {
    method: 'POST',
    signal,
  });
  if (!res.ok || !res.body) throw new Error('Failed to stream');
  return res.body.getReader();
}

async function fetchOnce(chatId: string) {
  const res = await fetch(`/api/chats/${chatId}/messages/generate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to fetch');
  const json = await res.json();
  return json.text as string;
}

export function useChat(chatId: string, options: UseChatOptions = {}) {
  const { initialMessages = [], stream = true } = options;
  const [state, dispatch] = useReducer(
    chatReducer,
    createInitialState({ chatId, messages: initialMessages })
  );
  const abortRef = useRef<AbortController | null>(null);

  // Reset when chatId changes
  useEffect(() => {
    dispatch({ type: 'RESET', payload: initialMessages } as ChatAction);
  }, [chatId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const userMessage: Message = {
        id: 'temp-' + Date.now(),
        chatId,
        role: 'user',
        content: text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'ADD_USER', payload: userMessage });

      try {
        const newMessage = await createMessageForChat({
          chatId,
          content: text,
          role: 'user',
        });
        dispatch({
          type: 'CONFIRM_USER',
          payload: { tempId: userMessage.id, real: newMessage as Message },
        });
      } catch (error) {
        console.error('Error sending chat message:', error);
        // Remove optimistic message on error
        dispatch({ type: 'ROLLBACK', payload: { tempId: userMessage.id } });
        return;
      }

      try {
        if (stream) {
          const assistantId = 'assistant-' + Date.now();
          dispatch({ type: 'START_ASSISTANT', payload: { id: assistantId } });
          const controller = new AbortController();
          abortRef.current = controller;
          const reader = await fetchStream(chatId, controller.signal);
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            if (chunk) {
              dispatch({
                type: 'APPEND_ASSISTANT_CHUNK',
                payload: { id: assistantId, content: chunk },
              });
            }
          }
          dispatch({ type: 'COMMIT_ASSISTANT', payload: { id: assistantId } });

          // server flush will persist assistant message; optionally could refetch or patch ID later
        } else {
          const textResp = await fetchOnce(chatId);
          const assistantMessage: Message = {
            id: 'assistant-' + Date.now(),
            chatId,
            role: 'assistant',
            content: textResp,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dispatch({ type: 'ADD_USER', payload: assistantMessage });

          // persist non-stream assistant message
          try {
            const saved = await createMessageForChat({
              chatId,
              content: textResp,
              role: 'assistant',
            });
            dispatch({
              type: 'CONFIRM_ASSISTANT',
              payload: { tempId: assistantMessage.id, real: saved as Message },
            });
          } catch (err) {
            console.error('Persist assistant failed:', err);
          }
        }
      } catch (e: unknown) {
        console.error(e);
        dispatch({ type: 'ROLLBACK', payload: { tempId: userMessage.id } });
        dispatch({
          type: 'ERROR',
          payload: (e as Error).message || 'Failed to send',
        });
      }
    },
    [chatId, state.messages, stream]
  );

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return { ...state, sendMessage, stop };
}
