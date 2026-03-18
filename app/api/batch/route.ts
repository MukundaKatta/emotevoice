import { NextRequest, NextResponse } from "next/server";
import { analyzeAudioFeatures, createEmotionAnalysis } from "@/lib/emotion-engine";
import { AudioFeatures } from "@/types/emotions";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_count = 3, webhook_url, priority = "normal" } = body;

    const count = Math.min(Math.max(1, file_count), 20);
    const jobId = generateId();
    const results = [];

    for (let i = 0; i < count; i++) {
      const features: AudioFeatures = {
        pitch: 80 + Math.random() * 350,
        pitchVariance: Math.random() * 60,
        energy: Math.random(),
        tempo: 50 + Math.random() * 170,
        spectralCentroid: 400 + Math.random() * 4500,
        zeroCrossingRate: Math.random() * 0.35,
        mfcc: Array.from({ length: 13 }, () => Math.random() * 120),
        formants: [350 + Math.random() * 200, 1600 + Math.random() * 600],
        harmonicity: 0.2 + Math.random() * 0.75,
        jitter: Math.random() * 0.05,
        shimmer: Math.random() * 0.1,
      };

      const scores = analyzeAudioFeatures(features);
      const analysis = createEmotionAnalysis(
        scores,
        features,
        1500 + Math.random() * 10000,
        undefined,
        "batch"
      );

      results.push({
        file_index: i,
        id: analysis.id,
        dominant_emotion: analysis.dominantEmotion,
        confidence: scores[0].confidence,
        top_scores: scores.slice(0, 3).map((s) => ({
          emotion: s.emotion,
          score: Math.round(s.score * 10000) / 10000,
        })),
        sentiment: {
          score: analysis.sentimentScore,
          label: analysis.sentimentLabel,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        job_id: jobId,
        status: "completed",
        total_files: count,
        priority,
        results,
        completed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Batch analysis failed" },
      { status: 500 }
    );
  }
}
