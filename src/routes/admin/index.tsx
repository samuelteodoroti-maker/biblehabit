import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { useServerFn } from "@tanstack/react-start";
import { getAdminDashboardStats } from "@/lib/admin.functions";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  BookOpen, 
  Flame, 
  AlertCircle,
  TrendingUp,
  Activity,
  ShieldAlert,
  History
} from "lucide-react";
import { BibleCard } from "@/components/BibleUI";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { role, roleLoading } = useAuth();
  const getStats = useServerFn(getAdminDashboardStats);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getStats(),
    enabled: !!role && ['super_admin', 'admin', 'support', 'analyst'].includes(role)
  });
  
  if (roleLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  );
  
  if (!role || !['super_admin', 'admin', 'support', 'analyst'].includes(role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">Acesso Negado</h1>
        <p className="mt-2 text-slate-400">Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-primary/20 transition-all">
      <div className={cn("absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12", color)}>
        <Icon className="h-16 w-16" />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <span className="text-3xl font-display font-bold text-white">{value}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Visão Geral">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Usuários" 
          value={stats?.totalUsers} 
          icon={Users} 
          color="text-blue-500" 
        />
        <StatCard 
          title="Ativos Hoje" 
          value={stats?.activeToday} 
          icon={Activity} 
          color="text-green-500" 
        />
        <StatCard 
          title="Total Leituras" 
          value={stats?.totalReadings} 
          icon={BookOpen} 
          color="text-biblical-gold" 
        />
        <StatCard 
          title="Planos Ativos" 
          value={stats?.totalPlans} 
          icon={TrendingUp} 
          color="text-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BibleCard title="Status do Sistema" icon={ShieldAlert}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-slate-400">Banco de Dados</span>
              <span className="text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-slate-400">Serviços de Autenticação</span>
              <span className="text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-slate-400">API Gateway</span>
              <span className="text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Online</span>
            </div>
          </div>
        </BibleCard>

        <BibleCard title="Atividade Recente" icon={History}>
           <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 italic">
             <p className="text-sm">Logs de auditoria em tempo real estarão disponíveis em breve.</p>
           </div>
        </BibleCard>
      </div>
    </AdminLayout>
  );
}
