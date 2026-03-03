"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function AddManualPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        season: [] as string[],
        color: "",
        fit: ""
    });

    const isValid = formData.name.length > 0 && formData.category !== "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setIsLoading(true);
        // Fake saving delay
        setTimeout(() => {
            setIsLoading(false);
            router.push("/wardrobe");
        }, 1200);
    };

    const toggleSeason = (s: string) => {
        if (formData.season.includes(s)) {
            setFormData({ ...formData, season: formData.season.filter(x => x !== s) });
        } else {
            setFormData({ ...formData, season: [...formData.season, s] });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans relative pb-32">

            {/* Minimal Header */}
            <header className="fixed top-0 left-0 w-full bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--card-border)] z-50">
                <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/wardrobe" className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <span className="font-bold tracking-widest uppercase text-sm">Add Item</span>
                    <div className="w-12" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 sm:px-12 pt-32">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-4">옷장에 새 아이템 추가</h1>
                    <p className="text-neutral-500 font-medium text-lg">기본 정보를 입력하면 DripNow가 찰떡같이 코디해 드립니다.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-12">

                    {/* Basic Info */}
                    <section className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-4">아이템 이름 (Name)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="예) 아크네 스튜디오 오버핏 블레이저"
                                className="w-full text-2xl sm:text-3xl pb-4 bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700 font-bold"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-4">카테고리 (Category)</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full text-xl pb-4 bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors font-medium appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled className="text-neutral-400">선택해주세요</option>
                                    <option value="outer">Outer (아우터)</option>
                                    <option value="top">Top (상의)</option>
                                    <option value="bottom">Bottom (하의)</option>
                                    <option value="shoes">Shoes (신발)</option>
                                    <option value="acc">Accessory (악세사리)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-4">주요 색상 (Color)</label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="예) Black, 차콜"
                                    className="w-full text-xl pb-4 bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700 font-medium"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Tags / Pills Selection */}
                    <section className="space-y-10 pt-8 border-t border-[var(--card-border)]">
                        <div>
                            <label className="block text-sm font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-6">착용 계절 (Season)</label>
                            <div className="flex flex-wrap gap-4">
                                {["봄", "여름", "가을", "겨울", "사계절"].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => toggleSeason(s)}
                                        className={clsx(
                                            "px-6 py-3 rounded-full border transition-all font-semibold",
                                            formData.season.includes(s)
                                                ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-lg"
                                                : "bg-transparent border-neutral-200 dark:border-neutral-800 text-[var(--foreground)] hover:border-neutral-400"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-6">핏 (Fit)</label>
                            <div className="flex flex-wrap gap-4">
                                {["오버핏", "스탠다드", "와이드", "슬림핏", "크롭"].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, fit: f })}
                                        className={clsx(
                                            "px-6 py-3 rounded-full border transition-all font-semibold",
                                            formData.fit === f
                                                ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-lg"
                                                : "bg-transparent border-neutral-200 dark:border-neutral-800 text-[var(--foreground)] hover:border-neutral-400"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Image Upload Area (Optional for manual) */}
                    <section className="pt-8 border-t border-[var(--card-border)]">
                        <label className="block text-sm font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-6">사진 (선택)</label>
                        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group">
                            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">사진 업로드</h3>
                            <p className="text-neutral-500 font-medium">JPEG, PNG (최대 5MB)</p>
                        </div>
                    </section>

                    {/* Submit Floating Area */}
                    <div className="fixed bottom-0 left-0 w-full p-6 sm:p-10 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent flex justify-center z-40 pointer-events-none">
                        <button
                            type="submit"
                            disabled={!isValid || isLoading}
                            className={clsx(
                                "pointer-events-auto group px-12 py-5 rounded-full text-xl font-bold shadow-[0_20px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.05)] transition-all flex items-center gap-3",
                                isValid ? "bg-[var(--foreground)] text-[var(--background)] hover:scale-[1.03]" : "bg-[var(--muted)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>저장하는 중... <Sparkles size={24} className="animate-spin" /></>
                            ) : (
                                <>옷장에 저장하기 <Save size={24} className="group-hover:scale-110 transition-transform" /></>
                            )}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
