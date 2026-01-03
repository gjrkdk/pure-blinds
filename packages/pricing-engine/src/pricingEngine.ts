import type {
  PriceMatrix,
  PricingInput,
  PricingResult,
  PricingRules,
} from "./types";
import { validateAndNormalizeDimensions } from "./rounding";

export type PricingEngineConfig = {
  rules: PricingRules;
  matrix: PriceMatrix;
  currency?: "EUR";
};

export function priceJaloezie(
  input: PricingInput,
  config: PricingEngineConfig
): PricingResult {
  try {
    const currency = config.currency ?? "EUR";

    const normalized = validateAndNormalizeDimensions(
      input.widthCm,
      input.heightCm,
      config.rules
    );

    if (!normalized.ok) return { ok: false, error: normalized.error };

    const { widthCm, heightCm } = normalized.value;

    const row = config.matrix[String(widthCm)];
    if (!row) {
      return {
        ok: false,
        error: {
          code: "MATRIX_MISSING",
          message: `No pricing row for width ${widthCm}cm.`,
          meta: { widthCm, heightCm },
        },
      };
    }

    const priceCents = row[String(heightCm)];
    if (typeof priceCents !== "number") {
      return {
        ok: false,
        error: {
          code: "MATRIX_MISSING",
          message: `No price for ${widthCm}cm x ${heightCm}cm in matrix.`,
          meta: { widthCm, heightCm },
        },
      };
    }

    return {
      ok: true,
      normalized: normalized.value,
      priceCents,
      currency,
    };
  } catch (e) {
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected pricing error.",
        meta: { cause: e instanceof Error ? e.message : String(e) },
      },
    };
  }
}
