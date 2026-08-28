import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core user table backing the Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const delegatedAccessCodes = mysqlTable("delegatedAccessCodes", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  codeHash: varchar("codeHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  registry: varchar("registry", { length: 120 }),
  carNumber: varchar("carNumber", { length: 120 }),
  municipality: varchar("municipality", { length: 120 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  address: text("address"),
  notes: text("notes"),
  createdByUserId: int("createdByUserId"),
  updatedByUserId: int("updatedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const stands = mysqlTable("stands", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  species: mysqlEnum("species", ["pinus", "eucalipto"]).notNull(),
  areaHa: decimal("areaHa", { precision: 10, scale: 2 }).notNull(),
  cycleStatus: mysqlEnum("cycleStatus", ["aguardando", "primeiro_desbaste", "segundo_desbaste", "corte_raso"]).default("aguardando").notNull(),
  operationalStatus: mysqlEnum("operationalStatus", ["ativo", "em_colheita", "bloqueado", "concluido"]).default("ativo").notNull(),
  polygonUrl: text("polygonUrl"),
  polygonGeoJson: text("polygonGeoJson"),
  polygonFileUrl: text("polygonFileUrl"),
  polygonFileKey: text("polygonFileKey"),
  polygonFormat: mysqlEnum("polygonFormat", ["kml", "geojson", "kmz", "outro"]),
  polygonVersion: varchar("polygonVersion", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const propertyAuditLogs = mysqlTable("propertyAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  actorUserId: int("actorUserId").notNull(),
  actorName: varchar("actorName", { length: 180 }),
  action: mysqlEnum("action", ["criada", "atualizada"]).notNull(),
  changeSummary: text("changeSummary").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  standId: int("standId"),
  code: varchar("code", { length: 64 }).notNull().unique(),
  buyerName: varchar("buyerName", { length: 180 }).notNull(),
  buyerDocument: varchar("buyerDocument", { length: 32 }),
  type: mysqlEnum("type", ["por_tonelada", "preco_fixo"]).notNull(),
  harvestType: mysqlEnum("harvestType", ["primeiro_desbaste", "segundo_desbaste", "corte_raso", "outro"]).default("corte_raso").notNull(),
  status: mysqlEnum("status", ["rascunho", "ativo", "suspenso", "encerrado", "rescindido"]).default("rascunho").notNull(),
  pricePerTon: decimal("pricePerTon", { precision: 14, scale: 2 }),
  fixedValue: decimal("fixedValue", { precision: 14, scale: 2 }),
  receivedValue: decimal("receivedValue", { precision: 14, scale: 2 }).default("0.00").notNull(),
  startDate: timestamp("startDate"),
  deadline: timestamp("deadline"),
  guaranteeType: mysqlEnum("guaranteeType", ["nenhuma", "nota_promissoria", "fiador", "seguro_garantia", "caucao"]).default("nenhuma").notNull(),
  guaranteeValue: decimal("guaranteeValue", { precision: 14, scale: 2 }),
  dailyDelayPenalty: decimal("dailyDelayPenalty", { precision: 14, scale: 2 }),
  cutOutsidePenalty: decimal("cutOutsidePenalty", { precision: 14, scale: 2 }),
  missingTicketPenaltyPercent: decimal("missingTicketPenaltyPercent", { precision: 5, scale: 2 }),
  ticketGraceDays: int("ticketGraceDays").default(3).notNull(),
  documentUrl: text("documentUrl"),
  documentKey: text("documentKey"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  standId: int("standId").notNull(),
  ticketNumber: varchar("ticketNumber", { length: 100 }).notNull(),
  issuedAt: timestamp("issuedAt").notNull(),
  vehiclePlate: varchar("vehiclePlate", { length: 16 }).notNull(),
  destination: varchar("destination", { length: 180 }).notNull(),
  netWeightTons: decimal("netWeightTons", { precision: 12, scale: 3 }).notNull(),
  status: mysqlEnum("status", ["pendente", "conferido", "divergente", "recusado"]).default("pendente").notNull(),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  trailCameraImageUrls: text("trailCameraImageUrls"),
  trailCameraImageKeys: text("trailCameraImageKeys"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const ledgerEntries = mysqlTable("ledgerEntries", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  standId: int("standId"),
  contractId: int("contractId"),
  occurredAt: timestamp("occurredAt").notNull(),
  flow: mysqlEnum("flow", ["receita", "despesa"]).notNull(),
  category: mysqlEnum("category", ["madeira_tonelada", "area_fixa", "manutencao", "diarias", "outros"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  tons: decimal("tons", { precision: 12, scale: 3 }),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  standId: int("standId"),
  contractId: int("contractId"),
  title: varchar("title", { length: 220 }).notNull(),
  type: mysqlEnum("type", ["contrato", "relatorio_vistoria", "tarefa", "licenca", "garantia", "outro"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inspections = mysqlTable("inspections", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  standId: int("standId").notNull(),
  inspectedAt: timestamp("inspectedAt").notNull(),
  inspectorName: varchar("inspectorName", { length: 180 }).notNull(),
  type: mysqlEnum("type", ["infraestrutura", "seguranca", "ambiental", "colheita", "entrega_final"]).notNull(),
  result: mysqlEnum("result", ["conforme", "atencao", "nao_conforme"]).notNull(),
  notes: text("notes"),
  photoUrl: text("photoUrl"),
  photoKey: text("photoKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  standId: int("standId"),
  contractId: int("contractId"),
  occurredAt: timestamp("occurredAt").notNull(),
  category: mysqlEnum("category", ["acesso", "ticket", "infraestrutura", "chuva", "incendio", "ambiental", "seguranca", "outro"]).notNull(),
  severity: mysqlEnum("severity", ["baixa", "media", "alta", "critica"]).default("media").notNull(),
  status: mysqlEnum("status", ["aberta", "em_tratativa", "resolvida"]).default("aberta").notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description").notNull(),
  photoUrl: text("photoUrl"),
  photoKey: text("photoKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type PropertyAuditLog = typeof propertyAuditLogs.$inferSelect;
export type Stand = typeof stands.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Inspection = typeof inspections.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
