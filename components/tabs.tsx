"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  activeTab: "verifier" | "source";
  onTabChange: (tab: "verifier" | "source") => void;
  children: ReactNode;
}

interface TabListProps {
  children: ReactNode;
}

interface TabTriggerProps {
  value: "verifier" | "source";
  activeTab: "verifier" | "source";
  onTabChange: (tab: "verifier" | "source") => void;
  children: ReactNode;
}

interface TabContentProps {
  value: "verifier" | "source";
  activeTab: "verifier" | "source";
  children: ReactNode;
}

const Tabs = ({ activeTab, onTabChange, children }: TabsProps) => {
  return <div className="w-full">{children}</div>;
};

const TabsList = ({ children }: TabListProps) => {
  return (
    <div className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500">
      {children}
    </div>
  );
};

const TabsTrigger = ({
  value,
  activeTab,
  onTabChange,
  children,
}: TabTriggerProps) => {
  const isActive = activeTab === value;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
      onClick={() => onTabChange(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, activeTab, children }: TabContentProps) => {
  if (activeTab !== value) return null;

  return (
    <div className="mt-6 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
