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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">어떻게 불러드릴까요?</h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-10">DripNow에서 사용할 멋진 닉네임을 정해주세요.</p>

            <input
                type="text"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                placeholder="예) 마포구패션왕"
                className="text-2xl p-6 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--foreground)] transition-colors shadow-sm"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && isValid) onNext();
                }}
            />

            <div className="mt-12 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-md",
                        isValid ? "bg-[var(--foreground)] text-[var(--background)] hover:scale-105" : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed hidden opacity-0"
                    )}
                >
                    계속하기 <ArrowRight size={20} />
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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{profile.nickname}님의 스펙을 완성해주세요.</h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-10">완벽한 핏(Fit) 제안을 위해 마네킹 아바타를 세팅합니다.</p>

            <div className="grid gap-6 sm:grid-cols-2">
                {/* 성별 */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm text-[var(--muted-foreground)]">성별</label>
                    <div className="flex gap-2 bg-[var(--card-bg)] p-2 rounded-[var(--radius-lg)] border border-[var(--card-border)]">
                        {(["male", "female", "other"] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setProfile({ ...profile, gender: g })}
                                className={clsx(
                                    "flex-1 py-3 px-4 rounded-[var(--radius-md)] text-center transition-all font-medium",
                                    profile.gender === g ? "bg-[var(--foreground)] text-[var(--background)] shadow-md" : "hover:bg-[var(--muted)]"
                                )}
                            >
                                {g === "male" ? "남성" : g === "female" ? "여성" : "기타"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 나이 */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm text-[var(--muted-foreground)]">나이</label>
                    <input
                        type="number"
                        placeholder="세"
                        value={profile.age || ""}
                        onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                        className="p-4 px-6 text-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                    />
                </div>

                {/* 키 */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm text-[var(--muted-foreground)]">키 (cm)</label>
                    <input
                        type="number"
                        placeholder="175"
                        value={profile.height || ""}
                        onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                        className="p-4 px-6 text-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                    />
                </div>

                {/* 체중 */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm text-[var(--muted-foreground)]">몸무게 (kg)</label>
                    <input
                        type="number"
                        placeholder="70"
                        value={profile.weight || ""}
                        onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                        className="p-4 px-6 text-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                    />
                </div>
            </div>

            <div className="mt-12 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-md",
                        isValid ? "bg-[var(--foreground)] text-[var(--background)] hover:scale-105" : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed opacity-50"
                    )}
                >
                    다음 단계 <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
}

// 3. 체형 및 핏
function StepThreeBodyFit({ profile, setProfile, onNext }: StepProps) {
    const isValid = profile.bodyShape && profile.preferredFit;

    const shapes = [
        { id: "broad_shoulder", label: "어깨발달형" },
        { id: "skinny", label: "슬림형" },
        { id: "sturdy_lower", label: "하체튼튼형" },
        { id: "belly", label: "복부발달형" },
        { id: "standard", label: "표준형" }
    ] as const;

    const fits = [
        { id: "over_fit", label: "오버 핏" },
        { id: "wide_fit", label: "와이드 핏" },
        { id: "standard_fit", label: "스탠다드 핏" },
        { id: "slim_fit", label: "슬림 핏" }
    ] as const;

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">옷태가 사는 비밀</h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-10">나의 특징을 감안해 최적의 실루엣을 제안해 드립니다.</p>

            <div className="flex flex-col gap-8">
                <div>
                    <h3 className="font-semibold mb-4 text-lg">나에 가까운 체형 특징은?</h3>
                    <div className="flex flex-wrap gap-3">
                        {shapes.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setProfile({ ...profile, bodyShape: s.id })}
                                className={clsx(
                                    "px-5 py-3 rounded-full border transition-all font-medium",
                                    profile.bodyShape === s.id
                                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-md"
                                        : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-neutral-400"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-4 text-lg">평소 즐겨입는 핏(Fit)은?</h3>
                    <div className="flex flex-wrap gap-3">
                        {fits.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setProfile({ ...profile, preferredFit: f.id })}
                                className={clsx(
                                    "px-5 py-3 rounded-full border transition-all font-medium",
                                    profile.preferredFit === f.id
                                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-md"
                                        : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-neutral-400"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-md",
                        isValid ? "bg-[var(--foreground)] text-[var(--background)] hover:scale-105" : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed opacity-50"
                    )}
                >
                    다음 <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
}

// 4. 온도 민감도
function StepFourTemperament({ profile, setProfile, onNext }: StepProps) {
    const options = [
        { id: "cold_sensitive", label: "🧊 추위를 많이 타요" },
        { id: "normal", label: "😌 보통이에요" },
        { id: "heat_sensitive", label: "🔥 더위를 많이 타요" },
    ] as const;

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">계절 체감 지수</h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-10">같은 10도에도 입는 두께가 달라집니다.</p>

            <div className="flex flex-col gap-4">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => {
                            setProfile({ ...profile, tempSensitivity: opt.id });
                            // 자동 다음 넘어가기 (편의성)
                            setTimeout(onNext, 300);
                        }}
                        className={clsx(
                            "p-6 text-left rounded-[var(--radius-lg)] border transition-all text-xl font-medium flex items-center justify-between",
                            profile.tempSensitivity === opt.id
                                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-lg scale-[1.02]"
                                : "border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--muted)]"
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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">나의 무드 보드</h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-8">즐겨 입거나 도전하고 싶은 스타일을 선택해 주세요. (최대 5개)</p>

            <div className="flex flex-wrap gap-3">
                {stylesList.map(style => {
                    const isSelected = profile.favoriteStyles.includes(style);
                    const isMaxedOut = profile.favoriteStyles.length >= 5 && !isSelected;
                    return (
                        <button
                            key={style}
                            onClick={() => toggleStyle(style)}
                            disabled={isMaxedOut}
                            className={clsx(
                                "px-6 py-4 rounded-xl border-2 transition-all font-semibold text-lg",
                                isSelected
                                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-md"
                                    : isMaxedOut
                                        ? "border-[var(--card-border)] bg-[var(--card-bg)] opacity-30 cursor-not-allowed"
                                        : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-neutral-400"
                            )}
                        >
                            # {style}
                        </button>
                    );
                })}
            </div>

            <div className="mt-12 flex justify-between items-end">
                <p className="text-[var(--muted-foreground)] font-medium">선택됨: {profile.favoriteStyles.length} / 5</p>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={clsx(
                        "flex items-center gap-2 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
                        isValid ? "bg-[var(--accent)] text-[var(--accent-foreground)] hover:scale-105" : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed hidden opacity-0"
                    )}
                >
                    내 옷장 시작하기 <Sparkles size={24} />
                </button>
            </div>
        </motion.div>
    );
}
