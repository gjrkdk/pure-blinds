import { NextResponse } from "next/server";
import { priceJaloezie } from "@/packages/pricing-engine/src/pricingEngine";
import matrix from "@/packages/pricing-engine/src/matrix/rolgordijnen-test.matrix.json";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const widthCm = Number(body?.widthCm);
  const heightCm = Number(body?.heightCm);

  const result = priceJaloezie(
    { widthCm, heightCm },
    {
      rules: {
        width: { min: 60, max: 200, step: 10 },
        height: { min: 60, max: 300, step: 10 },
      },
      matrix,
    }
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
