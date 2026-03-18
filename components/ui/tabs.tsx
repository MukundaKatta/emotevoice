"use client";

import { cn } from "@/lib/utils";
import { createContext, useContext, useState, ReactNode } from "react";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType>({
  activeTab: "",
  setActiveTab: () => {},
});

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 bg-surface-800/50 rounded-lg border border-surface-700",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
        isActive
          ? "bg-brand-600 text-white shadow-md"
          : "text-surface-400 hover:text-white hover:bg-surface-700",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={cn("animate-fade-in mt-4", className)}>{children}</div>;
}
