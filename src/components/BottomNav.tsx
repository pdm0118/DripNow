"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, User } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
    const pathname = usePathname();

    // Only show on main app pages
    const allowedPaths = ["/dashboard", "/wardrobe", "/profile"];
    const showNav = allowedPaths.includes(pathname);

    if (!showNav) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-[#121212]/85 backdrop-blur-3xl border-t border-white/10 px-6 py-3 pb-safe flex justify-around items-center">
            <Link href="/dashboard" className="flex flex-col items-center gap-1.5 group w-16">
                <Home size={24} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} className={clsx("transition-colors", pathname === "/dashboard" ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                <span className={clsx("text-[10px] font-semibold tracking-wide", pathname === "/dashboard" ? "text-white" : "text-white/40")}>투데이</span>
            </Link>

            <Link href="/wardrobe" className="flex flex-col items-center gap-1.5 group w-16">
                <Shirt size={24} strokeWidth={pathname === "/wardrobe" ? 2.5 : 2} className={clsx("transition-colors", pathname === "/wardrobe" ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                <span className={clsx("text-[10px] font-semibold tracking-wide", pathname === "/wardrobe" ? "text-white" : "text-white/40")}>옷장</span>
            </Link>

            <Link href="/onboarding" className="flex flex-col items-center gap-1.5 group w-16">
                <User size={24} strokeWidth={pathname === "/onboarding" ? 2.5 : 2} className={clsx("transition-colors", pathname === "/onboarding" ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                <span className={clsx("text-[10px] font-semibold tracking-wide", pathname === "/onboarding" ? "text-white" : "text-white/40")}>마이</span>
            </Link>
        </div>
    );
}
