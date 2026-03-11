import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between items-center bg-cream/80 backdrop-blur-md border-b border-violet-deep/5">
        <Link href="/" className="font-display text-xl text-violet-deep">
          Destiny
        </Link>
        <Link
          href="/login"
          className="text-violet-deep hover:text-rose font-medium transition"
        >
          Sign in
        </Link>
      </header>
      <Hero />
      <Features />
      <Testimonials />
      <footer className="py-12 px-4 border-t border-violet-deep/10 text-center text-violet-dark/60 text-sm">
        <p>© Destiny Matrix. Guidance for your path.</p>
      </footer>
    </main>
  );
}
