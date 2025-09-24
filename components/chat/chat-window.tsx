'use client';

import { Button } from '@/components/ui/button';
import { ArrowDown, FolderPlus } from 'lucide-react';
import { useState, useCallback } from 'react';
import ChatInput from './chat-input';
import { useChatScroll } from './useChatScroll';

import { useChatContext } from '@/lib/chat/ChatProvider';
import MarkdownRender from './markdown-render';
import StreamingIndicator from './streaming-indicator';
import AssignToProjectModal from './assign-to-project-modal';

function ChatWindow() {
  const { messages, sendMessage, isStreaming, chat, status } = useChatContext();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  // Local flag only while the synchronous submission is happening (very short)
  const [sending, setSending] = useState(false);

  const {
    scrollContainer,
    messagesWrapperRef,
    showScrollButton,
    scrollToBottom,
  } = useChatScroll({ messages });

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      setSending(true);
      try {
        await sendMessage(message);
      } finally {
        // We rely on status to show streaming; clear local flag immediately after dispatch
        setSending(false);
      }
    },
    [sendMessage]
  );

  const isBusy = sending || status === 'submitted' || isStreaming;

  return (
    <div
      ref={scrollContainer}
      className="overflow-y-auto w-full box-border flex-1 min-h-0"
    >
      <div className="max-w-[800px] px-4 mx-auto h-full">
        {!messages?.length ? (
          <div className="flex items-center justify-center flex-1 min-h-full">
            <div className="bg-card border border-border rounded-lg p-8 w-full flex flex-col gap-8">
              <h2 className="text-xl font-medium text-muted-foreground text-center">
                Start your chat
              </h2>
              <ChatInput onSendMessage={handleSendMessage} isBusy={isBusy} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">
                {chat?.title || 'Untitled Chat'}
              </h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setAssignModalOpen(true)}
                disabled={!chat?.id}
              >
                <FolderPlus className="size-4" />
                Assign to Project
              </Button>
            </div>

            <div
              ref={messagesWrapperRef}
              className="flex flex-col gap-4 mb-6 overflow-y-auto pb-16"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-muted dark:bg-zinc-700 border border-border w-[70%] self-end'
                      : 'w-full py-4 px-0 border-none'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownRender content={message.content} />
                  ) : (
                    <div className="text-foreground break-words whitespace-pre-wrap">
                      {message.content}
                    </div>
                  )}
                </div>
              ))}
              <StreamingIndicator active={isBusy} />
            </div>

            <div className="fixed bottom-6 max-w-[768px] w-[calc(100%-3rem)] z-10">
              <div className="absolute bottom-[calc(100%+1rem)] left-0 w-full flex justify-center pointer-events-none">
                {showScrollButton && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full shadow-sm pointer-events-auto"
                    onClick={() => scrollToBottom()}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                )}
              </div>
              <ChatInput onSendMessage={handleSendMessage} isBusy={isBusy} />
            </div>
            <AssignToProjectModal
              chatId={chat?.id || ''}
              open={assignModalOpen}
              onOpenChange={setAssignModalOpen}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
