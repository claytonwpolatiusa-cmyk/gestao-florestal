import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { currency, date, number } from "./forest";

type DashboardData = {
  totals: { properties: number; stands: number; areaHa: number; tons: number; revenue: number; cost: number; pendingTickets: number; overdueTickets: number; openIncidents: number; activeContracts: number };
  tonsByStand: { name: string; toneladas: number }[];
  expenseByCategory: { name: string; value: number }[];
  dueSoon: { contract: { code: string; buyerName: string; deadline: Date | null; status: string }; propertyName: string; standCode: string | null; days: number }[];
  overdueTickets: { ticket: { ticketNumber: string; issuedAt: Date; vehiclePlate: string; netWeightTons: unknown }; standCode: string; contractCode: string; ticketGraceDays: number }[];
};

type ContractItem = {
  contract: { code: string; buyerName: string; buyerDocument: string | null; type: "por_tonelada" | "preco_fixo"; harvestType: "primeiro_desbaste" | "segundo_desbaste" | "corte_raso" | "outro"; status: string; pricePerTon: unknown; fixedValue: unknown; receivedValue: unknown; startDate: Date | null; deadline: Date | null; guaranteeType: string; guaranteeValue: unknown; dailyDelayPenalty: unknown; cutOutsidePenalty: unknown; missingTicketPenaltyPercent: unknown; ticketGraceDays: number };
  propertyName: string;
  standCode: string | null;
};

const moment = () => new Date().toISOString().slice(0, 10);
const humanContractType = (value: ContractItem["contract"]["type"]) => value === "por_tonelada" ? "Retirada por tonelada" : "Venda do talhão / preço fixo";
const humanHarvestType = (value: ContractItem["contract"]["harvestType"]) => ({ primeiro_desbaste: "1º desbaste", segundo_desbaste: "2º desbaste", corte_raso: "Corte raso", outro: "Outro" })[value];

function savePdf(document: jsPDF, filename: string) {
  document.setProperties({ title: filename.replace(".pdf", ""), subject: "Gestão Florestal" });
  document.save(filename);
}

function addPdfHeading(document: jsPDF, title: string, subtitle: string) {
  document.setFillColor(23, 63, 46);
  document.rect(0, 0, 210, 31, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(18);
  document.text("Gestão Florestal", 14, 13);
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.text(title, 14, 20);
  document.text(subtitle, 14, 26);
  document.setTextColor(32, 54, 43);
}

export function exportDashboardExcel(data: DashboardData, filterLabel: string) {
  const workbook = XLSX.utils.book_new();
  const summary = [["Relatório do painel", ""], ["Filtro aplicado", filterLabel], ["Gerado em", new Date().toLocaleString("pt-BR")], [], ["Indicador", "Valor"], ["Propriedades", data.totals.properties], ["Talhões", data.totals.stands], ["Área (ha)", data.totals.areaHa], ["Toneladas conferidas", data.totals.tons], ["Receita aprovada", data.totals.revenue], ["Custo operacional", data.totals.cost], ["Tickets pendentes", data.totals.pendingTickets], ["Tickets atrasados", data.totals.overdueTickets], ["Ocorrências abertas", data.totals.openIncidents], ["Contratos ativos", data.totals.activeContracts]];
  const production = [["Talhão", "Toneladas conferidas"], ...data.tonsByStand.map(row => [row.name, row.toneladas])];
  const expenses = [["Categoria", "Despesas aprovadas (R$)"], ...data.expenseByCategory.map(row => [row.name, row.value])];
  const deadlines = [["Contrato", "Comprador", "Propriedade", "Talhão", "Prazo final", "Dias para o vencimento", "Situação"], ...data.dueSoon.map(row => [row.contract.code, row.contract.buyerName, row.propertyName, row.standCode || "Lote", date(row.contract.deadline), row.days, row.contract.status])];
  const pendingTickets = [["Ticket", "Talhão", "Contrato", "Placa", "Data", "Peso (t)", "Prazo de ticket (dias)"], ...data.overdueTickets.map(row => [row.ticket.ticketNumber, row.standCode, row.contractCode, row.ticket.vehiclePlate, date(row.ticket.issuedAt), Number(row.ticket.netWeightTons), row.ticketGraceDays])];
  [["Resumo", summary], ["Produção", production], ["Despesas", expenses], ["Vencimentos", deadlines], ["Tickets atrasados", pendingTickets]].forEach(([name, rows]) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows as (string | number)[][]);
    sheet["!cols"] = [{ wch: 25 }, { wch: 26 }, { wch: 24 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, sheet, String(name).slice(0, 31));
  });
  XLSX.writeFile(workbook, `relatorio-painel-${moment()}.xlsx`);
}

