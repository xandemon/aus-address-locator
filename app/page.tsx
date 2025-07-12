"use client";

import { AppProvider, useApp } from "@/context/app-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { VerifierTab } from "@/components/verifier-tab";
import { SourceTab } from "@/components/source-tab";

function MainContent() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Australian Address Locator
                </h1>
                <p className="mt-2 text-gray-600">
                  Verify addresses and search locations across Australia
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">AU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
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
                Location Source
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <TabsContent value="verifier" activeTab={activeTab}>
                <VerifierTab />
              </TabsContent>

              <TabsContent value="source" activeTab={activeTab}>
                <SourceTab />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              © 2024 Australian Address Locator. Built with Next.js, TypeScript,
              and Tailwind CSS.
            </p>
            <p className="mt-2">
              Data powered by Australia Post API • Maps by Google Maps
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
