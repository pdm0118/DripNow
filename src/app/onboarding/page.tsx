"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useLocalStorage, UserProfile, defaultUserProfile } from "@/hooks/useLocalStorage";
import clsx from "clsx";

// 공통 애니메이션 변수 설정
const stepVariants: Variants = {
    hidden: { opacity: 0, x: 20, filter: "blur(4px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, filter: "blur(4px)", transition: { duration: 0.3 } }
};

export interface StepProps {
    profile: UserProfile;
    setProfile: (value: UserProfile) => void;
    onNext: () => void;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [profile, setProfile] = useLocalStorage<UserProfile>("dripnow_user_profile", defaultUserProfile);

    // 온보딩 단계 (1 ~ 5)
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else finishOnboarding();
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const finishOnboarding = () => {
        // 설정 완료 후 대시보드로 이동
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col pt-12 pb-20 px-6 sm:px-12 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* Header & Progress */}
            <div className="max-w-2xl w-full mx-auto mb-10 flex items-center justify-between z-10">
                <button
                    onClick={handlePrev}
                    disabled={step === 1}
                    className={clsx(
                        "p-3 rounded-full transition-colors",
                        step === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--muted)]"
                    )}
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex gap-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "h-2 rounded-full transition-all duration-300",
                                i + 1 === step ? "w-8 bg-[var(--foreground)]" :
                                    i + 1 < step ? "w-2 bg-[var(--foreground)] opacity-50" : "w-2 bg-[var(--card-border)]"
                            )}
                        />
                    ))}
                </div>
                <div className="w-12" /> {/* Spacer for centering */}
            </div>

            {/* Form Content Area */}
            <main className="flex-1 max-w-2xl w-full mx-auto relative z-10 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <StepOneNickname
                            key="step1"
                            profile={profile}
                            setProfile={setProfile}
                            onNext={handleNext}
                        />
                    )}
                    {step === 2 && (
                        <StepTwoPhysical
                            key="step2"
                            profile={profile}
                            setProfile={setProfile}
                            onNext={handleNext}
                        />
                    )}
                    {step === 3 && (
                        <StepThreeBodyFit
                            key="step3"
                            profile={profile}
                            setProfile={setProfile}
                            onNext={handleNext}
                        />
                    )}
                    {step === 4 && (
                        <StepFourTemperament
                            key="step4"
                            profile={profile}
                            setProfile={setProfile}
                            onNext={handleNext}
                        />
                    )}
                    {step === 5 && (
                        <StepFiveStyles
                            key="step5"
                            profile={profile}
                            setProfile={setProfile}
                            onNext={handleNext}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// ======================== Sub Steps ========================

// 1. 닉네임
function StepOneNickname({ profile, setProfile, onNext }: StepProps) {
    const isValid = profile.nickname.length >= 2;

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-serif italic tracking-tight mb-6 text-[var(--foreground)]">Your Name</h2>
            <p className="text-neutral-400 text-sm tracking-widest uppercase font-medium mb-16">DripNow에서 사용할 멋진 닉네임을 정해주세요.</p>

            <input
                type="text"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                placeholder="Name"
                className="text-4xl sm:text-5xl pb-4 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-800 font-serif w-full"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && isValid) onNext();
                }}
            />

            <div className="mt-16 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "group flex items-center gap-4 px-10 py-5 bg-transparent text-[var(--foreground)] text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]",
                        isValid ? "opacity-100" : "opacity-0 translate-y-4 pointer-events-none"
                    )}
                >
                    Continue <ArrowRight size={18} strokeWidth={1.5} className={isValid ? "group-hover:translate-x-1 transition-transform" : ""} />
                </button>
            </div>
        </motion.div>
    );
}

