"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Shield, Search } from "lucide-react";

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
    <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
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

  const getTabContent = () => {
    if (value === "verifier") {
      return {
        icon: Shield,
        title: "Address Verifier",
        description: "Validate postal addresses",
      };
    } else {
      return {
        icon: Search,
        title: "Location Search",
        description: "Find suburbs & locations",
      };
    }
  };

  const { icon: Icon, title, description } = getTabContent();

  return (
    <button
      className={cn(
        "flex items-center px-6 py-4 rounded-xl transition-all duration-200 min-w-[240px] text-left",
        isActive
          ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
          : "text-slate-600 border-white hover:bg-slate-50 hover:text-slate-900"
      )}
      onClick={() => onTabChange(value)}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors",
          isActive ? "bg-blue-100" : "bg-slate-100"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            isActive ? "text-blue-600" : "text-slate-600"
          )}
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs opacity-70 mt-0.5">{description}</div>
      </div>
    </button>
  );
};

const TabsContent = ({ value, activeTab, children }: TabContentProps) => {
  if (activeTab !== value) return null;

  return (
    <div className="ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
