import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/shopify/client";

const ORDER_LOOKUP_QUERY = `
  query OrderLookup($id: ID!) {
    node(id: $id) {
      ... on DraftOrder {
        id
        status
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId || orderId.trim() === "") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  // Normalise to GID
  const gid = orderId.startsWith("gid://")
    ? orderId
    : `gid://shopify/DraftOrder/${orderId}`;

  try {
    const client = createAdminClient();
    const response = await client.request(ORDER_LOOKUP_QUERY, {
      variables: { id: gid },
    });

    const node = (response.data as { node?: { id?: string } } | null)?.node;

    if (node && node.id) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false });
  } catch {
    // Safe default: treat errors as invalid to avoid data loss
    return NextResponse.json({ valid: false });
  }
}
