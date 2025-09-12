import { useState, useRef, useEffect, useCallback } from 'react';

interface UseChatScrollOptions<TMessage = unknown> {
  messages?: TMessage[]; // current messages array to watch
  autoPinThreshold?: number; // px distance from bottom considered "near"
  disableAutoPin?: boolean; // allow opt-out
}

export function useChatScroll<TMessage = unknown>(
  options: UseChatScrollOptions<TMessage> = {}
) {
  const { messages, autoPinThreshold = 120, disableAutoPin = false } = options;

  const scrollContainer = useRef<HTMLDivElement>(null);
  const messagesWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const checkScrollPosition = useCallback((): void => {
    if (!scrollContainer.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 200; // 200px tolerance for button visibility
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
  }, []);

  const scrollToBottom = useCallback((immediate = false): void => {
    if (!scrollContainer.current) return;
    const targetScrollTop =
      scrollContainer.current.scrollHeight -
      scrollContainer.current.clientHeight;

    if (immediate) {
      scrollContainer.current.scrollTop = targetScrollTop;
      return;
    }

    const startScrollTop = scrollContainer.current.scrollTop;
    const distance = targetScrollTop - startScrollTop;
    const duration = 300;
    const startTime = performance.now();

    function step(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      if (scrollContainer.current) {
        scrollContainer.current.scrollTop =
          startScrollTop + distance * easeInOutCubic;
        if (progress < 1) requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, []);

  const pinToBottom = useCallback((): void => {
    if (!isAtBottom || !scrollContainer.current) return;
    requestAnimationFrame(() => {
      if (scrollContainer.current) {
        scrollContainer.current.scrollTop =
          scrollContainer.current.scrollHeight;
      }
    });
  }, [isAtBottom]);

  // Initial attach of scroll listener + initial jump
  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;
    container.addEventListener('scroll', checkScrollPosition);
    // initial position
    scrollToBottom(true);
    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, [checkScrollPosition, scrollToBottom]);

  // Double rAF when messages array changes
  useEffect(() => {
    if (!messages?.length || disableAutoPin) return;
    let f1: number;
    let f2: number;
    f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => {
        pinToBottom();
      });
    });
    return () => {
      cancelAnimationFrame(f1);
      cancelAnimationFrame(f2);
    };
  }, [messages, pinToBottom, disableAutoPin]);

  // ResizeObserver on messagesWrapper for dynamic height changes
  useEffect(() => {
    if (disableAutoPin) return;
    const container = scrollContainer.current;
    const wrapper = messagesWrapperRef.current;
    if (!container || !wrapper) return;

    const isNearBottom = () =>
      container.scrollHeight - container.scrollTop - container.clientHeight <
      autoPinThreshold;

    let raf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (!container) return;
      if (isNearBottom()) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => pinToBottom());
      }
    });
    ro.observe(wrapper);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinToBottom, autoPinThreshold, disableAutoPin]);

  return {
    scrollContainer,
    messagesWrapperRef,
    isAtBottom,
    showScrollButton,
    scrollToBottom,
    pinToBottom,
  };
}
