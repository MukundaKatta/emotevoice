import { NextRequest, NextResponse } from "next/server";
import {
  analyzeAudioFeatures,
  analyzeSentiment,
  createEmotionAnalysis,
} from "@/lib/emotion-engine";
import { AudioFeatures, ALL_EMOTIONS } from "@/types/emotions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, audio_features, sample_rate, include_features } = body;

    // Text-only analysis
    if (text) {
      const result = analyzeSentiment(text);
      return NextResponse.json({
        success: true,
        data: {
          sentiment: { score: result.score, label: result.label },
          emotions: result.emotions.slice(0, 6),
          word_count: text.split(/\s+/).length,
        },
      });
    }

    // Audio analysis (simulated from provided features or generated)
    const features: AudioFeatures = audio_features || {
      pitch: 150 + Math.random() * 200,
      pitchVariance: Math.random() * 50,
      energy: Math.random(),
      tempo: 60 + Math.random() * 140,
      spectralCentroid: 500 + Math.random() * 4000,
      zeroCrossingRate: Math.random() * 0.3,
      mfcc: Array.from({ length: 13 }, () => Math.random() * 100),
      formants: [400, 1800, 2800],
      harmonicity: 0.3 + Math.random() * 0.6,
      jitter: Math.random() * 0.04,
      shimmer: Math.random() * 0.08,
    };

    const scores = analyzeAudioFeatures(features);
    const analysis = createEmotionAnalysis(scores, features, 3000, text, "voice");

    const response: Record<string, any> = {
      success: true,
      data: {
        id: analysis.id,
        dominant_emotion: analysis.dominantEmotion,
        confidence: scores[0].confidence,
        scores: scores.slice(0, 6).map((s) => ({
          emotion: s.emotion,
          score: Math.round(s.score * 10000) / 10000,
          confidence: Math.round(s.confidence * 100) / 100,
        })),
        sentiment: {
          score: analysis.sentimentScore,
          label: analysis.sentimentLabel,
        },
        duration_ms: analysis.duration,
      },
    };

    if (include_features !== false) {
      response.data.audio_features = {
        pitch: Math.round(features.pitch * 10) / 10,
        energy: Math.round(features.energy * 1000) / 1000,
        tempo: Math.round(features.tempo),
        spectral_centroid: Math.round(features.spectralCentroid * 10) / 10,
        harmonicity: Math.round(features.harmonicity * 1000) / 1000,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    );
  }
}
