export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--background)]">
            <div className="max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-4">환영합니다!</h1>
                <p className="text-[var(--muted-foreground)] mb-8">당신에게 딱 맞는 코디를 위해 몇 가지 정보를 알려주세요.</p>
                {/* 온보딩 폼이 들어갈 자리 */}
                <div className="p-8 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-sm">
                    <p className="text-sm text-[var(--muted-foreground)] animate-pulse">온보딩 UI 구현 예정...</p>
                </div>
            </div>
        </div>
    );
}
