import React from 'react';
import clsx from 'clsx';

interface ChatBubbleProps {
  variant: 'sent' | 'received';
  children: React.ReactNode;
  className?: string;
}

export function ChatBubble({ variant, children, className }: ChatBubbleProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl p-3 max-w-[75%] text-sm',
        variant === 'sent'
          ? 'bg-blue-500 text-white self-end'
          : 'bg-gray-200 text-black self-start',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChatBubbleMessageProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatBubbleMessage({ children, className }: ChatBubbleMessageProps) {
  return <div className={clsx('leading-relaxed', className)}>{children}</div>;
}