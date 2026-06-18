import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { supabase, usernameToEmail } from "@/lib/supabaseClient";

const AuthContext = createContext(null);
const BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async (token) => {
    if (!token) {
      setRole(null);
      setTrainee(null);
      return;
    }
    try {
      const { data } = await axios.get(`${BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRole(data.role);
      setTrainee(data.trainee);
    } catch (e) {
      setRole(null);
      setTrainee(null);
      // A 401 here means the backend has rejected this token outright (expired,
      // revoked, or otherwise invalid) and a plain retry won't help - the safest
      // move is a clean sign-out so the user lands on the login screen instead of
      // a half-loaded dashboard showing zeros everywhere.
      if (e?.response?.status === 401) {
        try {
          await supabase.auth.signOut({ scope: "global" });
        } catch (signOutErr) {
          await supabase.auth.signOut();
        }
        try {
          localStorage.removeItem("odk-training-auth");
        } catch (storageErr) {}
        setSession(null);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      // Bootstrap admin once on initial load (idempotent server-side, but skip if already logged in)
      if (!data.session) {
        axios.post(`${BASE}/setup/init`).catch(() => {});
      }
      await refreshMe(data.session?.access_token);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await refreshMe(s?.access_token);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshMe]);

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
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (e) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem("odk-training-auth");
    } catch (e) {}
    setSession(null);
    setRole(null);
    setTrainee(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, role, trainee, loading, signInAs, signOut, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
