import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/shopify/client";

export async function GET() {
  try {
    const client = createAdminClient();

    const response = await client.request(`{
      shop {
        name
        url
        myshopifyDomain
      }
    }`);

    if (!response.data?.shop) {
      return NextResponse.json(
        { status: "error", message: "No shop data returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "connected",
      shop: {
        name: response.data.shop.name,
        url: response.data.shop.url,
        domain: response.data.shop.myshopifyDomain,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
