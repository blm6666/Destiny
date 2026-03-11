"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";

const PAYWALL_AT = 10;

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello, I'm Destiny—your personal matrix guide. I'm here to map your energies and support you through life, relationships, and purpose.\n\nTo begin, what should I call you?",
};

function parseDateOfBirth(text: string): string | null {
  const trimmed = text.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) return trimmed;
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(trimmed);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  const months: Record<string, string> = {
    jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03",
    apr: "04", april: "04", may: "05", jun: "06", june: "06", jul: "07", july: "07",
    aug: "08", august: "08", sep: "09", sept: "09", september: "09", oct: "10",
    october: "10", nov: "11", november: "11", dec: "12", december: "12",
  };
  const match = trimmed.match(
    /^(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})$/i
  );
  if (match) {
    const [, d, mon, y] = match;
    const m = months[mon!.toLowerCase()];
    if (m) return `${y}-${m}-${d!.padStart(2, "0")}`;
  }
  return null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [hasMatrix, setHasMatrix] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json();
    const list = (data.messages ?? []).map((m: { id: string; role: string; content: string }) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    setMessages(list.length === 0 ? [WELCOME_MESSAGE] : list);
  }, []);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    if (!res.ok) return;
    const data = await res.json();
    setMessageCount(data.message_count ?? 0);
    setHasMatrix(!!data.has_matrix);
    if (data.is_subscribed) {
      window.location.href = "/dashboard";
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadMessages();
  }, [loadProfile, loadMessages]);

  const handleSend = useCallback(
    async (content: string) => {
      const dateStr = parseDateOfBirth(content);
      if (dateStr && !hasMatrix) {
        setIsMatrixLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/matrix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date_of_birth: dateStr }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setError(err.error || "Could not calculate matrix.");
            setIsMatrixLoading(false);
            return;
          }
          setHasMatrix(true);
        } finally {
          setIsMatrixLoading(false);
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content },
      ]);
      setIsLoading(true);
      setStreamingContent("");
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });

        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          if (data.paywall) {
            setMessageCount(PAYWALL_AT);
            setMessages((prev) => prev.slice(0, -1));
          }
          setIsLoading(false);
          setStreamingContent(null);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message = data?.error || `Something went wrong (${res.status}). Please try again.`;
          setError(message);
          setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          setStreamingContent(null);
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            setStreamingContent(accumulated);
          }
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: accumulated,
          },
        ]);
        setMessageCount((c) => c + 1);
        loadProfile();
      } catch {
        setError("Network error. Please try again.");
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        setStreamingContent(null);
      }
    },
    [hasMatrix, loadProfile]
  );


  return (
    <main className="min-h-screen flex flex-col bg-cream">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-violet-deep/10 bg-white/80">
        <Link href="/" className="font-display text-xl text-violet-deep">
          Destiny
        </Link>
        <span className="text-sm text-violet-dark/60">
          {messageCount}/{PAYWALL_AT} messages
        </span>
      </header>
      {error && (
        <div className="px-4 py-2 bg-rose/10 text-rose text-sm text-center">
          {error}
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ChatWindow
          messages={messages}
          streamingContent={streamingContent}
          isLoading={isLoading}
          isMatrixLoading={isMatrixLoading}
          messageCount={messageCount}
          paywallAt={PAYWALL_AT}
          onSend={handleSend}
        />
      </div>
    </main>
  );
}
