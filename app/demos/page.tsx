"use client";

import { AppShell } from "@/components/layout/app-shell";
import { UseCaseDemos } from "@/components/demos/use-case-demos";

export default function DemosPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <UseCaseDemos />
      </div>
    </AppShell>
  );
}
