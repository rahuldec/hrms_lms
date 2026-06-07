import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, usernameToEmail } from "@/lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (userId) => {
    if (!userId) {
      setRole(null);
      setTrainee(null);
      return;
    }
    const { data: rolesRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const r = rolesRows?.[0]?.role || null;
    setRole(r);
    if (r === "trainee") {
      const { data: tRows } = await supabase
        .from("trainees")
        .select("*")
        .eq("auth_user_id", userId)
        .limit(1);
      setTrainee(tRows?.[0] || null);
    } else {
      setTrainee(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await loadRole(data.session?.user?.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await loadRole(s?.user?.id);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadRole]);

  const signInAs = async ({ username, password, roleHint }) => {
    const email = usernameToEmail(username, roleHint);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error };
    return { data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setTrainee(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, role, trainee, loading, signInAs, signOut, loadRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
