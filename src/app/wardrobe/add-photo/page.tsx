"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Upload, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

export default function AddPhotoPage() {
    const router = useRouter();
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [isLoading, setIsLoading] = useState(false);

    // Photo state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI parsed resulting data
    const [aiData, setAiData] = useState<{ name: string, category: string, color: string, fit: string } | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Using URL.createObjectURL for local preview. 
            // In a real app, you would upload this to an S3 bucket or similar and use the returned URL.
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);

            // Simulate AI Parsing delay
            setIsLoading(true);
            setTimeout(() => {
                // Mock AI result based on image selection
                setAiData({
                    name: "디컨스트럭티드 블레이저 (AI 분석)",
                    category: "outer",
                    color: "Charcoal Muted",
                    fit: "오버핏"
                });
                setIsLoading(false);
            }, 1500);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setAiData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiData) return;

        setIsLoading(true);

        const newItem: ClothingItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            category: aiData.category as any,
            name: aiData.name,
            color: aiData.color,
            thickness: "normal",
            fit: aiData.fit,
            isWashing: false,
            createdAt: new Date().toISOString(),
            // imageUrl: selectedImage // Note: In a real app, save the remote URL, not the local object URL
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
                    <span className="font-bold tracking-widest uppercase text-sm">Add By Photo</span>
                    <div className="w-12" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 sm:px-12 pt-32">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-4">사진으로 등록</h1>
                    <p className="text-neutral-500 font-medium text-lg">옷 사진을 업로드하면 AI가 자동으로 정보를 분석합니다.</p>
                </div>

                <div className="flex flex-col gap-12">
                    {/* Image Upload Area */}
                    <section>
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />

                        <AnimatePresence mode="wait">
                            {!selectedImage ? (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl aspect-square sm:aspect-video flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group relative overflow-hidden"
                                >
                                    <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)] transition-all duration-300 absolute z-10 text-neutral-400">
                                        <Upload size={36} />
                                    </div>
                                    <div className="mt-24 z-10">
                                        <h3 className="text-xl font-bold mb-2">여기를 눌러 사진 선택</h3>
                                        <p className="text-neutral-500 font-medium">JPEG, PNG 형식 지원</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative rounded-3xl overflow-hidden aspect-square sm:aspect-video border border-[var(--card-border)] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={selectedImage} alt="Selected clothing" className="w-full h-full object-contain" />

                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* AI Processing / Results Area */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {isLoading ? (
                                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-10 rounded-3xl text-center space-y-6 shadow-sm">
                                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <Sparkles size={28} className="text-[var(--foreground)] animate-spin" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight">AI가 옷을 분석중입니다</h3>
                                        <p className="text-neutral-500">카테고리, 색상, 핏을 유추하고 있어요...</p>
                                    </div>
                                ) : aiData ? (
                                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-8 sm:p-10 rounded-3xl shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                <Sparkles size={20} className="text-[var(--foreground)]" />
                                            </div>
                                            <h3 className="text-xl font-bold">분석 완료</h3>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">유추된 아이템 이름</label>
                                                <input
                                                    type="text"
                                                    value={aiData.name}
                                                    onChange={(e) => setAiData({ ...aiData, name: e.target.value })}
                                                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] pb-2 transition-colors"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">카테고리</label>
                                                    <div className="font-semibold text-lg uppercase">{aiData.category}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">색상</label>
                                                    <div className="font-semibold text-lg">{aiData.color}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">핏</label>
                                                    <div className="font-semibold text-lg">{aiData.fit}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Submit Floating Area */}
                    <AnimatePresence>
                        {(selectedImage && aiData && !isLoading) && (
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
