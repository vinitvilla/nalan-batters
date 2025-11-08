import React from "react";
import ConfigForm from "./ConfigForm";
import { Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="h-[calc(100vh-4rem)]"> 
            {/* Main Configuration Form */}
            <Card className="shadow-xl overflow-hidden h-full flex flex-col">
                <CardHeader className="border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex items-center justify-center">
                            <Palette className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold">Configuration Management</CardTitle>
                            <CardDescription>Manage application configuration and system settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <ConfigForm />
                </CardContent>
            </Card>
        </div>
    );
}
