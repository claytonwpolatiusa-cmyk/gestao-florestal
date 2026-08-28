import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DashboardPage, DocumentsPage, IncidentsPage, InspectionsPage, OperationsPage } from "@/pages/ForestPages";
import { ContractsCommercialPage } from "@/pages/ContractsCommercialPage";
import { TicketsEnhancedPage } from "@/pages/TicketsEnhancedPage";
import { StandsAuditedPage } from "@/pages/StandsAuditedPage";
import NotFound from "@/pages/NotFound";
import { LandingPage, PurchasePage, AccountPage, DelegatedLoginPage } from "@/pages/PublicPages";
import { useAuth } from "@/_core/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";

function Shell({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }

function Router() {
  const { user, loading } = useAuth();
  return <Switch>
    <Route path="/">{() => loading ? null : user ? <Shell><DashboardPage /></Shell> : <LandingPage />}</Route>
    <Route path="/comprar" component={PurchasePage} />
    <Route path="/acesso" component={DelegatedLoginPage} />
    <Route path="/perfil">{() => <Shell><AccountPage /></Shell>}</Route>
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
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
