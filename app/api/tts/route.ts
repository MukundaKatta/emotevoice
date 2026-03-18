import { NextRequest, NextResponse } from "next/server";
import { ALL_EMOTIONS, EmotionType } from "@/types/emotions";
import { generateId } from "@/lib/utils";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, emotion = "neutral", voice = "default", format = "mp3" } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Missing required field: text" },
        { status: 400 }
      );
    }

    if (!ALL_EMOTIONS.includes(emotion)) {
      return NextResponse.json(
        { success: false, error: `Invalid emotion. Must be one of: ${ALL_EMOTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const params = EMOTION_VOICE_PARAMS[emotion as EmotionType];
    const estimatedDuration = Math.round(text.length * 60 * (1 / params.rate));

    return NextResponse.json({
      success: true,
      data: {
        id: generateId(),
        text,
        emotion_applied: emotion,
        voice_params: params,
        voice,
        format,
        estimated_duration_ms: estimatedDuration,
        audio_url: `https://api.emotevoice.ai/audio/tts_${generateId()}.${format}`,
        note: "Audio generation is simulated. In production, this would return a real audio file URL.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "TTS synthesis failed" },
      { status: 500 }
    );
  }
}
