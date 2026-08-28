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
