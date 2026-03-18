"use client";

import { EmotionScore, EMOTION_COLORS, EMOTION_LABELS } from "@/types/emotions";
import { useMemo } from "react";

interface EmotionRadarProps {
  scores: EmotionScore[];
  size?: number;
}

export function EmotionRadar({ scores, size = 280 }: EmotionRadarProps) {
  const topScores = useMemo(
    () => scores.slice(0, 8),
    [scores]
  );

  const center = size / 2;
  const radius = (size / 2) * 0.75;

  const points = useMemo(() => {
    const count = topScores.length;
    return topScores.map((score, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = score.score * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 20) * Math.cos(angle),
        labelY: center + (radius + 20) * Math.sin(angle),
        emotion: score.emotion,
        score: score.score,
      };
    });
  }, [topScores, center, radius]);

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Grid lines */}
        {points.map((p, i) => {
          const angle = (Math.PI * 2 * i) / points.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(92, 124, 250, 0.15)"
          stroke="rgba(92, 124, 250, 0.6)"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={EMOTION_COLORS[p.emotion]}
            stroke="white"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={EMOTION_COLORS[p.emotion]}
            fontSize="10"
            fontWeight="500"
          >
            {EMOTION_LABELS[p.emotion]}
          </text>
        ))}
      </svg>
    </div>
  );
}
