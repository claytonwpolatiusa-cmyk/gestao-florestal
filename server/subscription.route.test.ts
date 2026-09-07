import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createSubscriptionLead: vi.fn(),
}));

vi.mock("./db", () => ({
  createContentLead: vi.fn(),
  createDelegatedCode: vi.fn(),
  createSubscriptionLead: mocks.createSubscriptionLead,
  createSupportRequest: vi.fn(),
  listActiveDelegatedCodes: vi.fn(),
  revokeDelegatedCodes: vi.fn(),
  updateUserProfile: vi.fn(),
}));

import { appRouter } from "./routers";

function createPublicContext() {
  return {
    user: null,
    req: { protocol: "https", headers: {} },
    res: {},
  } as TrpcContext;
}

describe("subscriptions.registerInterest", () => {
  beforeEach(() => {
    mocks.createSubscriptionLead.mockReset();
    mocks.createSubscriptionLead.mockResolvedValue({ id: 73 });
  });

  it("registra interesse válido somente após o consentimento de ativação", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const input = {
      name: "Produtor interessado",
      email: "produtor@example.com",
      phone: "+55 42 99999-9999",
      activationContactConsent: true as const,
    };

    await expect(caller.subscriptions.registerInterest(input)).resolves.toEqual({ id: 73 });
    expect(mocks.createSubscriptionLead).toHaveBeenCalledWith(input);
  });

  it("rejeita interesse sem consentimento explícito", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.subscriptions.registerInterest({
      name: "Produtor interessado",
      email: "produtor@example.com",
      phone: "+55 42 99999-9999",
      activationContactConsent: false,
    })).rejects.toThrow();
  });
});
