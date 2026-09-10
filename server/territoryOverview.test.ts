import { describe, expect, it } from "vitest";
import { buildTerritoryOverview } from "./territoryOverview";

describe("buildTerritoryOverview", () => {
  it("separa custos aprovados e ordena as últimas operações do talhão", () => {
    const result = buildTerritoryOverview([
      { stand: { id: 7, code: "T-07", name: "Pinus norte", species: "pinus", operationalStatus: "ativo", areaHa: "12.50", polygonGeoJson: "{\"type\":\"Polygon\"}", polygonFileUrl: null, polygonFormat: "geojson" }, propertyName: "Área Norte" },
    ], [
      { entry: { id: 1, standId: 7, flow: "despesa", status: "aprovado", amount: "1200.50", description: "Manutenção", occurredAt: new Date("2026-09-02") } },
      { entry: { id: 2, standId: 7, flow: "despesa", status: "pendente", amount: "999.99", description: "Não aprovado", occurredAt: new Date("2026-09-03") } },
    ], [
      { ticket: { id: 4, standId: 7, ticketNumber: "B-14", netWeightTons: "31.125", issuedAt: new Date("2026-09-04") } },
    ]);

    expect(result[0]).toMatchObject({ code: "T-07", totalCosts: 1200.5, areaHa: 12.5 });
    expect(result[0]?.latestOperations.map(item => item.id)).toEqual(["ticket-4", "caixa-2", "caixa-1"]);
  });
});
