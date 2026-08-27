export const labels = {
  species: { pinus: "Pinus", eucalipto: "Eucalipto" },
  commercialType: { por_tonelada: "Retirada por tonelada", preco_fixo: "Venda do talhão / preço fixo" },
  harvestType: { primeiro_desbaste: "1º desbaste", segundo_desbaste: "2º desbaste", corte_raso: "Corte raso", outro: "Outro" },
  cycle: { aguardando: "Aguardando", primeiro_desbaste: "1º desbaste", segundo_desbaste: "2º desbaste", corte_raso: "Corte raso" },
  standStatus: { ativo: "Ativo", em_colheita: "Em colheita", bloqueado: "Bloqueado", concluido: "Concluído" },
  contractType: { por_tonelada: "Por tonelada", preco_fixo: "Preço fixo" },
  contractStatus: { rascunho: "Rascunho", ativo: "Ativo", suspenso: "Suspenso", encerrado: "Encerrado", rescindido: "Rescindido" },
  ticketStatus: { pendente: "Pendente", conferido: "Conferido", divergente: "Divergente", recusado: "Recusado" },
  flow: { receita: "Receita", despesa: "Despesa" },
  category: { madeira_tonelada: "Madeira / tonelada", area_fixa: "Área fixa", manutencao: "Manutenção", diarias: "Diárias", outros: "Outros" },
  entryStatus: { pendente: "Pendente", aprovado: "Aprovado", rejeitado: "Rejeitado" },
  documentType: { contrato: "Contrato", relatorio_vistoria: "Relatório de vistoria", tarefa: "Tarefa", licenca: "Licença", garantia: "Garantia", outro: "Outro" },
  inspectionType: { infraestrutura: "Infraestrutura", seguranca: "Segurança", ambiental: "Ambiental", colheita: "Colheita", entrega_final: "Entrega final" },
  inspectionResult: { conforme: "Conforme", atencao: "Atenção", nao_conforme: "Não conforme" },
  incidentCategory: { acesso: "Acesso", ticket: "Ticket", infraestrutura: "Infraestrutura", chuva: "Chuva", incendio: "Incêndio", ambiental: "Ambiental", seguranca: "Segurança", outro: "Outro" },
  severity: { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" },
  incidentStatus: { aberta: "Aberta", em_tratativa: "Em tratativa", resolvida: "Resolvida" },
  guarantee: { nenhuma: "Sem garantia", nota_promissoria: "Nota promissória", fiador: "Fiador", seguro_garantia: "Seguro-garantia", caucao: "Caução" },
} as const;

export function currency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value ?? 0));
}

export function number(value: unknown, digits = 0) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value ?? 0));
}

export function date(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function dateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function inputDateTime(value = new Date()) {
  const timezoneOffset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export type UploadPayload = { dataBase64: string; fileName: string; mimeType: string };

export async function readUpload(file?: File | null): Promise<UploadPayload | undefined> {
  if (!file) return undefined;
  if (file.size > 6_000_000) throw new Error("O arquivo deve ter até 6 MB.");
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
  return { dataBase64, fileName: file.name, mimeType: file.type || "application/octet-stream" };
}

export async function readUploads(files: File[]): Promise<UploadPayload[]> {
  const uploads = await Promise.all(files.map(file => readUpload(file)));
  return uploads.filter((upload): upload is UploadPayload => Boolean(upload));
}

export function statusTone(value: string) {
  if (["ativo", "conferido", "aprovado", "conforme", "resolvida", "concluido"].includes(value)) return "green";
  if (["suspenso", "atencao", "pendente", "em_tratativa", "media"].includes(value)) return "gold";
  if (["divergente", "recusado", "rescindido", "nao_conforme", "alta", "critica", "bloqueado", "rejeitado"].includes(value)) return "red";
  return "gray";
}
