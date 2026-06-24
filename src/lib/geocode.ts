/**
 * Singapore address geocoding via OneMap API (free gov service).
 * Converts an address string to { latitude, longitude }.
 */

const ONEMAP_BASE = "https://www.onemap.gov.sg/api/common/elastic/search";

interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  postalCode: string;
}

interface OneMapResult {
  ADDRESS: string;
  POSTAL: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  try {
    const url = `${ONEMAP_BASE}?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const results: OneMapResult[] = data.results || [];

    if (results.length === 0) return null;

    const best = results[0];
    return {
      latitude: parseFloat(best.LATITUDE),
      longitude: parseFloat(best.LONGITUDE),
      address: best.ADDRESS,
      postalCode: best.POSTAL,
    };
  } catch (e) {
    console.error("[geocode] Error:", e);
    return null;
  }
}

/**
 * Build a search string from store address components.
 */
export function buildSearchAddress(
  address: string,
  unit: string,
  building: string,
  postalCode: string
): string {
  // Use postal code as primary search for accuracy
  if (postalCode) return postalCode;
  // Fall back to address + building
  const parts = [address, building].filter(Boolean);
  return parts.join(" ");
}
