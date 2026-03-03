"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
    title: string;
    backHref?: string;
    right?: React.ReactNode;
    transparent?: boolean;
}

export default function PageHeader({ title, backHref, right, transparent }: PageHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backHref) router.push(backHref);
        else router.back();
    };

    return (
        <header className={transparent ? "sticky top-0 z-30" : "page-header"}>
            <div className="flex items-center justify-between h-[56px] px-[var(--space-page)]">
                {backHref !== undefined ? (
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-[var(--card-bg)] transition-colors"
                    >
                        <ArrowLeft size={22} strokeWidth={2} />
                    </button>
                ) : (
                    <div className="w-10" />
                )}
                <span className="text-[var(--text-md)] font-semibold absolute left-1/2 -translate-x-1/2" style={{ fontSize: "var(--text-md)" }}>
                    {title}
                </span>
                <div className="w-10 flex items-center justify-end">
                    {right}
                </div>
            </div>
        </header>
    );
}
