"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      return;
    }
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await createClient()
      .from("profiles")
      .select("id,full_name,email,avatar_url,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  }, [session?.user.id]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setPasswordRecovery(false);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    profile,
    loading,
    passwordRecovery,
    clearPasswordRecovery: () => setPasswordRecovery(false),
    refreshProfile,
  }), [session, profile, loading, passwordRecovery, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
