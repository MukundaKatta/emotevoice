"use client";

import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useEmotionStore } from "@/store/emotion-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmotionRadar } from "./emotion-radar";
import { WaveformVisualizer } from "./waveform-visualizer";
import { formatDuration } from "@/lib/utils";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { EMOTION_COLORS, EMOTION_LABELS } from "@/types/emotions";

export function VoiceRecorder() {
  const { isRecording, isSupported, startRecording, stopRecording, analyserNode } =
    useAudioRecorder();
  const { recordingDuration, isProcessing, realtimeScores, currentAnalysis } =
    useEmotionStore();

  return (
    <div className="space-y-6">
      {/* Main recording interface */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-purple-600/5" />
        <div className="relative text-center space-y-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Voice Emotion Detection
            </h2>
            <p className="text-surface-400 text-sm">
              Speak into your microphone to analyze vocal emotions in real-time
            </p>
          </div>

          {/* Recording button */}
          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isSupported || isProcessing}
              className={`relative w-28 h-28 rounded-full transition-all duration-300 ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/40"
                  : "bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/40"
              } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
            >
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full animate-ripple bg-red-500/30" />
                  <span
                    className="absolute inset-0 rounded-full animate-ripple bg-red-500/20"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}
              {isProcessing ? (
                <Loader2 className="w-10 h-10 text-white mx-auto animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10 text-white mx-auto" />
              ) : (
                <Mic className="w-10 h-10 text-white mx-auto" />
              )}
            </button>
          </div>

          {/* Status */}
          <div className="text-sm text-surface-400">
            {!isSupported ? (
              <span className="text-red-400">
                Microphone not supported in this browser
              </span>
            ) : isProcessing ? (
              <span className="text-yellow-400">Analyzing emotions...</span>
            ) : isRecording ? (
              <span className="text-red-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording: {formatDuration(recordingDuration)}
              </span>
            ) : (
              "Click to start recording"
            )}
          </div>

          {/* Waveform */}
          {isRecording && analyserNode && (
            <WaveformVisualizer analyserNode={analyserNode} />
          )}
        </div>
      </Card>

      {/* Real-time emotion display */}
      {(isRecording || currentAnalysis) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-medium text-surface-300 mb-4">
              Emotion Radar
            </h3>
            <EmotionRadar scores={isRecording ? realtimeScores : (currentAnalysis?.scores || [])} />
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-surface-300 mb-4">
              Emotion Scores
            </h3>
            <div className="space-y-3">
              {(isRecording ? realtimeScores : (currentAnalysis?.scores || []))
                .slice(0, 8)
                .map((score) => (
                  <div key={score.emotion} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: EMOTION_COLORS[score.emotion] }}>
                        {EMOTION_LABELS[score.emotion]}
                      </span>
                      <span className="text-surface-400">
                        {(score.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${score.score * 100}%`,
                          backgroundColor: EMOTION_COLORS[score.emotion],
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Analysis result */}
      {currentAnalysis && !isRecording && (
        <Card>
          <h3 className="text-sm font-medium text-surface-300 mb-4">
            Analysis Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-surface-400 mb-1">Dominant Emotion</p>
              <p
                className="text-lg font-bold"
                style={{ color: EMOTION_COLORS[currentAnalysis.dominantEmotion] }}
              >
                {EMOTION_LABELS[currentAnalysis.dominantEmotion]}
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-surface-400 mb-1">Confidence</p>
              <p className="text-lg font-bold text-white">
                {(currentAnalysis.scores[0].confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-surface-400 mb-1">Sentiment</p>
              <p
                className={`text-lg font-bold ${
                  currentAnalysis.sentimentLabel === "positive"
                    ? "text-emerald-400"
                    : currentAnalysis.sentimentLabel === "negative"
                    ? "text-red-400"
                    : "text-surface-300"
                }`}
              >
                {currentAnalysis.sentimentLabel}
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-surface-400 mb-1">Duration</p>
              <p className="text-lg font-bold text-white">
                {formatDuration(currentAnalysis.duration)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
