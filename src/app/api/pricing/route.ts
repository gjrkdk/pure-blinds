import { NextResponse } from "next/server";
import { DimensionInputSchema } from "@/lib/pricing/validator";
import { calculatePrice } from "@/lib/pricing/calculator";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const result = DimensionInputSchema.safeParse(body);

    // If validation fails, return 400 with field-level errors
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid dimensions",
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    // Calculate price using validated dimensions
    const pricingResponse = calculatePrice(result.data.width, result.data.height);

    // Return successful response with pricing details
    return NextResponse.json(pricingResponse, { status: 200 });
  } catch (error) {
    // Handle unexpected errors (e.g., malformed JSON, calculator errors)
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error",
        message,
      },
      { status: 500 }
    );
  }
}
