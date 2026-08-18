import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { History, Search, Filter, Download, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const { role, roleLoading } = useAuth();
  const navigate = useNavigate();

  if (roleLoading) return <div className="p-10 text-white">Carregando...</div>;
  if (role !== 'super_admin' && role !== 'analyst') {
    return <div className="p-10 text-center text-white">Acesso negado. Apenas o Super Administrador ou Analista podem visualizar logs de auditoria.</div>;
  }

  return (
    <AdminLayout 
      title="Logs de Auditoria"
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
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Filtrar por ação ou admin..." 
            className="pl-10 bg-white/5 border-white/10 rounded-xl h-11 text-sm text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="border-white/10 bg-white/5 rounded-xl h-11 px-4 gap-2 text-white">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/5 p-12 text-center overflow-hidden">
        <div className="max-w-md mx-auto">
          <History className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Logs de Auditoria</h3>
          <p className="text-sm text-slate-500">
            A tabela de auditoria é imutável e registra todas as ações administrativas. 
            Os registros aparecerão aqui conforme ações forem executadas.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
