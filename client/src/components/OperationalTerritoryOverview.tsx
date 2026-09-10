import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleDollarSign, Layers3, MapPinned, ReceiptText, Sprout } from "lucide-react";
import { SatelliteTerritoryMap, type SatellitePolygon } from "@/components/SatelliteTerritoryMap";
import { polygonRingsFromGeoJson, polygonRingsFromRemoteFile, type TerritoryPoint } from "@/lib/territoryGeometry";

export type TerritoryOverviewItem = {
  id: number;
  code: string;
  name: string | null;
  propertyName: string;
  species: "pinus" | "eucalipto";
  operationalStatus: string;
  areaHa: number;
  polygonGeoJson: string | null;
  polygonFileUrl: string | null;
  polygonFormat: "kml" | "geojson" | "kmz" | "outro" | null;
  serverRings?: TerritoryPoint[][];
  totalCosts: number;
  latestOperations: Array<{ id: string; kind: string; description: string; occurredAt: Date }>;
};

function currency(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
function statusLabel(value: string) { return value.replaceAll("_", " "); }

export function OperationalTerritoryOverview({ items }: { items: TerritoryOverviewItem[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(items[0]?.id || null);
  const [fileRings, setFileRings] = useState<Record<number, TerritoryPoint[][]>>({});
  const [loading, setLoading] = useState(false);
  const selected = items.find(item => item.id === selectedId) || null;

  useEffect(() => {
    let active = true;
    const missing = items.filter(item => item.polygonFileUrl && !item.polygonGeoJson && !fileRings[item.id]);
    if (!missing.length) return;
    setLoading(true);
    Promise.all(missing.map(async item => ({ id: item.id, rings: await polygonRingsFromRemoteFile(item.polygonFileUrl!, item.polygonFormat === "outro" ? null : item.polygonFormat) }))).then(result => { if (active) setFileRings(previous => ({ ...previous, ...Object.fromEntries(result.map(item => [item.id, item.rings])) })); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fileRings, items]);

  const polygons = useMemo<SatellitePolygon[]>(() => items.flatMap(item => {
    const rings = item.serverRings?.length ? item.serverRings : item.polygonGeoJson ? polygonRingsFromGeoJson(JSON.parse(item.polygonGeoJson)) : fileRings[item.id] || [];
    return rings.length ? [{ id: item.id, label: item.code, species: item.species, rings }] : [];
  }), [fileRings, items]);

  return <section className="mt-5 overflow-hidden rounded-2xl border border-[#cfe0cf] bg-white shadow-[0_18px_45px_-37px_rgba(27,75,54,0.58)]"><div className="flex flex-col gap-3 border-b border-[#e5ece3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><MapPinned className="h-5 w-5 text-[#2f704d]" /><h2 className="font-semibold text-[#173f2e]">Visão territorial da operação</h2></div><p className="mt-1 text-xs text-[#78867d]">Satélite com Pinus em azul-petróleo e Eucalipto em verde-oliva. Clique em um recorte para ver o resumo.</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#f0f7ee] px-2.5 py-1 text-xs font-semibold text-[#315d40]"><Layers3 className="h-3.5 w-3.5" />{polygons.length} limite(s) visível(is)</span></div><div className="grid min-h-[460px] lg:grid-cols-[1.55fr_.75fr]"><SatelliteTerritoryMap polygons={polygons} selectedId={selectedId} onSelect={id => setSelectedId(Number(id))} className="h-[460px] rounded-none border-0" /> <aside className="border-t border-[#e5ece3] bg-[#fbfdf9] p-5 lg:border-l lg:border-t-0">{selected ? <><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d8b75]">Talhão selecionado</p><h3 className="mt-1 text-xl font-semibold text-[#173f2e]">{selected.code}</h3><p className="mt-1 text-sm text-[#718076]">{selected.name || selected.propertyName}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${selected.species === "pinus" ? "bg-[#e5f5f7] text-[#2f7482]" : "bg-[#edf4df] text-[#668344]"}`}>{selected.species === "pinus" ? "Pinus" : "Eucalipto"}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl border border-[#dde9dd] bg-white p-3"><Sprout className="h-4 w-4 text-[#4e855d]" /><p className="mt-2 text-xs text-[#7a897f]">Situação</p><p className="mt-1 text-sm font-semibold capitalize text-[#244935]">{statusLabel(selected.operationalStatus)}</p></div><div className="rounded-xl border border-[#dde9dd] bg-white p-3"><MapPinned className="h-4 w-4 text-[#4e855d]" /><p className="mt-2 text-xs text-[#7a897f]">Área</p><p className="mt-1 text-sm font-semibold text-[#244935]">{selected.areaHa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha</p></div></div><div className="mt-4 rounded-xl border border-[#f0dfc8] bg-[#fffaf4] p-3"><div className="flex items-center gap-2 text-[#9c632c]"><CircleDollarSign className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.1em]">Custos aprovados</span></div><p className="mt-2 text-xl font-semibold text-[#743f18]">{currency(selected.totalCosts)}</p></div><div className="mt-4"><div className="flex items-center gap-2"><ReceiptText className="h-4 w-4 text-[#476f56]" /><p className="text-sm font-semibold text-[#244935]">Últimas operações</p></div>{selected.latestOperations.length ? <div className="mt-2 divide-y divide-[#e8eee7] rounded-xl border border-[#e0e9df] bg-white">{selected.latestOperations.map(operation => <div key={operation.id} className="px-3 py-2.5"><p className="text-xs font-semibold text-[#385c45]">{operation.kind}</p><p className="mt-0.5 truncate text-xs text-[#728178]">{operation.description}</p><p className="mt-1 text-[11px] text-[#95a198]">{new Date(operation.occurredAt).toLocaleDateString("pt-BR")}</p></div>)}</div> : <p className="mt-2 rounded-xl border border-dashed border-[#dbe7da] bg-white px-3 py-4 text-center text-xs leading-5 text-[#809087]">Nenhuma operação registrada para este talhão.</p>}</div><a href={`/talhoes?talhao=${selected.id}`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1f5d42] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174b35]">Ver detalhes<ArrowRight className="ml-2 h-4 w-4" /></a></> : <div className="grid h-full place-items-center text-center"><div><MapPinned className="mx-auto h-7 w-7 text-[#7eaa88]" /><p className="mt-3 font-semibold text-[#244935]">Selecione um talhão</p><p className="mt-1 max-w-[220px] text-sm leading-6 text-[#75847b]">Clique em um limite no mapa para abrir o resumo de campo e financeiro.</p></div></div>}{loading && <p className="mt-3 text-[11px] text-[#6b8772]">Carregando arquivos de mapa…</p>}</aside></div></section>;
}
