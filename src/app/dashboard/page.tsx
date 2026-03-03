"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CloudSun, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Wind, Droplets, Plus } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

// Helper to pick random item from array
const pickRandom = (arr: ClothingItem[]) => arr[Math.floor(Math.random() * arr.length)];

export default function DashboardPage() {
    const [tpo, setTpo] = useState("work");
    const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
    const [swappingItem, setSwappingItem] = useState<string | null>(null);
    const [isCommitted, setIsCommitted] = useState(false);

    // Fetch user's wardrobe
    const [wardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);

    // Categorize wardrobe
    const categorizedWardrobe = useMemo(() => {
        return {
            outer: wardrobe.filter(i => i.category === "outer" && !i.isWashing),
            top: wardrobe.filter(i => i.category === "top" && !i.isWashing),
            bottom: wardrobe.filter(i => i.category === "bottom" && !i.isWashing),
            shoes: wardrobe.filter(i => (i.category === "shoes" || i.category === "accessory") && !i.isWashing),
        };
    }, [wardrobe]);

    // Generate dynamic presets based on user's actual clothes
    const dynamicPresets = useMemo(() => {
        if (wardrobe.length === 0) return []; // Handled in UI render

        // Let's generate 3 fake presets by randomly picking available clothes
        // In a real app, this would be an AI engine picking based on TPO, Weather, and Style
        const generatePreset = (id: string, name: string) => {
            const hasOuter = categorizedWardrobe.outer.length > 0 && Math.random() > 0.3; // 70% chance of outer
            const outer = hasOuter ? pickRandom(categorizedWardrobe.outer) : null;
            const top = categorizedWardrobe.top.length > 0 ? pickRandom(categorizedWardrobe.top) : null;
            const bottom = categorizedWardrobe.bottom.length > 0 ? pickRandom(categorizedWardrobe.bottom) : null;
            const shoes = categorizedWardrobe.shoes.length > 0 ? pickRandom(categorizedWardrobe.shoes) : null;

            const items = [];
            if (outer) items.push({ id: outer.id, name: outer.name || "아우터", type: "Outer", rawCategory: "outer" });
            if (top) items.push({ id: top.id, name: top.name || "상의", type: "Top", rawCategory: "top" });
            if (bottom) items.push({ id: bottom.id, name: bottom.name || "하의", type: "Bottom", rawCategory: "bottom" });
            if (shoes) items.push({ id: shoes.id, name: shoes.name || "신발", type: "Shoes", rawCategory: "shoes" });

            return {
                id,
                name,
                matchRate: Math.floor(Math.random() * 20) + 80, // 80~99%
                items
            };
        };

        return [
            generatePreset("p1", "Today's Best Pick"),
            generatePreset("p2", "Alternative Vibe"),
            generatePreset("p3", "Comfort Focus")
        ];
    }, [categorizedWardrobe, tpo]);

    // UI state for the currently playing presets
    const [renderedPresets, setRenderedPresets] = useState(dynamicPresets);

    // Update rendered presets when dynamic ones change (e.g., TPO change or wardrobe update)
    useEffect(() => {
        setRenderedPresets(dynamicPresets);
        setCurrentPresetIndex(0);
    }, [dynamicPresets]);

    const activePreset = renderedPresets[currentPresetIndex];

    const nextPreset = () => {
        if (currentPresetIndex < renderedPresets.length - 1) setCurrentPresetIndex(c => c + 1);
    };

    const prevPreset = () => {
        if (currentPresetIndex > 0) setCurrentPresetIndex(c => c - 1);
    };

    const handleSwap = (itemId: string, category: string) => {
        setSwappingItem(itemId);

        setTimeout(() => {
            // Find another random item from the same category
            const categoryItems = categorizedWardrobe[category as keyof typeof categorizedWardrobe];
            // Filter out the currently selected item
            const availableToSwap = categoryItems.filter(i => i.id !== itemId);

            if (availableToSwap.length > 0) {
                const newItem = pickRandom(availableToSwap);

                // Update the current preset in state
                const updatedPresets = [...renderedPresets];
                const currentItems = [...updatedPresets[currentPresetIndex].items];
                const itemIndex = currentItems.findIndex(i => i.id === itemId);

                if (itemIndex !== -1) {
                    currentItems[itemIndex] = {
                        id: newItem.id,
                        name: newItem.name || "새 아이템",
                        type: currentItems[itemIndex].type,
                        rawCategory: category
                    };
                    updatedPresets[currentPresetIndex].items = currentItems;
                    setRenderedPresets(updatedPresets);
                }
            } else {
                // Feature improvement: Show a toast saying "No other items to swap with!"
                alert("옷장에 이 카테고리의 다른 옷이 없습니다.");
            }

            setSwappingItem(null);
        }, 600);
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
                                onClick={() => { setTpo(t.id); }}
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
                    {wardrobe.length === 0 ? (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[500px]">
                            <h2 className="text-3xl font-bold mb-4">옷장이 비어있습니다</h2>
                            <p className="text-neutral-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                                완벽한 코디 추천을 위해 옷장에 보유하고 있는 옷을 먼저 등록해주세요.
                            </p>
                            <Link href="/wardrobe" className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full text-lg font-bold hover:scale-[1.02] transition-transform shadow-xl flex items-center gap-2">
                                <Plus size={24} /> 옷장으로 이동하기
                            </Link>
                        </div>
                    ) : activePreset ? (
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
                                    <span className="absolute top-6 right-6 bg-black/5 dark:bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold tracking-wider z-10 shadow-sm">
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
                                        {activePreset.items.length > 0 ? activePreset.items.map((item) => (
                                            <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all">
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">{item.type}</p>
                                                    <p className="text-lg font-medium">{item.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSwap(item.id, item.rawCategory)}
                                                    disabled={swappingItem === item.id}
                                                    className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-[var(--card-bg)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shrink-0 disabled:opacity-50"
                                                    title="다른 옷으로 변경 (세탁중 버튼 대용)"
                                                >
                                                    <RefreshCw size={18} className={clsx(swappingItem === item.id && "animate-spin")} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-neutral-500 italic">추천할 수 있는 옷의 조합이 부족합니다.</div>
                                        )}
                                    </div>

                                    <div className="pt-10 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button onClick={prevPreset} disabled={currentPresetIndex === 0} className="w-14 h-14 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button onClick={nextPreset} disabled={currentPresetIndex === renderedPresets.length - 1} className="w-14 h-14 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                        <span className="text-neutral-400 font-mono text-sm tracking-widest">{currentPresetIndex + 1} / {renderedPresets.length}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-12 text-center shadow-sm">
                            <h2 className="text-2xl font-bold mb-4">현재 조합할 수 있는 코디가 없습니다</h2>
                            <p className="text-neutral-500">카테고리별로 옷을 더 추가해보세요.</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Bottom Floating CTA */}
            <AnimatePresence>
                {(!isCommitted && wardrobe.length > 0 && activePreset && activePreset.items.length > 0) ? (
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
                ) : isCommitted ? (
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
                ) : null}
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
