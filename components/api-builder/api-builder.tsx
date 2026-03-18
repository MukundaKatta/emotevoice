"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApiEndpoint, ApiParameter } from "@/types/emotions";
import { Code, Copy, Check, Play, ChevronDown, ChevronRight } from "lucide-react";

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "analyze-voice",
    name: "Analyze Voice",
    method: "POST",
    path: "/api/analyze",
    description: "Submit audio data for real-time emotion analysis. Returns emotion scores, dominant emotion, sentiment, and audio features.",
    parameters: [
      { name: "audio", type: "Base64 | Blob", required: true, description: "Audio data in WAV/WebM format" },
      { name: "sample_rate", type: "number", required: false, description: "Audio sample rate in Hz", defaultValue: "44100" },
      { name: "include_features", type: "boolean", required: false, description: "Include raw audio features in response", defaultValue: "true" },
      { name: "emotion_model", type: "string", required: false, description: "Model variant: 'base', 'advanced', 'multilingual'", defaultValue: "base" },
    ],
    responseExample: JSON.stringify({
      id: "analysis_abc123",
      dominant_emotion: "joy",
      confidence: 0.87,
      scores: [
        { emotion: "joy", score: 0.42, confidence: 0.87 },
        { emotion: "excitement", score: 0.23, confidence: 0.72 },
        { emotion: "neutral", score: 0.15, confidence: 0.65 },
      ],
      sentiment: { score: 0.68, label: "positive" },
      duration_ms: 3200,
      audio_features: {
        pitch: 245.5,
        energy: 0.72,
        tempo: 142,
        spectral_centroid: 2890.3,
      },
    }, null, 2),
  },
  {
    id: "analyze-text",
    name: "Analyze Text Sentiment",
    method: "POST",
    path: "/api/analyze/text",
    description: "Perform sentiment and emotion analysis on text input.",
    parameters: [
      { name: "text", type: "string", required: true, description: "Text to analyze (max 5000 chars)" },
      { name: "language", type: "string", required: false, description: "ISO language code", defaultValue: "en" },
    ],
    responseExample: JSON.stringify({
      sentiment: { score: 0.45, label: "positive" },
      emotions: [
        { emotion: "joy", score: 0.35, confidence: 0.78 },
        { emotion: "love", score: 0.28, confidence: 0.65 },
      ],
      word_count: 42,
    }, null, 2),
  },
  {
    id: "batch-analyze",
    name: "Batch Analysis",
    method: "POST",
    path: "/api/batch",
    description: "Submit multiple audio files for asynchronous batch processing.",
    parameters: [
      { name: "files", type: "File[]", required: true, description: "Array of audio files" },
      { name: "webhook_url", type: "string", required: false, description: "URL to notify on completion" },
      { name: "priority", type: "string", required: false, description: "'low', 'normal', 'high'", defaultValue: "normal" },
    ],
    responseExample: JSON.stringify({
      job_id: "batch_xyz789",
      status: "processing",
      total_files: 5,
      estimated_completion: "2024-01-15T10:30:00Z",
    }, null, 2),
  },
  {
    id: "triggers",
    name: "Create Trigger",
    method: "POST",
    path: "/api/triggers",
    description: "Set up emotion-based triggers that fire when specific conditions are met during analysis.",
    parameters: [
      { name: "emotion", type: "EmotionType", required: true, description: "Target emotion to monitor" },
      { name: "threshold", type: "number", required: true, description: "Score threshold (0-1)" },
      { name: "direction", type: "string", required: true, description: "'above' or 'below'" },
      { name: "action", type: "string", required: true, description: "'alert', 'log', 'webhook', 'email'" },
      { name: "webhook_url", type: "string", required: false, description: "Webhook URL for 'webhook' action" },
    ],
    responseExample: JSON.stringify({
      id: "trigger_def456",
      status: "active",
      emotion: "anger",
      threshold: 0.7,
      direction: "above",
      action: "webhook",
    }, null, 2),
  },
  {
    id: "tts",
    name: "Emotion TTS",
    method: "POST",
    path: "/api/tts",
    description: "Generate speech audio with emotional expression.",
    parameters: [
      { name: "text", type: "string", required: true, description: "Text to synthesize" },
      { name: "emotion", type: "EmotionType", required: true, description: "Target emotional tone" },
      { name: "voice", type: "string", required: false, description: "Voice ID", defaultValue: "default" },
      { name: "format", type: "string", required: false, description: "'mp3', 'wav', 'ogg'", defaultValue: "mp3" },
    ],
    responseExample: JSON.stringify({
      audio_url: "https://api.emotevoice.ai/audio/tts_abc123.mp3",
      duration_ms: 4200,
      emotion_applied: "joy",
      voice_params: { rate: 1.15, pitch: 1.3, volume: 0.9 },
    }, null, 2),
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "#10b981",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
};

