import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Shield, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { BibleCard } from "@/components/BibleUI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/security")({
  component: AdminSecurityPage,
});

function AdminSecurityPage() {
  const { role, roleLoading } = useAuth();

  if (roleLoading) return <div className="p-10 text-white">Carregando...</div>;
  if (role !== "super_admin") {
    return (
      <AdminLayout title="Acesso Negado">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lock className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Apenas Super Administradores</h2>
          <p className="text-slate-400 mt-2">Esta seção contém configurações críticas de segurança.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Segurança do Sistema">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BibleCard title="Autenticação Multi-Fator (MFA)" icon={ShieldCheck}>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Status global de MFA para administradores.</p>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Exigir MFA para Super Admins</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Obrigatório por Política</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
            <Button variant="outline" className="w-full border-white/10 text-xs font-bold h-10 rounded-xl">
              Configurar Políticas de MFA
            </Button>
          </div>
        </BibleCard>

        <BibleCard title="Chaves e Tokens" icon={Shield}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Aviso de Segurança</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As chaves do sistema são gerenciadas pelo Lovable Cloud. Nenhuma service_role deve ser exposta ao frontend.
              </p>
            </div>
            <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5 text-xs font-bold h-10 rounded-xl">
              Ver Logs de Acesso a Segredos
            </Button>
          </div>
        </BibleCard>
      </div>
    </AdminLayout>
  );
}
