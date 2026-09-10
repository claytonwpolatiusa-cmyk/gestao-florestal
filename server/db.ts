import { and, desc, eq, gt, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  contracts,
  documents,
  incidents,
  inspections,
  ledgerEntries,
  propertyAuditLogs,
  propertyDeletionLogs,
  properties,
  stands,
  tickets,
  type InsertUser,
  users,
  delegatedAccessCodes,
  contentLeads,
  supportRequests,
  subscriptionLeads,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createContentLead(values: { name: string; email: string; whatsapp?: string | null; contentUpdatesConsent: boolean; commercialContactConsent: boolean; source?: string }) {
  const db = await requireDb();
  const [created] = await db.insert(contentLeads).values({
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    whatsapp: values.whatsapp?.trim() || null,
    contentUpdatesConsent: values.contentUpdatesConsent ? 1 : 0,
    commercialContactConsent: values.commercialContactConsent ? 1 : 0,
    source: values.source?.trim() || "conteudos",
  }).$returningId();
  return { id: created.id };
}

export async function createSupportRequest(values: { name: string; email: string; phone?: string | null; subject: string; message: string }) {
  const db = await requireDb();
  const [created] = await db.insert(supportRequests).values({
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone?.trim() || null,
    subject: values.subject.trim(),
    message: values.message.trim(),
  }).$returningId();
  return { id: created.id };
}

export async function createSubscriptionLead(values: { name: string; email: string; phone: string; activationContactConsent: boolean }) {
  const db = await requireDb();
  const [created] = await db.insert(subscriptionLeads).values({
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    promotionalMonthlyPriceCents: 29_700,
    referenceMonthlyPriceCents: 59_700,
    activationContactConsent: values.activationContactConsent ? 1 : 0,
  }).$returningId();
  return { id: created.id };
}

export async function updateUserProfile(openId: string, values: { name: string; email: string }) {
  const db = await requireDb();
  await db.update(users).set({ name: values.name, email: values.email }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function createDelegatedCode(ownerUserId: number, codeHash: string, expiresAt: Date) {
  const db = await requireDb();
  const [created] = await db.insert(delegatedAccessCodes).values({ ownerUserId, codeHash, expiresAt }).$returningId();
  return created.id;
}

export async function revokeDelegatedCodes(ownerUserId: number) {
  const db = await requireDb();
  await db.update(delegatedAccessCodes).set({ revokedAt: new Date() }).where(eq(delegatedAccessCodes.ownerUserId, ownerUserId));
}

export async function listActiveDelegatedCodes(ownerUserId: number) {
  const db = await requireDb();
  return db.select({ id: delegatedAccessCodes.id, expiresAt: delegatedAccessCodes.expiresAt, createdAt: delegatedAccessCodes.createdAt }).from(delegatedAccessCodes).where(and(eq(delegatedAccessCodes.ownerUserId, ownerUserId), isNull(delegatedAccessCodes.revokedAt), gt(delegatedAccessCodes.expiresAt, new Date())));
}

export async function consumeDelegatedCode(codeHash: string) {
  const db = await requireDb();
  const rows = await db.select().from(delegatedAccessCodes).where(eq(delegatedAccessCodes.codeHash, codeHash)).limit(1);
  const row = rows[0];
  if (!row || row.revokedAt || row.expiresAt.getTime() <= Date.now()) return undefined;
  await db.update(delegatedAccessCodes).set({ lastUsedAt: new Date() }).where(eq(delegatedAccessCodes.id, row.id));
  return getUserById(row.ownerUserId);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function listProperties(ownerId: number) {
  const db = await requireDb();
  return db.select().from(properties).where(eq(properties.ownerId, ownerId)).orderBy(desc(properties.updatedAt));
}

export async function getOwnedProperty(id: number, ownerId: number) {
  const db = await requireDb();
  const result = await db.select().from(properties).where(and(eq(properties.id, id), eq(properties.ownerId, ownerId))).limit(1);
  return result[0];
}

type AuditActor = { id: number; name: string | null };

export async function createProperty(ownerId: number, actor: AuditActor, values: Omit<typeof properties.$inferInsert, "ownerId" | "createdByUserId" | "updatedByUserId">) {
  const db = await requireDb();
  const [created] = await db.insert(properties).values({ ...values, ownerId, createdByUserId: actor.id, updatedByUserId: actor.id }).$returningId();
  await db.insert(propertyAuditLogs).values({ propertyId: created.id, actorUserId: actor.id, actorName: actor.name, action: "criada", changeSummary: "Cadastro inicial da propriedade." });
  return created.id;
}

export async function updateProperty(id: number, ownerId: number, actor: AuditActor, values: Omit<typeof properties.$inferInsert, "id" | "ownerId" | "createdByUserId" | "updatedByUserId" | "createdAt" | "updatedAt">) {
  const previous = await getOwnedProperty(id, ownerId);
  if (!previous) throw new Error("Propriedade não encontrada ou sem autorização.");
  const changedLabels: Record<string, string> = { name: "nome", registry: "matrícula", carNumber: "CAR", municipality: "município", state: "UF", address: "endereço/acesso", notes: "observações" };
  const changed = Object.entries(values).filter(([key, value]) => previous[key as keyof typeof previous] !== value).map(([key]) => changedLabels[key] || key);
  const db = await requireDb();
  await db.update(properties).set({ ...values, updatedByUserId: actor.id }).where(eq(properties.id, id));
  if (changed.length) await db.insert(propertyAuditLogs).values({ propertyId: id, actorUserId: actor.id, actorName: actor.name, action: "atualizada", changeSummary: `Campos alterados: ${changed.join(", ")}.` });
}

export async function listPropertyAuditLogs(propertyId: number, ownerId: number) {
  const property = await getOwnedProperty(propertyId, ownerId);
  if (!property) throw new Error("Propriedade não encontrada ou sem autorização.");
  const db = await requireDb();
  return db.select().from(propertyAuditLogs).where(eq(propertyAuditLogs.propertyId, propertyId)).orderBy(desc(propertyAuditLogs.createdAt));
}

export async function deletePropertyPermanently(id: number, ownerId: number, actor: AuditActor) {
  const property = await getOwnedProperty(id, ownerId);
  if (!property) throw new Error("Área não encontrada ou sem autorização.");
  const db = await requireDb();

  return db.transaction(async (tx) => {
    const ownedStands = await tx.select({ id: stands.id }).from(stands).where(eq(stands.propertyId, id));
    const standIds = ownedStands.map(item => item.id);

    if (standIds.length) await tx.delete(tickets).where(inArray(tickets.standId, standIds));
    await tx.delete(documents).where(eq(documents.propertyId, id));
    await tx.delete(inspections).where(eq(inspections.propertyId, id));
    await tx.delete(incidents).where(eq(incidents.propertyId, id));
    await tx.delete(ledgerEntries).where(eq(ledgerEntries.propertyId, id));
    await tx.delete(contracts).where(eq(contracts.propertyId, id));
    await tx.delete(propertyAuditLogs).where(eq(propertyAuditLogs.propertyId, id));
    await tx.delete(stands).where(eq(stands.propertyId, id));
    await tx.delete(properties).where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)));
    await tx.insert(propertyDeletionLogs).values({
      deletedPropertyId: id,
      propertyName: property.name,
      ownerUserId: ownerId,
      actorUserId: actor.id,
      actorName: actor.name,
      deletedStandsCount: standIds.length,
    });
    return { deletedStandsCount: standIds.length };
  });
}

export async function listStands(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ stand: stands, propertyName: properties.name, municipality: properties.municipality, state: properties.state })
    .from(stands)
    .innerJoin(properties, eq(stands.propertyId, properties.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(stands.updatedAt));
}

