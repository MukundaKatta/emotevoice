"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SentimentAnalyzer } from "@/components/sentiment/sentiment-analyzer";

export default function SentimentPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <SentimentAnalyzer />
      </div>
    </AppShell>
  );
}
