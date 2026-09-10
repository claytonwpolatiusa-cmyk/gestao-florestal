type StandRow = {
  stand: { id: number; code: string; name: string | null; species: "pinus" | "eucalipto"; operationalStatus: string; areaHa: unknown; polygonGeoJson: string | null; polygonFileUrl: string | null; polygonFormat: "kml" | "geojson" | "kmz" | "outro" | null };
  propertyName: string;
};

type LedgerRow = { entry: { id: number; standId: number | null; flow: "receita" | "despesa"; status: string; amount: unknown; description: string; occurredAt: Date } };
type TicketRow = { ticket: { id: number; standId: number; ticketNumber: string; netWeightTons: unknown; issuedAt: Date } };

function numeric(value: unknown) { const parsed = Number(value ?? 0); return Number.isFinite(parsed) ? parsed : 0; }

export function buildTerritoryOverview(stands: StandRow[], ledger: LedgerRow[], tickets: TicketRow[]) {
  return stands.map(item => {
    const standLedger = ledger.filter(record => record.entry.standId === item.stand.id);
    const approvedCost = standLedger.filter(record => record.entry.flow === "despesa" && record.entry.status === "aprovado").reduce((sum, record) => sum + numeric(record.entry.amount), 0);
    const ledgerOperations = standLedger.map(record => ({ id: `caixa-${record.entry.id}`, kind: record.entry.flow === "despesa" ? "Custo lançado" : "Receita lançada", description: record.entry.description, occurredAt: record.entry.occurredAt }));
    const ticketOperations = tickets.filter(record => record.ticket.standId === item.stand.id).map(record => ({ id: `ticket-${record.ticket.id}`, kind: "Ticket de balança", description: `${record.ticket.ticketNumber} · ${numeric(record.ticket.netWeightTons).toFixed(3)} t`, occurredAt: record.ticket.issuedAt }));
    return {
      id: item.stand.id,
      code: item.stand.code,
      name: item.stand.name,
      propertyName: item.propertyName,
      species: item.stand.species,
      operationalStatus: item.stand.operationalStatus,
      areaHa: Number(numeric(item.stand.areaHa).toFixed(2)),
      polygonGeoJson: item.stand.polygonGeoJson,
      polygonFileUrl: item.stand.polygonFileUrl,
      polygonFormat: item.stand.polygonFormat,
      totalCosts: Number(approvedCost.toFixed(2)),
      latestOperations: [...ledgerOperations, ...ticketOperations].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, 4),
    };
  });
}
