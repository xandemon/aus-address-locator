import { NextRequest, NextResponse } from "next/server";
import {
  logVerifierInteraction,
  logSourceInteraction,
  getLogs,
  initializeElasticsearchIndex,
  resetElasticsearchIndex,
} from "@/lib/services/elasticsearch";

let indexInitialized = false;

async function ensureIndexInitialized() {
  if (!indexInitialized) {
    indexInitialized = await initializeElasticsearchIndex();
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureIndexInitialized();

    const body = await request.json();
    const { type, ...data } = body;

    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    let success = false;

    if (type === "verifier") {
      const { input, result, sessionId } = data;
      success = await logVerifierInteraction(
        input,
        result,
        sessionId,
        userAgent,
        ipAddress
      );
    } else if (type === "source") {
      const { searchQuery, selectedLocation, sessionId } = data;
      success = await logSourceInteraction(
        searchQuery,
        selectedLocation,
        sessionId,
        userAgent,
        ipAddress
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid log type. Must be "verifier" or "source"' },
        { status: 400 }
      );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Interaction logged successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to log interaction" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error logging interaction:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureIndexInitialized();

    const { searchParams } = new URL(request.url);

    const options = {
      type: searchParams.get("type") as "verifier" | "source" | undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      searchTerm: searchParams.get("search") || undefined,
    };

    const result = await getLogs(options);

    return NextResponse.json({
      success: true,
      data: result.logs,
      total: result.total,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        hasMore: result.total > options.offset + options.limit,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving logs:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const success = await resetElasticsearchIndex();

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Elasticsearch index reset successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to reset Elasticsearch index",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resetting Elasticsearch index:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset Elasticsearch index",
      },
      { status: 500 }
    );
  }
}
