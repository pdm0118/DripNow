"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

export default function AddManualPage() {
    const router = useRouter();
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", category: "", season: [] as string[], color: "", fit: "" });
    const isValid = formData.name.trim().length > 0 && formData.category !== "";
    const [isSearchingAI, setIsSearchingAI] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleSearchProduct = async () => {
        if (!formData.name.trim()) return;
        setIsSearchingAI(true); setAiError(null);
        try {
            const res = await fetch("/api/search-product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: `${formData.name} ${formData.color}`.trim() }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "검색 실패");
            let autoSeason = ["사계절"];
            if (data.thickness === "heavy" || data.thickness === "thick") autoSeason = ["겨울", "가을"];
            if (data.thickness === "thin") autoSeason = ["여름", "봄"];
            setFormData(prev => ({ ...prev, name: data.name || prev.name, category: data.category || prev.category, color: data.color || prev.color, season: autoSeason }));
        } catch (err: any) { setAiError(err.message || "AI 검색 실패"); } finally { setIsSearchingAI(false); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); if (!isValid) return; setIsLoading(true);
        const newItem: ClothingItem = { id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, category: formData.category as any, name: formData.name.trim(), color: formData.color.trim() || "미지정", thickness: "normal", fit: formData.fit || "standard", isWashing: false, createdAt: new Date().toISOString() };
        setWardrobe([...wardrobe, newItem]);
        setTimeout(() => { setIsLoading(false); router.push("/wardrobe"); }, 600);
    };

    const toggleSeason = (s: string) => {
        if (formData.season.includes(s)) setFormData({ ...formData, season: formData.season.filter(x => x !== s) });
        else setFormData({ ...formData, season: [...formData.season, s] });
    };

    const inputCls = "w-full px-4 py-[14px] bg-[var(--card-bg)] rounded-[12px] text-[17px] font-medium placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all";

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--separator)]">
                <div className="max-w-lg mx-auto px-5 h-[56px] flex items-center justify-between">
                    <Link href="/wardrobe" className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[var(--card-bg)]"><ArrowLeft size={22} /></Link>
                    <span className="text-[17px] font-semibold">아이템 추가</span>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 pt-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Name */}
                    <div>
                        <label className="text-[13px] font-semibold text-[var(--muted-foreground)] mb-2 block">아이템 이름</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="예) 넌블랭크 발마칸코트" className={inputCls} />
                        <div className="mt-3 flex items-center gap-2">
                            <button type="button" onClick={handleSearchProduct} disabled={isSearchingAI || !formData.name.trim()} className="px-4 py-2.5 bg-[var(--accent)] text-white rounded-full text-[13px] font-semibold flex items-center gap-1.5 active:opacity-80 transition-opacity disabled:opacity-40">
                                <Sparkles size={14} className={isSearchingAI ? "animate-spin" : ""} /> AI 자동완성
                            </button>
                            {aiError && <span className="text-[12px] text-[var(--destructive)] font-medium">{aiError}</span>}
                        </div>
                    </div>

                    {/* Category & Color */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[13px] font-semibold text-[var(--muted-foreground)] mb-2 block">카테고리</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className={clsx(inputCls, "appearance-none")}>
                                <option value="" disabled>선택</option>
                                <option value="outer">아우터</option>
                                <option value="top">상의</option>
                                <option value="bottom">하의</option>
                                <option value="shoes">신발</option>
                                <option value="acc">악세사리</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[13px] font-semibold text-[var(--muted-foreground)] mb-2 block">색상</label>
                            <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="예) 블랙" className={inputCls} />
                        </div>
                    </div>

                    {/* Season */}
                    <div>
                        <label className="text-[13px] font-semibold text-[var(--muted-foreground)] mb-3 block">착용 계절</label>
                        <div className="flex flex-wrap gap-2">
                            {["봄", "여름", "가을", "겨울", "사계절"].map(s => (
                                <button key={s} type="button" onClick={() => toggleSeason(s)} className={clsx("px-4 py-2.5 rounded-full text-[14px] font-semibold transition-all", formData.season.includes(s) ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] text-[var(--foreground)] active:bg-[var(--separator)]")}>{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* Fit */}
                    <div>
                        <label className="text-[13px] font-semibold text-[var(--muted-foreground)] mb-3 block">핏</label>
                        <div className="flex flex-wrap gap-2">
                            {["오버핏", "스탠다드", "와이드", "슬림핏", "크롭"].map(f => (
                                <button key={f} type="button" onClick={() => setFormData({ ...formData, fit: f })} className={clsx("px-4 py-2.5 rounded-full text-[14px] font-semibold transition-all", formData.fit === f ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] text-[var(--foreground)] active:bg-[var(--separator)]")}>{f}</button>
                            ))}
                        </div>
                    </div>

                    {/* Fixed Submit */}
                    <div className="fixed bottom-0 left-0 w-full p-5 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--separator)] z-40 flex justify-center">
                        <button type="submit" disabled={!isValid || isLoading} className={clsx("max-w-lg w-full py-[15px] rounded-[14px] text-[17px] font-semibold transition-all flex items-center justify-center gap-2", isValid ? "bg-[var(--accent)] text-white active:opacity-80" : "bg-[var(--card-bg)] text-[var(--muted-foreground)]")}>
                            {isLoading ? "저장 중..." : "옷장에 저장"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
