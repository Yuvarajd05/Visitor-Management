"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { AuthUser } from "@/types/auth";
import { getErrorMessage } from "@/server/utils/errors";

interface UseAuthReturn {
  user: AuthUser | null;
  isLoggingOut: boolean;
  logout: () => Promise<void>;
}

export function useAuth(initialUser: AuthUser | null): UseAuthReturn {
  const router = useRouter();
  const [user] = useState<AuthUser | null>(initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to log out. Please try again.");
      }

      toast.success("Logged out successfully.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  return {
    user,
    isLoggingOut,
    logout,
  };
}
