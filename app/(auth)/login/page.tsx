"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: "Check your email for the magic link to sign in.",
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-deep/5 to-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl md:text-4xl text-violet-deep text-center mb-2">
          Welcome to Destiny
        </h1>
        <p className="text-violet-dark/70 text-center mb-8 font-sans">
          Enter your email and we&apos;ll send you a link to sign in.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="email" className="block text-sm font-medium text-violet-dark">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-xl border border-violet-deep/20 bg-white/80 text-violet-dark placeholder:text-violet-dark/50 focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-violet-deep text-cream font-medium hover:bg-violet-deep/90 transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.type === "success" ? "text-violet-deep" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
        <p className="mt-8 text-center text-sm text-violet-dark/70">
          <Link href="/" className="text-rose hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
