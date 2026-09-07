import { PublicBrand } from "@/pages/PublicPages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BadgeHelp, CheckCircle2, Headphones, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

const questions = [
  {
    question: "O que está incluído no plano Treeway Forest?",
    answer: "O plano reúne a gestão de propriedades e talhões, tickets, contratos, receitas, despesas, caixa, documentos, vistorias, ocorrências, tutorial e acesso delegado da equipe. As funcionalidades disponíveis podem evoluir conforme a plataforma recebe novas versões.",
  },
  {
    question: "Por que o site mostra R$ 9,90 por dia e R$ 297 por mês?",
    answer: "R$ 9,90/dia é uma forma de visualizar o investimento diário: R$ 297 divididos por 30 dias. A cobrança promocional exibida na página é mensal, no valor de R$ 297. O valor de referência anterior mostrado é R$ 597/mês.",
  },
  {
    question: "A Treeway atende pinus e eucalipto?",
    answer: "Sim. A plataforma foi desenhada para organizar rotinas de silvicultura com pinus e eucalipto, conectando espécie, talhão, operação de campo, contrato e indicadores financeiros.",
  },
  {
    question: "Posso permitir que alguém da equipe use a plataforma?",
    answer: "Sim. O titular pode criar códigos temporários de acesso delegado, sem compartilhar a própria senha. Os códigos podem ser revogados e expiram conforme a duração escolhida pelo titular.",
  },
  {
    question: "O cadastro na página de plano já realiza uma cobrança?",
    answer: "Não. O formulário da página de plano registra interesse e a contratação só é confirmada quando as condições aplicáveis forem apresentadas e aceitas. Não há cobrança automática apenas por preencher o formulário.",
  },
  {
    question: "Como começo a organizar minha operação?",
    answer: "Depois de entrar, use o Tutorial para conhecer o fluxo demonstrativo. O caminho recomendado é cadastrar a propriedade, estruturar os talhões e depois registrar contratos, tickets e lançamentos conforme a sua rotina.",
  },
];

function PublicHeader({ active }: { active: "faq" | "atendimento" }) {
  return <header className="border-b border-[#dce5db] bg-[#f7f8f3]/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8"><PublicBrand /><nav className="hidden items-center gap-6 text-sm font-medium text-[#6a7d70] md:flex"><a href="/#solucao" className="hover:text-[#e16d32]">Solução</a><a href="/conteudos" className="hover:text-[#e16d32]">Conteúdos</a><a href="/comprar" className="hover:text-[#e16d32]">Planos</a><a href="/faq" className={active === "faq" ? "text-[#e16d32]" : "hover:text-[#e16d32]"}>FAQ</a><a href="/atendimento" className={active === "atendimento" ? "text-[#e16d32]" : "hover:text-[#e16d32]"}>Atendimento</a></nav><a href="/" className="text-sm font-semibold text-[#6a7d70] hover:text-[#e16d32]">Voltar</a></div></header>;
}

