"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BatchAnalysis } from "@/components/batch/batch-analysis";

export default function BatchAnalysisPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <BatchAnalysis />
      </div>
    </AppShell>
  );
}
