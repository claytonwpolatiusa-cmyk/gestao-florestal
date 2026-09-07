import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext() {
  return {
    user: null,
    req: { protocol: "https", headers: {} },
    res: {},
  } as TrpcContext;
}

describe("support.createRequest", () => {
  it("rejeita endereço de e-mail inválido antes de gravar a solicitação", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.support.createRequest({
      name: "Produtor Exemplo",
      email: "email-invalido",
      subject: "Dúvida sobre plano",
      message: "Quero entender como a plataforma funciona.",
    })).rejects.toThrow();
  });

  it("rejeita mensagem curta para preservar um contexto mínimo de triagem", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.support.createRequest({
      name: "Produtor Exemplo",
      email: "produtor@example.com",
      subject: "Plano",
      message: "Curta",
    })).rejects.toThrow();
  });
});
