import { describe, expect, it } from "vitest";
import {
  advanceRecurrence,
  nextRecurrenceDate,
  payableStatus,
  pendingBalance,
  realizedCash,
  recurrenceCanGenerate,
  recurrenceInstallmentNumber,
  receivableStatus,
} from "./financeRules";

describe("regras financeiras", () => {
  it("classifica contas a receber como a receber, parcial ou total", () => {
    expect(receivableStatus("1000,00", 0)).toBe("A Receber");
    expect(receivableStatus(1000, 250)).toBe("Recebido Parcial");
    expect(receivableStatus(1000, 1000)).toBe("Recebido Total");
    expect(pendingBalance(1000, 250)).toBe(750);
  });

  it("classifica contas a pagar como a pagar, parcial ou total", () => {
    expect(payableStatus(800, 0)).toBe("A Pagar");
    expect(payableStatus(800, 300)).toBe("Pago Parcial");
    expect(payableStatus(800, 800)).toBe("Pago Total");
    expect(pendingBalance(800, 950)).toBe(0);
  });

  it("calcula somente o caixa efetivamente realizado", () => {
    expect(realizedCash(["1000,50", 200], [150, "50,50"])).toBe(1000);
  });

  it("gera parcelas sequencialmente, avança contadores e calcula a próxima data", () => {
    const initial = { generated: 0, remaining: 3, nextDue: new Date("2026-09-30T00:00:00.000Z") };
    expect(recurrenceCanGenerate(initial)).toBe(true);
    expect(recurrenceInstallmentNumber(initial, 3)).toBe(1);

    const second = advanceRecurrence(initial, "Mensal");
    expect(second.generated).toBe(1);
    expect(second.remaining).toBe(2);
    expect(second.nextDue.toISOString()).toBe("2026-10-30T00:00:00.000Z");
    expect(recurrenceInstallmentNumber(second, 3)).toBe(2);
  });

  it("ajusta datas no fim do mês sem transbordar para o mês seguinte", () => {
    expect(nextRecurrenceDate(new Date("2026-01-31T00:00:00.000Z"), "Mensal").toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });

  it("bloqueia a geração e não altera o estado ao fim da série", () => {
    const finished = { generated: 3, remaining: 0, nextDue: new Date("2026-12-15T00:00:00.000Z") };
    expect(recurrenceCanGenerate(finished)).toBe(false);
    expect(recurrenceInstallmentNumber(finished, 3)).toBeNull();
    expect(advanceRecurrence(finished, "Mensal")).toEqual(finished);
  });
});
