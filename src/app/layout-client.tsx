"use client";

import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { SessionHydrator } from "@/components/SessionHydrator";
import Footer from "@/components/Footer";
import EnvironmentBadge from "@/components/EnvironmentBadge";

export function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isSignInPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");

  return (
    <>
      <SessionHydrator />
      <EnvironmentBadge />
      {!(isAdminPage || isSignInPage) && <Header />}
      <Toaster />
      {children}
      {!(isAdminPage || isSignInPage) && <Footer />}
    </>
  );
}
