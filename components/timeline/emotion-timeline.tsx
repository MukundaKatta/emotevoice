"use client";

import { useEmotionStore } from "@/store/emotion-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EMOTION_COLORS,
  EMOTION_LABELS,
  EmotionTimelineEntry,
} from "@/types/emotions";
import { Trash2, Clock, Download } from "lucide-react";
import { useRef, useEffect, useMemo } from "react";
import { downloadFile } from "@/lib/utils";

export function EmotionTimeline() {
  const { timeline, clearTimeline } = useEmotionStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw timeline chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || timeline.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Time axis
    const startTime = timeline[0].timestamp;
    const endTime = timeline[timeline.length - 1].timestamp;
    const timeRange = endTime - startTime || 1;

    // Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.fillText(`${(100 - i * 25)}%`, padding.left - 8, y + 3);
    }

    // Plot intensity line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, "rgba(92, 124, 250, 0.8)");
    gradient.addColorStop(1, "rgba(92, 124, 250, 0.1)");

    ctx.beginPath();
    ctx.strokeStyle = "#5c7cfa";
    ctx.lineWidth = 2;

    timeline.forEach((entry, i) => {
      const x = padding.left + ((entry.timestamp - startTime) / timeRange) * chartW;
      const y = padding.top + chartH * (1 - entry.intensity);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(
      padding.left + chartW,
      padding.top + chartH
    );
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Emotion color dots
    timeline.forEach((entry) => {
      const x = padding.left + ((entry.timestamp - startTime) / timeRange) * chartW;
      const y = padding.top + chartH * (1 - entry.intensity);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = EMOTION_COLORS[entry.dominant];
      ctx.fill();
    });
  }, [timeline]);

  const recentEntries = useMemo(
    () => timeline.slice(-50).reverse(),
    [timeline]
  );

  const handleExport = () => {
    const csv = [
      "timestamp,dominant_emotion,intensity,top_score",
      ...timeline.map(
        (e) =>
          `${new Date(e.timestamp).toISOString()},${e.dominant},${e.intensity.toFixed(4)},${e.emotions[0]?.score.toFixed(4) || ""}`
      ),
    ].join("\n");
    downloadFile(csv, "emotion-timeline.csv", "text/csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Emotion Timeline</h2>
          <p className="text-sm text-surface-400 mt-1">
            Track emotional changes over time during recordings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={timeline.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={clearTimeline} disabled={timeline.length === 0}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Timeline chart */}
      <Card>
        <h3 className="text-sm font-medium text-surface-300 mb-4">
          Intensity Over Time
        </h3>
        {timeline.length < 2 ? (
          <div className="text-center py-16 text-surface-500">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Start recording to build your emotion timeline</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-72 rounded-lg"
          />
        )}
      </Card>

      {/* Event list */}
      <Card>
        <h3 className="text-sm font-medium text-surface-300 mb-4">
          Recent Events ({timeline.length} total)
        </h3>
        {recentEntries.length === 0 ? (
          <p className="text-center py-8 text-surface-500 text-sm">
            No timeline events yet
          </p>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {recentEntries.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: EMOTION_COLORS[entry.dominant] }}
                  />
                  <span className="text-sm" style={{ color: EMOTION_COLORS[entry.dominant] }}>
                    {EMOTION_LABELS[entry.dominant]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  <span>
                    Intensity: {(entry.intensity * 100).toFixed(1)}%
                  </span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
