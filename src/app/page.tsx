"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--background)] relative">
      <main className="flex flex-col items-center gap-8 text-center max-w-sm w-full">
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-20 bg-[var(--foreground)] rounded-[22px] flex items-center justify-center text-[var(--background)] text-2xl font-bold shadow-lg"
        >
          DN
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
        >
          <h1 className="text-[28px] font-bold tracking-tight leading-tight text-[var(--foreground)]">
            오늘 뭐 입지?<br />고민 끝.
          </h1>
          <p className="text-[15px] text-[var(--muted-foreground)] leading-relaxed">
            날씨와 스타일에 맞는 코디를<br />매일 아침 1초 만에 추천해 드립니다.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col gap-3 mt-4"
        >
          <Link href="/onboarding" className="w-full py-[15px] bg-[var(--accent)] text-white text-[17px] font-semibold rounded-[14px] text-center active:opacity-80 transition-opacity">
            시작하기
          </Link>
          <Link href="/dashboard" className="w-full py-[15px] bg-[var(--card-bg)] text-[var(--foreground)] text-[17px] font-semibold rounded-[14px] text-center active:opacity-80 transition-opacity flex items-center justify-center gap-1">
            바로 코디 보기 <ChevronRight size={18} />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
