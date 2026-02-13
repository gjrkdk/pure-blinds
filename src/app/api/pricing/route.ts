import { NextResponse } from "next/server";
import { PricingRequestSchema } from "@/lib/pricing/validator";
import { calculatePrice } from "@/lib/pricing/calculator";
import { getProduct } from "@/lib/product/catalog";
import { loadPricingMatrix } from "@/lib/pricing/loader";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request with Zod (now includes productId)
    const result = PricingRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const { productId, width, height } = result.data;

    // Load product metadata
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Load pricing matrix for this product
    let matrix;
    try {
      matrix = await loadPricingMatrix(product.pricingMatrixPath);
    } catch {
      return NextResponse.json(
        { error: "Pricing data unavailable" },
        { status: 404 }
      );
    }

    // Calculate price using product's matrix
    const pricingResponse = calculatePrice(matrix, width, height);
    return NextResponse.json(pricingResponse, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", message },
      { status: 500 }
    );
  }
}
