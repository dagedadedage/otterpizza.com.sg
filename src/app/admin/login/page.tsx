import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
