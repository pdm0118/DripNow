"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 font-sans relative overflow-hidden bg-[var(--background)]">
      {/* Background Decorative Graphic (Subtle & Elegant) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[var(--foreground)] rounded-full blur-[100px] pointer-events-none"
      />

      <main className="flex flex-col items-center gap-10 md:gap-14 z-10 text-center max-w-4xl w-full">
        {/* App Logo / Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--foreground)] rounded-2xl flex items-center justify-center text-[var(--background)] font-bold text-2xl shadow-xl transform rotate-3">
            DN
          </div>
          <h1 className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-[var(--muted-foreground)]">
            DripNow
          </h1>
        </motion.div>

        {/* Hero Copy (Editorial Style) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8 w-full items-center"
        >
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif tracking-tight leading-[1] text-[var(--foreground)]">
            <span className="italic font-light">Elevate Your</span><br className="hidden sm:block" />
            <span className="font-medium">Everyday Wardrobe.</span>
          </h2>
          <p className="text-neutral-500 text-sm sm:text-md tracking-widest uppercase font-medium leading-relaxed max-w-2xl mx-auto mt-4">
            정교한 분석과 실시간 데이터를 결합한 완벽한 큐레이션
          </p>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-6 w-full max-w-md sm:max-w-none justify-center mt-8 px-6"
        >
          <Link href="/wardrobe" className="group flex items-center justify-center gap-4 border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] px-10 py-5 text-sm uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all duration-500">
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">Manage Wardrobe</span>
              <span className="absolute inset-0 block translate-y-full transition-transform duration-500 group-hover:translate-y-0">내 옷장 관리</span>
            </span>
          </Link>
          <Link href="/dashboard" className="group flex items-center justify-center gap-4 bg-transparent text-[var(--foreground)] border border-neutral-200 dark:border-neutral-800 px-10 py-5 text-sm uppercase tracking-widest font-bold hover:border-[var(--foreground)] transition-all duration-500">
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">Get Recommendations</span>
              <span className="absolute inset-0 block translate-y-full transition-transform duration-500 group-hover:translate-y-0">오늘 뭐 입지?</span>
            </span>
            <ArrowRight size={18} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-8 md:bottom-12 text-[var(--muted-foreground)] text-xs md:text-sm tracking-widest uppercase flex gap-4 text-center z-10"
      >
        <p>© 2026 DripNow. Curated Perfection.</p>
      </motion.footer>
    </div>
  );
}
