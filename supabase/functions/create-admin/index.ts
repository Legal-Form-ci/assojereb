import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(
      (u) => u.email === "admin@assojereb.ci"
    );

    if (adminExists) {
      return new Response(
        JSON.stringify({ message: "Admin user already exists", success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: "admin@assojereb.ci",
      password: "123456",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin",
      },
    });

    if (createError) {
      throw createError;
    }

    if (userData.user) {
      // Create profile
      await supabase.from("profiles").insert({
        user_id: userData.user.id,
        full_name: "Admin",
      });

      // Assign admin role
      await supabase.from("user_roles").insert({
        user_id: userData.user.id,
        role: "admin",
      });
    }

    return new Response(
      JSON.stringify({ 
        message: "Admin user created successfully", 
        success: true,
        email: "admin@assojereb.ci"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
