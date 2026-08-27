import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useIsMobile } from "@/hooks/useMobile";
import {
  AlertTriangle,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PanelLeft,
  ReceiptText,
  Scale,
  ScrollText,
  Trees,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão geral", path: "/" },
  { icon: MapPinned, label: "Talhões", path: "/talhoes" },
  { icon: Scale, label: "Lançar ticket", path: "/tickets" },
  { icon: ReceiptText, label: "Caixa e operações", path: "/operacoes" },
  { icon: ScrollText, label: "Contratos", path: "/contratos" },
  { icon: FileText, label: "Arquivos", path: "/arquivos" },
  { icon: ClipboardCheck, label: "Vistorias", path: "/vistorias" },
  { icon: AlertTriangle, label: "Ocorrências", path: "/ocorrencias" },
];

const SIDEBAR_WIDTH_KEY = "forest-sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 240;
const MAX_WIDTH = 360;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f7f1] px-5 py-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-[0_25px_65px_-34px_rgba(23,64,46,0.45)] border border-[#dfe8dd]">
          <div className="h-12 w-12 rounded-2xl bg-[#173f2e] text-white flex items-center justify-center mb-7">
            <Trees className="h-6 w-6" />
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#71907c] font-semibold">Gestão florestal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#143226]">Acesso protegido para sua operação.</h1>
          <p className="mt-4 text-sm leading-6 text-[#64756a]">Entre para gerir talhões, tickets, contratos, arquivos, vistorias e indicadores em um único ambiente.</p>
          <Button onClick={() => startLogin()} size="lg" className="mt-8 w-full bg-[#1f5d42] hover:bg-[#174b35] text-white">Entrar na plataforma</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-[#244a38]/10 !bg-[#153e2e] !text-[#edf5ef]" disableTransition={isResizing}>
          <SidebarHeader className="h-[90px] justify-center px-3">
            <div className="flex w-full items-center gap-3">
              <button onClick={toggleSidebar} className="h-9 w-9 rounded-xl flex items-center justify-center text-[#b8d2c0] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white" aria-label="Alternar navegação">
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed && (
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#c3a667] text-[#173f2e] flex items-center justify-center"><Trees className="h-5 w-5" /></div>
                  <div className="min-w-0"><p className="font-semibold tracking-tight leading-none">Gestão Florestal</p><p className="text-[11px] text-[#a8c6b1] mt-1 truncate">Operação e controle</p></div>
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 px-2 py-2">
            <p className="px-3 py-3 text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8eb29a] group-data-[collapsible=icon]:hidden">Operação</p>
            <SidebarMenu>
              {menuItems.map(item => {
                const isActive = location === item.path;
                return <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className={`h-11 rounded-xl text-[#d7e7dc] hover:bg-white/10 hover:text-white ${isActive ? "bg-[#e8f1e8] text-[#174331] hover:bg-[#e8f1e8] hover:text-[#174331]" : ""}`}>
                    <item.icon className="h-4 w-4" /><span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left hover:bg-white/10 group-data-[collapsible=icon]:justify-center focus-visible:ring-2 focus-visible:ring-white">
                  <Avatar className="h-9 w-9 border border-white/20 shrink-0"><AvatarFallback className="bg-[#c3a667] text-[#173f2e] text-xs font-bold">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p><p className="text-[11px] text-[#a8c6b1] truncate mt-0.5">{user?.email || "Acesso autenticado"}</p></div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sair da plataforma</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className={`absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-white/30 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => !isCollapsed && setIsResizing(true)} />
      </div>
      <SidebarInset className="bg-[#f5f7f1] min-h-screen">
        {isMobile && <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#dfe8dd] bg-[#f8faf6]/95 px-3 backdrop-blur"><div className="flex items-center gap-2"><SidebarTrigger className="rounded-lg" /><span className="font-medium text-[#173f2e]">{activeMenuItem?.label || "Gestão Florestal"}</span></div><Trees className="h-5 w-5 text-[#1f5d42]" /></div>}
        <main className="min-h-screen p-4 pb-24 sm:p-7 sm:pb-7 lg:p-9">{children}</main>
        {isMobile && <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[#dfe8dd] bg-[#fbfcfa]/95 px-1 py-1.5 shadow-[0_-8px_28px_-18px_rgba(23,64,46,0.35)] backdrop-blur" aria-label="Atalhos de campo">{menuItems.slice(0, 5).map(item => { const active = location === item.path; return <button key={item.path} onClick={() => setLocation(item.path)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[9px] font-semibold ${active ? "bg-[#e8f3e8] text-[#1f5d42]" : "text-[#74837a]"}`}><item.icon className="h-4 w-4" /><span className="max-w-[65px] truncate">{item.label.replace("Lançar ", "")}</span></button>; })}</nav>}
      </SidebarInset>
    </>
  );
}
