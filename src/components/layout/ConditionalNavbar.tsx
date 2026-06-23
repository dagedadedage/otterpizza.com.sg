"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Navbar />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Footer />;
}
