import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DashboardPage, DocumentsPage, IncidentsPage, InspectionsPage, OperationsPage, StandsPage, TicketsPage } from "@/pages/ForestPages";
import { ContractsFinePage } from "@/pages/ContractsFinePage";
import NotFound from "@/pages/NotFound";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";

function Shell({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }

function Router() {
  return <Switch>
    <Route path="/">{() => <Shell><DashboardPage /></Shell>}</Route>
    <Route path="/talhoes">{() => <Shell><StandsPage /></Shell>}</Route>
    <Route path="/tickets">{() => <Shell><TicketsPage /></Shell>}</Route>
    <Route path="/operacoes">{() => <Shell><OperationsPage /></Shell>}</Route>
    <Route path="/contratos">{() => <Shell><ContractsFinePage /></Shell>}</Route>
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
