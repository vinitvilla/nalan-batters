"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getDefaultRoute } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const AdminPage: React.FC = () => {
  const router = useRouter();
  const { user, hasAdminAccess, userRole, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/signin");
      } else if (!hasAdminAccess) {
        router.push("/");
      } else {
        // Redirect to appropriate default route based on role
        const defaultRoute = getDefaultRoute(userRole);
        router.push(defaultRoute);
      }
    }
  }, [user, hasAdminAccess, userRole, loading, router]);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100">
        <Card className="flex flex-col items-center p-8 shadow-lg">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
          <h2 className="text-indigo-600 font-semibold text-2xl">
            Loading Admin Panel…
          </h2>
        </Card>
      </main>
    );
  }

  if (!user || !hasAdminAccess) {
    return null;
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <section>
        <p>
          Welcome to the admin panel. Use the navigation to manage the
          application.
        </p>
      </section>
    </main>
  );
};

export default AdminPage;
