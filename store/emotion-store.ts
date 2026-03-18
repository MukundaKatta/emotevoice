import { create } from "zustand";
import {
  EmotionAnalysis,
  EmotionScore,
  EmotionTimelineEntry,
  EmotionTrigger,
  BatchAnalysisJob,
  EmotionType,
  ALL_EMOTIONS,
} from "@/types/emotions";
import { generateId } from "@/lib/utils";

interface EmotionState {
  // Recording state
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;

  // Analysis results
  currentAnalysis: EmotionAnalysis | null;
  analysisHistory: EmotionAnalysis[];
  realtimeScores: EmotionScore[];

  // Timeline
  timeline: EmotionTimelineEntry[];

  // Triggers
  triggers: EmotionTrigger[];

  // Batch
  batchJobs: BatchAnalysisJob[];

  // TTS
  ttsEmotion: EmotionType;
  ttsSpeaking: boolean;

  // Actions
  setRecording: (isRecording: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setRecordingDuration: (duration: number) => void;
  setCurrentAnalysis: (analysis: EmotionAnalysis) => void;
  addToHistory: (analysis: EmotionAnalysis) => void;
  setRealtimeScores: (scores: EmotionScore[]) => void;
  addTimelineEntry: (entry: EmotionTimelineEntry) => void;
  clearTimeline: () => void;

  // Trigger actions
  addTrigger: (trigger: Omit<EmotionTrigger, "id" | "createdAt" | "firedCount">) => void;
  updateTrigger: (id: string, updates: Partial<EmotionTrigger>) => void;
  removeTrigger: (id: string) => void;
  incrementTriggerFired: (id: string) => void;

  // Batch actions
  addBatchJob: (job: BatchAnalysisJob) => void;
  updateBatchJob: (id: string, updates: Partial<BatchAnalysisJob>) => void;

  // TTS actions
  setTtsEmotion: (emotion: EmotionType) => void;
  setTtsSpeaking: (speaking: boolean) => void;

  // Utilities
  clearHistory: () => void;
  getEmotionStats: () => Record<EmotionType, { count: number; avgScore: number }>;
}

export const useEmotionStore = create<EmotionState>((set, get) => ({
  isRecording: false,
  isProcessing: false,
  recordingDuration: 0,
  currentAnalysis: null,
  analysisHistory: [],
  realtimeScores: ALL_EMOTIONS.map((e) => ({ emotion: e, score: 0, confidence: 0 })),
  timeline: [],
  triggers: [],
  batchJobs: [],
  ttsEmotion: "neutral",
  ttsSpeaking: false,

  setRecording: (isRecording) => set({ isRecording }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setRecordingDuration: (duration) => set({ recordingDuration: duration }),

  setCurrentAnalysis: (analysis) =>
    set({ currentAnalysis: analysis }),

  addToHistory: (analysis) =>
    set((state) => ({
      analysisHistory: [analysis, ...state.analysisHistory].slice(0, 500),
    })),

  setRealtimeScores: (scores) => set({ realtimeScores: scores }),

  addTimelineEntry: (entry) =>
    set((state) => ({
      timeline: [...state.timeline, entry].slice(-200),
    })),

  clearTimeline: () => set({ timeline: [] }),

  addTrigger: (trigger) =>
    set((state) => ({
      triggers: [
        ...state.triggers,
        { ...trigger, id: generateId(), createdAt: Date.now(), firedCount: 0 },
      ],
    })),

  updateTrigger: (id, updates) =>
    set((state) => ({
      triggers: state.triggers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTrigger: (id) =>
    set((state) => ({
      triggers: state.triggers.filter((t) => t.id !== id),
    })),

  incrementTriggerFired: (id) =>
    set((state) => ({
      triggers: state.triggers.map((t) =>
        t.id === id ? { ...t, firedCount: t.firedCount + 1 } : t
      ),
    })),

  addBatchJob: (job) =>
    set((state) => ({ batchJobs: [job, ...state.batchJobs] })),

  updateBatchJob: (id, updates) =>
    set((state) => ({
      batchJobs: state.batchJobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),

  setTtsEmotion: (emotion) => set({ ttsEmotion: emotion }),
  setTtsSpeaking: (speaking) => set({ ttsSpeaking: speaking }),

  clearHistory: () =>
    set({ analysisHistory: [], currentAnalysis: null, timeline: [] }),

  getEmotionStats: () => {
    const history = get().analysisHistory;
    const stats: Record<EmotionType, { count: number; avgScore: number }> =
      {} as any;
    ALL_EMOTIONS.forEach((e) => {
      stats[e] = { count: 0, avgScore: 0 };
    });
    history.forEach((a) => {
      stats[a.dominantEmotion].count++;
      const topScore = a.scores.find((s) => s.emotion === a.dominantEmotion);
      if (topScore) {
        stats[a.dominantEmotion].avgScore += topScore.score;
      }
    });
    ALL_EMOTIONS.forEach((e) => {
      if (stats[e].count > 0) {
        stats[e].avgScore /= stats[e].count;
      }
    });
    return stats;
  },
}));
