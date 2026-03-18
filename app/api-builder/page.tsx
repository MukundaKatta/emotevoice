"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ApiBuilder } from "@/components/api-builder/api-builder";

export default function ApiBuilderPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <ApiBuilder />
      </div>
    </AppShell>
  );
}
