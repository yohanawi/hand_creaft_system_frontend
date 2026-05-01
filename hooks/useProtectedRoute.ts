import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

type UseProtectedRouteOptions = {
  redirectTo?: string;
  requireAdmin?: boolean;
};

export default function useProtectedRoute(options?: UseProtectedRouteOptions) {
  const auth = useAuth();
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/login";
  const requireAdmin = options?.requireAdmin ?? false;

  const isReady = !auth.isLoading;
  const isAuthenticated = !!auth.userToken;
  const isAuthorized = isAuthenticated && (!requireAdmin || auth.isAdmin);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated || (requireAdmin && !auth.isAdmin)) {
      router.replace(redirectTo as any);
    }
  }, [
    auth.isAdmin,
    isAuthenticated,
    isReady,
    redirectTo,
    requireAdmin,
    router,
  ]);

  return {
    ...auth,
    isReady,
    isAuthenticated,
    isAuthorized,
    shouldBlock: !isReady || !isAuthorized,
  };
}
