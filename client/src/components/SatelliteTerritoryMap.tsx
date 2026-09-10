import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, PencilLine } from "lucide-react";
import { MapView } from "@/components/Map";

export type MapRing = Array<{ lat: number; lng: number }>;
export type SatellitePolygon = { id: number | string; label: string; species: "pinus" | "eucalipto"; rings: MapRing[]; color?: string; fillOpacity?: number };
export type DrawnArea = { geoJson: string; areaHa: number };

const BRAZIL_CENTER = { lat: -15.7801, lng: -47.9292 };
const colors = { pinus: "#2f9fb3", eucalipto: "#86ad45" };

function normalizePath(path: google.maps.MVCArray<google.maps.LatLng>) {
  return Array.from({ length: path.getLength() }, (_, index) => {
    const point = path.getAt(index);
    return { lat: point.lat(), lng: point.lng() };
  });
}

export function drawnPolygonToGeoJson(path: Array<{ lat: number; lng: number }>) {
  const closed = path.length && (path[0].lat !== path[path.length - 1].lat || path[0].lng !== path[path.length - 1].lng) ? [...path, path[0]] : path;
  return JSON.stringify({ type: "Polygon", coordinates: [closed.map(point => [Number(point.lng.toFixed(7)), Number(point.lat.toFixed(7))])] });
}

export function polygonAreaHa(path: Array<{ lat: number; lng: number }>) {
  if (path.length < 3) return 0;
  if (window.google?.maps?.geometry?.spherical) return Number((google.maps.geometry.spherical.computeArea(path) / 10_000).toFixed(2));
  const averageLatitude = path.reduce((sum, point) => sum + point.lat, 0) / path.length;
  const metersPerLat = 111_320;
  const metersPerLng = 111_320 * Math.cos((averageLatitude * Math.PI) / 180);
  const planar = path.reduce((sum, point, index) => {
    const next = path[(index + 1) % path.length];
    return sum + (point.lng * metersPerLng) * (next.lat * metersPerLat) - (next.lng * metersPerLng) * (point.lat * metersPerLat);
  }, 0);
  return Number((Math.abs(planar) / 2 / 10_000).toFixed(2));
}

