import { Layers3, LocateFixed, MapPin, RefreshCw } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { visibleTerritoryItems } from "@/lib/territorySafety";
import { polygonRingsFromGeoJson, polygonRingsFromKml, polygonRingsFromKmz, type TerritoryPoint } from "@/lib/territoryGeometry";

type TerritoryStand = {
  stand: {
    id: number;
    code: string;
    name: string | null;
    species: "pinus" | "eucalipto";
    polygonGeoJson: string | null;
    polygonFileUrl: string | null;
    polygonUrl: string | null;
    polygonFormat: "kml" | "geojson" | "kmz" | "outro" | null;
  };
  propertyName: string;
};

type RenderedPolygon = { standId: number; code: string; propertyName: string; species: "pinus" | "eucalipto"; points: TerritoryPoint[] };
const PINUS_COLOR = "#2f7482";
const EUCALIPTO_COLOR = "#668344";
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 520;
const PADDING = 56;

function colorFor(species: TerritoryStand["stand"]["species"]) { return species === "pinus" ? PINUS_COLOR : EUCALIPTO_COLOR; }

async function geometryForStand(item: TerritoryStand): Promise<RenderedPolygon[]> {
  const convert = (rings: TerritoryPoint[][]) => rings.map(points => ({ standId: item.stand.id, code: item.stand.code, propertyName: item.propertyName, species: item.stand.species, points }));
  if (item.stand.polygonGeoJson) {
    try {
      const rings = polygonRingsFromGeoJson(JSON.parse(item.stand.polygonGeoJson));
      if (rings.length) return convert(rings);
    } catch { /* Tenta o arquivo anexado abaixo. */ }
  }
  const source = item.stand.polygonFileUrl || item.stand.polygonUrl;
  if (!source) return [];
  try {
    const response = await fetch(source);
    if (!response.ok) return [];
    const isKmz = item.stand.polygonFormat === "kmz" || source.toLowerCase().endsWith(".kmz");
    if (isKmz) {
      return convert(await polygonRingsFromKmz(await response.arrayBuffer()));
    }
    const text = await response.text();
    const isGeoJson = item.stand.polygonFormat === "geojson" || source.toLowerCase().includes("geojson") || source.toLowerCase().endsWith(".json");
    return convert(isGeoJson ? polygonRingsFromGeoJson(JSON.parse(text)) : polygonRingsFromKml(text));
  } catch {
    return [];
  }
}

function project(points: TerritoryPoint[], allPoints: TerritoryPoint[]) {
  const lats = allPoints.map(point => point.lat);
  const lngs = allPoints.map(point => point.lng);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);
  return points.map(point => {
    const x = PADDING + ((point.lng - minLng) / lngSpan) * (SVG_WIDTH - PADDING * 2);
    const y = SVG_HEIGHT - PADDING - ((point.lat - minLat) / latSpan) * (SVG_HEIGHT - PADDING * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

export default function TerritoryMap({ stands }: { stands: TerritoryStand[] }) {
  const [polygons, setPolygons] = useState<RenderedPolygon[]>([]);
  const [selectedStandId, setSelectedStandId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const standSources = useMemo(() => stands.filter(item => item.stand.polygonGeoJson || item.stand.polygonFileUrl || item.stand.polygonUrl), [stands]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all(standSources.map(geometryForStand)).then(result => { if (active) setPolygons(result.flat()); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [standSources]);

  const allPoints = polygons.flatMap(polygon => polygon.points);
  const selected = polygons.find(polygon => polygon.standId === selectedStandId) || null;
  const renderedPolygons = visibleTerritoryItems(polygons, selectedStandId);

  return <section className="overflow-hidden rounded-2xl border border-[#dbe6da] bg-white shadow-[0_18px_45px_-37px_rgba(27,75,54,0.58)]">
    <div className="flex flex-col gap-3 border-b border-[#e5ece3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#628670]">Visão territorial</p><h2 className="mt-1 font-semibold text-[#173f2e]">Mapa de áreas e talhões</h2><p className="mt-1 text-xs text-[#78867d]">Limites lidos dos arquivos KML ou GeoJSON. Clique em um polígono para destacar o talhão.</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setSelectedStandId(null)} disabled={!selectedStandId} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dbe6da] px-2.5 text-xs font-semibold text-[#315440] disabled:opacity-40"><LocateFixed className="h-3.5 w-3.5" />Ver tudo</button><span className="inline-flex items-center gap-2 rounded-full bg-[#eef6ec] px-3 py-1.5 text-xs font-semibold text-[#2d6a48]"><Layers3 className="h-3.5 w-3.5" />{polygons.length} {polygons.length === 1 ? "recorte" : "recortes"}</span></div></div>
    <div className="relative min-h-[380px] overflow-hidden bg-[#e8f0e8] p-3 sm:p-5"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(68,104,80,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(68,104,80,.14) 1px,transparent 1px)", backgroundSize: "34px 34px" }} />{loading ? <div className="relative grid min-h-[340px] place-items-center text-sm font-medium text-[#5f7667]"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Lendo os limites do mapa…</div> : allPoints.length ? <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="relative h-[420px] w-full rounded-xl border border-[#cfddcf] bg-[#f8fbf7] shadow-inner" role="img" aria-label="Mapa interativo de polígonos das áreas e talhões">{[0.2, 0.4, 0.6, 0.8].map(position => <g key={position}><line x1={PADDING} x2={SVG_WIDTH - PADDING} y1={SVG_HEIGHT * position} y2={SVG_HEIGHT * position} stroke="#cbdacb" strokeDasharray="6 8" /><line y1={PADDING} y2={SVG_HEIGHT - PADDING} x1={SVG_WIDTH * position} x2={SVG_WIDTH * position} stroke="#cbdacb" strokeDasharray="6 8" /></g>)}{renderedPolygons.map((polygon, index) => <polygon key={`${polygon.standId}-${index}`} points={project(polygon.points, allPoints)} fill={colorFor(polygon.species)} fillOpacity={selectedStandId === polygon.standId ? 0.6 : 0.32} stroke={colorFor(polygon.species)} strokeWidth={selectedStandId === polygon.standId ? 6 : 3} className="cursor-pointer transition-opacity hover:fill-opacity-60" onClick={() => setSelectedStandId(polygon.standId)}><title>{`${polygon.code} · ${polygon.propertyName}`}</title></polygon>)}</svg> : <div className="relative grid min-h-[340px] place-items-center px-6 text-center"><div><MapPin className="mx-auto h-8 w-8 text-[#7fa18b]" /><p className="mt-3 font-semibold text-[#244935]">Ainda não há limite disponível para desenhar</p><p className="mt-1 max-w-sm text-sm leading-6 text-[#718076]">Envie um KML ou GeoJSON ao cadastrar um talhão. Se já houver um arquivo, confirme se ele contém um polígono válido.</p></div></div>}</div>
    <div className="flex flex-col gap-3 border-t border-[#e5ece3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-3 text-xs font-medium text-[#536b5d]"><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#2f7482]" />Pinus</span><span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#668344]" />Eucalipto</span></div>{selected && <p className="text-sm font-semibold text-[#244935]">Em destaque: {selected.code} · {selected.propertyName}</p>}</div>
  </section>;
}
