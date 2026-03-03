"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";
import PageHeader from "@/components/PageHeader";

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

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-32">
            <PageHeader title="아이템 추가" backHref="/wardrobe" />

            <main className="px-[var(--space-page)] pt-5">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Name + AI */}
                    <div>
                        <label className="section-label mb-2 block">아이템 이름</label>
                        <input
                            type="text" value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="예) 넌블랭크 발마칸코트" className="native-input"
                        />
                        <div className="mt-3 flex items-center gap-2">
                            <button
                                type="button" onClick={handleSearchProduct}
                                disabled={isSearchingAI || !formData.name.trim()}
                                className="pill pill-active !py-2 !px-3.5 text-[13px] flex items-center gap-1.5 disabled:opacity-40"
                            >
                                <Sparkles size={13} className={isSearchingAI ? "animate-spin" : ""} /> AI 자동완성
                            </button>
                            {aiError && <span className="text-[12px] text-[var(--destructive)] font-medium">{aiError}</span>}
                        </div>
                    </div>

                    {/* Category & Color */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <label className="section-label mb-2 block">카테고리</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="native-input appearance-none">
                                <option value="" disabled>선택</option>
                                <option value="outer">아우터</option>
                                <option value="top">상의</option>
                                <option value="bottom">하의</option>
                                <option value="shoes">신발</option>
                                <option value="acc">악세사리</option>
                            </select>
                        </div>
                        <div>
                            <label className="section-label mb-2 block">색상</label>
                            <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="예) 블랙" className="native-input" />
                        </div>
                    </div>

                    {/* Season */}
                    <div>
                        <label className="section-label mb-3 block">착용 계절</label>
                        <div className="flex flex-wrap gap-2">
                            {["봄", "여름", "가을", "겨울", "사계절"].map(s => (
                                <button key={s} type="button" onClick={() => toggleSeason(s)} className={clsx("pill", formData.season.includes(s) && "pill-active")}>{s}</button>
                            ))}
                        </div>
                    </div>

                    {/* Fit */}
                    <div>
                        <label className="section-label mb-3 block">핏</label>
                        <div className="flex flex-wrap gap-2">
                            {["오버핏", "스탠다드", "와이드", "슬림핏", "크롭"].map(f => (
                                <button key={f} type="button" onClick={() => setFormData({ ...formData, fit: f })} className={clsx("pill", formData.fit === f && "pill-active")}>{f}</button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="bottom-action-bar pb-safe">
                        <button type="submit" disabled={!isValid || isLoading} className="btn-primary flex items-center justify-center gap-2">
                            {isLoading ? "저장 중..." : "옷장에 저장"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
