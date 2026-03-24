import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const email = "elmerdiamantino@gmail.com";
  const password = "Elmerbe258";

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === email);

  if (existing) {
    // Just ensure they have super_admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", existing.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      await supabase.from("user_roles").insert({ user_id: existing.id, role: "super_admin" });
    }

    // Ensure profile exists
    const { data: profileData } = await supabase.from("profiles").select("id").eq("id", existing.id).maybeSingle();
    if (!profileData) {
      await supabase.from("profiles").insert({
        id: existing.id,
        full_name: "Super Admin",
        store_name: "Platform Admin",
        store_slug: "admin",
      });
    }

    return new Response(JSON.stringify({ ok: true, message: "Super admin already exists, role ensured" }));
  }

  // Create user
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Super Admin" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // The trigger will create profile + 'user' role automatically
  // Now add super_admin role
  await supabase.from("user_roles").insert({ user_id: newUser.user.id, role: "super_admin" });

  return new Response(JSON.stringify({ ok: true, message: "Super admin created" }));
});
