"use client";

import React, { ReactNode, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import Header from "./components/Header";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { GoldButton } from "@/components/GoldButton";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { loading, hasAdminAccess } = useAdminAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex min-h-screen bg-muted overflow-hidden">
                <div className="hidden lg:flex w-[240px] flex-col gap-4 p-4 border-r bg-background">
                    <Skeleton className="h-8 w-3/4 mb-8 mt-2" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="h-16 flex items-center justify-between px-6 border-b bg-background">
                        <Skeleton className="h-8 w-8 lg:hidden" />
                        <Skeleton className="h-8 w-32 ml-auto" />
                    </header>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-48" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </div>
                            <Skeleton className="h-[500px] w-full" />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // Redirect if user doesn't have admin access
    if (!hasAdminAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You don&apos;t have permission to access this area.</p>
                </div>
                <GoldButton
                    className="mt-4"
                    onClick={() => router.push("/signin")}
                >
                    Go to Home
                </GoldButton>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-muted overflow-hidden">
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col lg:ml-[240px] h-screen overflow-hidden">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
