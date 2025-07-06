import React from "react";
import { X } from "lucide-react";

export default function Modal({
    open,
    onClose,
    children,
    heading,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    heading?: string;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-lg p-8 min-w-[380px] relative">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>
                {heading && (
                    <h2 className="text-xl font-semibold mb-6">{heading}</h2>
                )}
                {children}
            </div>
        </div>
    );
}