// 2. 신체 정보 (성별, 키, 몸무게, 나이)
function StepTwoPhysical({ profile, setProfile, onNext }: StepProps) {
    const isValid = profile.gender && profile.height && profile.weight && profile.age;

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-4xl sm:text-6xl font-serif italic tracking-tight mb-6 text-[var(--foreground)]">Dimensions</h2>
            <p className="text-neutral-400 text-sm tracking-widest uppercase font-medium mb-12">완벽한 핏 제안을 위해 프로필을 세팅합니다.</p>

            <div className="grid gap-8 sm:grid-cols-2">
                {/* 성별 */}
                <div className="flex flex-col gap-3">
                    <label className="font-semibold text-sm uppercase tracking-wider text-[var(--muted-foreground)]">성별 (Gender)</label>
                    <div className="flex gap-2">
                        {(["male", "female", "other"] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setProfile({ ...profile, gender: g })}
                                className={clsx(
                                    "flex-1 py-4 px-2 rounded-full border transition-all font-medium text-[var(--foreground)]",
                                    profile.gender === g
                                        ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-lg"
                                        : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500"
                                )}
                            >
                                {g === "male" ? "남성" : g === "female" ? "여성" : "기타"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 나이 */}
                <div className="flex flex-col gap-3">
                    <label className="font-semibold text-sm uppercase tracking-wider text-[var(--muted-foreground)]">나이 (Age)</label>
                    <input
                        type="number"
                        placeholder="예) 25"
                        value={profile.age || ""}
                        onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                        className="p-4 px-2 text-xl bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700 w-full"
                    />
                </div>

                {/* 키 */}
                <div className="flex flex-col gap-3">
                    <label className="font-semibold text-sm uppercase tracking-wider text-[var(--muted-foreground)]">키 (Height, cm)</label>
                    <input
                        type="number"
                        placeholder="예) 175"
                        value={profile.height || ""}
                        onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                        className="p-4 px-2 text-xl bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700 w-full"
                    />
                </div>

                {/* 체중 */}
                <div className="flex flex-col gap-3">
                    <label className="font-semibold text-sm uppercase tracking-wider text-[var(--muted-foreground)]">체중 (Weight, kg)</label>
                    <input
                        type="number"
                        placeholder="예) 70"
                        value={profile.weight || ""}
                        onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                        className="p-4 px-2 text-xl bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700 w-full"
                    />
                </div>
            </div>

            <div className="mt-16 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "group flex items-center gap-4 px-10 py-5 transition-all duration-300 border border-[var(--foreground)] text-xs font-bold tracking-[0.2em] uppercase",
                        isValid ? "bg-transparent text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]" : "bg-transparent text-neutral-300 border-neutral-200 cursor-not-allowed"
                    )}
                >
                    Next Step <ArrowRight size={18} strokeWidth={1.5} className={isValid ? "group-hover:translate-x-1 transition-transform" : ""} />
                </button>
            </div>
        </motion.div>
    );
}

