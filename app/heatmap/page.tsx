"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmotionHeatmap } from "@/components/heatmap/emotion-heatmap";

export default function HeatmapPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <EmotionHeatmap />
      </div>
    </AppShell>
  );
}
