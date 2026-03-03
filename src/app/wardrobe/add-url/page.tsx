"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";
import PageHeader from "@/components/PageHeader";

export default function AddUrlPage() {
    const router = useRouter();
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scrapedData, setScrapedData] = useState<{ name: string; brand?: string; category: string; color: string; material?: string; thickness?: string } | null>(null);

    const handleParse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
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
        <div className="flex justify-between items-center py-3.5 border-b border-[var(--separator)] last:border-0">
            <span className="text-[14px] text-[var(--muted-foreground)]">{label}</span>
            <span className="text-[15px] font-medium text-right max-w-[60%] truncate">{value}</span>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-32">
            <PageHeader title="링크 등록" backHref="/wardrobe" />

            <main className="px-[var(--space-page)] pt-5 flex flex-col gap-5">
                <form onSubmit={handleParse} className="flex flex-col gap-3">
                    <label className="section-label">쇼핑몰 URL</label>
                    <div className="relative">
                        <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] opacity-60" />
                        <input
                            type="url" value={url}
                            onChange={(e) => { setUrl(e.target.value); setError(null); }}
                            placeholder="https://store.musinsa.com/..."
                            disabled={isLoading}
                            className={clsx("native-input !pl-11", error && "!shadow-[0_0_0_3px_rgba(var(--destructive),0.2)]")}
                        />
                    </div>
                    <button type="submit" disabled={isLoading || !url.trim()} className="btn-primary flex items-center justify-center gap-2">
                        {isLoading && !scrapedData ? <><Sparkles size={16} className="animate-spin" /> 분석 중...</> : "정보 가져오기"}
                    </button>
                </form>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[var(--destructive)] text-[13px] font-medium px-1">
                        <AlertCircle size={14} /> {error}
                    </motion.div>
                )}

                <AnimatePresence>
                    {scrapedData && !isLoading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="native-card overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-[var(--separator)] flex items-center gap-2">
                                <Sparkles size={14} className="text-[var(--accent)]" />
                                <span className="text-[14px] font-semibold">분석 완료</span>
                            </div>
                            <div className="px-5">
                                <input type="text" value={scrapedData.name} onChange={(e) => setScrapedData({ ...scrapedData, name: e.target.value })} className="w-full py-4 text-[17px] font-bold bg-transparent outline-none border-b border-[var(--separator)]" />
                                <InfoRow label="카테고리" value={scrapedData.category} />
                                <InfoRow label="브랜드" value={scrapedData.brand || "미상"} />
                                <InfoRow label="색상" value={scrapedData.color} />
                                <InfoRow label="소재" value={scrapedData.material || "미상"} />
                                <InfoRow label="두께감" value={scrapedData.thickness || "보통"} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {scrapedData && !isLoading && (
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bottom-action-bar pb-safe">
                            <button onClick={handleSubmit} className="btn-primary max-w-[430px] mx-auto block">옷장에 저장</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
