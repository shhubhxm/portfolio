'use client';

import React from 'react';

interface ChatBottombarProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
  isToolInProgress: boolean;
  disabled?: boolean;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
  disabled = false,
}: ChatBottombarProps) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || isToolInProgress || disabled || !input.trim()) return;
    handleSubmit(e);
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur md:px-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={disabled ? '' : isToolInProgress ? 'Working…' : 'Ask me anything'}
          className={`flex-1 bg-transparent px-2 py-2 outline-none placeholder:text-neutral-400 ${
            disabled ? 'text-red-600 font-medium' : 'text-black'
          }`}
          disabled={isToolInProgress || isLoading || disabled}
        />

        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isToolInProgress || disabled}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        )}
      </div>
    </form>
  );
}
