import {
  EmotionType,
  EmotionScore,
  EmotionAnalysis,
  AudioFeatures,
  EmotionHeatmapPoint,
  ALL_EMOTIONS,
} from "@/types/emotions";
import { generateId } from "./utils";

/**
 * EmotionEngine: Simulates emotion detection from audio features.
 * In production, this would integrate with ML models (e.g., Wav2Vec2, HuBERT).
 * The engine uses acoustic feature correlations based on emotion-prosody research.
 */

const EMOTION_ACOUSTIC_PROFILES: Record<EmotionType, {
  pitchRange: [number, number];
  energyRange: [number, number];
  tempoRange: [number, number];
  spectralRange: [number, number];
  harmonicityRange: [number, number];
}> = {
  joy: { pitchRange: [200, 400], energyRange: [0.6, 0.9], tempoRange: [120, 180], spectralRange: [2000, 4000], harmonicityRange: [0.7, 0.95] },
  sadness: { pitchRange: [80, 180], energyRange: [0.1, 0.4], tempoRange: [50, 90], spectralRange: [500, 1500], harmonicityRange: [0.3, 0.6] },
  anger: { pitchRange: [150, 350], energyRange: [0.7, 1.0], tempoRange: [130, 200], spectralRange: [3000, 5000], harmonicityRange: [0.2, 0.5] },
  fear: { pitchRange: [200, 450], energyRange: [0.4, 0.7], tempoRange: [140, 210], spectralRange: [2500, 4500], harmonicityRange: [0.3, 0.55] },
  surprise: { pitchRange: [250, 500], energyRange: [0.5, 0.8], tempoRange: [100, 160], spectralRange: [2000, 4000], harmonicityRange: [0.5, 0.8] },
  disgust: { pitchRange: [100, 200], energyRange: [0.3, 0.6], tempoRange: [70, 120], spectralRange: [1000, 2500], harmonicityRange: [0.2, 0.5] },
  contempt: { pitchRange: [120, 220], energyRange: [0.2, 0.5], tempoRange: [80, 130], spectralRange: [1000, 2000], harmonicityRange: [0.4, 0.65] },
  neutral: { pitchRange: [100, 250], energyRange: [0.3, 0.5], tempoRange: [90, 140], spectralRange: [1000, 3000], harmonicityRange: [0.5, 0.75] },
  love: { pitchRange: [150, 300], energyRange: [0.3, 0.6], tempoRange: [70, 110], spectralRange: [1500, 3000], harmonicityRange: [0.7, 0.95] },
  excitement: { pitchRange: [250, 500], energyRange: [0.7, 1.0], tempoRange: [150, 220], spectralRange: [3000, 5000], harmonicityRange: [0.5, 0.8] },
  calm: { pitchRange: [80, 180], energyRange: [0.1, 0.35], tempoRange: [50, 80], spectralRange: [500, 2000], harmonicityRange: [0.7, 0.95] },
  anxiety: { pitchRange: [180, 400], energyRange: [0.4, 0.7], tempoRange: [130, 190], spectralRange: [2500, 4000], harmonicityRange: [0.25, 0.5] },
};

