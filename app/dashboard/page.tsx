"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DestinyMatrixResult } from "@/lib/destiny-matrix";

export default function DashboardPage() {
  const [profile, setProfile] = useState<{
    full_name: string | null;
    phone_number: string | null;
    is_subscribed: boolean;
    subscription_ends_at: string | null;
  } | null>(null);
  const [matrix, setMatrix] = useState<DestinyMatrixResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, phone_number, is_subscribed, subscription_ends_at")
        .eq("id", user.id)
        .single();
      setProfile(p ?? null);
      setPhone(p?.phone_number ?? "");

      const { data: m } = await supabase
        .from("destiny_matrices")
        .select("matrix_data")
        .eq("user_id", user.id)
        .single();
      setMatrix((m?.matrix_data as DestinyMatrixResult) ?? null);
      setLoading(false);
    }
    load();
  }, []);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setPhoneSaving(true);
    try {
      const res = await fetch("/api/profile/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone.replace(/\s/g, "") }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setPhoneError(d.error || "Failed to save.");
        return;
      }
      setProfile((prev) => (prev ? { ...prev, phone_number: phone } : null));
    } catch {
      setPhoneError("Network error.");
    } finally {
      setPhoneSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-violet-dark/70">Loading…</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream px-4">
        <p className="text-violet-dark/70">Could not load profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="font-display text-xl text-violet-deep block mb-8">
          Destiny
        </Link>

        <h1 className="font-display text-2xl text-violet-deep mb-6">Your dashboard</h1>

        {matrix && (
          <section className="mb-8 p-6 rounded-2xl bg-white border border-violet-deep/10 shadow-sm">
            <h2 className="font-display text-lg text-violet-deep mb-3">Your Destiny Matrix</h2>
            <p className="text-violet-dark/80 text-sm mb-4">{matrix.summary}</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {Object.entries(matrix.arcana).map(([key, arc]) => (
                <div
                  key={key}
                  className="p-2 rounded-lg bg-violet-deep/5 border border-violet-deep/10"
                >
                  <span className="font-medium text-violet-deep">{key}</span>
                  <span className="block text-violet-dark/70 truncate" title={arc.name}>
                    {arc.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.is_subscribed && (
          <section className="mb-8 p-6 rounded-2xl bg-white border border-violet-deep/10 shadow-sm">
            <h2 className="font-display text-lg text-violet-deep mb-2">Subscription</h2>
            <p className="text-violet-dark/80 text-sm mb-4">
              You’re subscribed. Destiny will guide you via WhatsApp or text.
              {profile.subscription_ends_at && (
                <span className="block mt-1">
                  Current period ends:{" "}
                  {new Date(profile.subscription_ends_at).toLocaleDateString()}
                </span>
              )}
            </p>
            <p className="text-sm text-violet-dark/60">
              To cancel or manage billing, use the link in your subscription confirmation email, or
              contact support.
            </p>
          </section>
        )}

        <section className="p-6 rounded-2xl bg-white border border-violet-deep/10 shadow-sm">
          <h2 className="font-display text-lg text-violet-deep mb-2">Phone number</h2>
          <p className="text-violet-dark/80 text-sm mb-4">
            Destiny uses this number to reach you on WhatsApp or SMS.
          </p>
          <form onSubmit={handleSavePhone} className="space-y-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7700 900000"
              className="w-full px-4 py-3 rounded-xl border border-violet-deep/20 bg-white text-violet-dark placeholder:text-violet-dark/50 focus:outline-none focus:ring-2 focus:ring-rose/40"
            />
            {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
            <button
              type="submit"
              disabled={phoneSaving}
              className="py-2 px-4 rounded-xl bg-violet-deep text-cream text-sm font-medium hover:bg-violet-deep/90 transition disabled:opacity-60"
            >
              {phoneSaving ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        <p className="mt-8 text-center text-sm text-violet-dark/60">
          <Link href="/" className="text-rose hover:underline">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
