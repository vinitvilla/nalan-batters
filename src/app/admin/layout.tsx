"use client";

import React, { ReactNode, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import Header from "./components/Header";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { GoldButton } from "@/components/GoldButton";
import { useRouter } from "next/navigation";

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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Redirect if user doesn't have admin access
    if (!hasAdminAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this area.</p>
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
            <div className="flex-1 flex flex-col lg:ml-64 h-screen overflow-hidden">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
