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
            <header className="pt-12 pb-6 px-6 sm:px-12 max-w-5xl mx-auto flex items-end justify-between border-b border-neutral-100 dark:border-neutral-900 mb-8">
                <div>
                    <h1 className="text-4xl sm:text-6xl font-serif italic tracking-tight mb-2 text-[var(--foreground)]">Curation</h1>
                    <div className="flex items-center gap-2 text-neutral-400 font-medium text-xs tracking-widest uppercase">
                        <MapPin size={14} />
                        <span>Seoul, Gangnam</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-3 text-3xl font-light tracking-tight">
                        <CloudSun size={32} strokeWidth={1} className="text-[var(--foreground)]" />
                        22°
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium tracking-widest uppercase text-neutral-400 mt-2">
                        <span className="flex items-center gap-1"><Wind size={12} /> 3m/s</span>
                        <span className="flex items-center gap-1"><Droplets size={12} /> 10%</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 sm:px-12 pb-40">
                {/* TPO Selection */}
                <section className="mb-12">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-neutral-400">Occasion</p>
                    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
                        {TPOs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setTpo(t.id); }}
                                className={clsx(
                                    "pb-2 transition-all font-medium text-sm tracking-widest uppercase whitespace-nowrap relative",
                                    tpo === t.id
                                        ? "text-[var(--foreground)]"
                                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                )}
                            >
                                {t.label}
                                {tpo === t.id && (
                                    <motion.div
                                        layoutId="tpo-indicator"
                                        className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--foreground)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Outfit Presentation Area */}
                <section className="relative">
                    {wardrobe.length === 0 ? (
                        <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/20 p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                            <h2 className="text-3xl font-serif italic mb-4">Wardrobe Empty</h2>
                            <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm tracking-wide leading-relaxed uppercase">
                                완벽한 코디 추천을 위해 옷장에 옷을 먼저 등록해주세요.
                            </p>
                            <Link href="/wardrobe" className="px-10 py-4 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center gap-3">
                                <Plus size={16} /> 옷장으로 이동
                            </Link>
                        </div>
                    ) : activePreset ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePreset.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center"
                            >
                                {/* Avatar / Visual Placeholder container */}
                                <div className="w-full md:flex-1 aspect-[3/4] md:h-[700px] bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-center relative overflow-hidden group border border-neutral-100 dark:border-neutral-900">
                                    <span className="absolute top-6 right-6 font-mono text-xs tracking-widest uppercase z-10 text-neutral-400">
                                        Match {activePreset.matchRate}%
                                    </span>
                                    {/* Luxury Placeholder graphic */}
                                    <div className="w-32 h-64 sm:w-48 sm:h-96 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity bg-white dark:bg-black shadow-2xl">
                                        <p className="text-neutral-400 rotate-90 font-mono tracking-widest uppercase text-xs">Lookbook</p>
                                    </div>
                                </div>

                                {/* Preset Info & Item List */}
                                <div className="w-full md:flex-1 flex flex-col justify-center py-8">
                                    <h2 className="text-4xl sm:text-5xl font-serif italic mb-4 text-[var(--foreground)]">{activePreset.name}</h2>
                                    <p className="text-neutral-400 mb-12 font-medium text-xs tracking-[0.2em] uppercase">Today's Protocol</p>

                                    <div className="space-y-6 flex-1 mb-12">
                                        {activePreset.items.length > 0 ? activePreset.items.map((item) => (
                                            <div key={item.id} className="group flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 hover:border-[var(--foreground)] transition-colors">
                                                <div>
                                                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400 mb-2">{item.type}</p>
                                                    <p className="text-sm font-medium tracking-wide">{item.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSwap(item.id, item.rawCategory)}
                                                    disabled={swappingItem === item.id}
                                                    className="text-neutral-300 hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                                                    title="Swap Item"
                                                >
                                                    <RefreshCw size={18} strokeWidth={1.5} className={clsx(swappingItem === item.id && "animate-spin")} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="text-neutral-400 italic text-sm">Not enough items</div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-8">
                                        <div className="flex gap-6">
                                            <button onClick={prevPreset} disabled={currentPresetIndex === 0} className="text-neutral-400 hover:text-[var(--foreground)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                                <ChevronLeft size={16} /> Prev
                                            </button>
                                            <button onClick={nextPreset} disabled={currentPresetIndex === renderedPresets.length - 1} className="text-neutral-400 hover:text-[var(--foreground)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                                Next <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        <span className="text-neutral-300 font-mono text-xs tracking-widest">{currentPresetIndex + 1} / {renderedPresets.length}</span>
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
                            className="pointer-events-auto px-16 py-6 border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center gap-4 group"
                        >
                            Select Look <CheckCircle2 size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
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
    { id: "work", label: "Business" },
    { id: "date", label: "Date" },
    { id: "casual", label: "Casual" },
    { id: "formal", label: "Formal" },
];
