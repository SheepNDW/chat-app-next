'use client';

interface StreamingIndicatorProps {
  active: boolean;
  className?: string;
}

export default function StreamingIndicator({
  active,
  className = '',
}: StreamingIndicatorProps) {
  if (!active) return null;

  return (
    <span
      aria-label="model is responding"
      className={`inline-block animate-pulse ml-1 text-muted-foreground select-none ${className}`}
    >
      &#9611;
    </span>
  );
}
