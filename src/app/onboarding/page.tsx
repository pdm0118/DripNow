"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useLocalStorage, UserProfile, defaultUserProfile } from "@/hooks/useLocalStorage";
import clsx from "clsx";

const stepVariants: Variants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.2 } }
};

export interface StepProps {
    profile: UserProfile;
    setProfile: (value: UserProfile) => void;
    onNext: () => void;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [profile, setProfile] = useLocalStorage<UserProfile>("dripnow_user_profile", defaultUserProfile);
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else router.push("/dashboard");
    };
    const handlePrev = () => { if (step > 1) setStep(step - 1); };

    return (
        <div className="min-h-[100dvh] bg-[var(--background)] flex flex-col relative">
            {/* Header */}
            <header className="page-header px-[var(--space-page)] pt-14 pb-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1}
                        className={clsx("w-10 h-10 -ml-2 flex items-center justify-center rounded-full transition-colors", step === 1 ? "opacity-0" : "active:bg-[var(--card-bg)]")}
                    >
                        <ArrowLeft size={22} strokeWidth={2} />
                    </button>

                    {/* Progress dots */}
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={clsx(
                                "h-[3px] rounded-full transition-all duration-400",
                                i + 1 === step ? "w-6 bg-[var(--accent)]" : i + 1 < step ? "w-1.5 bg-[var(--accent)] opacity-30" : "w-1.5 bg-[var(--separator-opaque)]"
                            )} />
                        ))}
                    </div>

                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 w-full px-[var(--space-page)] pb-32 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {step === 1 && <StepNickname key="s1" profile={profile} setProfile={setProfile} onNext={handleNext} />}
                    {step === 2 && <StepPhysical key="s2" profile={profile} setProfile={setProfile} onNext={handleNext} />}
                    {step === 3 && <StepBodyFit key="s3" profile={profile} setProfile={setProfile} onNext={handleNext} />}
                    {step === 4 && <StepTemp key="s4" profile={profile} setProfile={setProfile} onNext={handleNext} />}
                    {step === 5 && <StepStyles key="s5" profile={profile} setProfile={setProfile} onNext={handleNext} />}
                </AnimatePresence>
            </main>
        </div>
    );
}

// ===== Steps =====

function StepNickname({ profile, setProfile, onNext }: StepProps) {
    const ok = profile.nickname.length >= 2;
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
            <div>
                <h2 className="text-[var(--text-xl)] font-bold tracking-tight mb-2" style={{ fontSize: "var(--text-xl)" }}>닉네임</h2>
                <p className="text-[var(--muted-foreground)]" style={{ fontSize: "var(--text-base)" }}>DripNow에서 사용할 이름을 알려주세요.</p>
            </div>
            <input
                type="text" autoFocus value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                placeholder="예) 드립마스터"
                onKeyDown={(e) => { if (e.key === "Enter" && ok) onNext(); }}
                className="native-input"
            />
            <button onClick={onNext} disabled={!ok} className="btn-primary">다음</button>
        </motion.div>
    );
}

function StepPhysical({ profile, setProfile, onNext }: StepProps) {
    const ok = profile.gender && profile.height && profile.weight && profile.age;
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
            <div>
                <h2 className="text-[var(--text-xl)] font-bold tracking-tight mb-2" style={{ fontSize: "var(--text-xl)" }}>기본 정보</h2>
                <p className="text-[var(--muted-foreground)]" style={{ fontSize: "var(--text-base)" }}>체형에 맞는 핏을 추천하기 위해 필요해요.</p>
            </div>
            <div>
                <label className="section-label mb-2.5 block">성별</label>
                <div className="grid grid-cols-3 gap-2">
                    {(["male", "female", "other"] as const).map((g) => (
                        <button key={g} onClick={() => setProfile({ ...profile, gender: g })} className={clsx("pill justify-center", profile.gender === g && "pill-active")}>
                            {g === "male" ? "남성" : g === "female" ? "여성" : "기타"}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
                <div>
                    <label className="section-label mb-2 block">나이</label>
                    <input type="number" placeholder="25" value={profile.age || ""} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })} className="native-input" />
                </div>
                <div>
                    <label className="section-label mb-2 block">키 (cm)</label>
                    <input type="number" placeholder="175" value={profile.height || ""} onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })} className="native-input" />
                </div>
                <div>
                    <label className="section-label mb-2 block">체중 (kg)</label>
                    <input type="number" placeholder="70" value={profile.weight || ""} onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })} className="native-input" />
                </div>
            </div>
            <button onClick={onNext} disabled={!ok} className="btn-primary">다음</button>
        </motion.div>
    );
}

