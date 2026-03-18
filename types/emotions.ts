export type EmotionType =
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "surprise"
  | "disgust"
  | "contempt"
  | "neutral"
  | "love"
  | "excitement"
  | "calm"
  | "anxiety";

export interface EmotionScore {
  emotion: EmotionType;
  score: number;
  confidence: number;
}

export interface EmotionAnalysis {
  id: string;
  timestamp: number;
  dominantEmotion: EmotionType;
  scores: EmotionScore[];
  audioFeatures: AudioFeatures;
  transcription?: string;
  sentimentScore: number;
  sentimentLabel: "positive" | "negative" | "neutral" | "mixed";
  duration: number;
  source: "voice" | "text" | "batch";
}

export interface AudioFeatures {
  pitch: number;
  pitchVariance: number;
  energy: number;
  tempo: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
  mfcc: number[];
  formants: number[];
  harmonicity: number;
  jitter: number;
  shimmer: number;
}

export interface EmotionTimelineEntry {
  timestamp: number;
  emotions: EmotionScore[];
  dominant: EmotionType;
  intensity: number;
}

export interface EmotionHeatmapPoint {
  time: number;
  frequency: number;
  intensity: number;
  emotion: EmotionType;
}

export interface EmotionTrigger {
  id: string;
  name: string;
  emotion: EmotionType;
  threshold: number;
  direction: "above" | "below";
  action: "alert" | "log" | "webhook" | "email";
  webhookUrl?: string;
  email?: string;
  enabled: boolean;
  createdAt: number;
  firedCount: number;
}

export interface BatchAnalysisJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  files: BatchFile[];
  createdAt: number;
  completedAt?: number;
  progress: number;
  results: EmotionAnalysis[];
}

export interface BatchFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: EmotionAnalysis;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  parameters: ApiParameter[];
  responseExample: string;
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  category: "customer-service" | "therapy" | "sales-coaching";
  description: string;
  sampleDialogue: DemoDialogueLine[];
  emotionFlow: EmotionType[];
}

export interface DemoDialogueLine {
  speaker: "agent" | "customer" | "therapist" | "patient" | "coach" | "rep";
  text: string;
  emotion: EmotionType;
  intensity: number;
}

export interface ExportConfig {
  format: "csv" | "json";
  dateRange: { start: number; end: number };
  emotions: EmotionType[];
  includeAudioFeatures: boolean;
  includeTranscription: boolean;
}

export const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: "#FFD700",
  sadness: "#4169E1",
  anger: "#DC143C",
  fear: "#8B008B",
  surprise: "#FF6347",
  disgust: "#2E8B57",
  contempt: "#708090",
  neutral: "#A0AEC0",
  love: "#FF69B4",
  excitement: "#FF4500",
  calm: "#48D1CC",
  anxiety: "#9370DB",
};

export const EMOTION_LABELS: Record<EmotionType, string> = {
  joy: "Joy",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  surprise: "Surprise",
  disgust: "Disgust",
  contempt: "Contempt",
  neutral: "Neutral",
  love: "Love",
  excitement: "Excitement",
  calm: "Calm",
  anxiety: "Anxiety",
};

export const EMOTION_ICONS: Record<EmotionType, string> = {
  joy: "Sun",
  sadness: "CloudRain",
  anger: "Flame",
  fear: "Ghost",
  surprise: "Zap",
  disgust: "Frown",
  contempt: "Meh",
  neutral: "Minus",
  love: "Heart",
  excitement: "Sparkles",
  calm: "Waves",
  anxiety: "AlertTriangle",
};

export const ALL_EMOTIONS: EmotionType[] = [
  "joy", "sadness", "anger", "fear", "surprise", "disgust",
  "contempt", "neutral", "love", "excitement", "calm", "anxiety",
];
