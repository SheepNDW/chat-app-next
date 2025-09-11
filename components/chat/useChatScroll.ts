import { useState, useRef, useEffect, useCallback } from 'react';

export function useChatScroll() {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Check if chat is scrolled to bottom
  const checkScrollPosition = useCallback((): void => {
    if (scrollContainer.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 200;
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom);
    }
  }, []);

  // Smooth scroll to bottom
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

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
    }

    requestAnimationFrame(step);
  }, []);

  // Pin to bottom when content changes - React optimized version
  const pinToBottom = useCallback((): void => {
    if (!isAtBottom || !scrollContainer.current) return;

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      if (scrollContainer.current) {
        scrollContainer.current.scrollTop =
          scrollContainer.current.scrollHeight;
      }
    });
  }, [isAtBottom]);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainer.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);

      // Initial scroll to bottom
      scrollToBottom(true);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [checkScrollPosition, scrollToBottom]);

  return {
    scrollContainer,
    isAtBottom,
    showScrollButton,
    scrollToBottom,
    pinToBottom,
  };
}
