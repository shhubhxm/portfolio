'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: string;
  content: string;
}

export default function ChatMessageContent({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  // Typography system inspired by the paid version
  // - Slightly larger font
  // - Tighter margins
  // - Nice lists spacing
  return isAssistant ? (
    <ReactMarkdown
      components={{
        h1: (props) => (
          <h1
            className="mb-3 mt-1 text-center text-[22px] font-semibold tracking-[-0.02em] text-neutral-900"
            {...props}
          />
        ),
        h2: (props) => (
          <h2
            className="mb-3 mt-1 text-center text-[20px] font-semibold tracking-[-0.02em] text-neutral-900"
            {...props}
          />
        ),
        h3: (props) => (
          <h3
            className="mb-2 mt-1 text-[18px] font-semibold tracking-[-0.01em] text-neutral-900"
            {...props}
          />
        ),
        p: (props) => (
          <p className="mb-3 mt-1 text-[15px] text-neutral-800" {...props} />
        ),
        ul: (props) => (
          <ul className="mb-3 ml-5 list-disc space-y-1 text-[15px] text-neutral-800" {...props} />
        ),
        ol: (props) => (
          <ol className="mb-3 ml-5 list-decimal space-y-1 text-[15px] text-neutral-800" {...props} />
        ),
        li: (props) => <li className="leading-[1.55]" {...props} />,
        strong: (props) => <strong className="font-semibold text-neutral-900" {...props} />,
        a: (props) => (
          <a
            className="text-[#2F6BFF] underline decoration-[#2F6BFF]/40 underline-offset-2 hover:decoration-[#2F6BFF]"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
        hr: () => <hr className="my-4 border-neutral-200" />,
        blockquote: (props) => (
          <blockquote
            className="mb-3 mt-1 border-l-4 border-neutral-200 pl-3 text-[15px] text-neutral-700"
            {...props}
          />
        ),
        code: (props) => (
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px] text-neutral-900" {...props} />
        ),
        pre: (props) => (
          <pre
            className="mb-3 mt-1 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-[13px] leading-[1.5] text-neutral-900"
            {...props}
          />
        ),
      }}
    >
      {message.content}
    </ReactMarkdown>
  ) : (
    <p className="text-[15px] leading-[1.55]">{message.content}</p>
  );
}
