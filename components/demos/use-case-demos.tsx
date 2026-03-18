"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEmotionTTS } from "@/hooks/use-emotion-tts";
import {
  DemoScenario,
  DemoDialogueLine,
  EMOTION_COLORS,
  EMOTION_LABELS,
  EmotionType,
} from "@/types/emotions";
import { Play, Headphones, Phone, Brain, TrendingUp } from "lucide-react";

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "cs-1",
    name: "Frustrated Customer Call",
    category: "customer-service",
    description:
      "A customer calls about a billing error. The agent must detect escalating frustration and respond empathetically.",
    sampleDialogue: [
      { speaker: "customer", text: "I have been waiting on hold for thirty minutes. This is unacceptable!", emotion: "anger", intensity: 0.8 },
      { speaker: "agent", text: "I sincerely apologize for the long wait time. I understand how frustrating that must be. Let me help you right away.", emotion: "calm", intensity: 0.9 },
      { speaker: "customer", text: "My bill is completely wrong. You charged me twice for the same service!", emotion: "anger", intensity: 0.9 },
      { speaker: "agent", text: "I can see how upsetting that would be. Let me pull up your account and fix this immediately. I want to make sure this is resolved for you today.", emotion: "calm", intensity: 0.85 },
      { speaker: "customer", text: "Well, okay. I just want it fixed. I have been a loyal customer for five years.", emotion: "sadness", intensity: 0.5 },
      { speaker: "agent", text: "And we truly value your loyalty. I have found the duplicate charge and I am reversing it right now. You will also receive a credit for the inconvenience.", emotion: "joy", intensity: 0.7 },
    ],
    emotionFlow: ["anger", "calm", "anger", "calm", "sadness", "joy"],
  },
  {
    id: "th-1",
    name: "Anxiety Management Session",
    category: "therapy",
    description:
      "A therapy session focused on anxiety. Voice analysis helps the therapist track emotional state throughout the conversation.",
    sampleDialogue: [
      { speaker: "patient", text: "I have been feeling really overwhelmed lately. Work has been so stressful and I cannot sleep.", emotion: "anxiety", intensity: 0.85 },
      { speaker: "therapist", text: "Thank you for sharing that with me. It takes courage to talk about these feelings. Can you tell me more about what is causing the most stress?", emotion: "calm", intensity: 0.9 },
      { speaker: "patient", text: "There is a big project deadline coming up. I am terrified I will fail and everyone will judge me.", emotion: "fear", intensity: 0.8 },
      { speaker: "therapist", text: "Those fears are very understandable. Many people experience similar worries. Let us work through a breathing exercise together first.", emotion: "calm", intensity: 0.95 },
      { speaker: "patient", text: "Okay... the breathing does help a little. I feel slightly less tense now.", emotion: "calm", intensity: 0.5 },
      { speaker: "therapist", text: "That is wonderful progress. Your body is learning to respond to the relaxation technique. Let us build on this.", emotion: "joy", intensity: 0.6 },
    ],
    emotionFlow: ["anxiety", "calm", "fear", "calm", "calm", "joy"],
  },
  {
    id: "sc-1",
    name: "Sales Pitch Coaching",
    category: "sales-coaching",
    description:
      "A sales coach reviews a rep's call recording, analyzing emotional dynamics to improve persuasion techniques.",
    sampleDialogue: [
      { speaker: "coach", text: "Let us review your call with the prospect. Your opening was strong but I noticed your energy dropped midway.", emotion: "neutral", intensity: 0.6 },
      { speaker: "rep", text: "Yes, I think I got nervous when they asked about pricing. I was not sure how to handle the objection.", emotion: "anxiety", intensity: 0.7 },
      { speaker: "coach", text: "That is completely normal! The key is to match their energy. When they expressed excitement about the product, you should have amplified that.", emotion: "excitement", intensity: 0.75 },
      { speaker: "rep", text: "Oh, I see! So when the client said they loved the demo, I should have been more enthusiastic in my response?", emotion: "surprise", intensity: 0.6 },
      { speaker: "coach", text: "Exactly! Let us practice. I will play the client and you match my emotional energy. Ready? I am so impressed with what I have seen today!", emotion: "excitement", intensity: 0.9 },
      { speaker: "rep", text: "That is so great to hear! I am thrilled you see the value. Let me show you how this can transform your workflow even further!", emotion: "excitement", intensity: 0.85 },
    ],
    emotionFlow: ["neutral", "anxiety", "excitement", "surprise", "excitement", "excitement"],
  },
];

