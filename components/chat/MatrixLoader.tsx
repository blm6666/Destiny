"use client";

import { motion } from "framer-motion";

export function MatrixLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        className="relative w-32 h-32"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-rose/40 border-t-rose"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner rotating ring (opposite) */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-gold-soft/50 border-b-gold-soft"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Center symbol */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl text-violet-deep">◇</span>
        </motion.div>
      </motion.div>
      <motion.p
        className="mt-8 text-violet-dark/80 text-center max-w-xs"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Mapping your energies…
      </motion.p>
      <motion.p
        className="mt-2 text-sm text-violet-dark/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Your Destiny Matrix is being compiled
      </motion.p>
    </div>
  );
}
