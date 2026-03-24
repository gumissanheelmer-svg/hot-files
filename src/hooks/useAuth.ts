import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "user" | "super_admin" | null;

export function useAuth(requiredRole?: "user" | "super_admin") {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (requiredRole) navigate("/login");
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const userRoles = (roles || []).map((r: any) => r.role);
      const detectedRole: UserRole = userRoles.includes("super_admin")
        ? "super_admin"
        : userRoles.includes("user")
        ? "user"
        : userRoles.includes("admin")
        ? "user"
        : null;

      setRole(detectedRole);

      if (requiredRole === "super_admin" && detectedRole !== "super_admin") {
        navigate("/login");
        return;
      }

      if (requiredRole === "user" && !detectedRole) {
        navigate("/login");
        return;
      }

      setLoading(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUserId(null);
        setRole(null);
        if (requiredRole) navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, requiredRole]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { loading, userId, role, logout };
}
