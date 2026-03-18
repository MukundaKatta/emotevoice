"use client";

import { useEmotionStore } from "@/store/emotion-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  EMOTION_COLORS,
  EMOTION_LABELS,
  ALL_EMOTIONS,
  EmotionType,
} from "@/types/emotions";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Mic,
  Activity,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

export function EmotionDashboard() {
  const { analysisHistory, currentAnalysis, realtimeScores, timeline } =
    useEmotionStore();

  const stats = useMemo(() => {
    if (analysisHistory.length === 0) {
      return {
        totalAnalyses: 0,
        avgSentiment: 0,
        dominantEmotion: "neutral" as EmotionType,
        emotionDistribution: ALL_EMOTIONS.map((e) => ({
          emotion: e,
          count: 0,
          percentage: 0,
        })),
        recentTrend: [] as { emotion: EmotionType; score: number }[],
        avgDuration: 0,
      };
    }

    const emotionCounts: Record<string, number> = {};
    let sentimentSum = 0;
    let durationSum = 0;

    analysisHistory.forEach((a) => {
      emotionCounts[a.dominantEmotion] =
        (emotionCounts[a.dominantEmotion] || 0) + 1;
      sentimentSum += a.sentimentScore;
      durationSum += a.duration;
    });

    const total = analysisHistory.length;
    const dominantEmotion = (Object.entries(emotionCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "neutral") as EmotionType;

    const emotionDistribution = ALL_EMOTIONS.map((e) => ({
      emotion: e,
      count: emotionCounts[e] || 0,
      percentage: ((emotionCounts[e] || 0) / total) * 100,
    })).sort((a, b) => b.count - a.count);

    const recent = analysisHistory.slice(0, 10);
    const recentTrend = recent.map((a) => ({
      emotion: a.dominantEmotion,
      score: a.scores[0]?.score || 0,
    }));

    return {
      totalAnalyses: total,
      avgSentiment: sentimentSum / total,
      dominantEmotion,
      emotionDistribution,
      recentTrend,
      avgDuration: durationSum / total,
    };
  }, [analysisHistory]);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-surface-400 mb-1">Total Analyses</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalAnalyses}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-brand-400" />
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-surface-400 mb-1">Dominant Emotion</p>
              <p
                className="text-2xl font-bold"
                style={{ color: EMOTION_COLORS[stats.dominantEmotion] }}
              >
                {EMOTION_LABELS[stats.dominantEmotion]}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-surface-400 mb-1">Avg Sentiment</p>
              <p
                className={`text-3xl font-bold ${
                  stats.avgSentiment > 0
                    ? "text-emerald-400"
                    : stats.avgSentiment < 0
                    ? "text-red-400"
                    : "text-surface-300"
                }`}
              >
                {stats.avgSentiment > 0 ? "+" : ""}
                {stats.avgSentiment.toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-surface-400 mb-1">Timeline Points</p>
              <p className="text-3xl font-bold text-white">{timeline.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Emotion distribution */}
      <Card>
        <h3 className="text-sm font-medium text-surface-300 mb-4">
          Emotion Distribution
        </h3>
        {stats.totalAnalyses === 0 ? (
          <div className="text-center py-12 text-surface-500">
            <Mic className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No analyses yet. Start recording to see emotion data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.emotionDistribution
              .filter((d) => d.count > 0)
              .map((d) => (
                <div key={d.emotion} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: EMOTION_COLORS[d.emotion] }}
                      />
                      <span style={{ color: EMOTION_COLORS[d.emotion] }}>
                        {EMOTION_LABELS[d.emotion]}
                      </span>
                    </div>
                    <span className="text-surface-400">
                      {d.count} ({d.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={d.percentage}
                    color={EMOTION_COLORS[d.emotion]}
                    size="sm"
                  />
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Recent analyses */}
      <Card>
        <h3 className="text-sm font-medium text-surface-300 mb-4">
          Recent Analyses
        </h3>
        {analysisHistory.length === 0 ? (
          <p className="text-center py-8 text-surface-500 text-sm">
            No analysis history yet
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {analysisHistory.slice(0, 20).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: EMOTION_COLORS[a.dominantEmotion],
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {EMOTION_LABELS[a.dominantEmotion]}
                    </p>
                    <p className="text-xs text-surface-500">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="emotion"
                    color={
                      a.sentimentLabel === "positive"
                        ? "#10b981"
                        : a.sentimentLabel === "negative"
                        ? "#ef4444"
                        : "#94a3b8"
                    }
                  >
                    {a.sentimentLabel}
                  </Badge>
                  <span className="text-xs text-surface-500">
                    {(a.scores[0].score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
