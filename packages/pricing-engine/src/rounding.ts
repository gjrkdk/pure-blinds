import type { PricingRules } from "./types";

export function ceilToStep(value: number, step: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
    return NaN;
  }
  return Math.ceil(value / step) * step;
}

export function validateAndNormalizeDimensions(
  inputWidth: number,
  inputHeight: number,
  rules: PricingRules
) {
  if (!Number.isFinite(inputWidth) || !Number.isFinite(inputHeight)) {
    return {
      ok: false as const,
      error: {
        code: "INVALID_INPUT" as const,
        message: "Width and height must be valid numbers.",
      },
    };
  }

  const widthCmRaw = inputWidth;
  const heightCmRaw = inputHeight;

  const widthCm = ceilToStep(widthCmRaw, rules.width.step);
  const heightCm = ceilToStep(heightCmRaw, rules.height.step);

  if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm)) {
    return {
      ok: false as const,
      error: {
        code: "INVALID_INPUT" as const,
        message: "Invalid rounding configuration.",
      },
    };
  }

  if (widthCm < rules.width.min || widthCm > rules.width.max) {
    return {
      ok: false as const,
      error: {
        code: "OUT_OF_RANGE" as const,
        message: `Width out of range after rounding (${widthCm} cm). Allowed range: ${rules.width.min}-${rules.width.max} cm.`,
        meta: {
          widthCmRaw,
          widthCm,
        },
      },
    };
  }

  if (heightCm < rules.height.min || heightCm > rules.height.max) {
    return {
      ok: false as const,
      error: {
        code: "OUT_OF_RANGE" as const,
        message: `Height out of range after rounding (${heightCm} cm). Allowed range: ${rules.height.min}-${rules.height.max} cm.`,
        meta: {
          heightCmRaw,
          heightCm,
        },
      },
    };
  }

  return {
    ok: true as const,
    value: {
      widthCmRaw,
      heightCmRaw,
      widthCm,
      heightCm,
      widthRoundedFrom: widthCmRaw !== widthCm ? widthCmRaw : undefined,
      heightRoundedFrom: heightCmRaw !== heightCm ? heightCmRaw : undefined,
    },
  };
}
