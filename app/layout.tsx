import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EmoteVoice — Empathic Voice AI Platform",
  description:
    "Real-time voice emotion detection, sentiment analysis, and emotion-responsive AI. Powered by Web Audio API and advanced acoustic analysis.",
  keywords: [
    "voice emotion detection",
    "sentiment analysis",
    "empathic AI",
    "voice analytics",
    "emotion recognition",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
