import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    // We check the admin status from the client/hook context if available
    // But since this is a route, we could add a server check or just rely on AdminGuard component
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin, role, roleLoading } = useAuth();
  
  if (roleLoading) return <div>Carregando...</div>;
  if (role !== 'super_admin' && role !== 'admin' && role !== 'support' && role !== 'analyst') {
    return <div>Acesso negado.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <p>Bem-vindo, {role}.</p>
    </div>
  );
}
