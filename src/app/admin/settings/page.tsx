import React from "react";
import ConfigForm from "./ConfigForm";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Site Configuration</h1>
            <ConfigForm />
        </div>
    );
}
