import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { useServerFn } from "@tanstack/react-start";
import { getAdminUserProfile, manageUserStatus } from "@/lib/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User as UserIcon,
  Shield,
  Calendar,
  Flame,
  BookOpen,
  AlertTriangle,
  Mail,
  Smartphone,
  Globe,
  CheckCircle2,
  XCircle,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BibleCard } from "@/components/BibleUI";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/users/$userId")({
  component: AdminUserDetailPage,
});

function AdminUserDetailPage() {
  const { userId } = Route.useParams();
  const { role, roleLoading } = useAuth();
  const fetchProfile = useServerFn(getAdminUserProfile);
  const updateStatus = useServerFn(manageUserStatus);
  const queryClient = useQueryClient();
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => fetchProfile({ data: { userId } }),
    enabled: !!role && ['super_admin', 'admin', 'support'].includes(role)
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: 'active' | 'suspended') => 
      updateStatus({ data: { userId, status: newStatus, reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
      toast.success("Status do usuário atualizado com sucesso");
      setIsSuspendModalOpen(false);
      setReason("");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar status: " + err.message);
    }
  });

  if (roleLoading || isLoading) return <div className="p-10 text-white">Carregando...</div>;
  if (!role || !['super_admin', 'admin', 'support'].includes(role)) {
    return <div className="p-10 text-center text-white">Acesso negado.</div>;
  }

  const { profile, roles, stats, plans } = data || {};

  return (
    <AdminLayout title="Detalhes do Usuário">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <BibleCard variant="editorial" className="p-0 overflow-hidden">
             <div className="bg-slate-900/50 p-8 flex flex-col items-center text-center border-b border-white/5">
                <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-primary/20 p-1 mb-4 overflow-hidden flex items-center justify-center text-3xl font-bold uppercase text-white">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile?.name?.charAt(0) || profile?.email?.charAt(0))}
                </div>
                <h2 className="text-xl font-bold text-white">{profile?.name || "Sem nome"}</h2>
                <p className="text-sm text-slate-400 mt-1">{profile?.email}</p>
                <Badge className={cn(
                  "mt-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase border-none",
                  profile?.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {profile?.status === 'active' ? 'Ativo' : 'Suspenso'}
                </Badge>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-widest font-bold">Papéis</span>
                  <div className="flex gap-1">
                    {roles?.map((r: string) => (
                      <Badge key={r} variant="outline" className="text-[9px] border-primary/20 text-primary uppercase">{r}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-widest font-bold">Membro desde</span>
                  <span className="text-slate-300">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '--'}</span>
                </div>
             </div>
          </BibleCard>

          {role === 'super_admin' && (
            <div className="space-y-3">
              <Button 
                variant="destructive" 
                className="w-full rounded-2xl h-12 font-bold gap-2"
                onClick={() => profile?.status === 'active' ? setIsSuspendModalOpen(true) : statusMutation.mutate('active')}
              >
                {profile?.status === 'active' ? (
                  <>
                    <Ban className="h-4 w-4" />
                    Suspender Conta
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Reativar Conta
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Content Tabs/Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
              <Flame className="h-5 w-5 text-orange-500 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sequência</p>
              <p className="text-2xl font-display font-bold text-white">{profile?.current_streak} dias</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
              <BookOpen className="h-5 w-5 text-biblical-gold mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Capítulos</p>
              <p className="text-2xl font-display font-bold text-white">{profile?.total_chapters_read}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
              <Calendar className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Lidos</p>
              <p className="text-2xl font-display font-bold text-white">{stats?.readingCount}</p>
            </div>
          </div>

          {/* Active Plans */}
          <BibleCard title="Jornadas de Leitura" icon={Calendar}>
             <div className="space-y-4">
                {plans?.length === 0 ? (
                  <p className="text-center py-6 text-sm text-slate-500 italic">Nenhum plano encontrado.</p>
                ) : plans?.map((plan: any) => (
                  <div key={plan.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-sm">{plan.title}</h4>
                      <Badge variant="outline" className="text-[9px] border-white/10">{plan.status} / {plan.total_days} dias</Badge>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(plan.status / plan.total_days) * 100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
          </BibleCard>
        </div>
      </div>

      {/* Suspension Modal */}
      <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif-title text-xl">Confirmar Suspensão</DialogTitle>
            <DialogDescription className="text-slate-400">
              Esta ação revogará o acesso do usuário ao aplicativo. Por favor, forneça uma justificativa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Justificativa administrativa..." 
              className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-white"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSuspendModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => statusMutation.mutate('suspended')}
              disabled={!reason || statusMutation.isPending}
              className="rounded-xl px-6 font-bold"
            >
              Confirmar Suspensão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
