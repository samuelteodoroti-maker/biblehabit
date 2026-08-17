import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { LifeBuoy, MessageCircle, UserCheck, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BibleCard } from "@/components/BibleUI";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupportPage,
});

function AdminSupportPage() {
  const { role, roleLoading } = useAuth();

  if (roleLoading) return <div className="p-10 text-white">Carregando...</div>;
  if (!role || !['super_admin', 'support'].includes(role)) {
    return <div className="p-10 text-center text-white">Acesso negado.</div>;
  }

  return (
    <AdminLayout title="Centro de Suporte">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-8 rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Atenção ao Usuário</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-8">
              Inicie uma sessão de suporte segura para diagnosticar problemas relatados. O modo de suporte é apenas leitura por padrão.
            </p>
            <Button className="gradient-primary rounded-2xl h-12 px-8 font-bold shadow-glow-sm">
              Iniciar Novo Atendimento
            </Button>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sessões Ativas</h4>
            </div>
            <div className="p-12 text-center text-slate-600 italic text-sm">
              Nenhuma sessão de suporte em andamento.
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <BibleCard title="Regras de Suporte" icon={ShieldCheck}>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400">Sessões expiram automaticamente em 30 minutos.</span>
              </li>
              <li className="flex gap-3">
                <UserCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400">É necessária autorização explícita para visualizar dados sensíveis.</span>
              </li>
            </ul>
          </BibleCard>
        </div>
      </div>
    </AdminLayout>
  );
}
