"use client";

import { useState } from "react";
import { useEmotionStore } from "@/store/emotion-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  EmotionTrigger,
  ALL_EMOTIONS,
  EMOTION_COLORS,
  EMOTION_LABELS,
  EmotionType,
} from "@/types/emotions";
import {
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Webhook,
  Mail,
  AlertCircle,
  FileText,
  ChevronDown,
} from "lucide-react";

export function EmotionTriggers() {
  const { triggers, addTrigger, updateTrigger, removeTrigger } = useEmotionStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emotion: "anger" as EmotionType,
    threshold: 0.7,
    direction: "above" as "above" | "below",
    action: "alert" as "alert" | "log" | "webhook" | "email",
    webhookUrl: "",
    email: "",
    enabled: true,
  });

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    addTrigger(formData);
    setFormData({
      name: "",
      emotion: "anger",
      threshold: 0.7,
      direction: "above",
      action: "alert",
      webhookUrl: "",
      email: "",
      enabled: true,
    });
    setShowForm(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "alert": return <AlertCircle className="w-3.5 h-3.5" />;
      case "log": return <FileText className="w-3.5 h-3.5" />;
      case "webhook": return <Webhook className="w-3.5 h-3.5" />;
      case "email": return <Mail className="w-3.5 h-3.5" />;
      default: return <Bell className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Emotion Triggers</h2>
          <p className="text-sm text-surface-400 mt-1">
            Configure automated actions based on detected emotional states
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Trigger
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border border-brand-500/30">
          <h3 className="text-sm font-medium text-white mb-4">
            Create New Trigger
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-surface-400 mb-1 block">
                Trigger Name
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g., High Anger Alert"
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs text-surface-400 mb-1 block">
                Target Emotion
              </label>
              <select
                value={formData.emotion}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    emotion: e.target.value as EmotionType,
                  }))
                }
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {ALL_EMOTIONS.map((e) => (
                  <option key={e} value={e}>
                    {EMOTION_LABELS[e]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-surface-400 mb-1 block">
                Threshold ({(formData.threshold * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    threshold: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-surface-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-surface-400 mb-1 block">
                Direction
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFormData((f) => ({ ...f, direction: "above" }))
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    formData.direction === "above"
                      ? "bg-brand-600 text-white"
                      : "bg-surface-800 text-surface-400 hover:text-white"
                  }`}
                >
                  Above threshold
                </button>
                <button
                  onClick={() =>
                    setFormData((f) => ({ ...f, direction: "below" }))
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    formData.direction === "below"
                      ? "bg-brand-600 text-white"
                      : "bg-surface-800 text-surface-400 hover:text-white"
                  }`}
                >
                  Below threshold
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-surface-400 mb-1 block">
                Action
              </label>
              <select
                value={formData.action}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    action: e.target.value as "alert" | "log" | "webhook" | "email",
                  }))
                }
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="alert">Alert Notification</option>
                <option value="log">Log to Console</option>
                <option value="webhook">Webhook</option>
                <option value="email">Email</option>
              </select>
            </div>

            {formData.action === "webhook" && (
              <div>
                <label className="text-xs text-surface-400 mb-1 block">
                  Webhook URL
                </label>
                <input
                  value={formData.webhookUrl}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, webhookUrl: e.target.value }))
                  }
                  placeholder="https://your-webhook.com/endpoint"
                  className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {formData.action === "email" && (
              <div>
                <label className="text-xs text-surface-400 mb-1 block">
                  Email Address
                </label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="alert@company.com"
                  className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleCreate} disabled={!formData.name.trim()}>
              Create Trigger
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Preset templates */}
      <Card>
        <h3 className="text-sm font-medium text-surface-300 mb-3">
          Quick Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Anger Escalation Alert", emotion: "anger" as EmotionType, threshold: 0.7, direction: "above" as const, action: "alert" as const },
            { name: "Low Engagement Warning", emotion: "neutral" as EmotionType, threshold: 0.6, direction: "above" as const, action: "log" as const },
            { name: "Customer Satisfaction", emotion: "joy" as EmotionType, threshold: 0.5, direction: "above" as const, action: "webhook" as const },
            { name: "Anxiety Detection", emotion: "anxiety" as EmotionType, threshold: 0.6, direction: "above" as const, action: "alert" as const },
            { name: "Excitement Peak", emotion: "excitement" as EmotionType, threshold: 0.7, direction: "above" as const, action: "log" as const },
            { name: "Calm State Reached", emotion: "calm" as EmotionType, threshold: 0.5, direction: "above" as const, action: "log" as const },
          ].map((template) => (
            <button
              key={template.name}
              onClick={() => {
                addTrigger({ ...template, webhookUrl: "", email: "", enabled: true });
              }}
              className="text-left p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: EMOTION_COLORS[template.emotion] }}
                />
                <span className="text-xs font-medium text-white">
                  {template.name}
                </span>
              </div>
              <p className="text-[10px] text-surface-500">
                {EMOTION_LABELS[template.emotion]} {template.direction}{" "}
                {(template.threshold * 100).toFixed(0)}%
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Active triggers */}
      {triggers.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-10 h-10 mx-auto mb-3 text-surface-500 opacity-50" />
          <p className="text-surface-500">
            No triggers configured. Create one above or use a template.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-surface-300">
            Active Triggers ({triggers.length})
          </h3>
          {triggers.map((trigger) => (
            <Card key={trigger.id} className={`${!trigger.enabled ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      updateTrigger(trigger.id, { enabled: !trigger.enabled })
                    }
                    className="transition-colors"
                  >
                    {trigger.enabled ? (
                      <ToggleRight className="w-8 h-8 text-brand-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-surface-600" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {trigger.name}
                      </span>
                      <Badge
                        variant="emotion"
                        color={EMOTION_COLORS[trigger.emotion]}
                        className="text-[10px]"
                      >
                        {EMOTION_LABELS[trigger.emotion]}
                      </Badge>
                    </div>
                    <p className="text-xs text-surface-500">
                      Fire when {EMOTION_LABELS[trigger.emotion]} is{" "}
                      {trigger.direction} {(trigger.threshold * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-surface-400">
                    {getActionIcon(trigger.action)}
                    <span className="text-xs capitalize">{trigger.action}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {trigger.firedCount}
                    </p>
                    <p className="text-[10px] text-surface-500">fired</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTrigger(trigger.id)}
                  >
                    <Trash2 className="w-4 h-4 text-surface-500 hover:text-red-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
