import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/lib/services/australia-post";
import { sourceSearchSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedInput = sourceSearchSchema.parse(body);

    const result = await searchLocations(
      validatedInput.query,
      validatedInput.category,
      20
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Location search error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          locations: [],
          total: 0,
          error: "Invalid search parameters",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        locations: [],
        total: 0,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
