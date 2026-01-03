export type DimensionCm = number;

export type PriceCents = number;

export type PricingRules = {
  width: { min: DimensionCm; max: DimensionCm; step: DimensionCm };
  height: { min: DimensionCm; max: DimensionCm; step: DimensionCm };
};

export type PricingInput = {
  widthCm: number;
  heightCm: number;
};

export type NormalizedDimensions = {
  widthCmRaw: number;
  heightCmRaw: number;
  widthCm: number;
  heightCm: number;
  widthRoundedFrom?: number;
  heightRoundedFrom?: number;
};

export type PricingResult =
  | {
      ok: true;
      normalized: NormalizedDimensions;
      priceCents: PriceCents;
      currency: "EUR";
    }
  | {
      ok: false;
      error: {
        code:
          | "INVALID_INPUT"
          | "OUT_OF_RANGE"
          | "MATRIX_MISSING"
          | "INTERNAL_ERROR";
        message: string;
        meta?: Record<string, unknown>;
      };
    };

export type PriceMatrix = Record<string, Record<string, PriceCents>>;
