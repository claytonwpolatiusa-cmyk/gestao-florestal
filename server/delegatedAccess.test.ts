import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

function hashCode(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function isUsable(expiresAt: Date, revokedAt: Date | null, now: Date) {
  return !revokedAt && expiresAt.getTime() > now.getTime();
}

describe("política de acesso delegado", () => {
  it("normaliza o código antes de gerar o hash", () => {
    expect(hashCode(" tw-ab12cd34 ")).toBe(hashCode("TW-AB12CD34"));
    expect(hashCode("TW-AB12CD34")).toHaveLength(64);
  });

  it("aceita código dentro do prazo e rejeita código expirado", () => {
    const now = new Date("2026-08-28T00:00:00Z");
    expect(isUsable(new Date("2026-08-28T04:00:00Z"), null, now)).toBe(true);
    expect(isUsable(new Date("2026-08-28T00:00:00Z"), null, now)).toBe(false);
  });

  it("rejeita código revogado mesmo dentro do prazo", () => {
    const now = new Date("2026-08-28T00:00:00Z");
    expect(isUsable(new Date("2026-08-29T00:00:00Z"), new Date(), now)).toBe(false);
  });

  it("permite reutilização controlada enquanto não expirar ou ser revogado", () => {
    const expires = new Date("2026-08-28T04:00:00Z");
    expect(isUsable(expires, null, new Date("2026-08-28T01:00:00Z"))).toBe(true);
    expect(isUsable(expires, null, new Date("2026-08-28T03:59:59Z"))).toBe(true);
  });
});