export async function getOwnedStand(id: number, ownerId: number) {
  const db = await requireDb();
  const result = await db
    .select({ stand: stands, property: properties })
    .from(stands)
    .innerJoin(properties, eq(stands.propertyId, properties.id))
    .where(and(eq(stands.id, id), eq(properties.ownerId, ownerId)))
    .limit(1);
  return result[0];
}

export async function createStand(ownerId: number, values: typeof stands.$inferInsert) {
  const property = await getOwnedProperty(values.propertyId, ownerId);
  if (!property) throw new Error("Propriedade não encontrada ou sem autorização.");
  const db = await requireDb();
  const [created] = await db.insert(stands).values(values).$returningId();
  return created.id;
}

export async function listContracts(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ contract: contracts, propertyName: properties.name, standCode: stands.code })
    .from(contracts)
    .innerJoin(properties, eq(contracts.propertyId, properties.id))
    .leftJoin(stands, eq(contracts.standId, stands.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(contracts.updatedAt));
}

export async function getOwnedContract(id: number, ownerId: number) {
  const db = await requireDb();
  const result = await db
    .select({ contract: contracts, property: properties })
    .from(contracts)
    .innerJoin(properties, eq(contracts.propertyId, properties.id))
    .where(and(eq(contracts.id, id), eq(properties.ownerId, ownerId)))
    .limit(1);
  return result[0];
}

