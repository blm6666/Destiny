"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Your matrix, your map",
    description:
      "Share your birth date and watch your Destiny Matrix unfold. Sacred geometry and 22 archetypal energies reveal your soul, karma, and life purpose in one place.",
    icon: "◇",
  },
  {
    title: "Guidance that knows you",
    description:
      "Ask about relationships, career, family, or any situation. Destiny answers using your matrix so every piece of advice is aligned with your unique energies.",
    icon: "✧",
  },
  {
    title: "Support when you need it",
    description:
      "After your free session, stay connected via WhatsApp or text. Get ongoing guidance and clarity wherever you are, in your pocket.",
    icon: "○",
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl md:text-4xl text-violet-deep text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.h2>
        <motion.p
          className="text-violet-dark/70 text-center mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Three simple steps to clarity and direction.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-10 md:gap-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-white/60 backdrop-blur rounded-2xl p-8 border border-violet-deep/10 shadow-lg shadow-violet-deep/5"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-3xl text-rose mb-4">{feature.icon}</div>
              <h3 className="font-display text-xl text-violet-deep mb-3">{feature.title}</h3>
              <p className="text-violet-dark/80 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