export function FaqPage() {
  return <div className="min-h-screen bg-[#f7f8f3] text-[#123b2c]"><PublicHeader active="faq" /><main><section className="relative overflow-hidden bg-[#123b2c] px-5 py-20 text-white lg:px-8 lg:py-28"><div className="absolute -right-24 -top-16 h-80 w-80 rounded-full border border-[#f08a4e]/20" /><div className="relative mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#f08a4e]">Clareza antes da contratação</p><h1 className="mt-5 text-5xl font-semibold leading-[.94] tracking-[-.06em] sm:text-7xl">Perguntas frequentes, respostas diretas.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">Entenda o plano, o acesso da equipe e como a Treeway se encaixa na rotina de pinus e eucalipto.</p></div></section><section className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24"><Accordion type="single" collapsible className="rounded-2xl border border-[#dce5db] bg-white px-6 shadow-[0_20px_50px_-42px_rgba(18,59,44,.7)]">{questions.map((item, index) => <AccordionItem value={`question-${index}`} key={item.question}><AccordionTrigger className="py-6 text-base text-[#123b2c] hover:no-underline">{item.question}</AccordionTrigger><AccordionContent className="max-w-3xl text-sm leading-7 text-[#667a70]">{item.answer}</AccordionContent></AccordionItem>)}</Accordion><div className="mt-10 flex flex-col justify-between gap-5 rounded-2xl border border-[#e16d32]/20 bg-[#fff5ef] p-6 sm:flex-row sm:items-center"><div className="flex gap-4"><BadgeHelp className="mt-0.5 h-6 w-6 shrink-0 text-[#e16d32]" /><p className="text-sm leading-6 text-[#566c5e]">Ainda ficou com alguma dúvida específica sobre sua operação? Registre uma mensagem para atendimento.</p></div><a href="/atendimento" className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-[#e16d32] px-5 text-sm font-semibold text-white hover:bg-[#c95722]">Falar com atendimento <ArrowRight className="ml-2 h-4 w-4" /></a></div></section></main></div>;
}

export function SupportPage() {
  const [sent, setSent] = useState(false);
  const createRequest = trpc.support.createRequest.useMutation({ onSuccess: () => setSent(true) });

  return <div className="min-h-screen bg-[#f7f8f3] text-[#123b2c]"><PublicHeader active="atendimento" /><main className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24"><section><p className="text-xs font-bold uppercase tracking-[.24em] text-[#e16d32]">Falar com atendimento</p><h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[.94] tracking-[-.06em] sm:text-6xl">Conte o que a sua operação precisa.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#667a70]">Envie sua dúvida sobre plano, uso da plataforma, acesso da equipe ou início de operação. A solicitação fica registrada para triagem; este canal não oferece resposta automática nem substitui suporte de emergência.</p><div className="mt-6 rounded-2xl border border-[#e16d32]/20 bg-[#fff5ef] p-4 text-sm leading-6 text-[#6f5a46]"><strong className="text-[#b44c1e]">Janela de retorno estimada: até 2 dias úteis.</strong><br />As solicitações são triadas em dias úteis pelo contato informado. Se sua demanda for urgente, não dependa deste formulário.</div><div className="mt-10 space-y-5"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0e7] text-[#2e6b49]"><ShieldCheck className="h-5 w-5" /></div><p className="text-sm leading-6 text-[#667a70]"><strong className="text-[#123b2c]">Seu pedido fica registrado.</strong><br />Os dados enviados são usados para analisar a solicitação e retornar pelo contato informado.</p></div><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e8] text-[#e16d32]"><Mail className="h-5 w-5" /></div><p className="text-sm leading-6 text-[#667a70]"><strong className="text-[#123b2c]">Mensagem objetiva ajuda mais.</strong><br />Inclua o assunto e o contexto da sua dúvida para facilitar a triagem.</p></div></div></section><Card className="border-[#dce5db] bg-white shadow-[0_24px_70px_-45px_rgba(18,59,44,.8)]"><CardHeader><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123b2c] text-white"><Headphones className="h-5 w-5" /></div><CardTitle className="mt-4 text-2xl">Enviar solicitação</CardTitle><p className="text-sm leading-6 text-[#718177]">Preencha os campos para registrar sua mensagem.</p></CardHeader><CardContent>{sent ? <div className="rounded-xl bg-[#e8f1e8] p-5 text-sm leading-7 text-[#315d43]"><CheckCircle2 className="mb-3 h-5 w-5" /><strong>Solicitação registrada.</strong><br />Guarde o e-mail informado: ele será a referência de contato para esta mensagem.</div> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); createRequest.mutate({ name: String(form.get("name") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || "") || null, subject: String(form.get("subject") || ""), message: String(form.get("message") || "") }); }}><div><Label htmlFor="support-name">Nome</Label><Input id="support-name" name="name" required placeholder="Como podemos chamar você?" /></div><div><Label htmlFor="support-email">E-mail</Label><Input id="support-email" name="email" required type="email" placeholder="voce@empresa.com" /></div><div><Label htmlFor="support-phone">Telefone ou WhatsApp <span className="font-normal text-[#8a9a8d]">(opcional)</span></Label><Input id="support-phone" name="phone" placeholder="(00) 00000-0000" /></div><div><Label htmlFor="support-subject">Assunto</Label><Input id="support-subject" name="subject" required placeholder="Ex.: dúvida sobre o plano" /></div><div><Label htmlFor="support-message">Mensagem</Label><Textarea id="support-message" name="message" required minLength={10} placeholder="Conte o contexto da sua dúvida." className="min-h-32" /></div>{createRequest.error && <p role="alert" className="text-xs font-medium text-red-700">{createRequest.error.message || "Não foi possível registrar sua solicitação agora."}</p>}<Button disabled={createRequest.isPending} className="h-12 w-full bg-[#e16d32] text-white hover:bg-[#c95722]">{createRequest.isPending ? "Enviando…" : "Enviar solicitação"}<ArrowRight className="ml-2 h-4 w-4" /></Button><p className="text-center text-[11px] leading-5 text-[#819087]">Ao enviar, você concorda que a Treeway use os dados informados para responder a esta solicitação.</p></form>}</CardContent></Card></main></div>;
}
