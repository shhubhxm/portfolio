'use client';

import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export function SimplifiedChatView({
  message,
  isLoading = false,
}: {
  message: { role: string; content: string };
  isLoading?: boolean;
}) {
  const isAssistant = message.role === 'assistant';

  // Shared container (keeps everything centered & narrow)
  const container = 'mx-auto w-full max-w-[720px] px-4';

  // Bubble styles
  const bubbleBase =
    'rounded-2xl px-4 py-3 leading-[1.55] tracking-[-0.01em]';
  const assistantStyle =
    'bg-white text-neutral-900 border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]';
  const userStyle =
    'bg-[#2F6BFF] text-white shadow-[0_2px_10px_rgba(47,107,255,0.25)]';

  return (
    <motion.div {...MOTION_CONFIG} className="w-full">
      <div className={container}>
        <div className={`${bubbleBase} ${isAssistant ? assistantStyle : userStyle}`}>
          <ChatMessageContent message={message} />
        </div>

        {isLoading && (
          <div className="mt-2 text-center text-sm text-neutral-500">
            Generating response…
          </div>
        )}
      </div>
    </motion.div>
  );
}
