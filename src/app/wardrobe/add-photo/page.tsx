"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";
import PageHeader from "@/components/PageHeader";

export default function AddPhotoPage() {
    const router = useRouter();
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aiData, setAiData] = useState<{ name: string; category: string; color: string; fit: string } | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setIsLoading(true);
            setTimeout(() => {
                setAiData({ name: "디컨스트럭티드 블레이저 (AI 분석)", category: "outer", color: "차콜 그레이", fit: "오버핏" });
                setIsLoading(false);
            }, 1500);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); if (!aiData) return; setIsLoading(true);
        const newItem: ClothingItem = { id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, category: aiData.category as any, name: aiData.name, color: aiData.color, thickness: "normal", fit: aiData.fit, isWashing: false, createdAt: new Date().toISOString() };
        setWardrobe([...wardrobe, newItem]);
        setTimeout(() => { setIsLoading(false); router.push("/wardrobe"); }, 600);
    };

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <div className="flex justify-between items-center py-3.5 border-b border-[var(--separator)] last:border-0">
            <span className="text-[14px] text-[var(--muted-foreground)]">{label}</span>
            <span className="text-[15px] font-medium">{value}</span>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-32">
            <PageHeader title="사진 등록" backHref="/wardrobe" />

            <main className="px-[var(--space-page)] pt-5 flex flex-col gap-5">
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

                <AnimatePresence mode="wait">
                    {!selectedImage ? (
                        <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square native-card flex flex-col items-center justify-center text-center cursor-pointer active:bg-[var(--card-bg-elevated)] transition-colors"
                        >
                            <div className="w-14 h-14 bg-[var(--card-bg-elevated)] rounded-full flex items-center justify-center mb-4">
                                <Upload size={24} className="text-[var(--muted-foreground)]" />
                            </div>
                            <h3 className="text-[16px] font-semibold mb-1">사진 선택</h3>
                            <p className="text-[13px] text-[var(--muted-foreground)]">JPEG, PNG 형식 지원</p>
                        </motion.div>
                    ) : (
                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden bg-[var(--card-bg)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedImage} alt="선택된 사진" className="w-full h-full object-contain" />
                            <button onClick={() => { setSelectedImage(null); setAiData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-3 right-3 w-9 h-9 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center active:bg-black/60 transition-colors">
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedImage && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {isLoading ? (
                                <div className="native-card p-7 text-center">
                                    <Sparkles size={22} className="text-[var(--accent)] animate-spin mx-auto mb-3" />
                                    <h3 className="text-[16px] font-semibold mb-1">AI가 분석 중이에요</h3>
                                    <p className="text-[13px] text-[var(--muted-foreground)]">카테고리, 색상, 핏을 파악하고 있어요...</p>
                                </div>
                            ) : aiData ? (
                                <div className="native-card overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[var(--separator)] flex items-center gap-2">
                                        <Sparkles size={14} className="text-[var(--accent)]" />
                                        <span className="text-[14px] font-semibold">분석 완료</span>
                                    </div>
                                    <div className="px-5">
                                        <input type="text" value={aiData.name} onChange={(e) => setAiData({ ...aiData, name: e.target.value })} className="w-full py-4 text-[17px] font-bold bg-transparent outline-none border-b border-[var(--separator)]" />
                                        <InfoRow label="카테고리" value={aiData.category} />
                                        <InfoRow label="색상" value={aiData.color} />
                                        <InfoRow label="핏" value={aiData.fit} />
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedImage && aiData && !isLoading && (
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bottom-action-bar pb-safe">
                            <button onClick={handleSubmit} className="btn-primary">옷장에 저장</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