export function exportDashboardPdf(data: DashboardData, filterLabel: string) {
  const document = new jsPDF({ unit: "mm", format: "a4" });
  addPdfHeading(document, "Relatório operacional", `Filtro aplicado: ${filterLabel} · Gerado em ${new Date().toLocaleString("pt-BR")}`);
  let nextY = 38;
  const afterTable = () => ((document as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || nextY) + 9;
  autoTable(document, { startY: nextY, head: [["Indicador", "Valor"]], body: [["Propriedades", String(data.totals.properties)], ["Talhões", String(data.totals.stands)], ["Área", `${number(data.totals.areaHa, 2)} ha`], ["Toneladas conferidas", `${number(data.totals.tons, 3)} t`], ["Receita aprovada", currency(data.totals.revenue)], ["Custo operacional", currency(data.totals.cost)], ["Tickets pendentes", String(data.totals.pendingTickets)], ["Tickets atrasados", String(data.totals.overdueTickets)], ["Ocorrências abertas", String(data.totals.openIncidents)]], styles: { fontSize: 9 }, headStyles: { fillColor: [31, 93, 66] } });
  nextY = afterTable();
  autoTable(document, { startY: nextY, head: [["Talhão", "Toneladas conferidas"]], body: data.tonsByStand.length ? data.tonsByStand.map(row => [row.name, `${number(row.toneladas, 3)} t`]) : [["Sem produção conferida no filtro", "—"]], styles: { fontSize: 9 }, headStyles: { fillColor: [31, 93, 66] } });
  nextY = afterTable();
  autoTable(document, { startY: nextY, head: [["Contrato", "Prazo", "Dias", "Situação"]], body: data.dueSoon.length ? data.dueSoon.map(row => [row.contract.code, date(row.contract.deadline), String(row.days), row.contract.status]) : [["Sem prazos críticos", "—", "—", "—"]], styles: { fontSize: 8 }, headStyles: { fillColor: [170, 102, 45] } });
  savePdf(document, `relatorio-painel-${moment()}.pdf`);
}

export function exportContractsExcel(contracts: ContractItem[]) {
  const rows = [["Código", "Comprador", "CPF/CNPJ", "Propriedade", "Talhão", "Modalidade comercial", "Modalidade de corte", "Status", "Preço por tonelada (R$)", "Valor fixo (R$)", "Recebido (R$)", "Garantia", "Valor garantido (R$)", "Início", "Prazo final", "Multa diária (R$)", "Multa fora do polígono (R$/árvore)", "Multa por ticket (%)", "Prazo do ticket (dias)"], ...contracts.map(item => [item.contract.code, item.contract.buyerName, item.contract.buyerDocument || "", item.propertyName, item.standCode || "Lote", humanContractType(item.contract.type), humanHarvestType(item.contract.harvestType), item.contract.status, Number(item.contract.pricePerTon || 0), Number(item.contract.fixedValue || 0), Number(item.contract.receivedValue || 0), item.contract.guaranteeType, Number(item.contract.guaranteeValue || 0), date(item.contract.startDate), date(item.contract.deadline), Number(item.contract.dailyDelayPenalty || 0), Number(item.contract.cutOutsidePenalty || 0), Number(item.contract.missingTicketPenaltyPercent || 0), item.contract.ticketGraceDays])];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = rows[0].map(() => ({ wch: 22 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Contratos");
  XLSX.writeFile(workbook, `contratos-florestais-${moment()}.xlsx`);
}

export function exportContractsPdf(contracts: ContractItem[]) {
  const document = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  addPdfHeading(document, "Relatório de contratos", `Gerado em ${new Date().toLocaleString("pt-BR")}`);
  autoTable(document, { startY: 37, head: [["Contrato", "Comprador", "Propriedade / talhão", "Comercial", "Corte", "Prazo", "Garantia", "Multas", "Status"]], body: contracts.length ? contracts.map(item => [item.contract.code, item.contract.buyerName, `${item.propertyName}${item.standCode ? ` / ${item.standCode}` : ""}`, humanContractType(item.contract.type), humanHarvestType(item.contract.harvestType), date(item.contract.deadline), item.contract.guaranteeType, `Diária: ${currency(item.contract.dailyDelayPenalty)}\nPolígono: ${currency(item.contract.cutOutsidePenalty)}/árvore\nTicket: ${number(item.contract.missingTicketPenaltyPercent, 0)}%`, item.contract.status]) : [["Sem contratos cadastrados", "", "", "", "", "", "", "", ""]], styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [31, 93, 66], fontSize: 7 } });
  savePdf(document, `contratos-florestais-${moment()}.pdf`);
}
