import { useAuth } from "@/context/AuthContext";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

type UseProtectedRouteOptions = {
  redirectTo?: string;
  requireAdmin?: boolean;
};

export default function useProtectedRoute(options?: UseProtectedRouteOptions) {
  const auth = useAuth();
  const {
    isLoading,
    userToken,
    isAdmin,
    user,
    isValidatingSession,
    setPendingRedirect,
    validateSession,
  } = auth;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const redirectTo = options?.redirectTo ?? "/login";
  const requireAdmin = options?.requireAdmin ?? false;
  const [hasValidatedAccess, setHasValidatedAccess] = useState(false);
  const validatedTokenRef = useRef<string | null>(null);

  const isReady = !isLoading;
  const isAuthenticated = !!userToken;
  const isAuthorized = isAuthenticated && (!requireAdmin || isAdmin);
  const currentDestination = useMemo(() => {
    const query = new URLSearchParams();

    Object.entries(searchParams || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => query.append(key, String(entry)));
        return;
      }

      if (typeof value !== "undefined") {
        query.set(key, String(value));
      }
    });

    const queryString = query.toString();
    return `${pathname || "/"}${queryString ? `?${queryString}` : ""}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    let isActive = true;

    if (!isReady) {
      setHasValidatedAccess(false);
      validatedTokenRef.current = null;
      return;
    }

    if (!isAuthenticated || (requireAdmin && !isAdmin)) {
      if (currentDestination !== redirectTo) {
        setPendingRedirect(currentDestination);
      }
      setHasValidatedAccess(false);
      validatedTokenRef.current = null;
      router.replace(redirectTo as any);
      return () => {
        isActive = false;
      };
    }

    if (validatedTokenRef.current === userToken && hasValidatedAccess) {
      return () => {
        isActive = false;
      };
    }

    setHasValidatedAccess(false);

    validateSession().then((isStillValid) => {
      if (!isActive) {
        return;
      }

      const isStillAuthorized =
        isStillValid && (!requireAdmin || user?.role === "admin");
      if (!isStillAuthorized) {
        validatedTokenRef.current = null;
        if (currentDestination !== redirectTo) {
          setPendingRedirect(currentDestination);
        }
        router.replace(redirectTo as any);
        return;
      }

      validatedTokenRef.current = userToken;
      setHasValidatedAccess(true);
    });

    return () => {
      isActive = false;
    };
  }, [
    isAdmin,
    user?.role,
    userToken,
    setPendingRedirect,
    validateSession,
    isAuthenticated,
    isReady,
    hasValidatedAccess,
    currentDestination,
    redirectTo,
    requireAdmin,
    router,
  ]);

  return {
    ...auth,
    isReady,
    isAuthenticated,
    isAuthorized,
    shouldBlock:
      !isReady ||
      !isAuthorized ||
      (!user && (isValidatingSession || !hasValidatedAccess)),
  };
}
