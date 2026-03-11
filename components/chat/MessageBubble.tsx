"use client";

import { motion } from "framer-motion";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-violet-deep text-cream rounded-br-md"
            : "bg-white/90 border border-violet-deep/10 text-violet-dark rounded-bl-md shadow-sm"
        }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}