// 3. 체형 및 핏
function StepThreeBodyFit({ profile, setProfile, onNext }: StepProps) {
    const isValid = profile.bodyShape && profile.preferredFit;

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-4xl sm:text-6xl font-serif italic tracking-tight mb-6 text-[var(--foreground)]">Silhouette</h2>
            <p className="text-neutral-400 text-sm tracking-widest uppercase font-medium mb-12">나의 특징을 감안해 최적의 실루엣을 제안해 드립니다.</p>

            <div className="flex flex-col gap-10">
                {/* 체형 */}
                <div>
                    <h3 className="font-semibold mb-6 text-sm uppercase tracking-widest text-[var(--muted-foreground)]">1. 가장 가까운 체형 특징</h3>
                    <div className="flex flex-wrap gap-4">
                        {[{ id: "broad_shoulder", label: "어깨발달형" }, { id: "skinny", label: "슬림형" }, { id: "sturdy_lower", label: "하체튼튼형" }, { id: "belly", label: "복부발달형" }, { id: "standard", label: "표준형" }].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setProfile({ ...profile, bodyShape: s.id as any })}
                                className={clsx(
                                    "px-6 py-4 rounded-full border transition-all font-medium text-lg text-[var(--foreground)]",
                                    profile.bodyShape === s.id
                                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-lg scale-[1.02]"
                                        : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-[var(--foreground)]"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 핏 */}
                <div>
                    <h3 className="font-semibold mb-6 text-sm uppercase tracking-widest text-[var(--muted-foreground)]">2. 평소 즐겨입는 핏 (Fit)</h3>
                    <div className="flex flex-wrap gap-4">
                        {[{ id: "over_fit", label: "오버 핏" }, { id: "wide_fit", label: "와이드 핏" }, { id: "standard_fit", label: "스탠다드 핏" }, { id: "slim_fit", label: "슬림 핏" }].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setProfile({ ...profile, preferredFit: f.id as any })}
                                className={clsx(
                                    "px-6 py-4 rounded-full border transition-all font-medium text-lg text-[var(--foreground)]",
                                    profile.preferredFit === f.id
                                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-lg scale-[1.02]"
                                        : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-[var(--foreground)]"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-16 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "group flex items-center gap-4 px-10 py-5 transition-all duration-300 border border-[var(--foreground)] text-xs font-bold tracking-[0.2em] uppercase",
                        isValid ? "bg-transparent text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]" : "bg-transparent text-neutral-300 border-neutral-200 cursor-not-allowed"
                    )}
                >
                    Next Step <ArrowRight size={18} strokeWidth={1.5} className={isValid ? "group-hover:translate-x-1 transition-transform" : ""} />
                </button>
            </div>
        </motion.div>
    );
}

// 4. 온도 민감도
function StepFourTemperament({ profile, setProfile, onNext }: StepProps) {
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-4xl sm:text-6xl font-serif italic tracking-tight mb-6 text-[var(--foreground)]">Thermal Profile</h2>
            <p className="text-neutral-400 text-sm tracking-widest uppercase font-medium mb-12">같은 온도라도 입는 옷의 두께가 달라집니다.</p>

            <div className="flex flex-col gap-4">
                {[{ id: "cold_sensitive", label: "추위를 많이 타요" }, { id: "normal", label: "보통이에요" }, { id: "heat_sensitive", label: "더위를 많이 타요" }].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => {
                            setProfile({ ...profile, tempSensitivity: opt.id as any });
                            setTimeout(onNext, 400); // 부드러운 전환
                        }}
                        className={clsx(
                            "p-6 text-left rounded-3xl border transition-all text-xl font-medium flex items-center justify-between text-[var(--foreground)]",
                            profile.tempSensitivity === opt.id
                                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-xl scale-[1.02]"
                                : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-[var(--foreground)]"
                        )}
                    >
                        {opt.label}
                        {profile.tempSensitivity === opt.id && <Check size={24} />}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

// 5. 스타일 선호 (최대 5개)
function StepFiveStyles({ profile, setProfile, onNext }: StepProps) {
    const stylesList = [
        "미니멀", "캐주얼", "스트릿", "아메카지", "시티보이",
        "포멀/수트", "남친룩", "여친룩", "올드머니", "고프코어",
        "스포티", "빈티지"
    ];

    const toggleStyle = (style: string) => {
        const current = profile.favoriteStyles;
        if (current.includes(style)) {
            setProfile({ ...profile, favoriteStyles: current.filter((s: string) => s !== style) });
        } else {
            if (current.length < 5) {
                setProfile({ ...profile, favoriteStyles: [...current, style] });
            }
        }
    };

    const isValid = profile.favoriteStyles.length > 0;

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-4xl sm:text-6xl font-serif italic tracking-tight mb-6 text-[var(--foreground)]">Aesthetic</h2>
            <p className="text-neutral-400 text-sm tracking-widest uppercase font-medium mb-4">즐겨 입거나 도전하고 싶은 스타일을 선택해 주세요. (최대 5개)</p>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-[var(--foreground)] border-b border-neutral-100 dark:border-neutral-900 pb-4 inline-block">Selected: {profile.favoriteStyles.length} / 5</p>

            <div className="flex flex-wrap gap-4">
                {stylesList.map(style => {
                    const isSelected = profile.favoriteStyles.includes(style);
                    const isMaxedOut = profile.favoriteStyles.length >= 5 && !isSelected;
                    return (
                        <button
                            key={style}
                            onClick={() => toggleStyle(style)}
                            disabled={isMaxedOut}
                            className={clsx(
                                "px-8 py-4 rounded-full border transition-all font-semibold text-lg text-[var(--foreground)]",
                                isSelected
                                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-xl scale-[1.05]"
                                    : isMaxedOut
                                        ? "border-neutral-200 dark:border-neutral-800 opacity-30 cursor-not-allowed"
                                        : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-[1.02]"
                            )}
                        >
                            {style}
                        </button>
                    );
                })}
            </div>

            <div className="mt-16 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "group flex items-center gap-4 px-12 py-6 border border-[var(--foreground)] text-[var(--background)] bg-[var(--foreground)] text-xs font-bold tracking-[0.2em] uppercase transition-all duration-500",
                        isValid ? "opacity-100 hover:bg-neutral-800" : "opacity-0 translate-y-4 pointer-events-none"
                    )}
                >
                    <Sparkles size={16} strokeWidth={1.5} className={isValid ? "group-hover:rotate-12 transition-transform" : ""} />
                    Enter Wardrobe
                </button>
            </div>
        </motion.div>
    );
}