function StepBodyFit({ profile, setProfile, onNext }: StepProps) {
    const ok = profile.bodyShape && profile.preferredFit;
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
            <div>
                <h2 className="text-[var(--text-xl)] font-bold tracking-tight mb-2" style={{ fontSize: "var(--text-xl)" }}>체형 & 핏</h2>
                <p className="text-[var(--muted-foreground)]" style={{ fontSize: "var(--text-base)" }}>나에게 맞는 실루엣을 추천해 드릴게요.</p>
            </div>
            <div>
                <label className="section-label mb-3 block">체형 특징</label>
                <div className="flex flex-wrap gap-2">
                    {[{ id: "broad_shoulder", label: "어깨발달" }, { id: "skinny", label: "슬림" }, { id: "sturdy_lower", label: "하체튼튼" }, { id: "belly", label: "복부발달" }, { id: "standard", label: "표준" }].map(s => (
                        <button key={s.id} onClick={() => setProfile({ ...profile, bodyShape: s.id as any })} className={clsx("pill", profile.bodyShape === s.id && "pill-active")}>{s.label}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="section-label mb-3 block">선호 핏</label>
                <div className="flex flex-wrap gap-2">
                    {[{ id: "over_fit", label: "오버핏" }, { id: "wide_fit", label: "와이드" }, { id: "standard_fit", label: "스탠다드" }, { id: "slim_fit", label: "슬림" }].map(f => (
                        <button key={f.id} onClick={() => setProfile({ ...profile, preferredFit: f.id as any })} className={clsx("pill", profile.preferredFit === f.id && "pill-active")}>{f.label}</button>
                    ))}
                </div>
            </div>
            <button onClick={onNext} disabled={!ok} className="btn-primary">다음</button>
        </motion.div>
    );
}

function StepTemp({ profile, setProfile, onNext }: StepProps) {
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
            <div>
                <h2 className="text-[var(--text-xl)] font-bold tracking-tight mb-2" style={{ fontSize: "var(--text-xl)" }}>온도 민감도</h2>
                <p className="text-[var(--muted-foreground)]" style={{ fontSize: "var(--text-base)" }}>같은 날씨에도 사람마다 느끼는 온도가 달라요.</p>
            </div>
            <div className="flex flex-col gap-2">
                {[{ id: "cold_sensitive", label: "추위를 많이 타요", emoji: "🥶" }, { id: "normal", label: "보통이에요", emoji: "😌" }, { id: "heat_sensitive", label: "더위를 많이 타요", emoji: "🥵" }].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => { setProfile({ ...profile, tempSensitivity: opt.id as any }); setTimeout(onNext, 300); }}
                        className={clsx(
                            "w-full px-5 py-4 rounded-[var(--radius-sm)] flex items-center justify-between text-[16px] font-medium transition-all",
                            profile.tempSensitivity === opt.id ? "bg-[var(--accent)] text-white" : "bg-[var(--card-bg)] text-[var(--foreground)] active:bg-[var(--card-bg-elevated)]"
                        )}
                    >
                        <span className="flex items-center gap-3"><span className="text-xl">{opt.emoji}</span> {opt.label}</span>
                        {profile.tempSensitivity === opt.id && <Check size={18} />}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

function StepStyles({ profile, setProfile, onNext }: StepProps) {
    const styles = ["미니멀", "캐주얼", "스트릿", "아메카지", "시티보이", "포멀/수트", "남친룩", "여친룩", "올드머니", "고프코어", "스포티", "빈티지"];
    const toggle = (s: string) => {
        const cur = profile.favoriteStyles;
        if (cur.includes(s)) setProfile({ ...profile, favoriteStyles: cur.filter((x: string) => x !== s) });
        else if (cur.length < 5) setProfile({ ...profile, favoriteStyles: [...cur, s] });
    };
    const ok = profile.favoriteStyles.length > 0;
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
            <div>
                <h2 className="text-[var(--text-xl)] font-bold tracking-tight mb-2" style={{ fontSize: "var(--text-xl)" }}>스타일 취향</h2>
                <p className="text-[var(--muted-foreground)]" style={{ fontSize: "var(--text-base)" }}>좋아하는 스타일을 골라주세요. (최대 5개)</p>
            </div>
            <p className="text-[var(--text-sm)] font-semibold text-[var(--accent)]" style={{ fontSize: "var(--text-sm)" }}>{profile.favoriteStyles.length} / 5 선택됨</p>
            <div className="flex flex-wrap gap-2">
                {styles.map(s => {
                    const sel = profile.favoriteStyles.includes(s);
                    const dis = profile.favoriteStyles.length >= 5 && !sel;
                    return (
                        <button key={s} onClick={() => toggle(s)} disabled={dis} className={clsx("pill", sel && "pill-active", dis && "opacity-30")}>
                            {s}
                        </button>
                    );
                })}
            </div>
            <button onClick={onNext} disabled={!ok} className="btn-primary">완료</button>
        </motion.div>
    );
}
