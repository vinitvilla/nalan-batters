"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getDefaultRoute } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";

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
      <main className="p-6 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!user || !hasAdminAccess) {
    return null;
  }

  return (
    <main className="p-6 space-y-6">
      <Skeleton className="h-10 w-1/4 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-5/6" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </main>
  );
};

export default AdminPage;
