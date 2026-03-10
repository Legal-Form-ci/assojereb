import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateSecurePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(x => chars[x % chars.length]).join('');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate: require service role key as Bearer token
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Generate a secure random password
    const securePassword = generateSecurePassword();

    // Create admin user with secure password
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: "admin@assojereb.ci",
      password: securePassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Admin",
      },
    });

    if (createError) {
      throw createError;
    }

    if (userData.user) {
      // Create profile with must_change_password flag
      await supabase.from("profiles").insert({
        user_id: userData.user.id,
        full_name: "Admin",
        must_change_password: true,
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
        email: "admin@assojereb.ci",
        temporary_password: securePassword,
        note: "Change this password immediately after first login."
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
