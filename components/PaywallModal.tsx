"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PaywallModalProps {
  isOpen: boolean;
  messageCount: number;
}

export function PaywallModal({ isOpen, messageCount }: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-violet-dark/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-cream rounded-2xl shadow-2xl max-w-md w-full p-8 border border-violet-deep/10"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="text-center mb-6">
            <span className="text-4xl text-rose">◇</span>
            <h2 className="font-display text-2xl text-violet-deep mt-4">
              You&apos;ve used your {messageCount} free messages
            </h2>
            <p className="text-violet-dark/80 mt-2">
              Subscribe to keep the conversation going—and get Destiny in your pocket via
              WhatsApp or text.
            </p>
          </div>
          <ul className="text-left text-violet-dark/80 space-y-2 mb-8">
            <li className="flex items-center gap-2">
              <span className="text-rose">✓</span> Unlimited guidance from Destiny
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose">✓</span> WhatsApp or SMS—your choice
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose">✓</span> Just $5 per week
            </li>
          </ul>
          <Link
            href="/subscribe"
            className="block w-full py-3 rounded-xl bg-violet-deep text-cream text-center font-medium hover:bg-violet-deep/90 transition"
          >
            Subscribe for $5/week
          </Link>
          <p className="text-xs text-violet-dark/60 text-center mt-4">
            Cancel anytime. After subscribing you&apos;ll add your phone number to receive
            messages.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
