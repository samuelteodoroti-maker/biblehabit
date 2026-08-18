import { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Users, 
  History, 
  ShieldAlert, 
  LifeBuoy, 
  Settings, 
  ChevronLeft,
  Menu,
  X,
  Lock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin", roles: ["super_admin", "admin", "support", "analyst"] },
  { label: "Usuários", icon: Users, path: "/admin/users", roles: ["super_admin", "admin", "support"] },
  { label: "Auditoria", icon: History, path: "/admin/audit", roles: ["super_admin", "admin", "analyst"] },
  { label: "Segurança", icon: ShieldAlert, path: "/admin/security", roles: ["super_admin", "analyst"] },
  { label: "Erros", icon: ShieldAlert, path: "/admin/errors", roles: ["super_admin", "analyst"] },

  { label: "Suporte", icon: LifeBuoy, path: "/admin/support", roles: ["super_admin", "support", "admin"] },
  { label: "Configurações", icon: Settings, path: "/admin/settings", roles: ["super_admin", "admin"] },
];

export function AdminLayout({ children, title, actions }: AdminLayoutProps) {
  const { role, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role as string));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30">
      {/* Mobile Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-md lg:hidden sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <span className="font-serif-title text-lg font-bold">Bible Habit <span className="text-primary text-xs ml-1 uppercase tracking-tighter">Admin</span></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-slate-900/50 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col p-6">
            <div className="hidden lg:flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-title text-xl font-bold leading-none">Bible Habit</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">Painel Admin</span>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {filteredNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
                    location.pathname === item.path 
                      ? "bg-primary text-white shadow-glow-sm" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-primary"
                  )} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center text-xs font-bold uppercase">
                  {user?.email?.charAt(0) || 'A'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-200 truncate">{user?.email}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-primary/80">{role}</span>
                </div>
              </div>
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-11">
                  <ExternalLink className="h-4 w-4" />
                  Voltar ao App
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-slate-950 min-h-screen">
          <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    <ShieldAlert className="h-3 w-3 text-primary" />
                    <span>Acesso Seguro Restrito</span>
                  </div>
                  <h1 className="font-serif-title text-3xl font-bold tracking-tight md:text-4xl text-white">{title}</h1>
                </div>
                {actions && <div>{actions}</div>}
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
