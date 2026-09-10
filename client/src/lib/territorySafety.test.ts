import { describe, expect, it } from "vitest";
import { deletionNameMatches, deletionStageAfter, visibleTerritoryItems } from "./territorySafety";

describe("segurança territorial", () => {
  it("conduz a exclusão por duas etapas e permite cancelar", () => {
    expect(deletionStageAfter("start")).toBe("confirm");
    expect(deletionStageAfter("advance")).toBe("danger");
    expect(deletionStageAfter("cancel")).toBeNull();
  });

  it("só libera a exclusão com o nome exato, ignorando maiúsculas e espaços externos", () => {
    expect(deletionNameMatches("Fazenda Santa Clara", " fazenda santa clara ")).toBe(true);
    expect(deletionNameMatches("Fazenda Santa Clara", "Fazenda Clara")).toBe(false);
  });

  it("destaca somente o talhão selecionado e restaura a visão consolidada", () => {
    const items = [{ standId: 1 }, { standId: 2 }, { standId: 2 }];
    expect(visibleTerritoryItems(items, 2)).toEqual([{ standId: 2 }, { standId: 2 }]);
    expect(visibleTerritoryItems(items, null)).toEqual(items);
  });
});
