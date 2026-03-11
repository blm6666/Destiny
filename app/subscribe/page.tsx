"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_subscribed, phone_number")
        .eq("id", user.id)
        .single();
      setIsSubscribed(!!profile?.is_subscribed);
      if (profile?.phone_number) {
        setPhone(profile.phone_number);
        setPhoneSuccess(true);
      }
      setLoading(false);
    }
    check();
  }, [success]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setPhoneError("Could not start checkout.");
    } catch {
      setPhoneError("Something went wrong.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    const normalized = phone.replace(/\s/g, "");
    if (!normalized.length) {
      setPhoneError("Please enter your phone number.");
      return;
    }
    try {
      const res = await fetch("/api/profile/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: normalized }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setPhoneError(d.error || "Failed to save.");
        return;
      }
      setPhoneSuccess(true);
    } catch {
      setPhoneError("Network error.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-violet-dark/70">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-md mx-auto">
        <Link href="/" className="font-display text-xl text-violet-deep block mb-8">
          Destiny
        </Link>

        {canceled && (
          <div className="mb-6 p-4 rounded-xl bg-gold-soft/20 text-violet-deep text-sm">
            Checkout was canceled. You can try again when you&apos;re ready.
          </div>
        )}

        {success && !isSubscribed && (
          <div className="mb-6 p-4 rounded-xl bg-rose/10 text-violet-deep text-sm">
            Your payment is being confirmed. This page will update in a moment, or refresh to check.
          </div>
        )}

        {!isSubscribed ? (
          <>
            <h1 className="font-display text-2xl text-violet-deep mb-2">
              Subscribe to Destiny
            </h1>
            <p className="text-violet-dark/80 mb-6">
              Get unlimited guidance and receive Destiny via WhatsApp or text for $5/week.
            </p>
            <ul className="space-y-2 text-violet-dark/80 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-rose">✓</span> Unlimited messages
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose">✓</span> WhatsApp or SMS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose">✓</span> Cancel anytime
              </li>
            </ul>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-3 rounded-xl bg-violet-deep text-cream font-medium hover:bg-violet-deep/90 transition disabled:opacity-60"
            >
              {checkoutLoading ? "Redirecting…" : "Subscribe for $5/week"}
            </button>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl text-violet-deep mb-2">
              You&apos;re subscribed
            </h1>
            <p className="text-violet-dark/80 mb-6">
              Add your mobile number to receive Destiny via WhatsApp or text.
            </p>
            {phoneSuccess ? (
              <div className="p-4 rounded-xl bg-white border border-violet-deep/10">
                <p className="text-violet-deep font-medium">Phone number saved</p>
                <p className="text-violet-dark/70 text-sm mt-1">
                  Destiny will reach you at {phone}. You can update it from your dashboard.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block mt-4 text-rose font-medium hover:underline"
                >
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmitPhone} className="space-y-4">
                <label htmlFor="phone" className="block text-sm font-medium text-violet-dark">
                  Mobile number (with country code)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full px-4 py-3 rounded-xl border border-violet-deep/20 bg-white text-violet-dark placeholder:text-violet-dark/50 focus:outline-none focus:ring-2 focus:ring-rose/40"
                />
                {phoneError && (
                  <p className="text-sm text-red-600">{phoneError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-violet-deep text-cream font-medium hover:bg-violet-deep/90 transition"
                >
                  Save and continue
                </button>
              </form>
            )}
            <p className="mt-8 text-center text-sm text-violet-dark/60">
              <Link href="/dashboard" className="text-rose hover:underline">
                Dashboard
              </Link>
              {" · "}
              <Link href="/" className="text-rose hover:underline">
                Home
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-violet-dark/70">Loading…</p>
        </main>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}
