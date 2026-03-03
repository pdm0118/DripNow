"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Shirt, User } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
    const pathname = usePathname();
    const showNav = ["/dashboard", "/wardrobe", "/onboarding"].some(p => pathname.startsWith(p));
    if (!showNav) return null;

    const tabs = [
        { href: "/dashboard", icon: Sun, label: "투데이" },
        { href: "/wardrobe", icon: Shirt, label: "옷장" },
        { href: "/onboarding", icon: User, label: "마이" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-[var(--background)]/80 backdrop-blur-2xl border-t border-[var(--separator)] pb-safe">
            <div className="flex justify-around items-center h-[50px]">
                {tabs.map(tab => {
                    const isActive = pathname.startsWith(tab.href);
                    return (
                        <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 w-16 pt-1">
                            <tab.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} className={clsx("transition-colors", isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]")} />
                            <span className={clsx("text-[10px] font-medium", isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]")}>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
