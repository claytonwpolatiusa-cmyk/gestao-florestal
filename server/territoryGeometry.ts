import JSZip from "jszip";
import { storageGetSignedUrl } from "./storage";

export type ServerTerritoryPoint = { lat: number; lng: number };

function validCoordinate(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length >= 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]));
}

function ringsFromGeoJson(value: unknown): ServerTerritoryPoint[][] {
  if (!value || typeof value !== "object") return [];
  const source = value as { type?: string; coordinates?: unknown; geometry?: unknown; features?: unknown[] };
  if (source.type === "Feature") return ringsFromGeoJson(source.geometry);
  if (source.type === "FeatureCollection") return (source.features || []).flatMap(feature => ringsFromGeoJson(feature));
  if (source.type === "Polygon" && Array.isArray(source.coordinates)) return source.coordinates.slice(0, 1).map(ring => Array.isArray(ring) ? ring.filter(validCoordinate).map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) })) : []).filter(ring => ring.length >= 3);
  if (source.type === "MultiPolygon" && Array.isArray(source.coordinates)) return source.coordinates.flatMap(polygon => ringsFromGeoJson({ type: "Polygon", coordinates: polygon }));
  return [];
}

export function ringsFromKml(source: string): ServerTerritoryPoint[][] {
  return Array.from(source.matchAll(/<coordinates[^>]*>([\s\S]*?)<\/coordinates>/gi))
    .map(match => match[1].trim().split(/\s+/).map(raw => {
      const [lng, lat] = raw.split(",").map(Number);
      return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    }).filter((point): point is ServerTerritoryPoint => Boolean(point)))
    .filter(ring => ring.length >= 3);
}

export async function ringsFromStoredGeometry(input: { fileKey?: string | null; format?: "kml" | "geojson" | "kmz" | "outro" | null; geoJson?: string | null }): Promise<ServerTerritoryPoint[][]> {
  if (input.geoJson) {
    try { return ringsFromGeoJson(JSON.parse(input.geoJson)); } catch { return []; }
  }
  if (!input.fileKey) return [];
  const signedUrl = await storageGetSignedUrl(input.fileKey);
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error("Não foi possível abrir a geometria armazenada.");
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isKmz = input.format === "kmz" || (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b);
  if (isKmz) {
    const archive = await JSZip.loadAsync(buffer);
    const kmlPath = Object.keys(archive.files).find(path => path.toLowerCase().endsWith(".kml"));
    return kmlPath ? ringsFromKml(await archive.files[kmlPath].async("text")) : [];
  }
  const text = new TextDecoder().decode(buffer).trim();
  if (input.format === "geojson" || text.startsWith("{") || text.startsWith("[")) {
    try { return ringsFromGeoJson(JSON.parse(text)); } catch { return []; }
  }
  return ringsFromKml(text);
}
