import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createSupportRequest: vi.fn(),
}));

vi.mock("./db", () => ({
  createContentLead: vi.fn(),
  createDelegatedCode: vi.fn(),
  createSupportRequest: mocks.createSupportRequest,
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

describe("rota de atendimento", () => {
  beforeEach(() => {
    mocks.createSupportRequest.mockReset();
    mocks.createSupportRequest.mockResolvedValue({ id: 42 });
  });

  it("encaminha uma solicitação válida ao helper de persistência", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const input = {
      name: "Produtor autorizado",
      email: "produtor@example.com",
      phone: "+55 42 99999-9999",
      subject: "Dúvida sobre a assinatura",
      message: "Quero entender os próximos passos para ativar a assinatura da plataforma.",
    };

    await expect(caller.support.createRequest(input)).resolves.toEqual({ id: 42 });
    expect(mocks.createSupportRequest).toHaveBeenCalledWith(input);
  });
});
