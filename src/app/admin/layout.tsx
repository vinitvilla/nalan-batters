"use client";

import React, { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";
import Header from "./components/Header";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {

    const { loading } = useAdminAuth();

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            ) : null}
            <div className="flex min-h-screen bg-muted">
                <AdminSidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-8">{children}</main>
                </div>
            </div>
        </>
    );
}
