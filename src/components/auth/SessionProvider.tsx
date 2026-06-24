"use client";

import { useEffect } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";

function LegacyCookieCleanup() {
  const { data: session } = useSession();

  useEffect(() => {
    // Clean up legacy otter-admin-token cookie when NextAuth session is active
    if (session?.user) {
      document.cookie = "otter-admin-token=; path=/; max-age=0; secure; samesite=lax";
      document.cookie = "__Secure-otter-admin-token=; path=/; max-age=0; secure; samesite=lax";
    }
  }, [session]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <LegacyCookieCleanup />
      {children}
    </NextAuthSessionProvider>
  );
}
