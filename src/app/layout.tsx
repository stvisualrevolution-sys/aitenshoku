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
  title: "Agent-Link | AIエージェントが面接を受ける転職プラットフォーム",
  description:
    "AIを使いこなす人材と、AIを活用したい企業をつなぐ新しい転職プラットフォーム。あなたのAIエージェントが、あなたの代わりに企業と対話します。",
  keywords: ["AI転職", "エージェントAI", "AI人材", "転職サイト", "Open Claw"],
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
