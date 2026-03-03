"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

export default function AddPhotoPage() {
    const router = useRouter();
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aiData, setAiData] = useState<{ name: string, category: string, color: string, fit: string } | null>(null);

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
        <div className="flex justify-between items-center py-3 border-b border-[var(--separator)] last:border-0">
            <span className="text-[14px] text-[var(--muted-foreground)]">{label}</span>
            <span className="text-[15px] font-medium">{value}</span>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] pb-32">
            <header className="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--separator)]">
                <div className="max-w-lg mx-auto px-5 h-[56px] flex items-center justify-between">
                    <Link href="/wardrobe" className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[var(--card-bg)]"><ArrowLeft size={22} /></Link>
                    <span className="text-[17px] font-semibold">사진 등록</span>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 pt-6 flex flex-col gap-6">
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

                <AnimatePresence mode="wait">
                    {!selectedImage ? (
                        <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square bg-[var(--card-bg)] rounded-[20px] flex flex-col items-center justify-center text-center cursor-pointer active:bg-[var(--separator)] transition-colors"
                        >
                            <div className="w-16 h-16 bg-[var(--separator)] rounded-full flex items-center justify-center mb-4">
                                <Upload size={28} className="text-[var(--muted-foreground)]" />
                            </div>
                            <h3 className="text-[17px] font-semibold mb-1">사진 선택</h3>
                            <p className="text-[14px] text-[var(--muted-foreground)]">JPEG, PNG 형식 지원</p>
                        </motion.div>
                    ) : (
                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-[20px] overflow-hidden bg-[var(--card-bg)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedImage} alt="선택된 사진" className="w-full h-full object-contain" />
                            <button onClick={() => { setSelectedImage(null); setAiData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center">
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Result */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                            {isLoading ? (
                                <div className="bg-[var(--card-bg)] rounded-[16px] p-8 text-center">
                                    <Sparkles size={24} className="text-[var(--accent)] animate-spin mx-auto mb-3" />
                                    <h3 className="text-[17px] font-semibold mb-1">AI가 분석 중이에요</h3>
                                    <p className="text-[14px] text-[var(--muted-foreground)]">카테고리, 색상, 핏을 파악하고 있어요...</p>
                                </div>
                            ) : aiData ? (
                                <div className="bg-[var(--card-bg)] rounded-[16px] overflow-hidden">
                                    <div className="px-5 py-4 border-b border-[var(--separator)] flex items-center gap-2">
                                        <Sparkles size={16} className="text-[var(--accent)]" />
                                        <span className="text-[15px] font-semibold">분석 완료</span>
                                    </div>
                                    <div className="px-5">
                                        <input type="text" value={aiData.name} onChange={(e) => setAiData({ ...aiData, name: e.target.value })} className="w-full py-4 text-[18px] font-bold bg-transparent outline-none border-b border-[var(--separator)]" />
                                        <InfoRow label="카테고리" value={aiData.category} />
                                        <InfoRow label="색상" value={aiData.color} />
                                        <InfoRow label="핏" value={aiData.fit} />
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <AnimatePresence>
                    {(selectedImage && aiData && !isLoading) && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 w-full p-5 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--separator)] z-40 flex justify-center">
                            <button onClick={handleSubmit} className="max-w-lg w-full py-[15px] bg-[var(--accent)] text-white rounded-[14px] text-[17px] font-semibold active:opacity-80 transition-opacity">옷장에 저장</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
