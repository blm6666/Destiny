"use client";

import { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { MatrixLoader } from "./MatrixLoader";
import { PaywallModal } from "../PaywallModal";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  streamingContent: string | null;
  isLoading: boolean;
  isMatrixLoading: boolean;
  messageCount: number;
  paywallAt: number;
  onSend: (content: string) => void;
}

export function ChatWindow({
  messages,
  streamingContent,
  isLoading,
  isMatrixLoading,
  messageCount,
  paywallAt,
  onSend,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const showPaywall = messageCount >= paywallAt;
  const canSend = !showPaywall && !isLoading && !isMatrixLoading;

  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (!trimmed || !canSend) return;
    onSend(trimmed);
    setInputValue("");
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {streamingContent && (
          <MessageBubble role="assistant" content={streamingContent} isStreaming />
        )}
        {isMatrixLoading && <MatrixLoader />}
        <div ref={bottomRef} />
      </div>
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={!canSend}
        placeholder={showPaywall ? "Subscribe to continue…" : "Type your message…"}
      />
      <PaywallModal isOpen={showPaywall} messageCount={paywallAt} />
    </div>
  );
}
