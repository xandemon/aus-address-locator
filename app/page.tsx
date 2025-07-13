"use client";

import { AppProvider, useApp } from "@/context/app-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { VerifierTab } from "@/components/verifier-tab";
import { SourceTab } from "@/components/source-tab";
import { ActivityLogsModal } from "@/components/activity-logs-modal";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";
import { useState } from "react";
import { BarChart3, MapPin } from "lucide-react";

function MainContent() {
  const { activeTab, setActiveTab } = useApp();
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-slate-100 to-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 shadow-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center sm:text-left">
              Australian Address Locator
            </h1>
          </div>

          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto px-4 sm:px-0">
            Verify addresses and search locations across Australia
          </p>
        </div>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <div className="flex justify-center mb-4 sm:mb-6">
            <TabsList>
              <TabsTrigger
                value="verifier"
                activeTab={activeTab}
                onTabChange={setActiveTab}
              >
                Address Verifier
              </TabsTrigger>
              <TabsTrigger
                value="source"
                activeTab={activeTab}
                onTabChange={setActiveTab}
              >
                Location Search
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex justify-center mb-8 sm:mb-12">
            <button
              onClick={() => setShowActivityLogs(true)}
              className="text-slate-400 hover:text-slate-500 text-sm font-medium px-3 py-2 underline rounded-md hover:bg-slate-100 transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              View Saved Logs
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <TabsContent value="verifier" activeTab={activeTab}>
              <VerifierTab />
            </TabsContent>

            <TabsContent value="source" activeTab={activeTab}>
              <SourceTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ActivityLogsModal
        isOpen={showActivityLogs}
        onClose={() => setShowActivityLogs(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ApolloProvider>
  );
}
