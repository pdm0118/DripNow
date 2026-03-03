"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, CloudSun, Cloud, CloudRain, Sun, Moon,
    RefreshCw, CheckCircle2, Search, Plus, X, List, AlertCircle, Droplets, Wind
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useLocalStorage, ClothingItem } from "@/hooks/useLocalStorage";

const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

interface WeatherData {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon_code: string;
    city: string;
}

export interface City {
    id: string;
    name: string;
    lat: number;
    lon: number;
    landmarkLabel: string;
}

const DEFAULT_CITY: City = { id: "seoul", name: "Seoul", lat: 37.5665, lon: 126.9780, landmarkLabel: "현재 위치" };

const getWeatherGradient = (weather: WeatherData | null) => {
    if (!weather) return "from-[#1a1a2e] to-[#0a0a15]";
    const isDay = weather.icon_code.includes("d");
    const c = weather.icon_code.slice(0, 2);
    if (isDay) {
        if (c === "01") return "from-[#3B82F6] to-[#1D4ED8]";
        if (["02", "03", "04"].includes(c)) return "from-[#64748B] to-[#334155]";
        if (["09", "10", "11"].includes(c)) return "from-[#475569] to-[#1E293B]";
        return "from-[#4B6A82] to-[#2A4152]";
    } else {
        if (c === "01") return "from-[#0F172A] to-[#020617]";
        if (["02", "03", "04"].includes(c)) return "from-[#1E293B] to-[#0F172A]";
        return "from-[#1A1A2E] to-[#0A0A15]";
    }
};

