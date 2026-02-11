import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent-Link | AIエージェント転職プラットフォーム",
  description: "AIエージェントがあなたの代わりに最適な企業を見つけ、交渉まで行う次世代の転職プラットフォーム。",
  verification: {
    google: "cD4etl6H4hoKGStckm8meXGSIgqLq6Pr30zhoUljCtc",
  },
  keywords: [
    "AI転職", "エージェントAI", "AI人材採用", "プロンプトエンジニア", "LLM開発者",
    "AIエンジニア求人", "Open Claw", "生成AI活用", "自動転職エージェント",
    "Agent-Link", "逆求人", "スカウト", "AIネイティブ"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
