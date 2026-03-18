"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  extractAudioFeatures,
  analyzeAudioFeatures,
  createEmotionAnalysis,
} from "@/lib/emotion-engine";
import { useEmotionStore } from "@/store/emotion-store";
import { EmotionScore, EmotionTimelineEntry } from "@/types/emotions";

export function useAudioRecorder() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    isRecording,
    setRecording,
    setProcessing,
    setRecordingDuration,
    setCurrentAnalysis,
    addToHistory,
    setRealtimeScores,
    addTimelineEntry,
  } = useEmotionStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(
        !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      );
    }
  }, []);

  const processAudio = useCallback(() => {
    if (!analyserNode || !audioContext) return;

    const features = extractAudioFeatures(analyserNode, audioContext.sampleRate);
    const scores = analyzeAudioFeatures(features);
    setRealtimeScores(scores);

    const entry: EmotionTimelineEntry = {
      timestamp: Date.now(),
      emotions: scores,
      dominant: scores[0].emotion,
      intensity: scores[0].score,
    };
    addTimelineEntry(entry);

    animationRef.current = requestAnimationFrame(processAudio);
  }, [analyserNode, audioContext, setRealtimeScores, addTimelineEntry]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const ctx = new AudioContext({ sampleRate: 44100 });
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      streamRef.current = stream;
      sourceRef.current = source;
      setAudioContext(ctx);
      setAnalyserNode(analyser);
      setRecording(true);
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - startTimeRef.current);
      }, 100);

      // Start processing on next frame after state updates
      setTimeout(() => {
        const processFrame = () => {
          if (!analyser || !ctx) return;
          const features = extractAudioFeatures(analyser, ctx.sampleRate);
          const scores = analyzeAudioFeatures(features);
          setRealtimeScores(scores);

          const entry: EmotionTimelineEntry = {
            timestamp: Date.now(),
            emotions: scores,
            dominant: scores[0].emotion,
            intensity: scores[0].score,
          };
          addTimelineEntry(entry);
          animationRef.current = requestAnimationFrame(processFrame);
        };
        animationRef.current = requestAnimationFrame(processFrame);
      }, 100);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsSupported(false);
    }
  }, [setRecording, setRecordingDuration, setRealtimeScores, addTimelineEntry]);

  const stopRecording = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const duration = Date.now() - startTimeRef.current;

    if (analyserNode && audioContext) {
      setProcessing(true);
      const features = extractAudioFeatures(analyserNode, audioContext.sampleRate);
      const scores = analyzeAudioFeatures(features);
      const analysis = createEmotionAnalysis(scores, features, duration);
      setCurrentAnalysis(analysis);
      addToHistory(analysis);
      setProcessing(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContext) {
      audioContext.close();
    }

    setAudioContext(null);
    setAnalyserNode(null);
    setRecording(false);
    setRecordingDuration(0);
  }, [
    analyserNode,
    audioContext,
    setRecording,
    setProcessing,
    setRecordingDuration,
    setCurrentAnalysis,
    addToHistory,
  ]);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    analyserNode,
    audioContext,
  };
}
