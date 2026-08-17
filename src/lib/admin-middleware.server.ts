import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const requireAdminRole = (allowedRoles: string[]) => 
  createMiddleware().server(async ({ next }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Mandatory MFA Check for Admin routes
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw new Error("Security check failed");

    // Check if the user has an active MFA session
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    // If factors exist but level is not 'aal2', user must step up
    if (factors.all.length > 0 && mfaData?.currentLevel !== 'aal2') {
      throw new Error("MFA Required: Please verify your second factor");
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
