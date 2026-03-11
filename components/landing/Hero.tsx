"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-deep/10 via-transparent to-cream pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-soft/20 rounded-full blur-3xl" />

      <motion.div
        className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full max-w-5xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            src="/destiny.png"
            alt="Destiny - your personal matrix guide"
            width={280}
            height={280}
            className="rounded-2xl shadow-xl object-cover w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72"
            priority
          />
        </motion.div>
        <div className="text-center md:text-left max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-violet-deep leading-tight mb-6">
          Discover your{" "}
          <span className="text-rose italic">Destiny Matrix</span>
          <br />
          and step into your path
        </h1>
        <p className="text-lg md:text-xl text-violet-dark/80 mb-10 max-w-xl mx-auto">
          Your personal guide, Destiny, will map your unique energies from your birth date—then
          support you through life, love, and purpose with wisdom tailored just for you.
        </p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button href="/login" variant="primary" size="lg">
            Begin your journey
          </Button>
          <Button href="#how-it-works" variant="secondary" size="lg">
            How it works
          </Button>
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
