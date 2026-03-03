"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CloudSun, Cloud, CloudRain, Sun, Moon, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Wind, Droplets, Plus, Sparkles } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

// Helper to pick random item from array
const pickRandom = (arr: ClothingItem[]) => arr[Math.floor(Math.random() * arr.length)];

// Types for Weather
interface WeatherData {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon_code: string;
    city: string;
}

export default function DashboardPage() {
    const [tpo, setTpo] = useState("work");
    const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
    const [swappingItem, setSwappingItem] = useState<string | null>(null);
    const [isCommitted, setIsCommitted] = useState(false);

    // Weather State
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    // Fetch user's wardrobe
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [cooldownItems, setCooldownItems] = useLocalStorage<Record<string, string>>("dripnow_cooldowns", {});

    // --- Weather Fetching ---
    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
                if (!res.ok) throw new Error("Failed to fetch weather");
                const data = await res.json();

                setWeather({
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    humidity: data.main.humidity,
                    wind_speed: data.wind.speed,
                    description: data.weather[0].description,
                    icon_code: data.weather[0].icon,
                    city: data.name
                });
            } catch (err) {
                console.error(err);
                setWeatherError("날씨 정보를 불러올 수 없습니다.");
            } finally {
                setIsLoadingWeather(false);
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    // Fallback to Seoul if location denied or failed
                    fetchWeather(37.5665, 126.9780);
                },
                { timeout: 10000 }
            );
        } else {
            // Fallback to Seoul
            fetchWeather(37.5665, 126.9780);
        }
    }, []);

    // --- Wardrobe Categorization (with Cooldown logic) ---
    const categorizedWardrobe = useMemo(() => {
        const now = new Date().getTime();

        // Filter out washing items AND items in cooldown (24 hours = 86400000 ms)
        const isAvailable = (i: ClothingItem) => {
            if (i.isWashing) return false;

            const cooldownTime = cooldownItems[i.id];
            if (cooldownTime) {
                const timePassed = now - new Date(cooldownTime).getTime();
                if (timePassed < 86400000) return false; // Still in cooldown
            }
            return true;
        };

        return {
            outer: wardrobe.filter(i => i.category === "outer" && isAvailable(i)),
            top: wardrobe.filter(i => i.category === "top" && isAvailable(i)),
            bottom: wardrobe.filter(i => i.category === "bottom" && isAvailable(i)),
            shoes: wardrobe.filter(i => (i.category === "shoes" || i.category === "accessory") && isAvailable(i)),
        };
    }, [wardrobe, cooldownItems]);

    // Generate dynamic presets based on user's actual clothes (and WEATHER)
    const dynamicPresets = useMemo(() => {
        if (wardrobe.length === 0) return []; // Handled in UI render

        // Let's generate 3 fake presets by randomly picking available clothes
        // In a real app, this would be an AI engine picking based on TPO, Weather, and Style
        const generatePreset = (id: string, name: string) => {
            const hasOuter = categorizedWardrobe.outer.length > 0 && Math.random() > 0.3; // 70% chance of outer
            const outer = hasOuter ? pickRandom(categorizedWardrobe.outer) : null;
            const top = categorizedWardrobe.top.length > 0 ? pickRandom(categorizedWardrobe.top) : null;
            const bottom = categorizedWardrobe.bottom.length > 0 ? pickRandom(categorizedWardrobe.bottom) : null;
            const shoes = categorizedWardrobe.shoes.length > 0 ? pickRandom(categorizedWardrobe.shoes) : null;

            const items = [];
            if (outer) items.push({ id: outer.id, name: outer.name || "아우터", type: "Outer", rawCategory: "outer" });
            if (top) items.push({ id: top.id, name: top.name || "상의", type: "Top", rawCategory: "top" });
            if (bottom) items.push({ id: bottom.id, name: bottom.name || "하의", type: "Bottom", rawCategory: "bottom" });
            if (shoes) items.push({ id: shoes.id, name: shoes.name || "신발", type: "Shoes", rawCategory: "shoes" });

            return {
                id,
                name,
                matchRate: Math.floor(Math.random() * 20) + 80, // 80~99%
                items
            };
        };

        return [
            generatePreset("p1", "Today's Best Pick"),
            generatePreset("p2", "Alternative Vibe"),
            generatePreset("p3", "Comfort Focus")
        ];
    }, [categorizedWardrobe, tpo]);

    // UI state for the currently playing presets
    const [renderedPresets, setRenderedPresets] = useState(dynamicPresets);

    // Update rendered presets when dynamic ones change (e.g., TPO change or wardrobe update)
    useEffect(() => {
        setRenderedPresets(dynamicPresets);
        setCurrentPresetIndex(0);
    }, [dynamicPresets]);

    const activePreset = renderedPresets[currentPresetIndex];

    const nextPreset = () => {
        if (currentPresetIndex < renderedPresets.length - 1) setCurrentPresetIndex(c => c + 1);
    };

    const prevPreset = () => {
        if (currentPresetIndex > 0) setCurrentPresetIndex(c => c - 1);
    };

    const handleSwap = (itemId: string, category: string) => {
        setSwappingItem(itemId);

        setTimeout(() => {
            // Find another random item from the same category
            const categoryItems = categorizedWardrobe[category as keyof typeof categorizedWardrobe];
            // Filter out the currently selected item
            const availableToSwap = categoryItems.filter(i => i.id !== itemId);

            if (availableToSwap.length > 0) {
                const newItem = pickRandom(availableToSwap);

                // Update the current preset in state
                const updatedPresets = [...renderedPresets];
                const currentItems = [...updatedPresets[currentPresetIndex].items];
                const itemIndex = currentItems.findIndex(i => i.id === itemId);

                if (itemIndex !== -1) {
                    currentItems[itemIndex] = {
                        id: newItem.id,
                        name: newItem.name || "새 아이템",
                        type: currentItems[itemIndex].type,
                        rawCategory: category
                    };
                    updatedPresets[currentPresetIndex].items = currentItems;
                    setRenderedPresets(updatedPresets);
                }
            } else {
                // Feature improvement: Show a toast saying "No other items to swap with!"
                alert("옷장에 이 카테고리의 다른 옷이 없습니다.");
            }

            setSwappingItem(null);
        }, 600);
    };

    // Commit Outfit (Apply Cooldown)
    const commitOutfit = () => {
        if (!activePreset) return;

        setIsCommitted(true);

        const newCooldowns = { ...cooldownItems };
        const now = new Date().toISOString();

        activePreset.items.forEach(item => {
            // Optional: Don't cooldown shoes or accessories
            if (item.rawCategory !== "shoes" && item.rawCategory !== "accessory") {
                newCooldowns[item.id] = now;
            }
        });

        setCooldownItems(newCooldowns);
    };

    // Helper for weather icons
    const WeatherIcon = () => {
        if (!weather) return <CloudSun size={64} strokeWidth={1} />;
        if (weather.icon_code.includes('01')) return <Sun size={64} strokeWidth={1} />;
        if (weather.icon_code.includes('02') || weather.icon_code.includes('03') || weather.icon_code.includes('04')) return <Cloud size={64} strokeWidth={1} />;
        if (weather.icon_code.includes('09') || weather.icon_code.includes('10') || weather.icon_code.includes('11')) return <CloudRain size={64} strokeWidth={1} />;
        return <CloudSun size={64} strokeWidth={1} />;
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans relative overflow-x-hidden">

            {/* iOS Weather-inspired Hero Section */}
            <header className="relative w-full pt-16 pb-12 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 text-neutral-400 font-medium text-xs tracking-widest uppercase mb-6">
                    <MapPin size={14} />
                    <span>{weather ? weather.city : isLoadingWeather ? "Locating..." : "Seoul"}</span>
                </div>

                {isLoadingWeather ? (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full" />
                        <div className="h-16 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-2xl" />
                        <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-900 rounded-full mt-2" />
                    </div>
                ) : weather ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center"
                    >
                        <div className="mb-2 text-[var(--foreground)] drop-shadow-sm">
                            <WeatherIcon />
                        </div>
                        <h1 className="text-8xl sm:text-[10rem] font-extralight tracking-tighter mb-0 leading-none drop-shadow-md" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {weather.temp}°
                        </h1>
                        <p className="text-xl sm:text-2xl font-medium tracking-wide capitalize mb-8 opacity-90 drop-shadow-sm">
                            {weather.description}
                        </p>

                        {/* Secondary weather stats */}
                        <div className="flex items-center gap-8 text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 pt-6">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Feels Like</span>
                                <span className="text-lg font-medium text-[var(--foreground)]">{weather.feels_like}°</span>
                            </div>
                            <div className="w-[1px] h-8 bg-neutral-200 dark:bg-neutral-800" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Humidity</span>
                                <span className="text-lg font-medium text-[var(--foreground)]">{weather.humidity}%</span>
                            </div>
                            <div className="w-[1px] h-8 bg-neutral-200 dark:bg-neutral-800" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Wind</span>
                                <span className="text-lg font-medium text-[var(--foreground)]">{weather.wind_speed} <span className="text-xs text-neutral-500">m/s</span></span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <p className="text-neutral-500">{weatherError}</p>
                )}
            </header>

            <main className="max-w-5xl mx-auto px-6 sm:px-12 pb-40">
                {/* TPO Selection */}
                <section className="mb-12">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-neutral-400">Occasion</p>
                    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
                        {TPOs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setTpo(t.id); }}
                                className={clsx(
                                    "pb-2 transition-all font-medium text-sm tracking-widest uppercase whitespace-nowrap relative",
                                    tpo === t.id
                                        ? "text-[var(--foreground)]"
                                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                )}
                            >
                                {t.label}
                                {tpo === t.id && (
                                    <motion.div
                                        layoutId="tpo-indicator"
                                        className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--foreground)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Outfit Presentation Area */}
                <section className="relative mt-12">
                    {wardrobe.length === 0 ? (
                        <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/20 p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                            <h2 className="text-3xl font-serif italic mb-4">Wardrobe Empty</h2>
                            <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm tracking-wide leading-relaxed uppercase">
                                완벽한 온도 기반 코디 추천을 위해 옷장에 옷을 등록해주세요.
                            </p>
                            <Link href="/wardrobe" className="px-10 py-4 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center gap-3">
                                <Plus size={16} /> 옷장으로 이동
                            </Link>
                        </div>
                    ) : isLoadingWeather ? (
                        <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/20 p-12 text-center flex flex-col items-center justify-center min-h-[500px] animate-pulse">
                            <Sparkles size={32} className="text-neutral-300 mb-4 animate-spin-slow" />
                            <p className="text-neutral-400 text-sm tracking-[0.2em] uppercase font-bold text-center">Curating for today's weather...</p>
                        </div>
                    ) : activePreset ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePreset.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start"
                            >
                                {/* Luxury Placeholder graphic */}
                                <div className="w-full md:w-[45%] aspect-[3/4] md:h-[600px] bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center relative overflow-hidden group border border-neutral-100 dark:border-neutral-900 sticky top-10">
                                    <span className="absolute top-6 right-6 font-mono text-[10px] tracking-widest uppercase z-10 text-neutral-400 bg-[var(--background)] px-3 py-1">
                                        Match {activePreset.matchRate}%
                                    </span>
                                    <div className="w-1/2 h-2/3 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-all duration-700 bg-white dark:bg-black shadow-2xl skew-y-3 group-hover:skew-y-0 group-hover:scale-105">
                                        <p className="text-neutral-400 rotate-90 font-mono tracking-widest uppercase text-xs">Lookbook</p>
                                    </div>
                                </div>

                                {/* Preset Info & Item List */}
                                <div className="w-full md:flex-1 py-4">
                                    <div className="mb-12">
                                        <h2 className="text-4xl sm:text-5xl font-serif italic mb-4 text-[var(--foreground)]">{activePreset.name}</h2>
                                        <p className="text-neutral-400 font-medium text-xs tracking-[0.2em] uppercase">Curated Protocol for {weather?.feels_like}°C & {TPOs.find(t => t.id === tpo)?.label}</p>
                                    </div>

                                    <div className="space-y-6 flex-1 mb-16">
                                        {activePreset.items.length > 0 ? activePreset.items.map((item) => (
                                            <div key={item.id} className="group flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-5 hover:border-[var(--foreground)] transition-colors">
                                                <div className="pr-4">
                                                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400 mb-2">{item.type}</p>
                                                    <p className="text-lg sm:text-xl font-medium tracking-wide">{item.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSwap(item.id, item.rawCategory)}
                                                    disabled={swappingItem === item.id}
                                                    className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-[var(--background)] hover:bg-[var(--foreground)] rounded-full transition-all disabled:opacity-50 border border-transparent hover:border-[var(--foreground)]"
                                                    title="Swap Item with another from wardrobe"
                                                >
                                                    <RefreshCw size={18} strokeWidth={1.5} className={clsx(swappingItem === item.id && "animate-spin")} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="text-neutral-400 italic text-sm">Not enough items in wardrobe to build a full look.</div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-8">
                                        <div className="flex gap-6">
                                            <button onClick={prevPreset} disabled={currentPresetIndex === 0} className="text-neutral-500 hover:text-[var(--foreground)] transition-colors disabled:opacity-20 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                                <ChevronLeft size={16} /> Prev Style
                                            </button>
                                            <button onClick={nextPreset} disabled={currentPresetIndex === renderedPresets.length - 1} className="text-neutral-500 hover:text-[var(--foreground)] transition-colors disabled:opacity-20 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                                Next Style <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        <span className="text-neutral-300 font-mono text-xs tracking-widest">{currentPresetIndex + 1} / {renderedPresets.length}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/20 p-12 text-center items-center justify-center min-h-[500px]">
                            <h2 className="text-2xl font-bold mb-4">No Suitable Looks</h2>
                            <p className="text-neutral-500">Not enough items matching current weather or TPO.</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Bottom Floating CTA */}
            <AnimatePresence>
                {(!isCommitted && wardrobe.length > 0 && activePreset && activePreset.items.length > 0) ? (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 w-full p-6 sm:p-10 pointer-events-none flex justify-center z-40 bg-gradient-to-t from-[var(--background)] to-transparent"
                    >
                        <button
                            onClick={commitOutfit}
                            className="pointer-events-auto px-16 py-6 border border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors flex items-center gap-4 group"
                        >
                            Select Look <CheckCircle2 size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </motion.div>
                ) : isCommitted ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[var(--card-bg)] p-10 py-14 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-[var(--card-border)]"
                        >
                            <div className="w-24 h-24 bg-[var(--foreground)] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--background)] shadow-xl">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mb-4">선택 완료!</h3>
                            <p className="text-neutral-500 font-medium mb-10 text-lg leading-relaxed">멋진 하루 보내세요.<br />해당 코디는 내일 추천에서 제외됩니다.</p>
                            <button
                                onClick={() => setIsCommitted(false)}
                                className="w-full px-6 py-5 bg-neutral-100 dark:bg-neutral-800 text-[var(--foreground)] rounded-full font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors mb-4"
                            >
                                코디 다시 고르기
                            </button>
                            <Link href="/" className="inline-block mt-2 text-sm text-neutral-400 font-semibold tracking-wider hover:text-[var(--foreground)] transition-colors uppercase">
                                홈으로 돌아가기
                            </Link>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

// Mocks
const TPOs = [
    { id: "work", label: "Business" },
    { id: "date", label: "Date" },
    { id: "casual", label: "Casual" },
    { id: "formal", label: "Formal" },
];