function gaussianScore(value: number, min: number, max: number): number {
  const mean = (min + max) / 2;
  const sigma = (max - min) / 4;
  const diff = value - mean;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

export function analyzeAudioFeatures(features: AudioFeatures): EmotionScore[] {
  const scores: EmotionScore[] = ALL_EMOTIONS.map((emotion) => {
    const profile = EMOTION_ACOUSTIC_PROFILES[emotion];
    const pitchScore = gaussianScore(features.pitch, ...profile.pitchRange);
    const energyScore = gaussianScore(features.energy, ...profile.energyRange);
    const tempoScore = gaussianScore(features.tempo, ...profile.tempoRange);
    const spectralScore = gaussianScore(features.spectralCentroid, ...profile.spectralRange);
    const harmonicScore = gaussianScore(features.harmonicity, ...profile.harmonicityRange);

    const weightedScore =
      pitchScore * 0.25 +
      energyScore * 0.25 +
      tempoScore * 0.15 +
      spectralScore * 0.2 +
      harmonicScore * 0.15;

    const jitterPenalty = features.jitter > 0.05 ? (1 - features.jitter * 2) : 1;
    const shimmerPenalty = features.shimmer > 0.1 ? (1 - features.shimmer) : 1;
    const confidence = Math.min(weightedScore * jitterPenalty * shimmerPenalty, 1);

    return {
      emotion,
      score: Math.max(0, Math.min(1, weightedScore)),
      confidence: Math.max(0.1, confidence),
    };
  });

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  if (totalScore > 0) {
    scores.forEach((s) => {
      s.score = s.score / totalScore;
    });
  }

  return scores.sort((a, b) => b.score - a.score);
}

export function analyzeSentiment(text: string): {
  score: number;
  label: "positive" | "negative" | "neutral" | "mixed";
  emotions: EmotionScore[];
} {
  const positiveWords = [
    "happy", "great", "wonderful", "love", "excellent", "amazing", "good",
    "fantastic", "beautiful", "joy", "excited", "grateful", "blessed",
    "awesome", "delightful", "brilliant", "perfect", "incredible", "superb",
    "pleased", "thrilled", "kind", "warm", "bright", "hope", "smile",
    "laugh", "celebrate", "win", "success", "enjoy", "paradise",
  ];
  const negativeWords = [
    "sad", "angry", "hate", "terrible", "awful", "bad", "horrible",
    "disgusting", "fearful", "anxious", "depressed", "frustrated",
    "miserable", "painful", "ugly", "disaster", "failure", "lonely",
    "scared", "worried", "stressed", "devastated", "grief", "rage",
    "furious", "heartbroken", "suffering", "cry", "despair", "doom",
  ];
  const surpriseWords = ["wow", "unexpected", "shocked", "astonished", "unbelievable", "omg", "sudden"];
  const calmWords = ["peaceful", "serene", "tranquil", "relaxed", "quiet", "gentle", "soothing"];

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;
  let surpriseCount = 0;
  let calmCount = 0;

  words.forEach((word) => {
    const clean = word.replace(/[^a-z]/g, "");
    if (positiveWords.includes(clean)) positiveCount++;
    if (negativeWords.includes(clean)) negativeCount++;
    if (surpriseWords.includes(clean)) surpriseCount++;
    if (calmWords.includes(clean)) calmCount++;
  });

  const totalEmotionWords = positiveCount + negativeCount + surpriseCount + calmCount || 1;
  const score = (positiveCount - negativeCount) / totalEmotionWords;

  let label: "positive" | "negative" | "neutral" | "mixed";
  if (positiveCount > 0 && negativeCount > 0 && Math.abs(positiveCount - negativeCount) <= 1) {
    label = "mixed";
  } else if (score > 0.1) {
    label = "positive";
  } else if (score < -0.1) {
    label = "negative";
  } else {
    label = "neutral";
  }

  const emotionScores: EmotionScore[] = ALL_EMOTIONS.map((emotion) => {
    let s = 0;
    switch (emotion) {
      case "joy": s = positiveCount * 0.15; break;
      case "love": s = positiveCount * 0.1; break;
      case "excitement": s = positiveCount * 0.08 + surpriseCount * 0.05; break;
      case "sadness": s = negativeCount * 0.12; break;
      case "anger": s = negativeCount * 0.1; break;
      case "fear": s = negativeCount * 0.08; break;
      case "anxiety": s = negativeCount * 0.06; break;
      case "surprise": s = surpriseCount * 0.15; break;
      case "calm": s = calmCount * 0.15; break;
      case "disgust": s = negativeCount * 0.05; break;
      case "contempt": s = negativeCount * 0.03; break;
      case "neutral": s = totalEmotionWords === 1 ? 0.5 : 0.05; break;
    }
    return { emotion, score: Math.min(s, 1), confidence: 0.6 + Math.random() * 0.3 };
  });

  const total = emotionScores.reduce((sum, e) => sum + e.score, 0) || 1;
  emotionScores.forEach((e) => (e.score = e.score / total));

  return {
    score: Math.max(-1, Math.min(1, score)),
    label,
    emotions: emotionScores.sort((a, b) => b.score - a.score),
  };
}

export function extractAudioFeatures(
  analyserNode: AnalyserNode,
  sampleRate: number
): AudioFeatures {
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  const freqArray = new Uint8Array(bufferLength);

  analyserNode.getFloatTimeDomainData(dataArray);
  analyserNode.getByteFrequencyData(freqArray);

  let sumSquares = 0;
  let zeroCrossings = 0;
  let prevSample = 0;

  for (let i = 0; i < bufferLength; i++) {
    sumSquares += dataArray[i] * dataArray[i];
    if (i > 0 && ((dataArray[i] >= 0 && prevSample < 0) || (dataArray[i] < 0 && prevSample >= 0))) {
      zeroCrossings++;
    }
    prevSample = dataArray[i];
  }

  const rms = Math.sqrt(sumSquares / bufferLength);
  const zeroCrossingRate = zeroCrossings / bufferLength;

  let weightedSum = 0;
  let magnitudeSum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const frequency = (i * sampleRate) / (bufferLength * 2);
    weightedSum += frequency * freqArray[i];
    magnitudeSum += freqArray[i];
  }
  const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

  const pitch = estimatePitch(dataArray, sampleRate);
  const pitchVariance = zeroCrossingRate * 100;

  const mfcc: number[] = [];
  for (let i = 0; i < 13; i++) {
    const start = Math.floor((i / 13) * bufferLength);
    const end = Math.floor(((i + 1) / 13) * bufferLength);
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += freqArray[j];
    }
    mfcc.push(sum / (end - start));
  }

  const formants: number[] = [];
  let isPeak = false;
  for (let i = 2; i < bufferLength - 2 && formants.length < 4; i++) {
    if (freqArray[i] > freqArray[i - 1] && freqArray[i] > freqArray[i + 1] && freqArray[i] > 50) {
      if (!isPeak) {
        formants.push((i * sampleRate) / (bufferLength * 2));
        isPeak = true;
      }
    } else {
      isPeak = false;
    }
  }

  const tempo = 60 + zeroCrossingRate * 300;

  return {
    pitch: Math.max(50, Math.min(500, pitch)),
    pitchVariance,
    energy: Math.min(1, rms * 5),
    tempo: Math.max(40, Math.min(220, tempo)),
    spectralCentroid,
    zeroCrossingRate,
    mfcc,
    formants,
    harmonicity: 0.3 + rms * 0.7,
    jitter: Math.random() * 0.03 + zeroCrossingRate * 0.02,
    shimmer: Math.random() * 0.05 + (1 - rms) * 0.1,
  };
}

