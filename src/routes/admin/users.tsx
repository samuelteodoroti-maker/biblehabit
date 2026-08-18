import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { useServerFn } from "@tanstack/react-start";
import { listAdminUsers } from "@/lib/admin.functions";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  AlertCircle,
  User as UserIcon,
  ChevronRight,
  Shield,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { role, roleLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const fetchUsers = useServerFn(listAdminUsers);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => fetchUsers({ data: { search, limit: 20 } }),
    enabled: !!role && ['super_admin', 'admin', 'support'].includes(role)
  });

  if (roleLoading) return <div className="p-10">Carregando...</div>;
  if (!role || !['super_admin', 'admin', 'support'].includes(role)) {
    return (
      <AdminLayout title="Acesso Negado">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p className="text-slate-400 mt-2">Você não possui o papel necessário para visualizar a lista de usuários.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestão de Usuários"
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
            placeholder="Buscar por nome ou e-mail..." 
            className="pl-10 bg-white/5 border-white/10 rounded-xl h-11 text-sm focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="border-white/10 bg-white/5 rounded-xl h-11 px-4 gap-2 flex-1 md:flex-none">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button className="gradient-primary rounded-xl h-11 px-6 shadow-glow-sm font-bold flex-1 md:flex-none">
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Leituras</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Último Acesso</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : data?.users?.map((user: any) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-xs uppercase">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" /> : (user.name?.charAt(0) || user.email?.charAt(0))}
                      </div>
                      <div className="flex flex-col">
                        <Link to="/admin/users/$userId" params={{ userId: user.id }} className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer">
                          {user.name || "Sem nome"}
                        </Link>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border-none",
                      user.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-300">{user.total_chapters_read}</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Cap</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">
                      {user.last_read_date ? new Date(user.last_read_date).toLocaleDateString('pt-BR') : 'Sem registro'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-white hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
