import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const requireAdminRole = (allowedRoles: string[]) => 
  createMiddleware().server(async ({ next }) => {
    // We use getUser() to ensure the token is verified and we get the latest user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized: Please sign in to access this area.");
    }

    // Security: Check for suspension status
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (profile?.status === 'suspended') {
      throw new Error("Account Suspended: Please contact support.");
    }

    // Mandatory MFA Check for Admin routes
    // This is a defense-in-depth layer
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      console.error("MFA factors check failed:", factorsError);
      throw new Error("Security check failed: Could not verify MFA status.");
    }

    const { data: mfaData, error: mfaLevelError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaLevelError) {
      console.error("MFA level check failed:", mfaLevelError);
      throw new Error("Security check failed: Could not verify assurance level.");
    }
    
    // If factors exist but level is not 'aal2', user must step up
    const hasVerifiedFactors = factors.all.some(f => f.status === 'verified');
    if (hasVerifiedFactors && mfaData?.currentLevel !== 'aal2') {
      throw new Error("MFA Required: High-privilege actions require multi-factor authentication.");
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleData || !allowedRoles.includes(roleData.role)) {
      console.warn(`Unauthorized access attempt by user ${user.id} to admin routes.`);
      throw new Error("Forbidden: You do not have the required permissions.");
    }

    return next();
  });
