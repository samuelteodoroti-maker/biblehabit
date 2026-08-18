import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Camera, Trash2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReadingData } from "@/hooks/useReadingData";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Editar perfil — Bible Habit" },
      { name: "description", content: "Atualize suas informações pessoais e foto de perfil no Bible Habit." },
    ],
  }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const { user } = useAuth();
  const { refresh } = useReadingData();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [originalGoogleAvatar, setOriginalGoogleAvatar] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Set Google photo if available
    const googlePhoto = user.user_metadata?.avatar_url;
    if (googlePhoto) setOriginalGoogleAvatar(googlePhoto);

    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.name || "");
          setAvatar(data.avatar_url);
        }
        setLoading(false);
      });
  }, [user]);

  // Prevent accidental leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPEG, PNG ou WebP.");
      return;
    }

    // Size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. O limite é 5MB.");
      return;
    }

    setSaving(true);
    try {
      // In a real scenario, we'd process the image to WebP 512x512 here.
      // For this implementation, we upload directly to Supabase Storage.
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      // Cache busting
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatar(finalUrl);
      setIsDirty(true);
      toast.success("Foto carregada. Não esqueça de salvar!");
    } catch (error: any) {
      toast.error("Falha no upload: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    
    if (trimmedName.length < 2) {
      toast.error("O nome deve ter pelo menos 2 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          name: trimmedName, 
          avatar_url: avatar, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      setIsDirty(false);
      refresh();
      navigate({ to: "/settings" });
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !confirm("Descartar alterações não salvas?")) return;
    navigate({ to: "/settings" });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando perfil...</p>
        </div>
      </AppShell>
    );
  }

  const initial = (name || user?.email || "?")[0]?.toUpperCase();

  return (
    <AppShell 
      title="Editar perfil" 
      subtitle="Atualize como seu perfil aparece no Bible Habit"
      hero={
        <Button 
          variant="ghost" 
          size="sm" 
          className="-ml-2 mb-4 h-9 gap-2 text-muted-foreground hover:text-foreground" 
          onClick={handleCancel}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
      }
    >
      <div className="mx-auto max-w-xl pb-24 md:pb-8">
        <div className="space-y-6">
          {/* Avatar Section */}
          <Card className="overflow-hidden border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="group relative">
                <Avatar className="h-28 w-28 ring-4 ring-primary/20 transition-transform group-hover:scale-[1.02]">
                  {avatar && <AvatarImage src={avatar} alt={`Foto de perfil de ${name}`} className="object-cover" />}
                  <AvatarFallback className="gradient-primary text-3xl font-bold text-primary-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                {saving && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-[2px]">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-9 gap-2 rounded-xl bg-background/50" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <Camera className="h-4 w-4" /> Alterar foto
                </Button>
                
                {avatar && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 gap-2 rounded-xl text-destructive hover:bg-destructive/10" 
                    onClick={() => { setAvatar(null); setIsDirty(true); }}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                )}

                {originalGoogleAvatar && avatar !== originalGoogleAvatar && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 gap-2 rounded-xl text-primary hover:bg-primary/10" 
                    onClick={() => { setAvatar(originalGoogleAvatar); setIsDirty(true); }}
                    disabled={saving}
                  >
                    <Sparkles className="h-4 w-4" /> Usar do Google
                  </Button>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png,image/jpeg,image/webp" 
                onChange={handleFileChange} 
              />
              
              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">
                JPG, PNG ou WebP. Máx 5MB. Recomendado 512x512.
              </p>
            </div>
          </Card>

          {/* Form Section */}
          <Card className="space-y-6 border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Nome de exibição
              </Label>
              <div className="relative">
                <Input 
                  id="display-name" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setIsDirty(true); }} 
                  maxLength={60} 
                  className="h-12 rounded-2xl border-border/60 bg-background/40 pr-12 focus-visible:ring-primary/30"
                  placeholder="Seu nome"
                />
                <span className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums transition-colors",
                  name.length > 55 ? "text-orange-500" : "text-muted-foreground/50"
                )}>
                  {name.length}/60
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Como você será visto em grupos e rankings.
              </p>
            </div>

            <div className="space-y-2 opacity-80">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                E-mail da conta
              </Label>
              <Input value={user?.email || ""} disabled className="h-12 rounded-2xl border-border/40 bg-muted/20" />
              <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-primary">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p className="text-[10px] leading-relaxed">
                  O e-mail está vinculado à sua forma de acesso e não pode ser alterado aqui.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button 
              variant="outline" 
              className="h-14 w-full rounded-2xl border-border/60 bg-card text-foreground shadow-sm hover:bg-accent sm:flex-1"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              className="h-14 w-full gap-2 rounded-2xl gradient-primary font-bold text-primary-foreground shadow-glow hover:brightness-110 sm:flex-1"
              onClick={handleSave}
              disabled={saving || !isDirty || name.trim().length < 2}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              Salvar alterações
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

