import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async ({ context }) => {
    // We check the admin status from the client/hook context if available
    // But since this is a route, we could add a server check or just rely on AdminGuard component
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { role, roleLoading } = useAuth();
  
  if (roleLoading) return <div>Carregando...</div>;
  
  if (!['super_admin', 'admin', 'support', 'analyst'].includes(role)) {
    return <div>Acesso negado.</div>;
  }

  return (
    <AdminLayout title="Dashboard Administrativo">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Usuários</p>
          <div className="text-3xl font-bold mt-2">--</div>
        </div>
        {/* Adicione outros cards aqui */}
      </div>
    </AdminLayout>
  );
}
