import { NextResponse } from "next/server";
import { createDraftOrder } from "@/lib/shopify/draft-order";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate items exist and is non-empty array
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const result = await createDraftOrder(body.items);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // User-friendly error only (CONTEXT.md decision)
    return NextResponse.json(
      { error: "Unable to process checkout. Please try again." },
      { status: 500 }
    );
  }
}
