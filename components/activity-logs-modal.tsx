"use client";

import { useState, useEffect } from "react";
import { cn, formatLocationDisplay, formatSuburbName } from "@/lib/utils";
import { BarChart3, Clock, FileText, MapPin, X } from "lucide-react";

interface LogEntry {
  type: "verifier" | "source";
  timestamp: string;
  sessionId: string;
  input?: {
    postcode: string;
    suburb: string;
    state: string;
  };
  result?: {
    isValid: boolean;
    message: string;
    location?: any;
  };
  searchQuery?: string;
  selectedLocation?: any;
}

interface LogStats {
  totalLogs: number;
  verifierLogs: number;
  sourceLogs: number;
}

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityLogsModal({ isOpen, onClose }: ActivityLogsModalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats>({
    totalLogs: 0,
    verifierLogs: 0,
    sourceLogs: 0,
  });
  const [loading, setLoading] = useState(false);
  const [elasticsearchHealthy, setElasticsearchHealthy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);

    try {
      const statsResponse = await fetch("/api/logs/stats");
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats({
          totalLogs: statsData.stats.totalLogs,
          verifierLogs: statsData.stats.verifierLogs,
          sourceLogs: statsData.stats.sourceLogs,
        });
        setElasticsearchHealthy(statsData.healthy);
      } else {
        setElasticsearchHealthy(false);
      }

      const logsResponse = await fetch("/api/logs?limit=20&offset=0");
      const logsData = await logsResponse.json();

      if (logsData.success) {
        setLogs(logsData.data);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
      setElasticsearchHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:max-w-4xl sm:h-[75vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Activity Logs
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Recent interactions and analytics
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[calc(75vh-140px)]">
          {!loading && !elasticsearchHealthy ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Logging service unavailable</p>
              <p className="text-sm mt-1">
                Elasticsearch is not configured or running
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
                    <div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        {stats.totalLogs}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Total Logs
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-base sm:text-lg font-bold text-green-900">
                        {stats.verifierLogs}
                      </div>
                      <div className="text-xs sm:text-sm text-green-600">
                        Verifications
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-base sm:text-lg font-bold text-blue-900">
                        {stats.sourceLogs}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-600">
                        Selections
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Recent Activity
                </h3>

                {loading ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <div className="text-sm text-gray-600 mt-2">Loading...</div>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm sm:text-base">No activity logs yet</p>
                    <p className="text-xs sm:text-sm mt-1">
                      Start using the app to see interactions here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {logs.map((log, index) => {
                      const isVerifier = log.type === "verifier";

                      return (
                        <div
                          key={`${log.sessionId}-${index}`}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                            <div className="flex items-center space-x-2">
                              {isVerifier ? (
                                <FileText
                                  className={cn(
                                    "h-4 w-4 flex-shrink-0",
                                    log?.result?.isValid
                                      ? "text-green-600"
                                      : "text-red-600"
                                  )}
                                />
                              ) : (
                                <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              )}
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  isVerifier
                                    ? log?.result?.isValid
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {isVerifier ? "Verification" : "Selection"}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {formatTimestamp(log.timestamp)}
                              </span>
                            </div>
                          </div>

                          {isVerifier ? (
                            <div className="text-sm">
                              <div className="text-gray-700 break-words">
                                <strong>
                                  {formatSuburbName(log.input?.suburb || "")}
                                </strong>
                                , {log.input?.state} {log.input?.postcode}
                              </div>
                              <div
                                className={cn(
                                  "mt-1 break-words",
                                  log?.result?.isValid
                                    ? "text-green-600"
                                    : "text-red-600"
                                )}
                              >
                                {log.result?.message}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <div className="text-gray-700 break-words">
                                Search: <strong>{log.searchQuery}</strong>
                              </div>
                              <div className="text-blue-600 mt-1 break-words">
                                Selected:{" "}
                                {formatLocationDisplay(log.selectedLocation)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
