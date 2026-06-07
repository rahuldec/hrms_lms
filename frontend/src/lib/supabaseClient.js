import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "odk-training-auth",
  },
});

export const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME || "admin";
export const ADMIN_DEFAULT_PASSWORD =
  process.env.REACT_APP_ADMIN_DEFAULT_PASSWORD || "admin123";

export const usernameToEmail = (username, role) => {
  const u = username.trim().toLowerCase();
  if (role === "admin" || u === ADMIN_USERNAME) return `${u}@odk.local`;
  return `${u}@trainee.local`;
};
