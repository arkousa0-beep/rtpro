import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";

/**
 * A hook to protect client-side routes based on user roles and permissions.
 * @param requiredPermission The permission(s) required to access the route. If an array is provided, the user needs at least one of them. If undefined, any authenticated user will be allowed (or any employee).
 * @returns { isAuthorized, isLoading }
 */
export function useRouteGuard(requiredPermission?: keyof ProfilePermissions | (keyof ProfilePermissions)[]) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthorization() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) setIsAuthorized(false);
          router.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, permissions")
          .eq("id", user.id)
          .single();

        if (!profile) {
          if (isMounted) setIsAuthorized(false);
          router.replace("/");
          return;
        }

        const role = profile.role;
        const perms = profile.permissions as ProfilePermissions;

        // Managers always have full access
        if (role === "Manager") {
          if (isMounted) {
            setIsAuthorized(true);
            setIsLoading(false);
          }
          return;
        }

        // If no specific permission is required, any logged in user can access
        if (!requiredPermission) {
          if (isMounted) {
            setIsAuthorized(true);
            setIsLoading(false);
          }
          return;
        }

        // Check if the user has the required permission
        let hasAccess = false;
        if (Array.isArray(requiredPermission)) {
          hasAccess = requiredPermission.some((p) => perms?.[p] === true);
        } else {
          hasAccess = perms?.[requiredPermission] === true;
        }

        if (!hasAccess) {
          if (isMounted) setIsAuthorized(false);
          router.replace("/");
        } else {
          if (isMounted) setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Authorization check failed", error);
        if (isMounted) setIsAuthorized(false);
        router.replace("/");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuthorization();

    return () => {
      isMounted = false;
    };
  }, [requiredPermission, router]);

  return { isAuthorized, isLoading };
}
