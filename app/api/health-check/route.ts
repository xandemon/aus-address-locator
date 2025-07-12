import { healthCheck } from "@/lib/services/australia-post";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const result = await healthCheck();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
