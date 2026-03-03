"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Shirt, User } from "lucide-react";
import clsx from "clsx";

const tabs = [
    { href: "/dashboard", icon: Sun, label: "투데이" },
    { href: "/wardrobe", icon: Shirt, label: "옷장" },
    { href: "/onboarding", icon: User, label: "마이" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const showNav = ["/dashboard", "/wardrobe", "/onboarding"].some(p => pathname.startsWith(p));
    if (!showNav) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--separator)] pb-safe">
            <div className="mx-auto max-w-[430px] flex justify-around items-center h-[52px]">
                {tabs.map(tab => {
                    const isActive = pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-[2px] w-[64px] py-1 transition-colors duration-200",
                                isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
                            )}
                        >
                            <tab.icon
                                size={22}
                                strokeWidth={isActive ? 2.2 : 1.6}
                                className="transition-all duration-200"
                            />
                            <span className={clsx(
                                "text-[10px] leading-tight transition-all duration-200",
                                isActive ? "font-bold" : "font-medium"
                            )}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
