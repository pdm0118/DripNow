"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CloudSun, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Wind, Droplets } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function DashboardPage() {
    const [tpo, setTpo] = useState("work");
    const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
    const [swappingItem, setSwappingItem] = useState<string | null>(null);
    const [isCommitted, setIsCommitted] = useState(false);

    const activePreset = PRESETS[currentPresetIndex];

    const nextPreset = () => {
        if (currentPresetIndex < PRESETS.length - 1) setCurrentPresetIndex(c => c + 1);
    };

    const prevPreset = () => {
        if (currentPresetIndex > 0) setCurrentPresetIndex(c => c - 1);
    };

    const handleSwap = (itemId: string) => {
        setSwappingItem(itemId);
        // Fake API delay for UI feedback
        setTimeout(() => setSwappingItem(null), 800);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans relative overflow-x-hidden">
            {/* Header: Date, Weather, Location */}
            <header className="pt-12 pb-6 px-6 sm:px-12 max-w-5xl mx-auto flex items-end justify-between">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-2 text-[var(--foreground)]">오늘 뭐 입지?</h1>
                    <div className="flex items-center gap-2 text-neutral-500 font-medium">
                        <MapPin size={16} />
                        <span>Seoul, Gangnam</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <CloudSun size={28} className="text-[var(--foreground)]" />
                        22°
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                        <span className="flex items-center gap-1"><Wind size={14} /> 3m/s</span>
                        <span className="flex items-center gap-1"><Droplets size={14} /> 10%</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 sm:px-12 pb-40">
                {/* TPO Selection */}
                <section className="mb-10">
                    <p className="text-sm font-semibold tracking-widest uppercase mb-4 text-[var(--muted-foreground)]">Occasion</p>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {TPOs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setTpo(t.id); setCurrentPresetIndex(0); }}
                                className={clsx(
                                    "px-6 py-3 rounded-full border transition-all font-medium whitespace-nowrap",
                                    tpo === t.id
                                        ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-lg"
                                        : "bg-transparent border-neutral-200 dark:border-neutral-800 text-[var(--foreground)] hover:border-neutral-400"
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Outfit Presentation Area */}
                <section className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePreset.id}
                            initial={{ opacity: 0, scale: 0.98, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.98, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 lg:gap-16"
                        >
                            {/* Avatar / Visual Placeholder container */}
                            <div className="flex-1 aspect-[3/4] md:aspect-auto md:h-[600px] rounded-3xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center relative overflow-hidden group">
                                <span className="absolute top-6 right-6 bg-black/5 dark:bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold tracking-wider z-10">
                                    적합도 {activePreset.matchRate}%
                                </span>
                                {/* Luxury Placeholder graphic */}
                                <div className="w-32 h-64 sm:w-48 sm:h-96 border-4 border-dashed border-neutral-300 dark:border-neutral-700 rounded-t-full rounded-b-xl flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    <p className="text-neutral-400 rotate-90 font-mono tracking-widest uppercase">My Avatar</p>
                                </div>
                            </div>

                            {/* Preset Info & Item List */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] mb-3">{activePreset.name}</h2>
                                <p className="text-neutral-500 mb-8 font-light text-lg">기온과 선호하는 핏에 최적화된 조합입니다.</p>

                                <div className="space-y-3 flex-1">
                                    {activePreset.items.map((item) => (
                                        <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all">
                                            <div>
                                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">{item.type}</p>
                                                <p className="text-lg font-medium">{item.name}</p>
                                            </div>
                                            <button
                                                onClick={() => handleSwap(item.id)}
                                                disabled={swappingItem === item.id}
                                                className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-[var(--card-bg)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shrink-0 disabled:opacity-50"
                                                title="다른 옷으로 변경"
                                            >
                                                <RefreshCw size={18} className={clsx(swappingItem === item.id && "animate-spin")} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-10 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button onClick={prevPreset} disabled={currentPresetIndex === 0} className="w-14 h-14 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button onClick={nextPreset} disabled={currentPresetIndex === PRESETS.length - 1} className="w-14 h-14 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                    <span className="text-neutral-400 font-mono text-sm tracking-widest">{currentPresetIndex + 1} / {PRESETS.length}</span>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </section>
            </main>

            {/* Bottom Floating CTA */}
            <AnimatePresence>
                {!isCommitted ? (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 w-full p-6 sm:p-10 pointer-events-none flex justify-center z-40"
                    >
                        <button
                            onClick={() => setIsCommitted(true)}
                            className="pointer-events-auto group px-12 py-5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xl font-bold shadow-[0_20px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.05)] hover:scale-[1.03] transition-all flex items-center gap-3"
                        >
                            오늘 이거 입기 <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[var(--card-bg)] p-10 py-14 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-[var(--card-border)]"
                        >
                            <div className="w-24 h-24 bg-[var(--foreground)] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--background)] shadow-xl">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mb-4">선택 완료!</h3>
                            <p className="text-neutral-500 font-medium mb-10 text-lg leading-relaxed">멋진 하루 보내세요.<br />해당 코디는 내일 추천에서 제외됩니다.</p>
                            <button
                                onClick={() => setIsCommitted(false)}
                                className="w-full px-6 py-5 bg-neutral-100 dark:bg-neutral-800 text-[var(--foreground)] rounded-full font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors mb-4"
                            >
                                코디 다시 고르기
                            </button>
                            <Link href="/" className="inline-block mt-2 text-sm text-neutral-400 font-semibold tracking-wider hover:text-[var(--foreground)] transition-colors uppercase">
                                홈으로 돌아가기
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Mocks
const TPOs = [
    { id: "work", label: "🏢 💼 출근/비즈니스" },
    { id: "date", label: "🍷 🥂 데이트" },
    { id: "casual", label: "☕ 🛹 힙/캐주얼" },
    { id: "formal", label: "👔 🎩 포멀/경조사" },
];

const PRESETS = [
    {
        id: "p1",
        name: "Minimal Chic",
        matchRate: 98,
        items: [
            { id: "i1", name: "블랙 오버핏 블레이저", type: "Outer" },
            { id: "i2", name: "화이트 베이직 티셔츠", type: "Top" },
            { id: "i3", name: "와이드 핏 울 슬랙스", type: "Bottom" },
            { id: "i4", name: "레더 더비 슈즈", type: "Shoes" },
        ]
    },
    {
        id: "p2",
        name: "City Boy Comfort",
        matchRate: 92,
        items: [
            { id: "i5", name: "네이비 윈드브레이커", type: "Outer" },
            { id: "i6", name: "블루 옥스포드 셔츠", type: "Top" },
            { id: "i7", name: "베이지 치노 팬츠", type: "Bottom" },
            { id: "i8", name: "캔버스 스니커즈", type: "Shoes" },
        ]
    },
    {
        id: "p3",
        name: "Effortless Denim",
        matchRate: 85,
        items: [
            { id: "i9", name: "(아우터 없음)", type: "Outer" },
            { id: "i10", name: "블랙 니트 카라티", type: "Top" },
            { id: "i11", name: "스트레이트 로우 데님", type: "Bottom" },
            { id: "i12", name: "스웨이드 로퍼", type: "Shoes" },
        ]
    }
];