function VectorFallback({ polygons, selectedId, onSelect, drawingEnabled, onPolygonDrawn }: { polygons: SatellitePolygon[]; selectedId?: number | string | null; onSelect?: (id: number | string) => void; drawingEnabled?: boolean; onPolygonDrawn?: (area: DrawnArea) => void }) {
  const points = polygons.flatMap(polygon => polygon.rings.flat());
  const minLng = points.length ? Math.min(...points.map(point => point.lng)) : -1; const maxLng = points.length ? Math.max(...points.map(point => point.lng)) : 1;
  const minLat = points.length ? Math.min(...points.map(point => point.lat)) : -1; const maxLat = points.length ? Math.max(...points.map(point => point.lat)) : 1;
  const project = (point: { lat: number; lng: number }) => ({ x: 8 + ((point.lng - minLng) / Math.max(maxLng - minLng, 0.00001)) * 84, y: 92 - ((point.lat - minLat) / Math.max(maxLat - minLat, 0.00001)) * 84 });
  const [draft, setDraft] = useState<Array<{ lat: number; lng: number }>>([]);
  const centerLat = (minLat + maxLat) / 2; const centerLng = (minLng + maxLng) / 2;
  const zoom = Math.max(10, Math.min(18, Math.round(13 - Math.log2(Math.max(maxLat - minLat, maxLng - minLng, 0.0002) / 0.01))));
  const satelliteUrl = points.length ? `/api/territory-satellite?lat=${encodeURIComponent(centerLat)}&lng=${encodeURIComponent(centerLng)}&zoom=${zoom}` : null;
  const toPoint = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return { lng: minLng + ((x - 8) / 84) * (maxLng - minLng), lat: minLat + ((92 - y) / 84) * (maxLat - minLat) };
  };
  const completeDraft = () => { if (draft.length < 3) return; onPolygonDrawn?.({ geoJson: drawnPolygonToGeoJson(draft), areaHa: polygonAreaHa(draft) }); setDraft([]); };
  return <div className="relative h-full w-full overflow-hidden bg-[#e9f0e8]" aria-label="Mapa territorial de contingência">{satelliteUrl && <img src={satelliteUrl} alt="Imagem de satélite da área" className="absolute inset-0 h-full w-full object-cover opacity-75" />}<svg viewBox="0 0 100 100" onClick={event => { if (drawingEnabled) { const point = toPoint(event); setDraft(previous => [...previous, point]); } }} onDoubleClick={event => { event.preventDefault(); completeDraft(); }} className={`relative h-full w-full ${drawingEnabled ? "cursor-crosshair" : ""}`}>{polygons.map(shape => <g key={shape.id}>{shape.rings.map((ring, index) => <polygon key={index} points={ring.map(point => { const projected = project(point); return `${projected.x},${projected.y}`; }).join(" ")} onClick={event => { event.stopPropagation(); onSelect?.(shape.id); }} className="cursor-pointer transition-opacity hover:opacity-90" fill={shape.color || colors[shape.species]} fillOpacity={selectedId === shape.id ? 0.52 : shape.fillOpacity ?? 0.28} stroke={shape.color || colors[shape.species]} strokeWidth={selectedId === shape.id ? 1.2 : 0.65} vectorEffect="non-scaling-stroke" />)}</g>)}{draft.length > 0 && <polyline points={draft.map(point => { const projected = project(point); return `${projected.x},${projected.y}`; }).join(" ")} fill="none" stroke="#f07c34" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}{draft.map((point, index) => { const projected = project(point); return <circle key={index} cx={projected.x} cy={projected.y} r="1.3" fill="#f07c34" />; })}</svg>{drawingEnabled ? <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-xl border border-white/20 bg-[#173f2e]/90 px-3 py-2 text-[11px] leading-4 text-white shadow-lg"><span>Clique para marcar pontos; dê dois cliques para concluir.</span><button type="button" onClick={completeDraft} disabled={draft.length < 3} className="rounded-lg bg-[#f4b078] px-2 py-1 font-bold text-[#4f2a10] disabled:opacity-50">Concluir</button></div> : <div className="absolute inset-x-3 bottom-3 rounded-xl border border-[#d9e5d8] bg-white/95 px-3 py-2 text-center text-[11px] leading-4 text-[#516c59]">Satélite em modo de contingência. Os limites continuam interativos.</div>}</div>;
}

export function SatelliteTerritoryMap({ polygons, selectedId, onSelect, drawingEnabled = false, onPolygonDrawn, className = "h-[430px]" }: { polygons: SatellitePolygon[]; selectedId?: number | string | null; onSelect?: (id: number | string) => void; drawingEnabled?: boolean; onPolygonDrawn?: (area: DrawnArea) => void; className?: string }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<google.maps.Polygon[]>([]);
  const drawingRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(true);

  const clearOverlays = useCallback(() => { overlaysRef.current.forEach(item => item.setMap(null)); overlaysRef.current = []; }, []);
  const centerAll = useCallback(() => {
    if (!mapRef.current || !polygons.length) return;
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    polygons.forEach(shape => shape.rings.flat().forEach(point => { bounds.extend(point); count += 1; }));
    if (count) mapRef.current.fitBounds(bounds, 44);
  }, [polygons]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !window.google) return;
    clearOverlays();
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    polygons.forEach(shape => {
      const selected = selectedId === shape.id;
      const color = shape.color || colors[shape.species];
      const overlay = new google.maps.Polygon({ paths: shape.rings, strokeColor: color, strokeOpacity: 1, strokeWeight: selected ? 4 : 2, fillColor: color, fillOpacity: selected ? 0.42 : shape.fillOpacity ?? 0.24, clickable: Boolean(onSelect), map });
      if (onSelect) overlay.addListener("click", () => onSelect(shape.id));
      overlaysRef.current.push(overlay);
      shape.rings.flat().forEach(point => { bounds.extend(point); count += 1; });
    });
    if (count) map.fitBounds(bounds, 44);
    return clearOverlays;
  }, [clearOverlays, onSelect, polygons, ready, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !window.google?.maps?.drawing) return;
    drawingRef.current?.setMap(null);
    drawingRef.current = null;
    if (!drawingEnabled) return;
    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: { position: google.maps.ControlPosition.TOP_CENTER, drawingModes: [google.maps.drawing.OverlayType.POLYGON] },
      polygonOptions: { strokeColor: "#f07c34", strokeWeight: 3, fillColor: "#f7a35c", fillOpacity: 0.24, editable: true },
    });
    manager.setMap(map);
    const listener = manager.addListener("overlaycomplete", (event: google.maps.drawing.OverlayCompleteEvent) => {
      if (event.type !== google.maps.drawing.OverlayType.POLYGON) return;
      const polygon = event.overlay as google.maps.Polygon;
      const path = normalizePath(polygon.getPath());
      polygon.setMap(null);
      manager.setDrawingMode(null);
      onPolygonDrawn?.({ geoJson: drawnPolygonToGeoJson(path), areaHa: polygonAreaHa(path) });
    });
    drawingRef.current = manager;
    return () => { google.maps.event.removeListener(listener); manager.setMap(null); };
  }, [drawingEnabled, onPolygonDrawn, ready]);

  return <div className={`relative overflow-hidden rounded-2xl border border-[#b6cdbd] bg-[#e8efe8] ${className}`}>{mapError ? <VectorFallback polygons={polygons} selectedId={selectedId} onSelect={onSelect} drawingEnabled={drawingEnabled} onPolygonDrawn={onPolygonDrawn} /> : <MapView className="h-full w-full" initialCenter={BRAZIL_CENTER} initialZoom={5} onMapError={() => setMapError(true)} onMapReady={map => { mapRef.current = map; map.setMapTypeId("satellite"); map.setOptions({ streetViewControl: false, mapTypeControlOptions: { mapTypeIds: ["satellite", "roadmap", "hybrid"] } }); setReady(true); }} />}{!ready && !mapError && <div className="absolute inset-0 grid place-items-center bg-[#eff4ee]/90 text-sm font-medium text-[#42614b]">Carregando mapa de satélite…</div>}{ready && !polygons.length && !drawingEnabled && <div className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center"><div className="rounded-2xl border border-white/30 bg-[#173f2e]/85 px-5 py-4 text-sm text-white shadow-xl"><MapPin className="mx-auto mb-2 h-5 w-5 text-[#f4b078]" />Ainda não há limites desenhados.</div></div>}{drawingEnabled && ready && <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-[#173f2e]/90 px-3 py-2 text-xs font-medium text-white shadow-lg"><PencilLine className="mr-1.5 inline h-4 w-4 text-[#f4b078]" />Use a ferramenta no topo do mapa para desenhar o limite do talhão.</div>}<button type="button" onClick={centerAll} disabled={!polygons.length || !ready} className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-white/95 px-3 text-xs font-semibold text-[#214a36] shadow-lg disabled:opacity-50"><LocateFixed className="h-3.5 w-3.5" />Ver todos</button></div>;
}
