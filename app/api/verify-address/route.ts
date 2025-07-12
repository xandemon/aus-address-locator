import { NextRequest, NextResponse } from "next/server";
import { verifyAddress } from "@/lib/services/australia-post";
import { verifierFormSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedInput = verifierFormSchema.parse(body);

    const result = await verifyAddress(
      validatedInput.postcode,
      validatedInput.suburb,
      validatedInput.state
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Address verification error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          isValid: false,
          message: "Invalid input data",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        isValid: false,
        message: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
