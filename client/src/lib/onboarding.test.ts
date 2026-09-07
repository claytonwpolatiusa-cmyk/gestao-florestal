import { describe, expect, it } from "vitest";
import { nextOnboardingEntryCount, resolveOnboardingAction, shouldShowOnboarding } from "./onboarding";

describe("onboarding Treeway", () => {
  it("mostra nas três primeiras entradas", () => {
    expect(shouldShowOnboarding(0, false)).toBe(true);
    expect(shouldShowOnboarding(1, false)).toBe(true);
    expect(shouldShowOnboarding(2, false)).toBe(true);
    expect(shouldShowOnboarding(3, false)).toBe(false);
    expect(nextOnboardingEntryCount(2, false)).toBe(3);
  });

  it("mostra sempre no acesso de equipe", () => {
    expect(shouldShowOnboarding(3, true)).toBe(true);
    expect(nextOnboardingEntryCount(3, true)).toBe(4);
  });

  it("fecha sem bloquear a plataforma ao usar X ou pular por agora", () => {
    expect(resolveOnboardingAction("close")).toEqual({ shouldRemainOpen: false });
    expect(resolveOnboardingAction("skip")).toEqual({ shouldRemainOpen: false });
  });

  it("fecha o aviso e direciona ao Tutorial quando solicitado", () => {
    expect(resolveOnboardingAction("open_tutorial")).toEqual({ shouldRemainOpen: false, destination: "/tutorial" });
  });
});
