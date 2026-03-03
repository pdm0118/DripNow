"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Link as LinkIcon, AlertCircle } from "lucide-react";
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
    const [scrapedData, setScrapedData] = useState<{ name: string, brand?: string, category: string, color: string, material?: string, thickness?: string } | null>(null);

    const handleParse = async (e: React.FormEvent) => {
        e.preventDefault(); if (!url.trim()) return;
        try { new URL(url); } catch { setError("유효한 URL을 입력해주세요."); return; }
        setError(null); setIsLoading(true); setScrapedData(null);
        try {
            const res = await fetch("/api/parse-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "분석 실패");
            setScrapedData({ name: data.name || "알 수 없음", brand: data.brand || "미상", category: data.category || "top", color: data.color || "미지정", material: data.material || "미상", thickness: data.thickness || "normal" });
        } catch (err: any) { setError(err.message || "오류 발생"); } finally { setIsLoading(false); }
    };

    const handleSubmit = () => {
        if (!scrapedData) return; setIsLoading(true);
        const newItem: ClothingItem = { id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, category: scrapedData.category as any, name: scrapedData.name, color: scrapedData.color, thickness: (["thin", "normal", "thick"].includes(scrapedData.thickness as string) ? scrapedData.thickness : "normal") as "thin" | "normal" | "thick", fit: "standard", isWashing: false, createdAt: new Date().toISOString() };
        setWardrobe([...wardrobe, newItem]);
        setTimeout(() => { setIsLoading(false); router.push("/wardrobe"); }, 600);
    };

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <div className="flex justify-between items-center py-3 border-b border-[var(--separator)] last:border-0">
            <span className="text-[14px] text-[var(--muted-foreground)]">{label}</span>
            <span className="text-[15px] font-medium text-right max-w-[60%] truncate">{value}</span>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-32">
            <header className="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--separator)]">
                <div className="max-w-lg mx-auto px-5 h-[56px] flex items-center justify-between">
                    <Link href="/wardrobe" className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[var(--card-bg)]"><ArrowLeft size={22} /></Link>
                    <span className="text-[17px] font-semibold">링크 등록</span>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 pt-6 flex flex-col gap-6">
                {/* URL Input */}
                <form onSubmit={handleParse} className="flex flex-col gap-3">
                    <label className="text-[13px] font-semibold text-[var(--muted-foreground)]">쇼핑몰 URL</label>
                    <div className="relative">
                        <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input type="url" value={url} onChange={(e) => { setUrl(e.target.value); setError(null); }} placeholder="https://store.musinsa.com/..." disabled={isLoading} className={clsx("w-full pl-12 pr-4 py-[14px] bg-[var(--card-bg)] rounded-[12px] text-[16px] font-medium placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 transition-all", error ? "ring-2 ring-[var(--destructive)]/50" : "focus:ring-[var(--accent)]/30")} />
                    </div>
                    <button type="submit" disabled={isLoading || !url.trim()} className="w-full py-[15px] bg-[var(--accent)] text-white rounded-[14px] text-[17px] font-semibold active:opacity-80 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
                        {isLoading && !scrapedData ? <><Sparkles size={18} className="animate-spin" /> 분석 중...</> : "정보 가져오기"}
                    </button>
                </form>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[var(--destructive)] text-[14px] font-medium px-1">
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}

                {/* Result */}
                <AnimatePresence>
                    {scrapedData && !isLoading && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card-bg)] rounded-[16px] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[var(--separator)] flex items-center gap-2">
                                <Sparkles size={16} className="text-[var(--accent)]" />
                                <span className="text-[15px] font-semibold">분석 완료</span>
                            </div>
                            <div className="px-5">
                                <input type="text" value={scrapedData.name} onChange={(e) => setScrapedData({ ...scrapedData, name: e.target.value })} className="w-full py-4 text-[18px] font-bold bg-transparent outline-none border-b border-[var(--separator)]" />
                                <InfoRow label="카테고리" value={scrapedData.category} />
                                <InfoRow label="브랜드" value={scrapedData.brand || "미상"} />
                                <InfoRow label="색상" value={scrapedData.color} />
                                <InfoRow label="소재" value={scrapedData.material || "미상"} />
                                <InfoRow label="두께감" value={scrapedData.thickness || "보통"} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <AnimatePresence>
                    {scrapedData && !isLoading && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 w-full p-5 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--separator)] z-40 flex justify-center">
                            <button onClick={handleSubmit} className="max-w-lg w-full py-[15px] bg-[var(--accent)] text-white rounded-[14px] text-[17px] font-semibold active:opacity-80 transition-opacity">옷장에 저장</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
