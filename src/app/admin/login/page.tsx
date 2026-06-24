"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const error = searchParams.get("error");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSRF token for the sign-in form
    fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary mx-auto mb-4">
            <Pizza className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark">Otter Admin</h1>
          <p className="text-sm text-muted mt-1">
            Sign in with your Otter Group Google account
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error === "AccessDenied"
                ? "Your email is not authorized for admin access. Contact an administrator."
                : error === "Configuration"
                  ? "Authentication is not configured. Check server settings."
                  : error === "OAuthAccountNotLinked"
                    ? "This Google account is already linked to another user."
                    : `Authentication error: ${error}`}
            </div>
          )}

          <form
            action="/api/auth/signin/google"
            method="POST"
          >
            <input type="hidden" name="csrfToken" value={csrfToken || ""} />
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button
              variant="primary"
              type="submit"
              disabled={!csrfToken}
              className="w-full flex items-center justify-center gap-3"
            >
              {!csrfToken ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Sign in with Google
            </Button>
          </form>

          <p className="text-xs text-center text-muted mt-4">
            Only authorized @otter-group.com accounts can access the admin
            panel.
          </p>
        </div>

        <p className="text-center text-xs text-muted/60 mt-6">
          Otter Pizza Pte Ltd &middot;{" "}
          <a href="/privacy" className="underline hover:text-muted">
            Privacy Policy
          </a>{" "}
          &middot;{" "}
          <a href="/" className="underline hover:text-muted">
            Back to Site
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
