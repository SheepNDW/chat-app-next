'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  isStreaming?: boolean;
  onSendMessage: (message: string) => void;
}

function ChatInput({ isStreaming = false, onSendMessage }: ChatInputProps) {
  const [newMessage, setNewMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim() || isStreaming) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (newMessage === '') {
      adjustTextareaHeight();
      textareaRef.current?.focus();
    }
  }, [newMessage]);

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  return (
    <form
      className="relative flex items-center justify-center transition-all duration-150 ease-in-out border border-border rounded-[1.8rem] overflow-hidden p-4 pr-8 pl-5 bg-background hover:shadow-md focus-within:shadow-md w-full"
      onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }}
    >
      <textarea
        ref={textareaRef}
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          adjustTextareaHeight();
        }}
        onKeyDown={handleKeyDown}
        className="w-full p-0 mr-6 resize-none bg-transparent outline-none border-none text-foreground disabled:cursor-not-allowed disabled:opacity-50 scrollbar-none"
        disabled={isStreaming}
        rows={1}
        placeholder="Type your message..."
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      />
      <Button
        type="submit"
        disabled={!newMessage.trim() || isStreaming}
        size="icon"
        className="absolute right-3 bottom-3 rounded-full size-8"
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}

export default ChatInput;
