"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-[var(--space-page)] relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-light)] via-transparent to-transparent pointer-events-none" />

      <main className="flex flex-col items-center gap-10 text-center w-full relative z-10">
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease }}
          className="w-[72px] h-[72px] bg-[var(--foreground)] rounded-[18px] flex items-center justify-center shadow-lg"
        >
          <span className="text-[var(--background)] text-[22px] font-bold tracking-tight">DN</span>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="flex flex-col gap-3"
        >
          <h1 className="text-[var(--text-2xl)] font-bold tracking-tight leading-[1.2]" style={{ fontSize: "var(--text-2xl)" }}>
            오늘 뭐 입지?<br />고민 끝.
          </h1>
          <p className="text-[var(--muted-foreground)] leading-relaxed" style={{ fontSize: "var(--text-base)" }}>
            날씨와 스타일에 맞는 코디를<br />매일 아침 추천해 드립니다.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28, ease }}
          className="w-full flex flex-col gap-3 mt-2"
        >
          <Link href="/onboarding" className="btn-primary flex items-center justify-center">
            시작하기
          </Link>
          <Link href="/dashboard" className="btn-secondary flex items-center justify-center gap-1">
            바로 코디 보기 <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
