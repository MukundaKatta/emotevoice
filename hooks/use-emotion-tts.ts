"use client";

import { useCallback, useRef } from "react";
import { EmotionType } from "@/types/emotions";
import { useEmotionStore } from "@/store/emotion-store";

const EMOTION_VOICE_PARAMS: Record<
  EmotionType,
  { rate: number; pitch: number; volume: number }
> = {
  joy: { rate: 1.15, pitch: 1.3, volume: 0.9 },
  sadness: { rate: 0.8, pitch: 0.7, volume: 0.6 },
  anger: { rate: 1.2, pitch: 0.9, volume: 1.0 },
  fear: { rate: 1.3, pitch: 1.4, volume: 0.7 },
  surprise: { rate: 1.1, pitch: 1.5, volume: 0.95 },
  disgust: { rate: 0.9, pitch: 0.8, volume: 0.7 },
  contempt: { rate: 0.85, pitch: 0.9, volume: 0.65 },
  neutral: { rate: 1.0, pitch: 1.0, volume: 0.8 },
  love: { rate: 0.9, pitch: 1.1, volume: 0.75 },
  excitement: { rate: 1.3, pitch: 1.4, volume: 1.0 },
  calm: { rate: 0.8, pitch: 0.9, volume: 0.6 },
  anxiety: { rate: 1.25, pitch: 1.2, volume: 0.8 },
};

export function useEmotionTTS() {
  const { ttsEmotion, setTtsEmotion, ttsSpeaking, setTtsSpeaking } =
    useEmotionStore();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, emotion?: EmotionType) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const activeEmotion = emotion || ttsEmotion;
      const params = EMOTION_VOICE_PARAMS[activeEmotion];

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = params.rate;
      utterance.pitch = params.pitch;
      utterance.volume = params.volume;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Google")
        );
        utterance.voice = preferredVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0];
      }

      utterance.onstart = () => setTtsSpeaking(true);
      utterance.onend = () => setTtsSpeaking(false);
      utterance.onerror = () => setTtsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [ttsEmotion, setTtsSpeaking]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTtsSpeaking(false);
    }
  }, [setTtsSpeaking]);

  return {
    speak,
    stop,
    ttsEmotion,
    setTtsEmotion,
    isSpeaking: ttsSpeaking,
    voiceParams: EMOTION_VOICE_PARAMS,
  };
}
