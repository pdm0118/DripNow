"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Image as ImageIcon, Link2, Type, Shirt } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

export default function WardrobePage() {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [wardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);

    const TABS = [
        { id: "all", label: "전체" },
        { id: "outer", label: "아우터" },
        { id: "top", label: "상의" },
        { id: "bottom", label: "하의" },
        { id: "shoes", label: "신발" },
    ];

    const filteredItems = wardrobe.filter(item => {
        if (activeTab === "all") return true;
        if (activeTab === "shoes") return item.category === "shoes" || item.category === "accessory";
        return item.category === activeTab;
    });

    const categoryLabel = (cat: string) => {
        const map: Record<string, string> = { outer: "아우터", top: "상의", bottom: "하의", shoes: "신발", accessory: "악세사리" };
        return map[cat] || cat;
    };

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-xl pt-14 pb-3 px-5">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-[28px] font-bold tracking-tight mb-1">옷장</h1>
                    <p className="text-[13px] text-[var(--muted-foreground)]">총 {wardrobe.length}벌</p>
                </div>
            </header>

            {/* Category Tabs */}
            <div className="sticky top-[88px] z-10 bg-[var(--background)]/80 backdrop-blur-xl px-5 pb-3">
                <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx("px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all", activeTab === tab.id ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--card-bg)] text-[var(--muted-foreground)] active:bg-[var(--separator)]")}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-5 mt-4">
                {wardrobe.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-16 h-16 bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-5">
                            <Shirt size={28} className="text-[var(--muted-foreground)]" />
                        </div>
                        <h2 className="text-[20px] font-bold mb-2">아직 옷이 없어요</h2>
                        <p className="text-[15px] text-[var(--muted-foreground)] mb-8">옷을 등록해서 나만의 디지털 옷장을<br />만들어 보세요.</p>
                        <button onClick={() => setIsAddMenuOpen(true)} className="px-6 py-3 bg-[var(--accent)] text-white rounded-[14px] text-[16px] font-semibold active:opacity-80 transition-opacity flex items-center gap-2">
                            <Plus size={18} /> 옷 추가하기
                        </button>
                    </div>
                ) : (
                    /* Grid */
                    <div className="grid grid-cols-2 gap-3">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="bg-[var(--card-bg)] rounded-[16px] overflow-hidden active:scale-[0.98] transition-transform">
                                <div className="aspect-square bg-[var(--separator)] flex items-center justify-center">
                                    <ImageIcon size={28} className="text-[var(--muted-foreground)] opacity-40" />
                                </div>
                                <div className="p-3">
                                    <h3 className="text-[15px] font-semibold truncate mb-0.5">{item.name}</h3>
                                    <p className="text-[12px] text-[var(--muted-foreground)]">{categoryLabel(item.category)} · {item.color}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* FAB */}
            {wardrobe.length > 0 && (
                <button
                    onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                    className={clsx("fixed bottom-24 right-5 z-[45] w-14 h-14 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all", isAddMenuOpen && "rotate-45")}
                >
                    <Plus size={26} />
                </button>
            )}

            {/* Add Menu */}
            <AnimatePresence>
                {isAddMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddMenuOpen(false)} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed bottom-40 right-5 z-[46] bg-[var(--background)] border border-[var(--card-border)] rounded-[16px] shadow-2xl overflow-hidden min-w-[200px]"
                        >
                            <Link href="/wardrobe/add-url" className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--card-bg)] transition-colors">
                                <Link2 size={20} className="text-[var(--accent)]" />
                                <span className="text-[15px] font-medium">링크로 등록</span>
                            </Link>
                            <div className="h-px bg-[var(--separator)] mx-4" />
                            <Link href="/wardrobe/add-photo" className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--card-bg)] transition-colors">
                                <ImageIcon size={20} className="text-[var(--accent)]" />
                                <span className="text-[15px] font-medium">사진으로 등록</span>
                            </Link>
                            <div className="h-px bg-[var(--separator)] mx-4" />
                            <Link href="/wardrobe/add-manual" className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--card-bg)] transition-colors">
                                <Type size={20} className="text-[var(--accent)]" />
                                <span className="text-[15px] font-medium">직접 입력</span>
                            </Link>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
