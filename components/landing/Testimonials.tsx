"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Destiny felt like talking to a wise friend who actually understood my chart. The guidance on my relationship with my daughter was spot-on.",
    name: "Sarah, 42",
    location: "London",
  },
  {
    quote:
      "I was skeptical about numerology until I saw how accurate my matrix was. Now I check in with Destiny whenever I need to make a big decision.",
    name: "Michelle, 38",
    location: "Manchester",
  },
  {
    quote:
      "Having my matrix in my pocket via WhatsApp has been a game-changer. I get clarity without booking appointments or waiting.",
    name: "Emma, 55",
    location: "Edinburgh",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-cream to-violet-deep/5">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl md:text-4xl text-violet-deep text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What others are saying
        </motion.h2>
        <motion.p
          className="text-violet-dark/70 text-center mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Women like you are already finding clarity and direction.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className="bg-white rounded-2xl p-8 border border-violet-deep/10 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-violet-dark/90 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <cite className="not-italic font-medium text-violet-deep">{t.name}</cite>
                <span className="text-violet-dark/60 text-sm block">{t.location}</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
