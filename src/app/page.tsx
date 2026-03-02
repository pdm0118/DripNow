

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 font-sans relative overflow-hidden">
      {/* Background Decorative Graphic */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)] opacity-5 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neutral-400 opacity-5 rounded-full blur-3xl pointer-events-none" />

      <main className="flex flex-col items-center gap-8 z-10 text-center max-w-2xl">
        {/* App Logo / Name */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-[var(--accent-foreground)] font-bold text-xl shadow-lg transform rotate-3">
            DN
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            DripNow
          </h1>
        </div>

        {/* Hero Copy */}
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            바쁜 아침, <br className="sm:hidden" />당신의 옷 고민을 <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-800 to-neutral-400 dark:from-neutral-100 dark:to-neutral-500">0으로 만듭니다.</span>
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg sm:text-xl leading-relaxed max-w-md mx-auto">
            날씨, 체감온도, 그리고 당신의 체형에 맞춘 완벽한 코디를 단 1초 만에 확인하세요.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full justify-center">
          <button className="animate-hover flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 text-lg font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
            내 옷장 만들기
          </button>
          <button className="animate-hover flex items-center justify-center gap-2 rounded-full bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] px-8 py-4 text-lg font-medium shadow-sm hover:bg-[var(--muted)] transition-all">
            오늘 뭐 입지?
          </button>
        </div>
      </main>

      <footer className="absolute bottom-8 text-[var(--muted-foreground)] text-sm flex gap-4 text-center z-10">
        <p>© 2026 DripNow. The Future of Wardrobe.</p>
      </footer>
    </div>
  );
}
