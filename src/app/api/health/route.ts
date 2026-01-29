import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/shopify/client";

export async function GET() {
  try {
    const client = createAdminClient();

    const response = await client.query({
      data: `{
        shop {
          name
          url
          myshopifyDomain
        }
      }`,
    });

    const shop = response.body as unknown as {
      data?: {
        shop?: {
          name: string;
          url: string;
          myshopifyDomain: string;
        };
      };
    };

    if (!shop.data?.shop) {
      return NextResponse.json(
        { status: "error", message: "No shop data returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "connected",
      shop: {
        name: shop.data.shop.name,
        url: shop.data.shop.url,
        domain: shop.data.shop.myshopifyDomain,
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
