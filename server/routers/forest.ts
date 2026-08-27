import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { calculateOperationTotals } from "../forestRules";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

const dateSchema = z.coerce.date();
const optionalId = z.number().int().positive().optional().nullable();
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

const uploadSchema = z.object({
  dataBase64: z.string().max(8_100_000).optional(),
  fileName: z.string().trim().max(180).optional(),
  mimeType: z.string().trim().max(100).optional(),
}).optional();

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
}

async function uploadFile(
  userId: number,
  prefix: string,
  file?: z.infer<typeof uploadSchema>,
) {
  if (!file?.dataBase64) return {};
  const base64 = file.dataBase64.includes(",")
    ? file.dataBase64.slice(file.dataBase64.indexOf(",") + 1)
    : file.dataBase64;
  const data = Buffer.from(base64, "base64");
  if (!data.length || data.length > 6_000_000) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "O arquivo deve ter até 6 MB." });
  }
  const fileName = safeFileName(file.fileName || `${prefix}.bin`);
  const stored = await storagePut(`florestal/${userId}/${prefix}/${Date.now()}-${fileName}`, data, file.mimeType || "application/octet-stream");
  return { fileUrl: stored.url, fileKey: stored.key };
}

function asNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export const forestRouter = router({
  dashboard: protectedProcedure.input(z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    standId: z.number().int().positive().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    const [allProperties, allStands, allContracts, allTickets, allLedger, allIncidents] = await Promise.all([
      db.listProperties(ctx.user.id),
      db.listStands(ctx.user.id),
      db.listContracts(ctx.user.id),
      db.listTickets(ctx.user.id),
      db.listLedgerEntries(ctx.user.id),
      db.listIncidents(ctx.user.id),
    ]);

    const selectedMonth = input?.month;
    const selectedStandId = input?.standId;
    const matchesMonth = (value: Date) => !selectedMonth || `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}` === selectedMonth;
    const matchesStand = (standId: number | null) => !selectedStandId || standId === selectedStandId;
    const filteredTickets = allTickets.filter(item => matchesStand(item.ticket.standId) && matchesMonth(item.ticket.issuedAt));
    const filteredLedger = allLedger.filter(item => matchesStand(item.entry.standId) && matchesMonth(item.entry.occurredAt));
    const filteredStands = selectedStandId ? allStands.filter(item => item.stand.id === selectedStandId) : allStands;
    const filteredContracts = allContracts.filter(item => !selectedStandId || item.contract.standId === selectedStandId);
    const filteredIncidents = allIncidents.filter(item => matchesStand(item.incident.standId) && matchesMonth(item.incident.occurredAt));
    const operationTotals = calculateOperationTotals(filteredLedger.map(item => item.entry), filteredTickets.map(item => item.ticket));
    const approvedEntries = filteredLedger.filter(item => item.entry.status === "aprovado");

    const tonsByStand = filteredStands.map(item => ({
      name: item.stand.code,
      toneladas: Number(filteredTickets.filter(ticket => ticket.ticket.standId === item.stand.id && ticket.ticket.status === "conferido").reduce((sum, ticket) => sum + asNumber(ticket.ticket.netWeightTons), 0).toFixed(3)),
    })).filter(item => item.toneladas > 0);

    const expenseByCategoryMap = approvedEntries.filter(item => item.entry.flow === "despesa").reduce<Record<string, number>>((result, item) => {
        result[item.entry.category] = (result[item.entry.category] || 0) + asNumber(item.entry.amount);
        return result;
      }, {});
    const expenseByCategory = Object.entries(expenseByCategoryMap).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

    const dueSoon = filteredContracts
      .filter(item => item.contract.deadline && ["ativo", "suspenso"].includes(item.contract.status))
      .map(item => ({ ...item, days: Math.ceil((item.contract.deadline!.getTime() - Date.now()) / 86_400_000) }))
      .filter(item => item.days <= 30)
      .sort((a, b) => a.days - b.days);

    return {
      totals: {
        properties: allProperties.length,
        stands: filteredStands.length,
        areaHa: Number(filteredStands.reduce((sum, item) => sum + asNumber(item.stand.areaHa), 0).toFixed(2)),
        tons: operationTotals.tons,
        revenue: operationTotals.revenue,
        cost: operationTotals.cost,
        pendingTickets: operationTotals.pendingTickets,
        openIncidents: filteredIncidents.filter(item => item.incident.status !== "resolvida").length,
        activeContracts: filteredContracts.filter(item => item.contract.status === "ativo").length,
      },
      tonsByStand,
      expenseByCategory,
      dueSoon,
      recentTickets: filteredTickets.slice(0, 5),
      openIncidents: filteredIncidents.filter(item => item.incident.status !== "resolvida").slice(0, 5),
      filterOptions: allStands.map(item => ({ id: item.stand.id, code: item.stand.code, propertyName: item.propertyName })),
    };
  }),

  property: router({
    list: protectedProcedure.query(({ ctx }) => db.listProperties(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(180),
      registry: optionalText(120),
      carNumber: optionalText(120),
      municipality: z.string().trim().min(2).max(120),
      state: z.string().trim().toUpperCase().length(2),
      address: optionalText(3_000),
      notes: optionalText(5_000),
    })).mutation(async ({ ctx, input }) => ({ id: await db.createProperty(ctx.user.id, input) })),
  }),

  stand: router({
    list: protectedProcedure.query(({ ctx }) => db.listStands(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      code: z.string().trim().min(2).max(64).transform(value => value.toUpperCase()),
      name: optionalText(160),
      species: z.enum(["pinus", "eucalipto"]),
      areaHa: z.coerce.number().positive().max(100_000),
      cycleStatus: z.enum(["aguardando", "primeiro_desbaste", "segundo_desbaste", "corte_raso"]).default("aguardando"),
      operationalStatus: z.enum(["ativo", "em_colheita", "bloqueado", "concluido"]).default("ativo"),
      polygonUrl: optionalText(2_000),
      polygonGeoJson: optionalText(30_000),
      notes: optionalText(5_000),
    })).mutation(async ({ ctx, input }) => ({ id: await db.createStand(ctx.user.id, { ...input, areaHa: input.areaHa.toFixed(2) }) })),
  }),

  contract: router({
    list: protectedProcedure.query(({ ctx }) => db.listContracts(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      standId: optionalId,
      code: z.string().trim().min(3).max(64).transform(value => value.toUpperCase()),
      buyerName: z.string().trim().min(2).max(180),
      buyerDocument: optionalText(32),
      type: z.enum(["por_tonelada", "preco_fixo"]),
      status: z.enum(["rascunho", "ativo", "suspenso", "encerrado", "rescindido"]).default("rascunho"),
      pricePerTon: z.coerce.number().nonnegative().optional().nullable(),
      fixedValue: z.coerce.number().nonnegative().optional().nullable(),
      receivedValue: z.coerce.number().nonnegative().default(0),
      startDate: dateSchema.optional().nullable(),
      deadline: dateSchema.optional().nullable(),
      guaranteeType: z.enum(["nenhuma", "nota_promissoria", "fiador", "seguro_garantia", "caucao"]).default("nenhuma"),
      guaranteeValue: z.coerce.number().nonnegative().optional().nullable(),
      dailyDelayPenalty: z.coerce.number().nonnegative().optional().nullable(),
      cutOutsidePenalty: z.coerce.number().nonnegative().optional().nullable(),
      missingTicketPenaltyPercent: z.coerce.number().min(0).max(100).optional().nullable(),
      notes: optionalText(5_000),
      file: uploadSchema,
    })).mutation(async ({ ctx, input }) => {
      const { file, pricePerTon, fixedValue, receivedValue, guaranteeValue, dailyDelayPenalty, cutOutsidePenalty, missingTicketPenaltyPercent, ...values } = input;
      const uploaded = await uploadFile(ctx.user.id, "contratos", file);
      const id = await db.createContract(ctx.user.id, {
        ...values,
        pricePerTon: pricePerTon === null || pricePerTon === undefined ? null : pricePerTon.toFixed(2),
        fixedValue: fixedValue === null || fixedValue === undefined ? null : fixedValue.toFixed(2),
        receivedValue: receivedValue.toFixed(2),
        guaranteeValue: guaranteeValue === null || guaranteeValue === undefined ? null : guaranteeValue.toFixed(2),
        dailyDelayPenalty: dailyDelayPenalty === null || dailyDelayPenalty === undefined ? null : dailyDelayPenalty.toFixed(2),
        cutOutsidePenalty: cutOutsidePenalty === null || cutOutsidePenalty === undefined ? null : cutOutsidePenalty.toFixed(2),
        missingTicketPenaltyPercent: missingTicketPenaltyPercent === null || missingTicketPenaltyPercent === undefined ? null : missingTicketPenaltyPercent.toFixed(2),
        documentUrl: uploaded.fileUrl || null,
        documentKey: uploaded.fileKey || null,
      });
      return { id };
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["rascunho", "ativo", "suspenso", "encerrado", "rescindido"]),
    })).mutation(async ({ ctx, input }) => {
      await db.updateContractStatus(input.id, ctx.user.id, input.status);
      return { success: true };
    }),
  }),

  ticket: router({
    list: protectedProcedure.query(({ ctx }) => db.listTickets(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      contractId: z.number().int().positive(),
      standId: z.number().int().positive(),
      ticketNumber: z.string().trim().min(1).max(100),
      issuedAt: dateSchema,
      vehiclePlate: z.string().trim().min(5).max(16).transform(value => value.toUpperCase()),
      destination: z.string().trim().min(2).max(180),
      netWeightTons: z.coerce.number().positive().max(1_000),
      status: z.enum(["pendente", "conferido", "divergente", "recusado"]).default("pendente"),
      notes: optionalText(3_000),
      file: uploadSchema,
    })).mutation(async ({ ctx, input }) => {
      const { file, netWeightTons, ...values } = input;
      const uploaded = await uploadFile(ctx.user.id, "tickets", file);
      return { id: await db.createTicket(ctx.user.id, { ...values, netWeightTons: netWeightTons.toFixed(3), fileUrl: uploaded.fileUrl || null, fileKey: uploaded.fileKey || null }) };
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["pendente", "conferido", "divergente", "recusado"]),
    })).mutation(async ({ ctx, input }) => {
      await db.updateTicketStatus(input.id, ctx.user.id, input.status);
      return { success: true };
    }),
  }),

  ledger: router({
    list: protectedProcedure.query(({ ctx }) => db.listLedgerEntries(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      standId: optionalId,
      contractId: optionalId,
      occurredAt: dateSchema,
      flow: z.enum(["receita", "despesa"]),
      category: z.enum(["madeira_tonelada", "area_fixa", "manutencao", "diarias", "outros"]),
      description: z.string().trim().min(2).max(255),
      tons: z.coerce.number().nonnegative().max(1_000_000).optional().nullable(),
      amount: z.coerce.number().nonnegative().max(100_000_000),
      status: z.enum(["pendente", "aprovado", "rejeitado"]).default("pendente"),
      file: uploadSchema,
    })).mutation(async ({ ctx, input }) => {
      const { file, tons, amount, ...values } = input;
      const uploaded = await uploadFile(ctx.user.id, "caixa", file);
      return { id: await db.createLedgerEntry(ctx.user.id, { ...values, tons: tons === null || tons === undefined ? null : tons.toFixed(3), amount: amount.toFixed(2), fileUrl: uploaded.fileUrl || null, fileKey: uploaded.fileKey || null }) };
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["pendente", "aprovado", "rejeitado"]),
    })).mutation(async ({ ctx, input }) => {
      await db.updateLedgerStatus(input.id, ctx.user.id, input.status);
      return { success: true };
    }),
  }),

  document: router({
    list: protectedProcedure.query(({ ctx }) => db.listDocuments(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      standId: optionalId,
      contractId: optionalId,
      title: z.string().trim().min(2).max(220),
      type: z.enum(["contrato", "relatorio_vistoria", "tarefa", "licenca", "garantia", "outro"]),
      file: uploadSchema.refine(value => Boolean(value?.dataBase64), "Selecione um arquivo."),
    })).mutation(async ({ ctx, input }) => {
      const uploaded = await uploadFile(ctx.user.id, "documentos", input.file);
      if (!uploaded.fileUrl || !uploaded.fileKey) throw new TRPCError({ code: "BAD_REQUEST", message: "Arquivo inválido." });
      return { id: await db.createDocument(ctx.user.id, { propertyId: input.propertyId, standId: input.standId, contractId: input.contractId, title: input.title, type: input.type, fileUrl: uploaded.fileUrl, fileKey: uploaded.fileKey }) };
    }),
  }),

  inspection: router({
    list: protectedProcedure.query(({ ctx }) => db.listInspections(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      standId: z.number().int().positive(),
      inspectedAt: dateSchema,
      inspectorName: z.string().trim().min(2).max(180),
      type: z.enum(["infraestrutura", "seguranca", "ambiental", "colheita", "entrega_final"]),
      result: z.enum(["conforme", "atencao", "nao_conforme"]),
      notes: optionalText(5_000),
      file: uploadSchema,
    })).mutation(async ({ ctx, input }) => {
      const { file, ...values } = input;
      const uploaded = await uploadFile(ctx.user.id, "vistorias", file);
      return { id: await db.createInspection(ctx.user.id, { ...values, photoUrl: uploaded.fileUrl || null, photoKey: uploaded.fileKey || null }) };
    }),
  }),

  incident: router({
    list: protectedProcedure.query(({ ctx }) => db.listIncidents(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      propertyId: z.number().int().positive(),
      standId: optionalId,
      contractId: optionalId,
      occurredAt: dateSchema,
      category: z.enum(["acesso", "ticket", "infraestrutura", "chuva", "incendio", "ambiental", "seguranca", "outro"]),
      severity: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
      status: z.enum(["aberta", "em_tratativa", "resolvida"]).default("aberta"),
      title: z.string().trim().min(2).max(220),
      description: z.string().trim().min(3).max(5_000),
      file: uploadSchema,
    })).mutation(async ({ ctx, input }) => {
      const { file, ...values } = input;
      const uploaded = await uploadFile(ctx.user.id, "ocorrencias", file);
      return { id: await db.createIncident(ctx.user.id, { ...values, photoUrl: uploaded.fileUrl || null, photoKey: uploaded.fileKey || null }) };
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["aberta", "em_tratativa", "resolvida"]),
    })).mutation(async ({ ctx, input }) => {
      await db.updateIncidentStatus(input.id, ctx.user.id, input.status);
      return { success: true };
    }),
  }),
});
