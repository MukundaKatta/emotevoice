"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmotionTimeline } from "@/components/timeline/emotion-timeline";

export default function TimelinePage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <EmotionTimeline />
      </div>
    </AppShell>
  );
}
