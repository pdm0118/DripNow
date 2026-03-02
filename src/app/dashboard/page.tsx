export default function DashboardPage() {
    return (
        <div className="min-h-screen p-8 bg-[var(--background)]">
            <div className="max-w-4xl mx-auto mt-10">
                <h1 className="text-3xl font-bold mb-8">오늘의 코디 추천</h1>
                {/* 추천 UI가 들어갈 자리 */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="h-64 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-sm flex items-center justify-center">
                        <p className="text-sm text-[var(--muted-foreground)]">코디 제안 A</p>
                    </div>
                    <div className="h-64 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-sm flex items-center justify-center">
                        <p className="text-sm text-[var(--muted-foreground)]">코디 제안 B</p>
                    </div>
                    <div className="h-64 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-sm flex items-center justify-center">
                        <p className="text-sm text-[var(--muted-foreground)]">코디 제안 C</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
