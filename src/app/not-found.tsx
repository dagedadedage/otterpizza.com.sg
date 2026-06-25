import Link from "next/link";
import { Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <Pizza className="h-20 w-20 text-primary/30 mb-6" />
      <h1 className="text-4xl font-black text-dark mb-2">404</h1>
      <p className="text-xl font-bold text-dark mb-2">Page Not Found</p>
      <p className="text-muted max-w-md mb-8">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/order">Order Now</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/menu">View Menu</Link>
        </Button>
      </div>
    </div>
  );
}
