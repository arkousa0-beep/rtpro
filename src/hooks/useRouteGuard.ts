import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

/**
 * A hook to protect client-side routes based on user roles and permissions.
 * @param requiredPermission The permission(s) required to access the route.
 */
export function useRouteGuard(requiredPermission?: keyof ProfilePermissions | (keyof ProfilePermissions)[]) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRedirected = useRef(false);
  const retryCount = useRef(0);

  const checkAuthorization = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError && authError.status !== 401) throw authError;

      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/login");
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, permissions")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error(profileError?.message || "Profile not found");
      }

      const role = profile.role;
      const perms = profile.permissions as ProfilePermissions;

      if (role === "Manager") {
        setIsAuthorized(true);
        setIsLoading(false);
        retryCount.current = 0;
        return;
      }

      if (!requiredPermission) {
        setIsAuthorized(true);
        setIsLoading(false);
        retryCount.current = 0;
        return;
      }

      let hasAccess = false;
      if (Array.isArray(requiredPermission)) {
        hasAccess = requiredPermission.some((p) => perms?.[p] === true);
      } else {
        hasAccess = perms?.[requiredPermission] === true;
      }

      setIsAuthorized(hasAccess);
      setIsLoading(false);
      retryCount.current = 0;

      if (!hasAccess && !hasRedirected.current) {
        hasRedirected.current = true;
        router.replace("/");
      }
    } catch (error) {
      console.error("Authorization check failed:", error);

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        setTimeout(() => checkAuthorization(), RETRY_DELAY);
        return;
      }

      setIsAuthorized(false);
      setIsLoading(false);
      // Only redirect to home if we are sure it's an authorization failure, 
      // not just a network error. If it's a network error, we stay on the page.
    }
  }, [requiredPermission, router]);

  useEffect(() => {
    retryCount.current = 0;
    hasRedirected.current = false;

    checkAuthorization();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        hasRedirected.current = false;
        retryCount.current = 0;
        setIsLoading(true);
        setIsAuthorized(null);
        checkAuthorization();
      }
      if (event === "SIGNED_OUT") {
        hasRedirected.current = false;
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthorization, router]);

  return { isAuthorized, isLoading };
}
