"use client";

import { useState, useCallback, useRef } from "react";
import { useEmotionStore } from "@/store/emotion-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BatchAnalysisJob,
  BatchFile,
  EMOTION_COLORS,
  EMOTION_LABELS,
  ALL_EMOTIONS,
  AudioFeatures,
} from "@/types/emotions";
import { analyzeAudioFeatures, createEmotionAnalysis } from "@/lib/emotion-engine";
import { generateId, downloadFile } from "@/lib/utils";
import {
  Upload,
  FolderOpen,
  FileAudio,
  Loader2,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Play,
} from "lucide-react";

export function BatchAnalysis() {
  const { batchJobs, addBatchJob, updateBatchJob, addToHistory } = useEmotionStore();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateAnalysis = useCallback(
    async (job: BatchAnalysisJob) => {
      const files = job.files;
      const results = [];

      for (let i = 0; i < files.length; i++) {
        updateBatchJob(job.id, {
          progress: ((i + 1) / files.length) * 100,
          status: "processing",
        });

        // Simulate processing delay
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

        // Generate simulated features
        const features: AudioFeatures = {
          pitch: 100 + Math.random() * 300,
          pitchVariance: Math.random() * 50,
          energy: Math.random(),
          tempo: 60 + Math.random() * 160,
          spectralCentroid: 500 + Math.random() * 4000,
          zeroCrossingRate: Math.random() * 0.3,
          mfcc: Array.from({ length: 13 }, () => Math.random() * 100),
          formants: [300 + Math.random() * 200, 1500 + Math.random() * 500],
          harmonicity: 0.2 + Math.random() * 0.7,
          jitter: Math.random() * 0.05,
          shimmer: Math.random() * 0.1,
        };

        const scores = analyzeAudioFeatures(features);
        const analysis = createEmotionAnalysis(
          scores,
          features,
          2000 + Math.random() * 8000,
          undefined,
          "batch"
        );

        results.push(analysis);
        addToHistory(analysis);

        // Update individual file status
        const updatedFiles = [...files];
        updatedFiles[i] = { ...updatedFiles[i], status: "completed", result: analysis };
        updateBatchJob(job.id, { files: updatedFiles });
      }

      updateBatchJob(job.id, {
        status: "completed",
        progress: 100,
        results,
        completedAt: Date.now(),
      });
    },
    [updateBatchJob, addToHistory]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const batchFiles: BatchFile[] = Array.from(fileList).map((f) => ({
        id: generateId(),
        name: f.name,
        size: f.size,
        type: f.type,
        status: "pending" as const,
      }));

      const job: BatchAnalysisJob = {
        id: generateId(),
        status: "processing",
        files: batchFiles,
        createdAt: Date.now(),
        progress: 0,
        results: [],
      };

      addBatchJob(job);
      simulateAnalysis(job);
    },
    [addBatchJob, simulateAnalysis]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const exportJobResults = (job: BatchAnalysisJob) => {
    const data = job.results.map((r) => ({
      id: r.id,
      dominant_emotion: r.dominantEmotion,
      top_score: r.scores[0]?.score,
      confidence: r.scores[0]?.confidence,
      sentiment_score: r.sentimentScore,
      sentiment_label: r.sentimentLabel,
      duration_ms: r.duration,
    }));
    downloadFile(
      JSON.stringify(data, null, 2),
      `batch-results-${job.id}.json`,
      "application/json"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
      case "processing": return <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-surface-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Batch Analysis</h2>
        <p className="text-sm text-surface-400 mt-1">
          Upload multiple audio files for bulk emotion analysis
        </p>
      </div>

      {/* Upload area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragOver
            ? "border-brand-500 bg-brand-500/5"
            : "border-surface-600 hover:border-surface-500"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center py-10">
          <Upload
            className={`w-12 h-12 mx-auto mb-4 ${
              dragOver ? "text-brand-400" : "text-surface-500"
            }`}
          />
          <p className="text-white font-medium mb-1">
            {dragOver ? "Drop files here" : "Drag & drop audio files"}
          </p>
          <p className="text-sm text-surface-500">
            or click to browse. Supports WAV, MP3, WebM, OGG
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </Card>

      {/* Quick test */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Quick Demo</p>
            <p className="text-xs text-surface-400">
              Simulate batch analysis with generated test files
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const testFiles: BatchFile[] = [
                { id: generateId(), name: "customer-call-001.wav", size: 245000, type: "audio/wav", status: "pending" },
                { id: generateId(), name: "support-session-042.mp3", size: 182000, type: "audio/mp3", status: "pending" },
                { id: generateId(), name: "interview-recording.webm", size: 320000, type: "audio/webm", status: "pending" },
                { id: generateId(), name: "meeting-clip-07.ogg", size: 195000, type: "audio/ogg", status: "pending" },
                { id: generateId(), name: "voicemail-2024.wav", size: 98000, type: "audio/wav", status: "pending" },
              ];
              const job: BatchAnalysisJob = {
                id: generateId(),
                status: "processing",
                files: testFiles,
                createdAt: Date.now(),
                progress: 0,
                results: [],
              };
              addBatchJob(job);
              simulateAnalysis(job);
            }}
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Run Demo Batch
          </Button>
        </div>
      </Card>

      {/* Jobs list */}
      {batchJobs.length === 0 ? (
        <Card className="text-center py-12">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 text-surface-500 opacity-50" />
          <p className="text-surface-500">
            No batch jobs yet. Upload files or run a demo to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {batchJobs.map((job) => (
            <Card key={job.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="text-sm font-medium text-white">
                        Batch {job.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-surface-500">
                        {job.files.length} files &middot;{" "}
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="emotion"
                      color={
                        job.status === "completed"
                          ? "#10b981"
                          : job.status === "processing"
                          ? "#3b82f6"
                          : job.status === "failed"
                          ? "#ef4444"
                          : "#94a3b8"
                      }
                    >
                      {job.status}
                    </Badge>
                    {job.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportJobResults(job)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <Progress value={job.progress} showLabel size="md" color={
                  job.status === "completed" ? "#10b981" : "#5c7cfa"
                } />

                {/* File list */}
                <div className="space-y-1">
                  {job.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-surface-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-3.5 h-3.5 text-surface-500" />
                        <span className="text-xs text-surface-300">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-surface-600">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.result && (
                          <Badge
                            variant="emotion"
                            color={EMOTION_COLORS[file.result.dominantEmotion]}
                            className="text-[10px]"
                          >
                            {EMOTION_LABELS[file.result.dominantEmotion]}
                          </Badge>
                        )}
                        {getStatusIcon(file.status)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Results summary */}
                {job.status === "completed" && job.results.length > 0 && (
                  <div className="pt-3 border-t border-surface-800">
                    <p className="text-xs text-surface-400 mb-2">
                      Emotion Distribution
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const counts: Record<string, number> = {};
                        job.results.forEach((r) => {
                          counts[r.dominantEmotion] =
                            (counts[r.dominantEmotion] || 0) + 1;
                        });
                        return Object.entries(counts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([emotion, count]) => (
                            <Badge
                              key={emotion}
                              variant="emotion"
                              color={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                            >
                              {EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS]}: {count}
                            </Badge>
                          ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

