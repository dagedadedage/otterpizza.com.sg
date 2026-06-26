const ONEMAP_API = "https://www.onemap.gov.sg/api/common/elastic";

interface OneMapSearchResult {
  SEARCHVAL: string;
  ADDRESS: string;
  LATITUDE: string;
  LONGITUDE: string;
  X: string;
  Y: string;
}

interface OneMapSearchResponse {
  found: number;
  totalNumPages: number;
  pageNum: number;
  results: OneMapSearchResult[];
}

export interface AddressResult {
  address: string;
  postalCode: string | null;
  lat: number;
  lng: number;
}

export async function searchAddress(query: string): Promise<AddressResult[]> {
  if (query.length < 3) return [];

  try {
    const url = `${ONEMAP_API}/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y`;
    const res = await fetch(url);

    if (!res.ok) return [];

    const data: OneMapSearchResponse = await res.json();

    if (data.found === 0) return [];

    return data.results.slice(0, 8).map((r) => ({
      address: r.ADDRESS,
      postalCode: r.SEARCHVAL.match(/^\d{6}/) ? r.SEARCHVAL.substring(0, 6) : null,
      lat: parseFloat(r.LATITUDE),
      lng: parseFloat(r.LONGITUDE),
    }));
  } catch {
    return [];
  }
}

export async function getCoordinates(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const results = await searchAddress(address);
  if (results.length > 0) {
    return { lat: results[0].lat, lng: results[0].lng };
  }
  return null;
}
