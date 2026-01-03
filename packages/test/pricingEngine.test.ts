import { priceJaloezie } from "@/packages/pricing-engine/src/pricingEngine";
import matrix from "@/packages/pricing-engine/src/matrix/rolgordijnen-test.matrix.json";
import type { PricingEngineConfig } from "@/packages/pricing-engine/src/pricingEngine";

const config: PricingEngineConfig = {
  rules: {
    width: { min: 60, max: 200, step: 10 },
    height: { min: 60, max: 300, step: 10 },
  },
  matrix,
};

describe("priceJaloezie()", () => {
  test("rounds height up: 150 x 162 -> 150 x 170", () => {
    const res = priceJaloezie({ widthCm: 150, heightCm: 162 }, config);
    expect(res.ok).toBe(true);

    if (!res.ok) return;

    expect(res.normalized.widthCm).toBe(150);
    expect(res.normalized.heightCm).toBe(170);
    expect(res.priceCents).toBe(36900);
  });

  test("rounds width up: 151 -> 160 (step 10) but matrix missing", () => {
    const res = priceJaloezie({ widthCm: 151, heightCm: 170 }, config);
    expect(res.ok).toBe(false);

    if (res.ok) return;

    expect(res.error.code).toBe("MATRIX_MISSING");
  });

  test("rejects width out of range after rounding", () => {
    const res = priceJaloezie({ widthCm: 201, heightCm: 170 }, config);
    expect(res.ok).toBe(false);

    if (res.ok) return;

    expect(res.error.code).toBe("OUT_OF_RANGE");
  });

  test("rejects height out of range after rounding", () => {
    const res = priceJaloezie({ widthCm: 150, heightCm: 301 }, config);
    expect(res.ok).toBe(false);

    if (res.ok) return;

    expect(res.error.code).toBe("OUT_OF_RANGE");
  });

  test("rejects invalid input", () => {
    const res = priceJaloezie({ widthCm: NaN, heightCm: 170 }, config);
    expect(res.ok).toBe(false);

    if (res.ok) return;

    expect(res.error.code).toBe("INVALID_INPUT");
  });

  test("errors when matrix cell is missing", () => {
    const res = priceJaloezie({ widthCm: 70, heightCm: 260 }, config);
    expect(res.ok).toBe(false);

    if (res.ok) return;

    expect(res.error.code).toBe("MATRIX_MISSING");
  });
});
