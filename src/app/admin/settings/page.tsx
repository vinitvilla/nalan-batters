"use client";
import React from "react";
import ConfigForm from "./ConfigForm";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="h-[calc(100vh-4rem)]"> 
            {/* Main Configuration Form */}
            <Card className="shadow-xl overflow-hidden h-full flex flex-col">
                <ConfigForm />
            </Card>
        </div>
    );
}
