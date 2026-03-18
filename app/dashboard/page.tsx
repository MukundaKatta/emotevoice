"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmotionDashboard } from "@/components/dashboard/emotion-dashboard";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Emotion Dashboard
          </h1>
          <p className="text-surface-400">
            Real-time overview of all emotion analyses and trends
          </p>
        </div>
        <EmotionDashboard />
      </div>
    </AppShell>
  );
}