export function UseCaseDemos() {
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const { speak, stop, isSpeaking } = useEmotionTTS();

  const handlePlayLine = (line: DemoDialogueLine, index: number) => {
    if (isSpeaking) {
      stop();
      if (playingLine === index) {
        setPlayingLine(null);
        return;
      }
    }
    setPlayingLine(index);
    speak(line.text, line.emotion);
    // Auto-clear after approx speaking time
    setTimeout(() => setPlayingLine(null), line.text.length * 60 + 1000);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "customer-service": return <Phone className="w-4 h-4" />;
      case "therapy": return <Brain className="w-4 h-4" />;
      case "sales-coaching": return <TrendingUp className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "customer-service": return "Customer Service";
      case "therapy": return "Therapy & Wellness";
      case "sales-coaching": return "Sales Coaching";
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Use Case Demos</h2>
        <p className="text-sm text-surface-400 mt-1">
          Interactive demonstrations of empathic voice AI across industries
        </p>
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              activeScenario.id === scenario.id
                ? "glass-strong border-brand-500/50 shadow-lg shadow-brand-500/10"
                : "glass border-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(scenario.category)}
              <Badge variant="outline">
                {getCategoryLabel(scenario.category)}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              {scenario.name}
            </h3>
            <p className="text-xs text-surface-400 line-clamp-2">
              {scenario.description}
            </p>
          </button>
        ))}
      </div>

      {/* Active scenario */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {activeScenario.name}
              </h3>
              <p className="text-sm text-surface-400 mt-1">
                {activeScenario.description}
              </p>
            </div>
            <Badge variant="outline">
              {getCategoryLabel(activeScenario.category)}
            </Badge>
          </div>

          {/* Emotion flow */}
          <div>
            <p className="text-xs text-surface-400 mb-2 uppercase tracking-wider">
              Emotion Flow
            </p>
            <div className="flex items-center gap-1">
              {activeScenario.emotionFlow.map((emotion, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      color: EMOTION_COLORS[emotion],
                      backgroundColor: `${EMOTION_COLORS[emotion]}15`,
                    }}
                  >
                    {EMOTION_LABELS[emotion]}
                  </div>
                  {i < activeScenario.emotionFlow.length - 1 && (
                    <div className="w-4 h-px bg-surface-600 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dialogue */}
          <div className="space-y-3">
            <p className="text-xs text-surface-400 uppercase tracking-wider">
              Interactive Dialogue
            </p>
            {activeScenario.sampleDialogue.map((line, i) => {
              const isLeft = ["customer", "patient", "rep"].includes(line.speaker);
              return (
                <div
                  key={i}
                  className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl p-3 border ${
                      isLeft
                        ? "rounded-tl-sm bg-surface-800/80 border-surface-700"
                        : "rounded-tr-sm glass border-brand-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-surface-400 capitalize">
                        {line.speaker}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="emotion"
                          color={EMOTION_COLORS[line.emotion]}
                          className="text-[10px]"
                        >
                          {EMOTION_LABELS[line.emotion]} ({(line.intensity * 100).toFixed(0)}%)
                        </Badge>
                        <button
                          onClick={() => handlePlayLine(line, i)}
                          className={`p-1 rounded transition-colors ${
                            playingLine === i
                              ? "text-brand-400"
                              : "text-surface-500 hover:text-white"
                          }`}
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-white leading-relaxed">
                      {line.text}
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={line.intensity * 100}
                        color={EMOTION_COLORS[line.emotion]}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
