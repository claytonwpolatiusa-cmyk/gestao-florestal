import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/_core/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";

const DashboardPage = lazy(() => import("@/pages/ForestPages").then(module => ({ default: module.DashboardPage })));
const DocumentsPage = lazy(() => import("@/pages/ForestPages").then(module => ({ default: module.DocumentsPage })));
const IncidentsPage = lazy(() => import("@/pages/ForestPages").then(module => ({ default: module.IncidentsPage })));
const InspectionsPage = lazy(() => import("@/pages/ForestPages").then(module => ({ default: module.InspectionsPage })));
const OperationsPage = lazy(() => import("@/pages/ForestPages").then(module => ({ default: module.OperationsPage })));
const ContractsCommercialPage = lazy(() => import("@/pages/ContractsCommercialPage").then(module => ({ default: module.ContractsCommercialPage })));
const TicketsEnhancedPage = lazy(() => import("@/pages/TicketsEnhancedPage").then(module => ({ default: module.TicketsEnhancedPage })));
const StandsAuditedPage = lazy(() => import("@/pages/StandsAuditedPage").then(module => ({ default: module.StandsAuditedPage })));
const LandingPage = lazy(() => import("@/pages/PublicPages").then(module => ({ default: module.LandingPage })));
const PurchasePage = lazy(() => import("@/pages/PublicPages").then(module => ({ default: module.PurchasePage })));
const AccountPage = lazy(() => import("@/pages/PublicPages").then(module => ({ default: module.AccountPage })));
const DelegatedLoginPage = lazy(() => import("@/pages/PublicPages").then(module => ({ default: module.DelegatedLoginPage })));
const FaqPage = lazy(() => import("@/pages/PublicSupportPages").then(module => ({ default: module.FaqPage })));
const SupportPage = lazy(() => import("@/pages/PublicSupportPages").then(module => ({ default: module.SupportPage })));
const TutorialPage = lazy(() => import("@/pages/TutorialPage"));
const PublicContentPage = lazy(() => import("@/pages/PublicContentPage"));

function RouteLoader() {
  return <div className="flex min-h-[40vh] items-center justify-center bg-[#f7f8f3] text-sm font-medium text-[#6a7d70]">Carregando…</div>;
}

function Shell({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }

function Router() {
  const { user, loading } = useAuth();
  return <Switch>
    <Route path="/">{() => loading ? null : user ? <Shell><DashboardPage /></Shell> : <LandingPage />}</Route>
    <Route path="/comprar" component={PurchasePage} />
    <Route path="/apresentacao" component={LandingPage} />
    <Route path="/conteudos" component={PublicContentPage} />
    <Route path="/faq" component={FaqPage} />
    <Route path="/atendimento" component={SupportPage} />
    <Route path="/acesso" component={DelegatedLoginPage} />
    <Route path="/perfil">{() => <Shell><AccountPage /></Shell>}</Route>
    <Route path="/tutorial">{() => <Shell><TutorialPage /></Shell>}</Route>
    <Route path="/talhoes">{() => <Shell><StandsAuditedPage /></Shell>}</Route>
    <Route path="/tickets">{() => <Shell><TicketsEnhancedPage /></Shell>}</Route>
    <Route path="/operacoes">{() => <Shell><OperationsPage /></Shell>}</Route>
    <Route path="/contratos">{() => <Shell><ContractsCommercialPage /></Shell>}</Route>
    <Route path="/arquivos">{() => <Shell><DocumentsPage /></Shell>}</Route>
    <Route path="/vistorias">{() => <Shell><InspectionsPage /></Shell>}</Route>
    <Route path="/ocorrencias">{() => <Shell><IncidentsPage /></Shell>}</Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Suspense fallback={<RouteLoader />}><Router /></Suspense></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