export async function createContract(ownerId: number, values: typeof contracts.$inferInsert) {
  const property = await getOwnedProperty(values.propertyId, ownerId);
  if (!property) throw new Error("Propriedade não encontrada ou sem autorização.");
  if (values.standId) {
    const stand = await getOwnedStand(values.standId, ownerId);
    if (!stand || stand.stand.propertyId !== values.propertyId) throw new Error("Talhão inválido para esta propriedade.");
  }
  const db = await requireDb();
  const [created] = await db.insert(contracts).values(values).$returningId();
  return created.id;
}

export async function updateContractStatus(id: number, ownerId: number, status: typeof contracts.$inferInsert.status) {
  const contract = await getOwnedContract(id, ownerId);
  if (!contract) throw new Error("Contrato não encontrado ou sem autorização.");
  const db = await requireDb();
  await db.update(contracts).set({ status }).where(eq(contracts.id, id));
}

export async function listTickets(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ ticket: tickets, standCode: stands.code, contractCode: contracts.code, ticketGraceDays: contracts.ticketGraceDays, propertyName: properties.name })
    .from(tickets)
    .innerJoin(stands, eq(tickets.standId, stands.id))
    .innerJoin(properties, eq(stands.propertyId, properties.id))
    .innerJoin(contracts, eq(tickets.contractId, contracts.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(tickets.issuedAt));
}

export async function createTicket(ownerId: number, values: typeof tickets.$inferInsert) {
  const stand = await getOwnedStand(values.standId, ownerId);
  const contract = await getOwnedContract(values.contractId, ownerId);
  if (!stand || !contract || stand.stand.propertyId !== contract.contract.propertyId) {
    throw new Error("Talhão ou contrato inválido para este lançamento.");
  }
  const db = await requireDb();
  const [created] = await db.insert(tickets).values(values).$returningId();
  return created.id;
}

export async function updateTicketStatus(id: number, ownerId: number, status: typeof tickets.$inferInsert.status) {
  const db = await requireDb();
  const ticket = await db
    .select({ ticket: tickets })
    .from(tickets)
    .innerJoin(stands, eq(tickets.standId, stands.id))
    .innerJoin(properties, eq(stands.propertyId, properties.id))
    .where(and(eq(tickets.id, id), eq(properties.ownerId, ownerId)))
    .limit(1);
  if (!ticket[0]) throw new Error("Ticket não encontrado ou sem autorização.");
  await db.update(tickets).set({ status }).where(eq(tickets.id, id));
}

export async function listLedgerEntries(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ entry: ledgerEntries, standCode: stands.code, contractCode: contracts.code, propertyName: properties.name })
    .from(ledgerEntries)
    .innerJoin(properties, eq(ledgerEntries.propertyId, properties.id))
    .leftJoin(stands, eq(ledgerEntries.standId, stands.id))
    .leftJoin(contracts, eq(ledgerEntries.contractId, contracts.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(ledgerEntries.occurredAt));
}

export async function createLedgerEntry(ownerId: number, values: typeof ledgerEntries.$inferInsert) {
  const property = await getOwnedProperty(values.propertyId, ownerId);
  if (!property) throw new Error("Propriedade não encontrada ou sem autorização.");
  if (values.standId) {
    const stand = await getOwnedStand(values.standId, ownerId);
    if (!stand || stand.stand.propertyId !== values.propertyId) throw new Error("Talhão inválido para este lançamento.");
  }
  if (values.contractId) {
    const contract = await getOwnedContract(values.contractId, ownerId);
    if (!contract || contract.contract.propertyId !== values.propertyId) throw new Error("Contrato inválido para este lançamento.");
  }
  const db = await requireDb();
  const [created] = await db.insert(ledgerEntries).values(values).$returningId();
  return created.id;
}

