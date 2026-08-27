import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createAuthenticatedContext(): TrpcContext {
  return {
    user: {
      id: 27,
      openId: "operador-florestal",
      name: "Operador de Campo",
      email: "operador@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const propertyValues = {
  name: "Fazenda Santa Clara",
  registry: "12.345",
  carNumber: "SC-123456789",
  municipality: "Porto União",
  state: "sc",
  address: "Estrada Geral, km 12",
  notes: "Acesso pela porteira norte.",
};

describe("forest.property audit trail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atribui a criação da propriedade ao usuário autenticado", async () => {
    dbMocks.createProperty.mockResolvedValue(41);
    const caller = appRouter.createCaller(createAuthenticatedContext());

    const result = await caller.forest.property.create(propertyValues);

    expect(result).toEqual({ id: 41 });
    expect(dbMocks.createProperty).toHaveBeenCalledWith(
      27,
      { id: 27, name: "Operador de Campo" },
      { ...propertyValues, state: "SC" },
    );
  });

  it("atribui a atualização ao usuário autenticado sem aceitar ator do formulário", async () => {
    const caller = appRouter.createCaller(createAuthenticatedContext());

    await caller.forest.property.update({ id: 41, ...propertyValues });

    expect(dbMocks.updateProperty).toHaveBeenCalledWith(
      41,
      27,
      { id: 27, name: "Operador de Campo" },
      { ...propertyValues, state: "SC" },
    );
  });
});
