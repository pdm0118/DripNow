"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, CloudSun, Cloud, CloudRain, Sun, Moon,
    RefreshCw, CheckCircle2, Search, Plus, X, List, AlertCircle
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

const DEFAULT_CITY: City = { id: "seoul", name: "Seoul", lat: 37.5665, lon: 126.9780, landmarkLabel: "Current Location" };

const getDynamicBackground = (weather: WeatherData | null) => {
    if (!weather) return "from-neutral-900 to-black";
    const isDay = weather.icon_code.includes('d');
    const condition = weather.icon_code.slice(0, 2);

    if (isDay) {
        if (condition === '01') return "from-[#4dbce9] to-[#26a0da]";
        if (['02', '03', '04'].includes(condition)) return "from-[#7fa2b6] to-[#5a768c]";
        if (['09', '10', '11'].includes(condition)) return "from-[#4a5568] to-[#2d3748]";
        return "from-[#62778A] to-[#8799A8]";
    } else {
        if (condition === '01') return "from-[#0b2b5e] to-[#04122d]";
        if (['02', '03', '04'].includes(condition)) return "from-[#1b2735] to-[#090a0f]";
        if (['09', '10', '11'].includes(condition)) return "from-[#1a202c] to-[#050505]";
        return "from-[#1B2735] to-[#090A0F]";
    }
};

