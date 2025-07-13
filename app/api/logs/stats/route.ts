import { NextRequest, NextResponse } from "next/server";
import {
  getLogStatistics,
  elasticsearchHealthCheck,
} from "@/lib/services/elasticsearch";

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await elasticsearchHealthCheck();

    if (!isHealthy) {
      return NextResponse.json({
        success: false,
        message: "Elasticsearch is not available",
        healthy: false,
        stats: {
          totalLogs: 0,
          verifierLogs: 0,
          sourceLogs: 0,
          successfulVerifications: 0,
          failedVerifications: 0,
        },
      });
    }

    const stats = await getLogStatistics();

    return NextResponse.json({
      success: true,
      healthy: true,
      stats,
    });
  } catch (error: any) {
    console.error("Error getting log statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
        healthy: false,
        stats: {
          totalLogs: 0,
          verifierLogs: 0,
          sourceLogs: 0,
          successfulVerifications: 0,
          failedVerifications: 0,
        },
      },
      { status: 500 }
    );
  }
}
