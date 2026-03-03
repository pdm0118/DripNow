"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Settings2, Image as ImageIcon, Link2, Type, Sparkles } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

export default function WardrobePage() {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [wardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);

    const TABS = [
        { id: "all", label: "All Items" },
        { id: "outer", label: "Outerwear" },
        { id: "top", label: "Tops" },
        { id: "bottom", label: "Bottoms" },
        { id: "shoes", label: "Shoes/Acc" },
    ];

    // Filter logic
    const filteredItems = wardrobe.filter(item => {
        if (activeTab === "all") return true;
        if (activeTab === "shoes") return item.category === "shoes" || item.category === "accessory";
        return item.category === activeTab;
    });

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans relative overflow-x-hidden pt-12 pb-32">

            {/* Header */}
            <header className="px-6 sm:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-2 text-[var(--foreground)]">내 옷장</h1>
                    <p className="text-neutral-500 font-medium text-lg">완벽한 코디를 위한 당신만의 컬렉션 (총 {wardrobe.length}벌)</p>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:w-64">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[var(--foreground)] transition-colors" />
                        <input
                            type="text"
                            placeholder="아이템 검색..."
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] focus:outline-none focus:border-[var(--foreground)] transition-colors text-[var(--foreground)] placeholder:text-neutral-400 font-medium"
                        />
                    </div>
                    <button className="w-14 h-14 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shrink-0">
                        <Settings2 size={24} className="text-[var(--foreground)]" />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 sm:px-12">

                {/* Category Tabs */}
                <div className="flex gap-2 mb-10 overflow-x-auto scrollbar-hide pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "px-6 py-3 rounded-full border transition-all font-semibold tracking-wide whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-lg"
                                    : "bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-[var(--foreground)] hover:border-neutral-400"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">

                    {/* Items */}
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <div className="aspect-[3/4] rounded-3xl bg-neutral-100 dark:bg-neutral-900 mb-4 overflow-hidden relative border border-[var(--card-border)] group-hover:border-neutral-300 dark:group-hover:border-neutral-700 transition-colors flex items-center justify-center">
                                {/* Visual Placeholder */}
                                <div className="text-neutral-300 dark:text-neutral-700 p-8 text-center group-hover:scale-105 transition-transform duration-500">
                                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs font-mono uppercase tracking-widest opacity-50">No Image</p>
                                </div>

                                {/* Hover Overlay Actions */}
                                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold truncate mb-1 text-[var(--foreground)] group-hover:text-black dark:group-hover:text-white transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span>{item.color}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Add First Item Prompt (Visible if no items) */}
                {wardrobe.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                            <Sparkles size={40} className="text-neutral-400" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-4">옷장이 아직 비어있네요</h2>
                        <p className="text-neutral-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">자주 입는 옷부터 하나씩 등록해보세요. DripNow가 찰떡같은 코디를 제안해드립니다.</p>
                        <button
                            onClick={() => setIsAddMenuOpen(true)}
                            className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full text-lg font-bold shadow-xl hover:scale-[1.03] transition-transform flex items-center gap-2"
                        >
                            <Plus size={24} /> 첫 번째 옷 등록하기
                        </button>
                    </div>
                )}
            </main>

            {/* Floating Action Button (FAB) for adding clothes */}
            <div className="fixed bottom-10 right-6 sm:right-12 z-50 flex flex-col items-end gap-4">
                <AnimatePresence>
                    {isAddMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-3 shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.05)] flex flex-col gap-2 origin-bottom-right"
                        >
                            <Link href="/wardrobe/add-url" className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors font-semibold group">
                                <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Link2 size={20} />
                                </span>
                                쇼핑몰 링크로 자동 등록
                            </Link>
                            <Link href="/wardrobe/add-photo" className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors font-semibold group">
                                <span className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ImageIcon size={20} />
                                </span>
                                사진 찍어 AI가 분류하기
                            </Link>
                            <Link href="/wardrobe/add-manual" className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors font-semibold group border-t border-[var(--card-border)] mt-2 pt-4">
                                <span className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Type size={20} />
                                </span>
                                텍스트로 직접 입력
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                    className={clsx(
                        "w-20 h-20 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-[0_10px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_10px_30px_rgb(255,255,255,0.1)] transition-transform duration-300 hover:scale-105",
                        isAddMenuOpen && "rotate-45"
                    )}
                >
                    <Plus size={36} />
                </button>
            </div>
            {/* Backdrop for FAB Menu */}
            <AnimatePresence>
                {isAddMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