function estimatePitch(buffer: Float32Array, sampleRate: number): number {
  const size = buffer.length;
  let bestOffset = -1;
  let bestCorrelation = 0;
  let foundGoodCorrelation = false;

  const minPeriod = Math.floor(sampleRate / 500);
  const maxPeriod = Math.floor(sampleRate / 50);

  for (let offset = minPeriod; offset < maxPeriod && offset < size; offset++) {
    let correlation = 0;
    for (let i = 0; i < size - offset; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / (size - offset);

    if (correlation > 0.9 && correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
      foundGoodCorrelation = true;
    } else if (foundGoodCorrelation && correlation < bestCorrelation - 0.1) {
      break;
    }
  }

  if (bestOffset > 0) {
    return sampleRate / bestOffset;
  }
  return 150 + Math.random() * 100;
}

export function createEmotionAnalysis(
  scores: EmotionScore[],
  features: AudioFeatures,
  duration: number,
  transcription?: string,
  source: "voice" | "text" | "batch" = "voice"
): EmotionAnalysis {
  const dominant = scores[0];
  const sentimentResult = transcription ? analyzeSentiment(transcription) : null;

  return {
    id: generateId(),
    timestamp: Date.now(),
    dominantEmotion: dominant.emotion,
    scores,
    audioFeatures: features,
    transcription,
    sentimentScore: sentimentResult?.score ?? 0,
    sentimentLabel: sentimentResult?.label ?? "neutral",
    duration,
    source,
  };
}

export function generateHeatmapData(
  analysis: EmotionAnalysis,
  resolution: number = 50
): EmotionHeatmapPoint[] {
  const points: EmotionHeatmapPoint[] = [];
  const duration = analysis.duration || 5000;

  for (let t = 0; t < resolution; t++) {
    for (let f = 0; f < 20; f++) {
      const timePos = (t / resolution) * duration;
      const freqPos = f * 500;

      const dominantIdx = ALL_EMOTIONS.indexOf(analysis.dominantEmotion);
      const phase = (t / resolution) * Math.PI * 4;
      const freqFactor = Math.sin((f / 20) * Math.PI);
      const timeFactor = 0.5 + 0.5 * Math.sin(phase + dominantIdx);
      const intensity = timeFactor * freqFactor * analysis.scores[0].score;

      const emotionIdx = Math.floor((t / resolution) * analysis.scores.length) % analysis.scores.length;

      points.push({
        time: timePos,
        frequency: freqPos,
        intensity: Math.max(0, Math.min(1, intensity)),
        emotion: analysis.scores[Math.min(emotionIdx, analysis.scores.length - 1)].emotion,
      });
    }
  }

  return points;
}

export function generateRealtimeEmotionData(): EmotionScore[] {
  const baseScores: Partial<Record<EmotionType, number>> = {};
  const primaryEmotion = ALL_EMOTIONS[Math.floor(Math.random() * ALL_EMOTIONS.length)];
  const secondaryEmotion = ALL_EMOTIONS[Math.floor(Math.random() * ALL_EMOTIONS.length)];

  ALL_EMOTIONS.forEach((emotion) => {
    if (emotion === primaryEmotion) {
      baseScores[emotion] = 0.3 + Math.random() * 0.4;
    } else if (emotion === secondaryEmotion) {
      baseScores[emotion] = 0.1 + Math.random() * 0.2;
    } else {
      baseScores[emotion] = Math.random() * 0.1;
    }
  });

  const total = Object.values(baseScores).reduce((sum, v) => sum + (v || 0), 0) || 1;

  return ALL_EMOTIONS.map((emotion) => ({
    emotion,
    score: (baseScores[emotion] || 0) / total,
    confidence: 0.5 + Math.random() * 0.5,
  })).sort((a, b) => b.score - a.score);
}
