"use client";

import React, { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";
import Header from "./components/Header";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {

    return (
        <div className="flex min-h-screen bg-muted">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}
