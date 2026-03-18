"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useEmotionStore } from "@/store/emotion-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EMOTION_COLORS,
  EMOTION_LABELS,
  EmotionHeatmapPoint,
  ALL_EMOTIONS,
} from "@/types/emotions";
import { generateHeatmapData } from "@/lib/emotion-engine";
import { hexToRgba } from "@/lib/utils";
import { Grid3X3, RefreshCw } from "lucide-react";

export function EmotionHeatmap() {
  const { currentAnalysis, analysisHistory } = useEmotionStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<EmotionHeatmapPoint[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(0);

  const analysis = useMemo(() => {
    if (analysisHistory.length === 0) return currentAnalysis;
    return analysisHistory[selectedAnalysis] || currentAnalysis;
  }, [selectedAnalysis, analysisHistory, currentAnalysis]);

  useEffect(() => {
    if (analysis) {
      setHeatmapData(generateHeatmapData(analysis, 60));
    }
  }, [analysis]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || heatmapData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
    ctx.fillRect(0, 0, width, height);

    const maxTime = Math.max(...heatmapData.map((p) => p.time)) || 1;
    const maxFreq = Math.max(...heatmapData.map((p) => p.frequency)) || 1;

    const cellW = width / 60;
    const cellH = height / 20;

    heatmapData.forEach((point) => {
      const x = (point.time / maxTime) * (width - cellW);
      const y = height - (point.frequency / maxFreq) * (height - cellH) - cellH;
      const alpha = Math.max(0.05, point.intensity);
      const color = EMOTION_COLORS[point.emotion];

      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.fillRect(x, y, cellW + 1, cellH + 1);
    });

    // Grid overlay
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 60; i += 10) {
      const x = (i / 60) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let i = 0; i <= 20; i += 5) {
      const y = (i / 20) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time -->", width / 2, height - 4);
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Frequency -->", 0, 0);
    ctx.restore();
  }, [heatmapData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Emotion Heatmap</h2>
          <p className="text-sm text-surface-400 mt-1">
            Visualize emotion intensity across time and frequency domains
          </p>
        </div>
        {analysisHistory.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSelectedAnalysis((s) =>
                  Math.min(s + 1, analysisHistory.length - 1)
                )
              }
              disabled={selectedAnalysis >= analysisHistory.length - 1}
            >
              Older
            </Button>
            <span className="text-xs text-surface-400">
              {selectedAnalysis + 1} / {analysisHistory.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSelectedAnalysis((s) => Math.max(s - 1, 0))
              }
              disabled={selectedAnalysis <= 0}
            >
              Newer
            </Button>
          </div>
        )}
      </div>

      <Card>
        {!analysis ? (
          <div className="text-center py-16 text-surface-500">
            <Grid3X3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Record audio to generate an emotion heatmap</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-sm text-surface-400">Dominant: </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: EMOTION_COLORS[analysis.dominantEmotion] }}
                >
                  {EMOTION_LABELS[analysis.dominantEmotion]}
                </span>
              </div>
              <span className="text-xs text-surface-500">
                {new Date(analysis.timestamp).toLocaleString()}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-80 rounded-lg border border-surface-800"
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {ALL_EMOTIONS.map((emotion) => (
                <div key={emotion} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: EMOTION_COLORS[emotion] }}
                  />
                  <span className="text-xs text-surface-400">
                    {EMOTION_LABELS[emotion]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