export default function DashboardPage() {
    const [savedCities, setSavedCities] = useLocalStorage<City[]>("dripnow_cities", [DEFAULT_CITY]);
    const [cityIndex, setCityIndex] = useState(0);
    const activeCity = savedCities[cityIndex] || DEFAULT_CITY;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(true);

    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [cooldownItems, setCooldownItems] = useLocalStorage<Record<string, string>>("dripnow_cooldowns", {});
    const [renderedPreset, setRenderedPreset] = useState<any>(null);
    const [swappingItem, setSwappingItem] = useState<string | null>(null);
    const [isCommitted, setIsCommitted] = useState(false);

    // Fetch Weather
    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoadingWeather(true);
            try {
                const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${activeCity.lat}&lon=${activeCity.lon}&units=metric&appid=${API_KEY}`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setWeather({
                    temp: Math.round(data.main.temp), feels_like: Math.round(data.main.feels_like),
                    humidity: data.main.humidity, wind_speed: data.wind.speed,
                    description: data.weather[0].description, icon_code: data.weather[0].icon,
                    city: data.name
                });
            } catch {
                setWeather({
                    temp: 22, feels_like: 21, humidity: 50, wind_speed: 2,
                    description: "맑음", icon_code: "01d", city: activeCity.name
                });
            } finally {
                setIsLoadingWeather(false);
            }
        };
        fetchWeather();
    }, [activeCity]);

    // Wardrobe Logic
    const categorizedWardrobe = useMemo(() => {
        const now = Date.now();
        const isAvailable = (i: ClothingItem) => {
            if (i.isWashing) return false;
            const cd = cooldownItems[i.id];
            if (cd && (now - new Date(cd).getTime() < 86400000)) return false;
            return true;
        };
        return {
            outer: wardrobe.filter(i => i.category === "outer" && isAvailable(i)),
            top: wardrobe.filter(i => i.category === "top" && isAvailable(i)),
            bottom: wardrobe.filter(i => i.category === "bottom" && isAvailable(i)),
            shoes: wardrobe.filter(i => (i.category === "shoes" || i.category === "accessory") && isAvailable(i)),
        };
    }, [wardrobe, cooldownItems]);

    useEffect(() => {
        if (wardrobe.length === 0 || isLoadingWeather || !weather) return;
        const needsOuter = weather.feels_like < 15;
        const outer = (needsOuter && categorizedWardrobe.outer.length > 0) ? pickRandom(categorizedWardrobe.outer) : null;
        const top = categorizedWardrobe.top.length > 0 ? pickRandom(categorizedWardrobe.top) : null;
        const bottom = categorizedWardrobe.bottom.length > 0 ? pickRandom(categorizedWardrobe.bottom) : null;
        const shoes = categorizedWardrobe.shoes.length > 0 ? pickRandom(categorizedWardrobe.shoes) : null;
        const items: any[] = [];
        if (outer) items.push({ id: outer.id, name: outer.name, type: "아우터", rawCategory: "outer" });
        if (top) items.push({ id: top.id, name: top.name, type: "상의", rawCategory: "top" });
        if (bottom) items.push({ id: bottom.id, name: bottom.name, type: "하의", rawCategory: "bottom" });
        if (shoes) items.push({ id: shoes.id, name: shoes.name, type: "신발", rawCategory: "shoes" });
        setRenderedPreset({ id: `auto-${Date.now()}`, name: "오늘의 추천 코디", items });
    }, [categorizedWardrobe, weather, isLoadingWeather]);

    const handleSwap = (itemId: string, category: string) => {
        setSwappingItem(itemId);
        setTimeout(() => {
            const catItems = categorizedWardrobe[category as keyof typeof categorizedWardrobe];
            const available = catItems.filter(i => i.id !== itemId);
            if (available.length > 0) {
                const newItem = pickRandom(available);
                const currentItems = [...renderedPreset.items];
                const idx = currentItems.findIndex((i: any) => i.id === itemId);
                if (idx !== -1) {
                    currentItems[idx] = { id: newItem.id, name: newItem.name || "새 아이템", type: currentItems[idx].type, rawCategory: category };
                    setRenderedPreset({ ...renderedPreset, items: currentItems });
                }
            }
            setSwappingItem(null);
        }, 400);
    };

    const commitOutfit = () => {
        if (!renderedPreset) return;
        setIsCommitted(true);
        const newCooldowns = { ...cooldownItems };
        const now = new Date().toISOString();
        renderedPreset.items.forEach((item: any) => {
            if (item.rawCategory !== "shoes" && item.rawCategory !== "accessory") {
                newCooldowns[item.id] = now;
            }
        });
        setCooldownItems(newCooldowns);
    };

    const searchCity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
            const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${API_KEY}`);
            const data = await res.json();
            if (Array.isArray(data)) setSearchResults(data);
        } catch { }
        finally { setIsSearching(false); }
    };

    const addCity = (geoItem: any) => {
        const newCity: City = { id: `${geoItem.lat}-${geoItem.lon}`, name: geoItem.name, lat: geoItem.lat, lon: geoItem.lon, landmarkLabel: geoItem.state || geoItem.country };
        if (!savedCities.find(c => c.id === newCity.id)) {
            const n = [...savedCities, newCity];
            setSavedCities(n);
            setCityIndex(n.length - 1);
        } else {
            setCityIndex(savedCities.findIndex(c => c.id === newCity.id));
        }
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const WeatherIcon = () => {
        const size = 56;
        const sw = 1.2;
        if (!weather) return <CloudSun size={size} strokeWidth={sw} />;
        const c = weather.icon_code;
        if (c.includes("01")) return c.includes("d") ? <Sun size={size} strokeWidth={sw} /> : <Moon size={size} strokeWidth={sw} />;
        if (["02", "03", "04"].some(x => c.includes(x))) return <Cloud size={size} strokeWidth={sw} />;
        if (["09", "10", "11"].some(x => c.includes(x))) return <CloudRain size={size} strokeWidth={sw} />;
        return <CloudSun size={size} strokeWidth={sw} />;
    };

    return (
        <div className={clsx("min-h-[100dvh] text-white transition-all duration-700 bg-gradient-to-b flex flex-col", getWeatherGradient(weather))}>
            {/* Header */}
            <header className="relative w-full pt-14 pb-2 px-[var(--space-page)] flex justify-between items-center z-20">
                <div className="flex items-center gap-1.5">
                    {savedCities.map((_, i) => (
                        <button key={i} onClick={() => setCityIndex(i)} className={clsx("rounded-full transition-all duration-300", i === cityIndex ? "w-5 h-[5px] bg-white" : "w-[5px] h-[5px] bg-white/30")} />
                    ))}
                </div>
                <button onClick={() => setIsSearchOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors">
                    <List size={18} className="text-white/80" />
                </button>
            </header>

            {/* Weather Hero */}
            <main className="flex-1 overflow-y-auto px-[var(--space-page)] pb-40 z-10 scrollbar-hide flex flex-col">
                <div className="flex flex-col items-center text-center mt-4 mb-8">
                    <p className="text-[15px] font-medium text-white/70 mb-1">{activeCity.name}</p>
                    {isLoadingWeather ? (
                        <div className="flex flex-col items-center gap-3 mt-6">
                            <div className="w-14 h-14 rounded-full bg-white/10 skeleton" />
                            <div className="h-16 w-28 rounded-2xl bg-white/10 skeleton" />
                        </div>
                    ) : weather ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                            <h1 className="text-[80px] font-[200] tracking-tighter leading-none my-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                                {weather.temp}°
                            </h1>
                            <p className="text-[17px] font-medium capitalize text-white/85 mb-3">{weather.description}</p>
                            <div className="flex items-center gap-4 text-[13px] text-white/60 font-medium">
                                <span className="flex items-center gap-1"><Droplets size={13} /> {weather.humidity}%</span>
                                <span>체감 {weather.feels_like}°</span>
                                <span className="flex items-center gap-1"><Wind size={13} /> {weather.wind_speed}m/s</span>
                            </div>
                        </motion.div>
                    ) : null}
                </div>

                {/* Outfit Card */}
                <div className="flex-1 w-full relative flex flex-col justify-end">
                    {wardrobe.length === 0 ? (
                        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.08] p-7 rounded-[var(--radius-xl)] text-center">
                            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} className="text-white/50" />
                            </div>
                            <h3 className="text-[18px] font-semibold mb-2 tracking-tight">옷장이 비어있어요</h3>
                            <p className="text-[14px] text-white/50 mb-6 leading-relaxed">맞춤 코디 추천을 위해<br />옷을 먼저 등록해주세요.</p>
                            <Link href="/wardrobe" className="block w-full py-[14px] text-[15px] bg-white text-black font-semibold rounded-[var(--radius-sm)] active:scale-[0.98] transition-transform">
                                옷 등록하러 가기
                            </Link>
                        </motion.div>
                    ) : !renderedPreset ? (
                        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.08] p-7 rounded-[var(--radius-xl)] h-52 skeleton" />
                    ) : (
                        <motion.div
                            key={renderedPreset.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 220, damping: 22 }}
                            className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.08] rounded-[var(--radius-xl)] overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-5 pt-5 pb-3">
                                <h3 className="font-semibold text-[16px] tracking-tight text-white/90">오늘의 추천 코디</h3>
                                <span className="text-[11px] font-semibold text-white/40 bg-white/[0.08] px-2.5 py-1 rounded-full">AI 추천</span>
                            </div>
                            <div className="px-3 pb-4 space-y-1.5">
                                {renderedPreset.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between bg-white/[0.05] hover:bg-white/[0.08] px-4 py-3.5 rounded-[var(--radius-md)] transition-colors">
                                        <div>
                                            <p className="text-[11px] text-white/40 font-semibold tracking-wider uppercase mb-0.5">{item.type}</p>
                                            <p className="font-medium text-[15px] tracking-tight">{item.name}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSwap(item.id, item.rawCategory)}
                                            className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center active:bg-white/20 transition-colors shrink-0"
                                        >
                                            <RefreshCw size={16} className={clsx("text-white/70", swappingItem === item.id && "animate-spin")} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Sticky CTA */}
            <AnimatePresence>
                {!isCommitted && wardrobe.length > 0 && renderedPreset && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-[68px] left-0 w-full px-[var(--space-page)] pb-4 z-40 flex justify-center pointer-events-none">
                        <button
                            onClick={commitOutfit}
                            className="pointer-events-auto max-w-[430px] w-full py-[15px] bg-white text-black text-[15px] font-semibold tracking-tight rounded-full shadow-xl active:scale-[0.98] transition-transform"
                        >
                            이 코디로 결정
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* City Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed inset-0 z-50 bg-[#0A0A0A] text-white flex flex-col"
                    >
                        <div className="px-[var(--space-page)] pt-14 pb-3 flex items-center gap-3">
                            <form onSubmit={searchCity} className="flex-1 relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    autoFocus type="text" placeholder="도시 이름으로 검색"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.08] rounded-[var(--radius-sm)] py-3 pl-10 pr-4 text-[15px] text-white placeholder:text-white/40 focus:bg-white/[0.12] transition-colors"
                                />
                            </form>
                            <button onClick={() => setIsSearchOpen(false)} className="text-[15px] font-medium text-white/60 active:text-white px-1 shrink-0">취소</button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-[var(--space-page)] pb-10">
                            {isSearching ? (
                                <p className="text-center text-white/40 mt-12 text-[14px]">검색 중...</p>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-1 mt-2">
                                    {searchResults.map((geo, i) => (
                                        <button key={i} onClick={() => addCity(geo)} className="w-full text-left px-4 py-3.5 rounded-[var(--radius-sm)] hover:bg-white/[0.06] transition-colors flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-[16px]">{geo.name}</p>
                                                <p className="text-[12px] text-white/40 mt-0.5">{geo.state ? `${geo.state}, ` : ""}{geo.country}</p>
                                            </div>
                                            <Plus size={18} className="text-white/30" />
                                        </button>
                                    ))}
                                </div>
                            ) : !searchQuery ? (
                                <div className="mt-6">
                                    <p className="text-[12px] font-semibold text-white/25 uppercase tracking-wider mb-3 px-1">저장된 도시</p>
                                    <div className="space-y-1">
                                        {savedCities.map((city, i) => (
                                            <div key={city.id} className="w-full text-left px-4 py-3.5 rounded-[var(--radius-sm)] bg-white/[0.04] flex justify-between items-center">
                                                <button onClick={() => { setCityIndex(i); setIsSearchOpen(false); }} className="flex-1 text-left">
                                                    <p className="font-semibold text-[16px]">{city.name}</p>
                                                    <p className="text-[12px] text-white/40 mt-0.5">{city.landmarkLabel}</p>
                                                </button>
                                                {savedCities.length > 1 && (
                                                    <button onClick={() => { const n = savedCities.filter(c => c.id !== city.id); setSavedCities(n); if (cityIndex >= n.length) setCityIndex(n.length - 1); }} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-white/40 mt-12 text-[14px]">결과가 없습니다</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Committed Success */}
            <AnimatePresence>
                {isCommitted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[var(--radius-xl)] w-full text-center text-black">
                            <div className="w-16 h-16 bg-[var(--foreground)] text-white rounded-full flex items-center justify-center mx-auto mb-5">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-[22px] font-bold tracking-tight mb-2">완벽해요!</h3>
                            <p className="text-neutral-500 text-[15px] mb-8 leading-relaxed">멋진 하루 보내세요.<br />선택한 아이템들은 쿨다운 중이에요.</p>
                            <button onClick={() => setIsCommitted(false)} className="w-full py-[14px] bg-neutral-100 text-black rounded-[var(--radius-sm)] font-semibold text-[15px] mb-3 active:bg-neutral-200 transition-colors">
                                다른 코디 보기
                            </button>
                            <Link href="/" className="block text-[13px] text-neutral-400 font-medium mt-1">홈으로</Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
