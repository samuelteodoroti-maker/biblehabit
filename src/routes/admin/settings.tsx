import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { Settings as SettingsIcon, Database, Bell, Layout, Cpu, ChevronLeft } from "lucide-react";
import { BibleCard } from "@/components/BibleUI";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { role, roleLoading } = useAuth();
  const navigate = useNavigate();

  if (roleLoading) return <div className="p-10 text-white">Carregando...</div>;
  if (role !== "super_admin") {
    return <div className="p-10 text-center text-white">Acesso negado.</div>;
  }

  return (
    <AdminLayout 
      title="Configurações do Sistema"
      actions={
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate({ to: "/admin" })}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BibleCard title="Geral" icon={Layout}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-white">Modo Manutenção</Label>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Bloqueia acesso público</p>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-white">Logs de Depuração</Label>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Aumenta verbosidade</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </BibleCard>

        <BibleCard title="Infraestrutura" icon={Database}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-white">Versão do Backend</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">v14.5 (PostgreSQL)</span>
            </div>
          </div>
        </BibleCard>
      </div>
    </AdminLayout>
  );
}
