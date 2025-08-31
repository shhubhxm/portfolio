'use client';

import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import HelperBoost from '@/components/chat/HelperBoost';
import { PoweredByFastfolio } from '@/components/powered-by-fastfolio';

// ----- Client-only wrapper -----
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

interface AvatarProps {
  hasActiveTool: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTalking: boolean;
}

// ----- Avatar (UI only) -----
const Avatar = dynamic<AvatarProps>(
  () =>
    Promise.resolve(({ hasActiveTool, videoRef }: AvatarProps) => {
      const isIOS = () => {
        const ua = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const maxTouchPoints = window.navigator.maxTouchPoints || 0;
        const isIOSUA =
          // @ts-ignore
          /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isIOSPlat = /iPad|iPhone|iPod/.test(platform);
        const isIPadOS =
          // @ts-ignore
          platform === 'MacIntel' && maxTouchPoints > 1 && !window.MSStream;
        const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
        return isIOSUA || isIOSPlat || isIPadOS || isSafari;
      };

      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${
            hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'
          }`}
        >
          <div className="relative cursor-pointer" onClick={() => (window.location.href = '/')}>
            {isIOS() ? (
              <img
                src="/landing-memojis.png"
                alt="iOS avatar"
                className="h-full w-full scale-[1.8] object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                className="h-full w-full scale-[1.8] object-contain"
                muted
                playsInline
                loop
              >
                <source src="/final_memojis.webm" type="video/webm" />
                <source src="/final_memojis_ios.mp4" type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      );
    }),
  { ssr: false }
);

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 18 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

export default function Chat() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');

  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // Groq-friendly message model
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isToolInProgress = false; // no tools with Groq for now

  // ---- API call to your /api/chat (Groq) ----
  async function fetchGroqChat(nextMsgs: { role: string; content: string }[]) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: nextMsgs }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  const submitQuery = async (query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setLoadingSubmit(true);
    setIsLoading(true);

    const next = [...messages, { role: 'user', content: query }];
    setMessages(next);

    try {
      const reply = await fetchGroqChat(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
      setIsTalking(true);
      videoRef.current?.play().catch(() => {});
    } catch (err: any) {
      setIsTalking(false);
      videoRef.current?.pause();
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoadingSubmit(false);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQuery(input);
    setInput('');
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.pause();
    }
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted]);

  useEffect(() => {
    if (!videoRef.current) return;
    isTalking ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
  }, [isTalking]);

  // ---- Derivations for header + single-turn list ----
  const { currentAIMessage, latestUserMessage, lastPair } = useMemo(() => {
    const aiIdx = messages.findLastIndex((m) => m.role === 'assistant');
    const userIdx = messages.findLastIndex((m) => m.role === 'user');

    let currentAIMessage: { role: string; content: string } | null =
      aiIdx !== -1 ? messages[aiIdx] : null;

    // If last message is user (awaiting assistant), "currentAIMessage" must be null.
    if (aiIdx < userIdx) currentAIMessage = null;

    // Build the latest (user + assistant) pair
    let lastPair: { role: string; content: string }[] = [];
    if (aiIdx !== -1) {
      const prevUserIdx = [...messages]
        .slice(0, aiIdx)
        .findLastIndex((m) => m.role === 'user');
      if (prevUserIdx !== -1) {
        lastPair = [messages[prevUserIdx], messages[aiIdx]];
      } else {
        lastPair = [messages[aiIdx]];
      }
    }

    return {
      currentAIMessage,
      latestUserMessage: userIdx !== -1 ? messages[userIdx] : null,
      lastPair,
    };
  }, [messages]);

  // Pending detection
  const pendingUserIndex =
    currentAIMessage === null &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'user'
      ? messages.length - 1
      : -1;

  const isPending = pendingUserIndex !== -1;

  const isEmptyState =
    messages.length === 0 ||
    (!isPending && lastPair.length === 0);

  const headerHeight = 180;

  const handleStop = () => {
    setLoadingSubmit(false);
    setIsTalking(false);
    videoRef.current?.pause();
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white">
      {/* Help button */}
      <div className="absolute right-8 top-6 z-50 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="cursor-pointer rounded-2xl px-3 py-1.5 hover:bg-accent">
              <Info className="h-8 text-accent-foreground" />
            </div>
          }
        />
      </div>

      {/* Fixed avatar header with gradient */}
      <div
        className="fixed left-0 right-0 top-0 z-40"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 100%)',
        }}
      >
        <div className="py-6 transition-all duration-300 ease-in-out">
          <div className="flex justify-center">
            <ClientOnly>
              <Avatar hasActiveTool={false} videoRef={videoRef} isTalking={isTalking} />
            </ClientOnly>
          </div>

          {/* Show only the latest user message while waiting */}
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div
                key={`header-${messages[pendingUserIndex]?.content.slice(0, 24)}`}
                {...MOTION_CONFIG}
                className="mx-auto flex max-w-3xl px-4"
              >
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent message={messages[pendingUserIndex]} />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main column */}
      <div className="container mx-auto flex h-[100dvh] max-w-3xl flex-col">
        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingTop: `${headerHeight}px` }}>
          <div className="mx-auto w-full max-w-3xl px-2 pb-36">
            <AnimatePresence mode="wait">
              {isEmptyState ? (
                <motion.div
                  key="landing"
                  className="flex min-h-full items-center justify-center px-4"
                  {...MOTION_CONFIG}
                >
                  <ChatLanding submitQuery={submitQuery} hasReachedLimit={false} />
                </motion.div>
              ) : isPending ? (
                // Important: while pending, hide the previous pair completely
                <motion.div key="pending-placeholder" {...MOTION_CONFIG} />
              ) : (
                <motion.div
                  key={
                    lastPair.map((m) => `${m.role}:${m.content.slice(0, 12)}`).join('|') ||
                    'empty-pair'
                  }
                  className="space-y-6"
                  {...MOTION_CONFIG}
                >
                  {lastPair.map((msg, idx) => (
                    <SimplifiedChatView
                      key={`${idx}-${msg.role}-${msg.content.slice(0, 12)}`}
                      message={msg}
                      isLoading={false}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sticky composer */}
        <div
          className="sticky bottom-0 bg-white px-2 pt-3 md:px-0 md:pb-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-3">
            <HelperBoost submitQuery={submitQuery} />
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={false}
            />
          </div>
          <PoweredByFastfolio />
        </div>
      </div>
    </div>
  );
}
