"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, Link2, Type, Shirt } from "lucide-react";
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
            <header className="page-header pt-14 pb-1 px-[var(--space-page)]">
                <div className="flex items-baseline justify-between">
                    <h1 className="text-[var(--text-2xl)] font-bold tracking-tight" style={{ fontSize: "var(--text-2xl)" }}>옷장</h1>
                    <span className="text-[var(--text-sm)] text-[var(--muted-foreground)] font-medium" style={{ fontSize: "var(--text-sm)" }}>
                        {wardrobe.length}벌
                    </span>
                </div>
            </header>

            {/* Category Tabs */}
            <div className="page-header top-[56px] px-[var(--space-page)] py-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "pill transition-all",
                                activeTab === tab.id && "pill-active"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-[var(--space-page)] mt-3">
                {wardrobe.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-5">
                            <Shirt size={26} className="text-[var(--muted-foreground)]" />
                        </div>
                        <h2 className="text-[var(--text-lg)] font-bold mb-2" style={{ fontSize: "var(--text-lg)" }}>아직 옷이 없어요</h2>
                        <p className="text-[var(--text-base)] text-[var(--muted-foreground)] mb-8 leading-relaxed" style={{ fontSize: "var(--text-base)" }}>
                            옷을 등록해서 나만의<br />디지털 옷장을 만들어 보세요.
                        </p>
                        <button onClick={() => setIsAddMenuOpen(true)} className="btn-primary !w-auto px-6 flex items-center gap-2">
                            <Plus size={18} /> 옷 추가하기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="native-card overflow-hidden active:scale-[0.97] transition-transform cursor-pointer"
                            >
                                <div className="aspect-[4/3] bg-[var(--card-bg-elevated)] flex items-center justify-center">
                                    {item.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.imageUrl} alt={item.name || ""} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} className="text-[var(--muted-foreground)] opacity-30" />
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="text-[14px] font-semibold truncate mb-0.5">{item.name}</h3>
                                    <p className="text-[12px] text-[var(--muted-foreground)]">{categoryLabel(item.category)}{item.color ? ` · ${item.color}` : ""}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* FAB */}
            {wardrobe.length > 0 && (
                <button
                    onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                    className={clsx(
                        "fixed bottom-24 right-5 z-[45] w-[52px] h-[52px] rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all duration-200",
                        isAddMenuOpen && "rotate-45"
                    )}
                >
                    <Plus size={24} strokeWidth={2.2} />
                </button>
            )}

            {/* Add Menu */}
            <AnimatePresence>
                {isAddMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddMenuOpen(false)} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed bottom-[140px] right-5 z-[46] bg-[var(--background)] border border-[var(--card-border)] rounded-[var(--radius-md)] shadow-xl overflow-hidden min-w-[180px]"
                        >
                            {[
                                { href: "/wardrobe/add-url", icon: Link2, label: "링크로 등록" },
                                { href: "/wardrobe/add-photo", icon: ImageIcon, label: "사진으로 등록" },
                                { href: "/wardrobe/add-manual", icon: Type, label: "직접 입력" },
                            ].map((item, i) => (
                                <div key={item.href}>
                                    {i > 0 && <div className="h-px bg-[var(--separator)] mx-4" />}
                                    <Link href={item.href} className="flex items-center gap-3 px-4 py-3.5 active:bg-[var(--card-bg)] transition-colors">
                                        <item.icon size={18} className="text-[var(--accent)]" />
                                        <span className="text-[15px] font-medium">{item.label}</span>
                                    </Link>
                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
