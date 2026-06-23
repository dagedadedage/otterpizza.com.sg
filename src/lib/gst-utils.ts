/**
 * Calculate GST amount based on settings.
 * Matches server-side logic in src/app/api/checkout/route.ts
 */
export function calculateGst(
  baseAmount: number,
  rate: number,
  mode: "INCLUSIVE" | "EXCLUSIVE"
): number {
  if (rate <= 0) return 0;
  if (mode === "EXCLUSIVE") {
    // GST added on top: base * rate / 100
    return Math.round(baseAmount * rate) / 100;
  }
  // INCLUSIVE: extract embedded GST from total
  return Math.round((baseAmount * rate / (100 + rate)) * 100) / 100;
}

/** Default GST settings used before API response */
export const GST_DEFAULTS = { rate: 9, mode: "EXCLUSIVE" as const };
