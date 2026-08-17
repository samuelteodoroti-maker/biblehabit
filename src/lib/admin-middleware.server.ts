import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const requireAdminRole = (allowedRoles: string[]) => 
  createMiddleware().server(async ({ next }) => {
    // In a server function, we should use the admin client or check context
    // However, createServerFn context varies.
    // We'll rely on the supabase client being correctly configured with the bearer token via middleware.
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !allowedRoles.includes(roleData.role)) {
      throw new Error("Forbidden: Insufficient permissions");
    }

    return next();
  });
