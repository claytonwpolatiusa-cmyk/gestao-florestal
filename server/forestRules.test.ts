import { describe, expect, it } from "vitest";
import { calculateDelayPenalty, calculateOperationTotals } from "./forestRules";

describe("calculateOperationTotals", () => {
  it("considera apenas lançamentos aprovados e tickets conferidos", () => {
    const totals = calculateOperationTotals(
      [
        { flow: "receita", status: "aprovado", amount: "12500.50" },
        { flow: "despesa", status: "aprovado", amount: "3280.25" },
        { flow: "receita", status: "pendente", amount: "9000.00" },
        { flow: "despesa", status: "rejeitado", amount: "100.00" },
      ],
      [
        { status: "conferido", netWeightTons: "31.250" },
        { status: "pendente", netWeightTons: "28.700" },
        { status: "conferido", netWeightTons: "19.125" },
      ],
    );
    expect(totals).toEqual({ revenue: 12500.5, cost: 3280.25, tons: 50.375, pendingTickets: 1 });
  });
});

describe("calculateDelayPenalty", () => {
  it("calcula multa diária somente quando o prazo estiver vencido", () => {
    const deadline = new Date("2026-08-20T00:00:00Z");
    expect(calculateDelayPenalty(deadline, new Date("2026-08-23T12:00:00Z"), "500.00")).toBe(2000);
    expect(calculateDelayPenalty(deadline, new Date("2026-08-19T12:00:00Z"), "500.00")).toBe(0);
  });
});