export async function updateLedgerStatus(id: number, ownerId: number, status: typeof ledgerEntries.$inferInsert.status) {
  const db = await requireDb();
  const entry = await db
    .select({ entry: ledgerEntries })
    .from(ledgerEntries)
    .innerJoin(properties, eq(ledgerEntries.propertyId, properties.id))
    .where(and(eq(ledgerEntries.id, id), eq(properties.ownerId, ownerId)))
    .limit(1);
  if (!entry[0]) throw new Error("Lançamento não encontrado ou sem autorização.");
  await db.update(ledgerEntries).set({ status }).where(eq(ledgerEntries.id, id));
}

export async function listDocuments(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ document: documents, standCode: stands.code, contractCode: contracts.code, propertyName: properties.name })
    .from(documents)
    .innerJoin(properties, eq(documents.propertyId, properties.id))
    .leftJoin(stands, eq(documents.standId, stands.id))
    .leftJoin(contracts, eq(documents.contractId, contracts.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(documents.updatedAt));
}

export async function createDocument(ownerId: number, values: typeof documents.$inferInsert) {
  const property = await getOwnedProperty(values.propertyId, ownerId);
  if (!property) throw new Error("Propriedade não encontrada ou sem autorização.");
  if (values.standId) {
    const stand = await getOwnedStand(values.standId, ownerId);
    if (!stand || stand.stand.propertyId !== values.propertyId) throw new Error("Talhão inválido para este documento.");
  }
  if (values.contractId) {
    const contract = await getOwnedContract(values.contractId, ownerId);
    if (!contract || contract.contract.propertyId !== values.propertyId) throw new Error("Contrato inválido para este documento.");
  }
  const db = await requireDb();
  const [created] = await db.insert(documents).values(values).$returningId();
  return created.id;
}

export async function listInspections(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ inspection: inspections, standCode: stands.code, propertyName: properties.name })
    .from(inspections)
    .innerJoin(stands, eq(inspections.standId, stands.id))
    .innerJoin(properties, eq(inspections.propertyId, properties.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(inspections.inspectedAt));
}

export async function createInspection(ownerId: number, values: typeof inspections.$inferInsert) {
  const stand = await getOwnedStand(values.standId, ownerId);
  if (!stand || stand.stand.propertyId !== values.propertyId) throw new Error("Talhão inválido para esta vistoria.");
  const db = await requireDb();
  const [created] = await db.insert(inspections).values(values).$returningId();
  return created.id;
}

export async function listIncidents(ownerId: number) {
  const db = await requireDb();
  return db
    .select({ incident: incidents, standCode: stands.code, contractCode: contracts.code, propertyName: properties.name })
    .from(incidents)
    .innerJoin(properties, eq(incidents.propertyId, properties.id))
    .leftJoin(stands, eq(incidents.standId, stands.id))
    .leftJoin(contracts, eq(incidents.contractId, contracts.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(incidents.occurredAt));
}

export async function createIncident(ownerId: number, values: typeof incidents.$inferInsert) {
  const property = await getOwnedProperty(values.propertyId, ownerId);
  if (!property) throw new Error("Propriedade não encontrada ou sem autorização.");
  if (values.standId) {
    const stand = await getOwnedStand(values.standId, ownerId);
    if (!stand || stand.stand.propertyId !== values.propertyId) throw new Error("Talhão inválido para esta ocorrência.");
  }
  if (values.contractId) {
    const contract = await getOwnedContract(values.contractId, ownerId);
    if (!contract || contract.contract.propertyId !== values.propertyId) throw new Error("Contrato inválido para esta ocorrência.");
  }
  const db = await requireDb();
  const [created] = await db.insert(incidents).values(values).$returningId();
  return created.id;
}

export async function updateIncidentStatus(id: number, ownerId: number, status: typeof incidents.$inferInsert.status) {
  const db = await requireDb();
  const incident = await db
    .select({ incident: incidents })
    .from(incidents)
    .innerJoin(properties, eq(incidents.propertyId, properties.id))
    .where(and(eq(incidents.id, id), eq(properties.ownerId, ownerId)))
    .limit(1);
  if (!incident[0]) throw new Error("Ocorrência não encontrada ou sem autorização.");
  await db.update(incidents).set({ status }).where(eq(incidents.id, id));
}
