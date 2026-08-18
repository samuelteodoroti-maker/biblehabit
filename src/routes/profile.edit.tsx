import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload, Trash2, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfilePage,
});

function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 5MB)");
      return;
    }

    setSaving(true);
    const fileExt = "webp";
    const filePath = `${user!.id}/${crypto.randomUUID()}.${fileExt}`;

    // Note: In a real implementation, we'd use a server function or client-side resize/upload logic
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      toast.error("Erro ao subir imagem: " + uploadError.message);
      setSaving(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatar(publicUrl);
    setSaving(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), avatar_url: avatar, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Perfil atualizado com sucesso");
      navigate({ to: "/settings" });
    }
  };

  if (loading) return <AppShell><div className="flex h-screen items-center justify-center">Carregando...</div></AppShell>;

  const initial = (name || user?.email || "?")[0]?.toUpperCase();

  return (
    <AppShell title="Editar perfil" subtitle="Atualize como seu perfil aparece no Bible Habit" hero={<Button variant="ghost" className="mb-4" onClick={() => navigate({ to: "/settings" })}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>}>
      <div className="mx-auto max-w-xl space-y-8">
        <Card className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              {avatar && <AvatarImage src={avatar} alt={`Foto de perfil de ${name}`} />}
              <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}><Camera className="mr-2 h-4 w-4" /> Alterar foto</Button>
              <Button size="sm" variant="ghost" onClick={() => setAvatar(null)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label>Nome de exibição</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            <p className="text-xs text-muted-foreground">{name.length}/60 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">O e-mail está vinculado à sua forma de acesso e não pode ser alterado aqui.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate({ to: "/settings" })}>Cancelar</Button>
            <Button className="flex-1 gradient-primary" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : "Salvar alterações"}</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
