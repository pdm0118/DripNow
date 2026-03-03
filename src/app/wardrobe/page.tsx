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
            <header className="px-6 sm:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif italic tracking-tight mb-2 text-[var(--foreground)]">Wardrobe</h1>
                    <p className="text-neutral-500 font-light text-lg tracking-wide uppercase text-sm mt-4">완벽한 코디를 위한 당신만의 컬렉션 (총 {wardrobe.length}벌)</p>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:w-72">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[var(--foreground)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Find an item..."
                            className="w-full pl-14 pr-6 py-4 rounded-full bg-neutral-50 dark:bg-neutral-900/50 border border-transparent focus:bg-transparent focus:border-neutral-200 dark:focus:border-neutral-800 transition-all text-[var(--foreground)] placeholder:text-neutral-400 font-medium text-sm outline-none"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 sm:px-12">

                {/* Category Tabs - Elegant minimal design */}
                <div className="flex gap-6 mb-12 overflow-x-auto scrollbar-hide pb-2 border-b border-neutral-100 dark:border-neutral-900">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "pb-4 transition-all font-medium text-sm tracking-widest uppercase whitespace-nowrap relative",
                                activeTab === tab.id
                                    ? "text-[var(--foreground)]"
                                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--foreground)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">

                    {/* Items */}
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <div className="aspect-[3/4] bg-neutral-50 dark:bg-neutral-900/40 mb-5 overflow-hidden relative flex items-center justify-center transition-all group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800/60">
                                {/* Visual Placeholder */}
                                <div className="text-neutral-300 dark:text-neutral-700 p-8 text-center group-hover:scale-105 transition-transform duration-700 ease-out">
                                    <ImageIcon size={32} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-md font-medium truncate mb-1 text-[var(--foreground)] group-hover:opacity-70 transition-opacity">{item.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
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
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="mb-8">
                            <Sparkles size={32} strokeWidth={1} className="text-neutral-300 mx-auto" />
                        </div>
                        <h2 className="text-4xl font-serif italic mb-6">Your Collection is Empty</h2>
                        <p className="text-neutral-500 text-sm tracking-wide uppercase mb-12 max-w-sm mx-auto leading-relaxed">
                            Start building your digital wardrobe by adding your first piece.
                        </p>
                        <button
                            onClick={() => setIsAddMenuOpen(true)}
                            className="px-10 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-none text-sm font-bold tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-3"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                )}
            </main>

            {/* Floating Action Button (FAB) for adding clothes */}
            <div className="fixed bottom-28 right-6 sm:right-12 z-[45] flex flex-col items-end gap-4">
                <AnimatePresence>
                    {isAddMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[var(--background)] shadow-2xl border border-neutral-100 dark:border-neutral-900 p-2 flex flex-col gap-1 origin-bottom-right rounded-none mb-4"
                        >
                            <Link href="/wardrobe/add-url" className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
                                <span className="text-neutral-400 group-hover:text-[var(--foreground)] transition-colors">
                                    <Link2 size={18} strokeWidth={1.5} />
                                </span>
                                <span className="font-medium text-sm tracking-wide">Import via Link</span>
                            </Link>
                            <Link href="/wardrobe/add-photo" className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
                                <span className="text-neutral-400 group-hover:text-[var(--foreground)] transition-colors">
                                    <ImageIcon size={18} strokeWidth={1.5} />
                                </span>
                                <span className="font-medium text-sm tracking-wide">Analyze Photo</span>
                            </Link>
                            <Link href="/wardrobe/add-manual" className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group border-t border-neutral-100 dark:border-neutral-900 mt-1 pt-3">
                                <span className="text-neutral-400 group-hover:text-[var(--foreground)] transition-colors">
                                    <Type size={18} strokeWidth={1.5} />
                                </span>
                                <span className="font-medium text-sm tracking-wide">Manual Entry</span>
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
