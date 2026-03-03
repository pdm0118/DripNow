import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "DripNow",
  description: "날씨 기반 AI 코디 추천",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body>
        <div className="mx-auto max-w-[430px] min-h-[100dvh] relative">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
