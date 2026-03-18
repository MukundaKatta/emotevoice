"use client";

import { useState, useMemo } from "react";
import { analyzeSentiment, createEmotionAnalysis } from "@/lib/emotion-engine";
import { useEmotionStore } from "@/store/emotion-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  EMOTION_COLORS,
  EMOTION_LABELS,
  AudioFeatures,
  EmotionScore,
} from "@/types/emotions";
import { MessageSquare, Send, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentResult {
  id: string;
  text: string;
  score: number;
  label: "positive" | "negative" | "neutral" | "mixed";
  emotions: EmotionScore[];
  timestamp: number;
}

export function SentimentAnalyzer() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<SentimentResult[]>([]);
  const { addToHistory } = useEmotionStore();

  const handleAnalyze = () => {
    if (!text.trim()) return;

    const result = analyzeSentiment(text.trim());
    const entry: SentimentResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: text.trim(),
      ...result,
      timestamp: Date.now(),
    };

    setResults((prev) => [entry, ...prev]);

    // Also add to global store
    const dummyFeatures: AudioFeatures = {
      pitch: 150,
      pitchVariance: 20,
      energy: 0.3,
      tempo: 100,
      spectralCentroid: 1500,
      zeroCrossingRate: 0.1,
      mfcc: new Array(13).fill(0),
      formants: [],
      harmonicity: 0.5,
      jitter: 0.02,
      shimmer: 0.05,
    };
    const analysis = createEmotionAnalysis(
      result.emotions,
      dummyFeatures,
      0,
      text.trim(),
      "text"
    );
    addToHistory(analysis);
    setText("");
  };

  const aggregateStats = useMemo(() => {
    if (results.length === 0) return null;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const posCount = results.filter((r) => r.label === "positive").length;
    const negCount = results.filter((r) => r.label === "negative").length;
    const neuCount = results.filter((r) => r.label === "neutral").length;
    const mixCount = results.filter((r) => r.label === "mixed").length;
    return { avgScore, posCount, negCount, neuCount, mixCount, total: results.length };
  }, [results]);

  const getSentimentIcon = (label: string) => {
    if (label === "positive") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (label === "negative") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-surface-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Sentiment Analysis</h2>
        <p className="text-sm text-surface-400 mt-1">
          Analyze text for emotional content and sentiment polarity
        </p>
      </div>

      {/* Input */}
      <Card>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            placeholder="Enter text to analyze sentiment and detect emotions..."
            className="w-full h-32 bg-surface-800 border border-surface-600 rounded-lg p-4 text-sm text-white placeholder-surface-500 resize-none focus:outline-none focus:border-brand-500"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-surface-500">
              Press Enter to analyze, Shift+Enter for new line
            </span>
            <Button onClick={handleAnalyze} disabled={!text.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </div>
        </div>
      </Card>

      {/* Aggregate stats */}
      {aggregateStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="text-center">
            <p className="text-xs text-surface-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{aggregateStats.total}</p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-surface-400 mb-1">Avg Score</p>
            <p
              className={`text-2xl font-bold ${
                aggregateStats.avgScore > 0
                  ? "text-emerald-400"
                  : aggregateStats.avgScore < 0
                  ? "text-red-400"
                  : "text-surface-300"
              }`}
            >
              {aggregateStats.avgScore > 0 ? "+" : ""}
              {aggregateStats.avgScore.toFixed(2)}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-emerald-400 mb-1">Positive</p>
            <p className="text-2xl font-bold text-emerald-400">
              {aggregateStats.posCount}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-red-400 mb-1">Negative</p>
            <p className="text-2xl font-bold text-red-400">
              {aggregateStats.negCount}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-xs text-surface-400 mb-1">Neutral/Mixed</p>
            <p className="text-2xl font-bold text-surface-300">
              {aggregateStats.neuCount + aggregateStats.mixCount}
            </p>
          </Card>
        </div>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-surface-500 opacity-50" />
          <p className="text-surface-500">
            Enter text above to perform sentiment analysis
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-surface-300">
              Analysis Results
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setResults([])}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear All
            </Button>
          </div>
          {results.map((r) => (
            <Card key={r.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-white flex-1 mr-4 leading-relaxed">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getSentimentIcon(r.label)}
                    <Badge
                      variant="emotion"
                      color={
                        r.label === "positive"
                          ? "#10b981"
                          : r.label === "negative"
                          ? "#ef4444"
                          : r.label === "mixed"
                          ? "#f59e0b"
                          : "#94a3b8"
                      }
                    >
                      {r.label} ({r.score > 0 ? "+" : ""}{r.score.toFixed(2)})
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {r.emotions.slice(0, 4).map((e) => (
                    <div key={e.emotion} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: EMOTION_COLORS[e.emotion] }}>
                          {EMOTION_LABELS[e.emotion]}
                        </span>
                        <span className="text-surface-500">
                          {(e.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={e.score * 100}
                        color={EMOTION_COLORS[e.emotion]}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
