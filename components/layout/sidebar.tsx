"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Mic,
  LayoutDashboard,
  Clock,
  Grid3X3,
  MessageSquare,
  Play,
  Code,
  FolderOpen,
  Bell,
  AudioWaveform,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Voice Capture", icon: Mic },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/heatmap", label: "Heatmap", icon: Grid3X3 },
  { href: "/sentiment", label: "Sentiment", icon: MessageSquare },
  { href: "/demos", label: "Use Cases", icon: Play },
  { href: "/api-builder", label: "API Builder", icon: Code },
  { href: "/batch-analysis", label: "Batch Analysis", icon: FolderOpen },
  { href: "/triggers", label: "Triggers", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
            <AudioWaveform className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              EmoteVoice
            </h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-widest">
              Empathic Voice AI
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                  : "text-surface-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-brand-400" : ""
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-surface-400 mb-1">Platform Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400">All Systems Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
