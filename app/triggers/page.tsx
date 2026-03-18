"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmotionTriggers } from "@/components/triggers/emotion-triggers";

export default function TriggersPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <EmotionTriggers />
      </div>
    </AppShell>
  );
}
