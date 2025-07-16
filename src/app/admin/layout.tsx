"use client";

import React, { ReactNode, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import Header from "./components/Header";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { loading } = useAdminAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : null}
            <div className="flex min-h-screen bg-muted">
                <AdminSidebar 
                    isOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                />
                <div className="flex-1 flex flex-col lg:ml-0">
                    <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
