export type LedgerForTotals = {
  flow: "receita" | "despesa";
  status: "pendente" | "aprovado" | "rejeitado";
  amount: unknown;
};

export type TicketForTotals = {
  status: "pendente" | "conferido" | "divergente" | "recusado";
  netWeightTons: unknown;
};

function toFiniteNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateOperationTotals(entries: LedgerForTotals[], tickets: TicketForTotals[]) {
  const approvedEntries = entries.filter(entry => entry.status === "aprovado");
  const revenue = approvedEntries
    .filter(entry => entry.flow === "receita")
    .reduce((sum, entry) => sum + toFiniteNumber(entry.amount), 0);
  const cost = approvedEntries
    .filter(entry => entry.flow === "despesa")
    .reduce((sum, entry) => sum + toFiniteNumber(entry.amount), 0);
  const tons = tickets
    .filter(ticket => ticket.status === "conferido")
    .reduce((sum, ticket) => sum + toFiniteNumber(ticket.netWeightTons), 0);

  return {
    revenue: Number(revenue.toFixed(2)),
    cost: Number(cost.toFixed(2)),
    tons: Number(tons.toFixed(3)),
    pendingTickets: tickets.filter(ticket => ticket.status === "pendente").length,
  };
}

export function calculateDelayPenalty(deadline: Date | null, checkedAt: Date, dailyPenalty: unknown): number {
  if (!deadline || deadline.getTime() >= checkedAt.getTime()) return 0;
  const overdueDays = Math.ceil((checkedAt.getTime() - deadline.getTime()) / 86_400_000);
  return Number((Math.max(0, overdueDays) * Math.max(0, toFiniteNumber(dailyPenalty))).toFixed(2));
}

export function isTicketOverdue(issuedAt: Date, graceDays: number, checkedAt = new Date()): boolean {
  return checkedAt.getTime() - issuedAt.getTime() > Math.max(1, graceDays) * 86_400_000;
}
