"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Link as LinkIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

export default function AddUrlPage() {
    const router = useRouter();
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);

    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parsed resulting data
    const [scrapedData, setScrapedData] = useState<{ name: string, category: string, color: string, price?: number } | null>(null);

    const handleParse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            setError("유효한 URL을 입력해주세요.");
            return;
        }

        setError(null);
        setIsLoading(true);
        setScrapedData(null);

        // Simulate scraping and parsing delay
        setTimeout(() => {
            if (url.includes("musinsa") || url.includes("29cm")) {
                setScrapedData({
                    name: "썸머 릴렉스드 하프 셔츠 (스카이블루)",
                    category: "top",
                    color: "Sky Blue",
                    price: 49000
                });
            } else {
                setScrapedData({
                    name: "베이직 코튼 팬츠",
                    category: "bottom",
                    color: "Beige",
                });
            }
            setIsLoading(false);
        }, 2000);
    };

    const handleSubmit = () => {
        if (!scrapedData) return;

        setIsLoading(true);

        const newItem: ClothingItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            category: scrapedData.category as any,
            name: scrapedData.name,
            color: scrapedData.color,
            thickness: "normal",
            fit: "standard", // default fallback
            isWashing: false,
            createdAt: new Date().toISOString(),
        };

        setWardrobe([...wardrobe, newItem]);

        setTimeout(() => {
            setIsLoading(false);
            router.push("/wardrobe");
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans relative pb-32">

            {/* Minimal Header */}
            <header className="fixed top-0 left-0 w-full bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--card-border)] z-50">
                <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/wardrobe" className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <span className="font-bold tracking-widest uppercase text-sm">Add By Link</span>
                    <div className="w-12" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 sm:px-12 pt-32">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-4">링크로 등록</h1>
                    <p className="text-neutral-500 font-medium text-lg">쇼핑몰 상품 URL을 붙여넣으면 정보를 자동으로 가져옵니다.</p>
                </div>

                <div className="flex flex-col gap-10">
                    {/* URL Input Area */}
                    <form onSubmit={handleParse} className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400">
                            <LinkIcon size={24} />
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setError(null); }}
                            placeholder="https://store.musinsa.com/app/goods/..."
                            className={clsx(
                                "w-full pl-16 pr-32 py-6 rounded-[2rem] bg-[var(--card-bg)] border-2 transition-colors text-lg font-medium outline-none",
                                error
                                    ? "border-red-500/50 focus:border-red-500 text-red-500 placeholder:text-red-300"
                                    : "border-neutral-200 dark:border-neutral-800 focus:border-[var(--foreground)] placeholder:text-neutral-400 text-[var(--foreground)]"
                            )}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !url.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold hover:scale-[1.03] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            가져오기
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-500 font-medium px-4"
                        >
                            <AlertCircle size={18} /> {error}
                        </motion.div>
                    )}

                    {/* Loading State */}
                    <AnimatePresence>
                        {isLoading && !scrapedData && !error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] p-12 rounded-3xl text-center space-y-6 shadow-sm"
                            >
                                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles size={28} className="text-[var(--foreground)] animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-2">상품 정보를 불러오는 중입니다...</h3>
                                    <p className="text-neutral-500">이미지, 이름, 색상 등을 추출하고 있어요.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Result Area */}
                    <AnimatePresence>
                        {scrapedData && !isLoading && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] p-8 sm:p-10 rounded-3xl shadow-sm space-y-8"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <Sparkles size={20} className="text-[var(--foreground)]" />
                                    </div>
                                    <h3 className="text-xl font-bold">크롤링 완료</h3>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">상품명</label>
                                        <input
                                            type="text"
                                            value={scrapedData.name}
                                            onChange={(e) => setScrapedData({ ...scrapedData, name: e.target.value })}
                                            className="w-full text-2xl font-bold bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] pb-2 transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">분류된 카테고리</label>
                                            <div className="font-semibold text-lg uppercase">{scrapedData.category}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">추출된 색상</label>
                                            <div className="font-semibold text-lg">{scrapedData.color}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Submit Floating Area */}
                    <AnimatePresence>
                        {scrapedData && !isLoading && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="fixed bottom-0 left-0 w-full p-6 sm:p-10 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent flex justify-center z-40"
                            >
                                <button
                                    onClick={handleSubmit}
                                    className="px-12 py-5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xl font-bold shadow-[0_20px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.05)] hover:scale-[1.03] transition-all flex items-center gap-3"
                                >
                                    옷장에 저장하기 <Save size={24} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