export function ApiBuilder() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0]);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(
    new Set([API_ENDPOINTS[0].id])
  );
  const [tryItParams, setTryItParams] = useState<Record<string, string>>({});
  const [tryItResult, setTryItResult] = useState<string | null>(null);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCurl = (endpoint: ApiEndpoint) => {
    const baseUrl = "https://api.emotevoice.ai/v1";
    let cmd = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
    cmd += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
    cmd += ` \\\n  -H "Content-Type: application/json"`;
    if (endpoint.method !== "GET") {
      const body: Record<string, any> = {};
      endpoint.parameters.forEach((p) => {
        if (p.required) {
          body[p.name] = p.type === "number" ? 0 : p.type === "boolean" ? true : `<${p.name}>`;
        }
      });
      cmd += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
    }
    return cmd;
  };

  const generatePython = (endpoint: ApiEndpoint) => {
    let code = `import requests\n\n`;
    code += `url = "https://api.emotevoice.ai/v1${endpoint.path}"\n`;
    code += `headers = {\n    "Authorization": "Bearer YOUR_API_KEY",\n    "Content-Type": "application/json"\n}\n`;
    if (endpoint.method !== "GET") {
      const body: Record<string, any> = {};
      endpoint.parameters.forEach((p) => {
        if (p.required) {
          body[p.name] = p.type === "number" ? 0 : p.type === "boolean" ? true : `<${p.name}>`;
        }
      });
      code += `payload = ${JSON.stringify(body, null, 4).replace(/true/g, "True").replace(/false/g, "False")}\n\n`;
      code += `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=payload)\n`;
    } else {
      code += `\nresponse = requests.get(url, headers=headers)\n`;
    }
    code += `print(response.json())`;
    return code;
  };

  const generateJS = (endpoint: ApiEndpoint) => {
    let code = `const response = await fetch("https://api.emotevoice.ai/v1${endpoint.path}", {\n`;
    code += `  method: "${endpoint.method}",\n`;
    code += `  headers: {\n    "Authorization": "Bearer YOUR_API_KEY",\n    "Content-Type": "application/json",\n  },\n`;
    if (endpoint.method !== "GET") {
      const body: Record<string, any> = {};
      endpoint.parameters.forEach((p) => {
        if (p.required) {
          body[p.name] = p.type === "number" ? 0 : p.type === "boolean" ? true : `<${p.name}>`;
        }
      });
      code += `  body: JSON.stringify(${JSON.stringify(body, null, 4)}),\n`;
    }
    code += `});\n\nconst data = await response.json();\nconsole.log(data);`;
    return code;
  };

  const handleTryIt = () => {
    // Simulate API response
    setTryItResult(selectedEndpoint.responseExample);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">API Builder</h2>
        <p className="text-sm text-surface-400 mt-1">
          Explore and test the EmoteVoice API endpoints with interactive documentation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint list */}
        <div className="lg:col-span-1 space-y-2">
          <Card>
            <h3 className="text-sm font-medium text-surface-300 mb-3">
              Endpoints
            </h3>
            <div className="space-y-1">
              {API_ENDPOINTS.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTryItResult(null);
                    setTryItParams({});
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedEndpoint.id === ep.id
                      ? "bg-brand-600/15 border border-brand-500/30"
                      : "hover:bg-surface-800 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: METHOD_COLORS[ep.method],
                        backgroundColor: `${METHOD_COLORS[ep.method]}15`,
                      }}
                    >
                      {ep.method}
                    </span>
                    <code className="text-xs text-surface-300">{ep.path}</code>
                  </div>
                  <p className="text-xs text-surface-500">{ep.name}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Endpoint detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{
                  color: METHOD_COLORS[selectedEndpoint.method],
                  backgroundColor: `${METHOD_COLORS[selectedEndpoint.method]}15`,
                  border: `1px solid ${METHOD_COLORS[selectedEndpoint.method]}30`,
                }}
              >
                {selectedEndpoint.method}
              </span>
              <code className="text-sm text-white font-mono">
                /v1{selectedEndpoint.path}
              </code>
            </div>
            <p className="text-sm text-surface-400 mb-6">
              {selectedEndpoint.description}
            </p>

            {/* Parameters */}
            <div className="mb-6">
              <h4 className="text-xs text-surface-400 uppercase tracking-wider mb-3">
                Parameters
              </h4>
              <div className="border border-surface-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-800/50">
                      <th className="text-left px-3 py-2 text-xs text-surface-400 font-medium">Name</th>
                      <th className="text-left px-3 py-2 text-xs text-surface-400 font-medium">Type</th>
                      <th className="text-left px-3 py-2 text-xs text-surface-400 font-medium">Required</th>
                      <th className="text-left px-3 py-2 text-xs text-surface-400 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {selectedEndpoint.parameters.map((param) => (
                      <tr key={param.name} className="hover:bg-surface-800/30">
                        <td className="px-3 py-2">
                          <code className="text-xs text-brand-400">{param.name}</code>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-surface-400">{param.type}</span>
                        </td>
                        <td className="px-3 py-2">
                          {param.required ? (
                            <Badge color="#ef4444" className="text-[10px]">required</Badge>
                          ) : (
                            <span className="text-xs text-surface-500">optional</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-surface-400">
                          {param.description}
                          {param.defaultValue && (
                            <span className="text-surface-500"> (default: {param.defaultValue})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code samples */}
            <Tabs defaultValue="curl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="curl">
                <div className="relative">
                  <pre className="bg-surface-900 border border-surface-700 rounded-lg p-4 text-xs text-surface-300 overflow-x-auto font-mono">
                    {generateCurl(selectedEndpoint)}
                  </pre>
                  <button
                    onClick={() => copyCode(generateCurl(selectedEndpoint), "curl")}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-800 hover:bg-surface-700 transition-colors"
                  >
                    {copied === "curl" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-surface-400" />
                    )}
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="js">
                <div className="relative">
                  <pre className="bg-surface-900 border border-surface-700 rounded-lg p-4 text-xs text-surface-300 overflow-x-auto font-mono">
                    {generateJS(selectedEndpoint)}
                  </pre>
                  <button
                    onClick={() => copyCode(generateJS(selectedEndpoint), "js")}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-800 hover:bg-surface-700 transition-colors"
                  >
                    {copied === "js" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-surface-400" />
                    )}
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="python">
                <div className="relative">
                  <pre className="bg-surface-900 border border-surface-700 rounded-lg p-4 text-xs text-surface-300 overflow-x-auto font-mono">
                    {generatePython(selectedEndpoint)}
                  </pre>
                  <button
                    onClick={() => copyCode(generatePython(selectedEndpoint), "python")}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-surface-800 hover:bg-surface-700 transition-colors"
                  >
                    {copied === "python" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-surface-400" />
                    )}
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="response">
                <div className="relative">
                  <pre className="bg-surface-900 border border-surface-700 rounded-lg p-4 text-xs text-emerald-300 overflow-x-auto font-mono">
                    {selectedEndpoint.responseExample}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            {/* Try it */}
            <div className="mt-4 pt-4 border-t border-surface-800">
              <Button onClick={handleTryIt} size="sm">
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Try It (Simulated)
              </Button>
              {tryItResult && (
                <pre className="mt-3 bg-surface-900 border border-emerald-800/30 rounded-lg p-4 text-xs text-emerald-300 overflow-x-auto font-mono">
                  {tryItResult}
                </pre>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
