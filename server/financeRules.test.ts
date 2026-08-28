import { describe, expect, it } from "vitest";
import { payableStatus, pendingBalance, realizedCash, receivableStatus } from "./financeRules";

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
});
