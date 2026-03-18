"use client";

import { AppShell } from "@/components/layout/app-shell";
import { VoiceRecorder } from "@/components/voice/voice-recorder";
import { EmotionTTSPanel } from "@/components/voice/emotion-tts-panel";

export default function HomePage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            EmoteVoice Platform
          </h1>
          <p className="text-surface-400">
            Capture, analyze, and respond to human emotions through voice and
            text. Real-time detection powered by Web Audio API.
          </p>
        </div>

        <VoiceRecorder />

        <div className="pt-4">
          <EmotionTTSPanel />
        </div>
      </div>
    </AppShell>
  );
}
