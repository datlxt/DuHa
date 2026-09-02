import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured, supabaseEnv } from "../lib/env";

type SignUpMetadata = {
  full_name: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseEnv.isConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      async signIn(email, password) {
        requireSupabaseConfigured();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
      },
      async signUp(email, password, metadata) {
        requireSupabaseConfigured();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });
        if (error) throw new Error(error.message);

        if (data.user && data.session) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: metadata.full_name,
            role: metadata.role,
          });
          if (profileError) throw new Error(profileError.message);
        }

        return { needsEmailConfirmation: Boolean(data.user && !data.session) };
      },
      async signOut() {
        requireSupabaseConfigured();
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  return value;
}
