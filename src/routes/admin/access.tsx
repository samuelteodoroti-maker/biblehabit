import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Activity, ShieldAlert, AlertCircle, Terminal } from "lucide-react";
import { BibleCard } from "@/components/BibleUI";

export const Route = createFileRoute("/admin/access")({
  component: AdminAccessPage,
});

function AdminAccessPage() {
  const { role, roleLoading } = useAuth();

  if (roleLoading) return <div className="p-10 text-white">Carregando...</div>;
  if (!role || !['super_admin', 'admin'].includes(role)) {
    return <div className="p-10 text-center text-white">Acesso negado.</div>;
  }

  return (
    <AdminLayout title="Acessos e Tentativas">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Eventos Recentes</h3>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="p-12 text-center text-slate-500 italic text-sm">
              Nenhum evento de acesso suspeito registrado nas últimas 24 horas.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BibleCard title="Segurança de Sessão" icon={ShieldAlert}>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Retenção de Logs</p>
                <p className="text-sm font-medium text-white">30 Dias (Padrão)</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Mascaramento de IP</p>
                <p className="text-sm font-medium text-green-500">Ativado</p>
              </div>
            </div>
          </BibleCard>

          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
            <Terminal className="h-6 w-6 text-primary mb-3" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Tentativas de acesso a rotas administrativas por usuários não autorizados são automaticamente bloqueadas e registradas.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
