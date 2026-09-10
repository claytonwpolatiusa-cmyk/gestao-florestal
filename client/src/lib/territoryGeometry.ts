export type TerritoryPoint = { lat: number; lng: number };

function validCoordinate(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length >= 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]));
}

export function polygonRingsFromGeoJson(value: unknown): TerritoryPoint[][] {
  if (!value || typeof value !== "object") return [];
  const source = value as { type?: string; coordinates?: unknown; geometry?: unknown; features?: unknown[] };
  if (source.type === "Feature") return polygonRingsFromGeoJson(source.geometry);
  if (source.type === "FeatureCollection") return (source.features || []).flatMap(feature => polygonRingsFromGeoJson(feature));
  if (source.type === "Polygon" && Array.isArray(source.coordinates)) return source.coordinates.slice(0, 1).map(ring => Array.isArray(ring) ? ring.filter(validCoordinate).map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) })) : []).filter(points => points.length >= 3);
  if (source.type === "MultiPolygon" && Array.isArray(source.coordinates)) return source.coordinates.flatMap(polygon => polygonRingsFromGeoJson({ type: "Polygon", coordinates: polygon }));
  return [];
}

export function polygonRingsFromKml(source: string): TerritoryPoint[][] {
  return Array.from(source.matchAll(/<coordinates[^>]*>([\s\S]*?)<\/coordinates>/gi))
    .map(match => match[1].trim().split(/\s+/).map(raw => {
      const [lng, lat] = raw.split(",").map(Number);
      return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    }).filter((point): point is TerritoryPoint => Boolean(point)))
    .filter(points => points.length >= 3);
}

export async function polygonRingsFromKmz(buffer: ArrayBuffer): Promise<TerritoryPoint[][]> {
  const JSZip = (await import("jszip")).default;
  const archive = await JSZip.loadAsync(buffer);
  const kmlPath = Object.keys(archive.files).find(path => path.toLowerCase().endsWith(".kml"));
  if (!kmlPath) return [];
  return polygonRingsFromKml(await archive.files[kmlPath].async("text"));
}

export async function polygonRingsFromRemoteFile(url: string, format?: "kml" | "geojson" | "kmz" | null): Promise<TerritoryPoint[][]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível abrir o arquivo de mapa.");
  const lowerUrl = url.toLowerCase();
  const detected = lowerUrl.endsWith(".kmz") ? "kmz" : lowerUrl.includes("geojson") || lowerUrl.endsWith(".json") ? "geojson" : format || "kml";
  if (detected === "kmz") return polygonRingsFromKmz(await response.arrayBuffer());
  const text = await response.text();
  if (detected === "geojson") return polygonRingsFromGeoJson(JSON.parse(text));
  return polygonRingsFromKml(text);
}
