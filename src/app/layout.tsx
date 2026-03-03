import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DripNow | No More Outfit Dilemmas",
  description: "Your personal, weather-aware daily outfit recommender.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr" className="scroll-smooth">
      <body className="antialiased text-[var(--foreground)] bg-[var(--background)]">
        {children}
      </body>
    </html>
  );
}
