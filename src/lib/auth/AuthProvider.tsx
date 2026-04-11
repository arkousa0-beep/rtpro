"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";

interface AuthProfile {
  role: string;
  permissions: ProfilePermissions;
}

interface AuthContextType {
  user: User | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isManager: boolean;
  hasPermission: (perm: keyof ProfilePermissions | (keyof ProfilePermissions)[]) => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, permissions")
          .eq("id", user.id)
          .single();

        setProfile(profileData ? {
          role: profileData.role,
          permissions: profileData.permissions as ProfilePermissions,
        } : null);
      }
    } catch (error) {
      console.error("Auth fetch error:", error);
    } finally {
      setIsLoading(false);
      fetchedRef.current = true;
    }
  };

  useEffect(() => {
    fetchAuth();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchAuth();
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync with tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const isManager = profile?.role === "Manager";

  const hasPermission = (perm: keyof ProfilePermissions | (keyof ProfilePermissions)[]) => {
    if (isManager) return true;
    if (!profile?.permissions) return false;
    if (Array.isArray(perm)) {
      return perm.some((p) => {
        const key = p as keyof ProfilePermissions;
        return profile.permissions[key] === true;
      });
    }
    const key = perm as keyof ProfilePermissions;
    return profile.permissions[key] === true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isManager,
      hasPermission,
      refreshAuth: fetchAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