export default function DashboardPage() {
    // City Management
    const [savedCities, setSavedCities] = useLocalStorage<City[]>("dripnow_cities", [DEFAULT_CITY]);
    const [cityIndex, setCityIndex] = useState(0);
    const activeCity = savedCities[cityIndex] || DEFAULT_CITY;

    // Search Modal State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Weather State
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    // Wardrobe & Cooldowns
    const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>("dripnow_wardrobe", []);
    const [cooldownItems, setCooldownItems] = useLocalStorage<Record<string, string>>("dripnow_cooldowns", {});

    // Outfit State
    const [renderedPreset, setRenderedPreset] = useState<any>(null);
    const [swappingItem, setSwappingItem] = useState<string | null>(null);
    const [isCommitted, setIsCommitted] = useState(false);

    // 1. Fetch Weather
    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoadingWeather(true);
            setWeatherError(null);
            try {
                const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${activeCity.lat}&lon=${activeCity.lon}&units=metric&appid=${API_KEY}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();

                setWeather({
                    temp: Math.round(data.main.temp), feels_like: Math.round(data.main.feels_like),
                    humidity: data.main.humidity, wind_speed: data.wind.speed,
                    description: data.weather[0].description, icon_code: data.weather[0].icon,
                    city: data.name
                });
            } catch (err) {
                setWeatherError("날씨 연동 실패");
            } finally {
                setIsLoadingWeather(false);
            }
        };
        fetchWeather();
    }, [activeCity]);

    // 2. Wardrobe Logic (1-Tap Best Pick)
    const categorizedWardrobe = useMemo(() => {
        const now = new Date().getTime();
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

    // Generate 1 perfect look automatically
    useEffect(() => {
        if (wardrobe.length === 0 || isLoadingWeather || !weather) return;

        // Mock AI logic based on feels_like
        const needsOuter = weather.feels_like < 15;
        const outer = (needsOuter && categorizedWardrobe.outer.length > 0) ? pickRandom(categorizedWardrobe.outer) : null;
        const top = categorizedWardrobe.top.length > 0 ? pickRandom(categorizedWardrobe.top) : null;
        const bottom = categorizedWardrobe.bottom.length > 0 ? pickRandom(categorizedWardrobe.bottom) : null;
        const shoes = categorizedWardrobe.shoes.length > 0 ? pickRandom(categorizedWardrobe.shoes) : null;

        const items = [];
        if (outer) items.push({ id: outer.id, name: outer.name, type: "Outer", rawCategory: "outer" });
        if (top) items.push({ id: top.id, name: top.name, type: "Top", rawCategory: "top" });
        if (bottom) items.push({ id: bottom.id, name: bottom.name, type: "Bottom", rawCategory: "bottom" });
        if (shoes) items.push({ id: shoes.id, name: shoes.name, type: "Shoes", rawCategory: "shoes" });

        setRenderedPreset({
            id: `auto-${Date.now()}`, name: "Today's Perfect Fit", items
        });
    }, [categorizedWardrobe, weather, isLoadingWeather]);

    const handleSwap = (itemId: string, category: string) => {
        setSwappingItem(itemId);
        setTimeout(() => {
            const catItems = categorizedWardrobe[category as keyof typeof categorizedWardrobe];
            const available = catItems.filter(i => i.id !== itemId);
            if (available.length > 0) {
                const newItem = pickRandom(available);
                const currentItems = [...renderedPreset.items];
                const idx = currentItems.findIndex(i => i.id === itemId);
                if (idx !== -1) {
                    currentItems[idx] = { id: newItem.id, name: newItem.name || "새 아이템", type: currentItems[idx].type, rawCategory: category };
                    setRenderedPreset({ ...renderedPreset, items: currentItems });
                }
            } else {
                alert("옷장에 이 카테고리의 대체 옷이 없습니다.");
            }
            setSwappingItem(null);
        }, 500);
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

    // 3. City Search Feature
    const searchCity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
            const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${API_KEY}`);
            const data = await res.json();
            if (Array.isArray(data)) setSearchResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const addCity = (geoItem: any) => {
        const newCity: City = {
            id: `${geoItem.lat}-${geoItem.lon}`,
            name: geoItem.name,
            lat: geoItem.lat,
            lon: geoItem.lon,
            landmarkLabel: geoItem.state || geoItem.country
        };
        // Avoid duplicates
        if (!savedCities.find(c => c.id === newCity.id)) {
            const newCities = [...savedCities, newCity];
            setSavedCities(newCities);
            setCityIndex(newCities.length - 1);
        } else {
            setCityIndex(savedCities.findIndex(c => c.id === newCity.id));
        }
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const WeatherIcon = () => {
        if (!weather) return <CloudSun size={72} strokeWidth={1} />;
        if (weather.icon_code.includes('01')) return <Sun size={72} strokeWidth={1} />;
        if (['02', '03', '04'].some(c => weather.icon_code.includes(c))) return <Cloud size={72} strokeWidth={1} />;
        if (['09', '10', '11'].some(c => weather.icon_code.includes(c))) return <CloudRain size={72} strokeWidth={1} />;
        return <CloudSun size={72} strokeWidth={1} />;
    };

    return (
        <div className={clsx(
            "min-h-[100dvh] font-sans relative overflow-hidden text-white transition-all duration-1000 bg-gradient-to-b flex flex-col",
            getDynamicBackground(weather)
        )}>
            {/* Background 
            Typography Collage */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04] select-none flex items-center justify-center">
                <h1 className="text-[30vw] font-extrabold tracking-tighter uppercase leading-none whitespace-nowrap -rotate-12 scale-150">
                    {activeCity.name}
                </h1>
            </div>

            {/* Pagination / City Header (Mobile Optimized) */}
            <header className="relative w-full pt-12 pb-4 px-6 flex justify-between items-center z-20">
                <div className="flex gap-2">
                    {savedCities.map((_, i) => (
                        <div key={i} className={clsx("h-1.5 rounded-full transition-all duration-300", i === cityIndex ? "w-6 bg-white" : "w-1.5 bg-white/30")} />
                    ))}
                </div>
                <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-95 transition-transform"><List size={18} /></button>
            </header>

            {/* Scrollable Main Area (1-Tap Viewer) */}
            <main className="flex-1 overflow-y-auto px-6 pb-40 z-10 scrollbar-hide flex flex-col">

                {/* Weather Hero (Extremely Minimal) */}
                <div className="flex flex-col items-center justify-center text-center mt-6 mb-10">
                    <h2 className="text-3xl font-bold tracking-tight mb-1 drop-shadow-md">{activeCity.name}</h2>

                    {isLoadingWeather ? (
                        <div className="flex flex-col items-center animate-pulse mt-4">
                            <div className="w-20 h-20 bg-white/20 rounded-full mb-4" />
                            <div className="h-16 w-32 bg-white/20 rounded-2xl" />
                        </div>
                    ) : weather ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                            <h1 className="text-[7rem] font-extralight tracking-tighter leading-none drop-shadow-xl my-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                                {weather.temp}°
                            </h1>
                            <p className="text-xl font-medium tracking-wide capitalize opacity-90 drop-shadow-md">
                                {weather.description}
                            </p>
                            <div className="flex gap-4 mt-3 text-sm opacity-80 font-medium">
                                <span>H:{weather.humidity}%</span>
                                <span>W:{weather.wind_speed}m/s</span>
                            </div>
                        </motion.div>
                    ) : (
                        <p className="text-white/50 py-10">Failed to load weather</p>
                    )}
                </div>

                {/* 1-Tap Recommendations Card */}
                <div className="flex-1 w-full max-w-md mx-auto relative flex flex-col justify-end">
                    {wardrobe.length === 0 ? (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] text-center shadow-2xl">
                            <AlertCircle className="mx-auto mb-4 text-white/50" size={32} />
                            <h3 className="text-xl font-bold mb-2">옷장이 비어있습니다</h3>
                            <p className="text-sm text-white/70 mb-6">온도 맞춤 추천을 위해 옷을 등록해주세요.</p>
                            <Link href="/wardrobe" className="block w-full py-4 bg-white text-black font-bold rounded-2xl">옷 등록하기</Link>
                        </motion.div>
                    ) : !renderedPreset ? (
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] text-center animate-pulse h-64 flex items-center justify-center" />
                    ) : (
                        <motion.div
                            key={renderedPreset.id}
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white/15 backdrop-blur-[40px] border border-white/20 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] w-full"
                        >
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="font-bold text-lg">{renderedPreset.name}</h3>
                                <span className="text-[10px] uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Automated</span>
                            </div>

                            <div className="space-y-3">
                                {renderedPreset.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between bg-black/20 p-4 rounded-2xl group active:scale-[0.98] transition-all">
                                        <div>
                                            <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-0.5">{item.type}</p>
                                            <p className="font-medium text-[15px]">{item.name}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSwap(item.id, item.rawCategory)}
                                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 transition-colors"
                                        >
                                            <RefreshCw size={16} className={clsx(swappingItem === item.id && "animate-spin")} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* 1-Tap Sticky Action Button */}
            <AnimatePresence>
                {(!isCommitted && wardrobe.length > 0 && renderedPreset) && (
                    <motion.div
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 w-full p-6 pb-8 z-40 bg-gradient-to-t from-black/80 to-transparent flex justify-center backdrop-blur-sm pointer-events-none"
                    >
                        <button
                            onClick={commitOutfit}
                            className="pointer-events-auto max-w-md w-full py-5 bg-white text-black text-sm font-bold tracking-[0.1em] uppercase rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={18} /> 스타일 확정하기
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* City Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-50 bg-[#121212] text-white flex flex-col"
                    >
                        <div className="p-6 pt-12 flex items-center gap-4 border-b border-white/10">
                            <form onSubmit={searchCity} className="flex-1 relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search for a city..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                                />
                            </form>
                            <button onClick={() => setIsSearchOpen(false)} className="p-3 bg-white/10 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {isSearching ? (
                                <p className="text-center text-white/50 mt-10 animate-pulse">Searching global cities...</p>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((geo, i) => (
                                    <button
                                        key={i} onClick={() => addCity(geo)}
                                        className="w-full text-left p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-bold text-lg">{geo.name}</p>
                                            <p className="text-xs text-white/50">{geo.state ? `${geo.state}, ` : ""}{geo.country}</p>
                                        </div>
                                        <Plus size={20} className="text-white/50" />
                                    </button>
                                ))
                            ) : searchQuery && !isSearching ? (
                                <p className="text-center text-white/50 mt-10">No cities found.</p>
                            ) : (
                                <div className="mt-4">
                                    <p className="text-xs font-bold tracking-widest text-white/30 uppercase mb-4">Saved Cities</p>
                                    <div className="space-y-2">
                                        {savedCities.map((city, i) => (
                                            <div key={city.id} className="w-full text-left p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                                                <button onClick={() => { setCityIndex(i); setIsSearchOpen(false); }} className="flex-1 text-left">
                                                    <p className="font-bold text-lg">{city.name}</p>
                                                </button>
                                                {savedCities.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            const n = savedCities.filter(c => c.id !== city.id);
                                                            setSavedCities(n);
                                                            if (cityIndex >= n.length) setCityIndex(n.length - 1);
                                                        }}
                                                        className="p-2 text-white/30 hover:text-red-400"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Committed Success Modal Overlay */}
            <AnimatePresence>
                {isCommitted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 py-14 rounded-[2rem] max-w-sm w-full text-center shadow-2xl text-black">
                            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mb-4">You're Set!</h3>
                            <p className="text-neutral-600 font-medium mb-10 text-lg leading-relaxed">Have a great day.<br />Selected items are on cooldown.</p>
                            <button onClick={() => setIsCommitted(false)} className="w-full px-6 py-4 bg-neutral-100 text-black border border-neutral-200 rounded-2xl font-bold hover:bg-neutral-200 transition-colors mb-4">
                                Change Look
                            </button>
                            <Link href="/" className="inline-block mt-2 text-sm text-neutral-400 font-bold tracking-wider hover:text-black transition-colors uppercase">Return Home</Link>
                        </motion.div>
                    </motion.div>
                )}
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
