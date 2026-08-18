import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { AlertTriangle, ShieldAlert, ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSystemErrors } from "@/lib/system-errors.functions";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/errors")({
  component: AdminErrorsPage,
});

function AdminErrorsPage() {
  const { role, roleLoading } = useAuth();
  const navigate = useNavigate();
  const fetchErrors = useServerFn(getSystemErrors);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-system-errors'],
    queryFn: () => fetchErrors({ data: { limit: 50 } }),
    enabled: !!role && ['super_admin', 'analyst'].includes(role)
  });

  if (roleLoading) return <div className="p-10 text-white">Carregando...</div>;
  
  if (!role || !['super_admin', 'analyst'].includes(role)) {
    return (
      <AdminLayout title="Acesso Negado">
        <div className="flex flex-col items-center justify-center py-20 text-center text-white">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p className="text-slate-400 mt-2">Apenas Super Administradores e Analistas podem ver erros do sistema.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Erros do Sistema"
      actions={
        <div className="flex items-center gap-2">
           <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="border-white/10 bg-white/5 text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate({ to: "/admin" })}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      }
    >
      <div className="rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Horário</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rota</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Mensagem</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              ) : data?.errors?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                    Nenhum erro registrado recentemente.
                  </td>
                </tr>
              ) : data?.errors?.map((err: any) => (
                <tr key={err.id} className="text-xs text-slate-300 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(err.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px]">
                    {err.route || 'N/A'}
                  </td>
                  <td className="px-6 py-4 max-w-md truncate" title={err.message}>
                    {err.message}
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px]">
                    {err.user_id ? err.user_id.slice(0, 8) : 'Anônimo'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
