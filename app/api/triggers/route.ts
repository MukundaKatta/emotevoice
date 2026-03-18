import { NextRequest, NextResponse } from "next/server";
import { ALL_EMOTIONS, EmotionType } from "@/types/emotions";
import { generateId } from "@/lib/utils";

// In-memory triggers store for API demo
const triggers: Array<{
  id: string;
  name: string;
  emotion: EmotionType;
  threshold: number;
  direction: "above" | "below";
  action: string;
  enabled: boolean;
  created_at: string;
}> = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: { triggers, count: triggers.length },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, emotion, threshold, direction, action, webhook_url, email } = body;

    if (!name || !emotion || threshold === undefined || !direction || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, emotion, threshold, direction, action" },
        { status: 400 }
      );
    }

    if (!ALL_EMOTIONS.includes(emotion)) {
      return NextResponse.json(
        { success: false, error: `Invalid emotion. Must be one of: ${ALL_EMOTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const trigger = {
      id: generateId(),
      name,
      emotion,
      threshold: Math.max(0, Math.min(1, threshold)),
      direction,
      action,
      webhook_url,
      email,
      enabled: true,
      created_at: new Date().toISOString(),
    };

    triggers.push(trigger);

    return NextResponse.json({
      success: true,
      data: trigger,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create trigger" },
      { status: 500 }
    );
  }
}
