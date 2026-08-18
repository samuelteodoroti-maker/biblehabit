import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "moderator" | "user" | "super_admin" | "support" | "analyst";

export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!data) return false;
  
  const roles: UserRole[] = ["admin", "super_admin", "support", "analyst"];
  return roles.includes(data.role as UserRole);
}

export const APP_VERSION = "1.5.0";
export const SUPPORT_WHATSAPP = "5521959331138";
export const SUPPORT_WHATSAPP_DISPLAY = "(21) 9 5933-1138";

export function getWhatsAppUrl(message?: string) {
  const encodedMsg = encodeURIComponent(message || "Olá! Preciso de ajuda com o Bible Habit.");
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodedMsg}`;
}

export function getVersionWhatsAppUrl(version: string) {
  return getWhatsAppUrl(`Olá! Preciso de ajuda com a atualização ${version} do Bible Habit.`);
}
