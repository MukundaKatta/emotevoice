"use client";

import { useState } from "react";
import { useEmotionTTS } from "@/hooks/use-emotion-tts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ALL_EMOTIONS,
  EMOTION_COLORS,
  EMOTION_LABELS,
  EmotionType,
} from "@/types/emotions";
import { Volume2, VolumeX, Play, Square } from "lucide-react";

const SAMPLE_TEXTS: Record<string, string> = {
  greeting: "Hello! It is so wonderful to see you today. I hope you are having an absolutely fantastic day!",
  empathy: "I understand how you feel. That must be really difficult. I am here for you and want to help in any way I can.",
  excitement: "This is incredible news! I cannot believe it! Everything is coming together perfectly and I am so thrilled!",
  calm: "Take a deep breath. Everything is going to be alright. Let us take this one step at a time, peacefully.",
  concern: "I noticed something might be wrong. Are you okay? Please do not hesitate to share what is on your mind.",
};

export function EmotionTTSPanel() {
  const { speak, stop, ttsEmotion, setTtsEmotion, isSpeaking, voiceParams } =
    useEmotionTTS();
  const [customText, setCustomText] = useState("");
  const [selectedSample, setSelectedSample] = useState("greeting");

  const handleSpeak = () => {
    const text = customText || SAMPLE_TEXTS[selectedSample];
    speak(text);
  };

  const params = voiceParams[ttsEmotion];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-1">
        Emotion-Responsive TTS
      </h3>
      <p className="text-sm text-surface-400 mb-6">
        Synthesize speech with emotional expression using Web Speech API
      </p>

      {/* Emotion selector */}
      <div className="mb-6">
        <p className="text-xs text-surface-400 mb-3 uppercase tracking-wider">
          Select Voice Emotion
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              onClick={() => setTtsEmotion(emotion)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                ttsEmotion === emotion
                  ? "border-current shadow-lg scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              style={{
                color: EMOTION_COLORS[emotion],
                backgroundColor:
                  ttsEmotion === emotion
                    ? `${EMOTION_COLORS[emotion]}20`
                    : "transparent",
              }}
            >
              {EMOTION_LABELS[emotion]}
            </button>
          ))}
        </div>
      </div>

      {/* Voice parameters display */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-xs text-surface-400 mb-1">Rate</p>
          <p className="text-lg font-bold text-white">{params.rate.toFixed(2)}x</p>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-xs text-surface-400 mb-1">Pitch</p>
          <p className="text-lg font-bold text-white">{params.pitch.toFixed(2)}</p>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-xs text-surface-400 mb-1">Volume</p>
          <p className="text-lg font-bold text-white">
            {(params.volume * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Sample text selector */}
      <div className="mb-4">
        <p className="text-xs text-surface-400 mb-2 uppercase tracking-wider">
          Sample Texts
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SAMPLE_TEXTS).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedSample(key);
                setCustomText("");
              }}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                selectedSample === key && !customText
                  ? "bg-brand-600 text-white"
                  : "bg-surface-800 text-surface-400 hover:text-white"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <textarea
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder={SAMPLE_TEXTS[selectedSample]}
        className="w-full h-24 bg-surface-800 border border-surface-600 rounded-lg p-3 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-brand-500 mb-4"
      />

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={handleSpeak}
          disabled={isSpeaking}
          className="flex-1"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Speak with {EMOTION_LABELS[ttsEmotion]}
        </Button>
        {isSpeaking && (
          <Button onClick={stop} variant="danger" size="lg">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      {isSpeaking && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Volume2
            className="w-5 h-5 animate-pulse"
            style={{ color: EMOTION_COLORS[ttsEmotion] }}
          />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-brand-500 rounded-full waveform-bar"
                style={{
                  backgroundColor: EMOTION_COLORS[ttsEmotion],
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: EMOTION_COLORS[ttsEmotion] }}
          >
            Speaking...
          </span>
        </div>
      )}
    </Card>
  );
}
