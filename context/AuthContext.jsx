"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async (supaUser) => {
      if (!supaUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(supaUser);

      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
          // Merge profile data into user object for convenience
          setUser((prev) => ({ ...prev, ...data }));
        } else {
          setRole("helper");
        }
      } catch {
        setRole("helper");
      } finally {
        setLoading(false);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchRole(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      fetchRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    supabase,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
