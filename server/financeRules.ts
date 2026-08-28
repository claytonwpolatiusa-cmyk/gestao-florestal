export type ReceivableStatus = "A Receber" | "Recebido Parcial" | "Recebido Total";
export type PayableStatus = "A Pagar" | "Pago Parcial" | "Pago Total";

function money(value: number | string | null | undefined): number {
  const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function pendingBalance(total: number | string, settled: number | string): number {
  return Math.max(money(total) - money(settled), 0);
}

export function receivableStatus(invoiceTotal: number | string, received: number | string): ReceivableStatus {
  const total = money(invoiceTotal);
  const paid = money(received);
  if (paid <= 0) return "A Receber";
  if (paid < total) return "Recebido Parcial";
  return "Recebido Total";
}

export function payableStatus(expenseTotal: number | string, paid: number | string): PayableStatus {
  const total = money(expenseTotal);
  const settled = money(paid);
  if (settled <= 0) return "A Pagar";
  if (settled < total) return "Pago Parcial";
  return "Pago Total";
}

export function realizedCash(receipts: Array<number | string>, payments: Array<number | string>): number {
  return receipts.reduce<number>((sum, value) => sum + money(value), 0) - payments.reduce<number>((sum, value) => sum + money(value), 0);
}

export type RecurrencePeriodicity = "Mensal" | "Bimestral" | "Trimestral" | "Semestral" | "Anual";

export type RecurrenceState = {
  generated: number;
  remaining: number;
  nextDue: Date;
};

export function recurrenceCanGenerate(state: Pick<RecurrenceState, "remaining">): boolean {
  return state.remaining > 0;
}

function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return result;
}

export function nextRecurrenceDate(date: Date, periodicity: RecurrencePeriodicity): Date {
  const increments: Record<RecurrencePeriodicity, number> = {
    Mensal: 1,
    Bimestral: 2,
    Trimestral: 3,
    Semestral: 6,
    Anual: 12,
  };
  return addMonthsClamped(date, increments[periodicity]);
}

export function advanceRecurrence(state: RecurrenceState, periodicity: RecurrencePeriodicity): RecurrenceState {
  if (!recurrenceCanGenerate(state)) return state;
  return {
    generated: state.generated + 1,
    remaining: state.remaining - 1,
    nextDue: nextRecurrenceDate(state.nextDue, periodicity),
  };
}

export function recurrenceInstallmentNumber(state: Pick<RecurrenceState, "generated" | "remaining">, total: number): number | null {
  if (!recurrenceCanGenerate(state)) return null;
  return total - state.remaining + 1;
}
