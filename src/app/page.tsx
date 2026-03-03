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
          className="flex flex-col gap-6 w-full"
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.02em] leading-[1.1] text-[var(--foreground)]">
            Elevate Your <br className="hidden sm:block" /> Everyday Wardrobe.
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto">
            정교한 체형 분석과 실시간 날씨 데이터를 결합한 <br className="hidden sm:block" /> 완벽한 퍼스널 스타일링 큐레이션.
          </p>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md sm:max-w-none justify-center mt-4"
        >
          <Link href="/onboarding" className="group flex items-center justify-center gap-3 rounded-full bg-[var(--foreground)] text-[var(--background)] px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-medium shadow-2xl hover:scale-[1.02] transition-transform duration-300">
            <Sparkles size={22} className="opacity-80 group-hover:opacity-100 transition-opacity" />
            내 옷장 만들기
          </Link>
          <Link href="/dashboard" className="group flex items-center justify-center gap-3 rounded-full bg-transparent text-[var(--foreground)] border border-[var(--card-border)] backdrop-blur-md px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-medium hover:border-[var(--foreground)] transition-all duration-300">
            오늘 뭐 입지?
            <ArrowRight size={22} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
