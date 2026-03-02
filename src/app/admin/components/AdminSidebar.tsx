"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useNewMessagesCount } from "@/hooks/useNewMessagesCount";
import { useUserRole } from "@/hooks/useUserRole";
import { hasPermission, Permission } from "@/lib/permissions";
import { userStore } from "@/store/userStore";
import {
    X,
    LayoutDashboard,
    ShoppingCart,
    Truck,
    Package,
    Users,
    Tag,
    Flag,
    Settings,
    MessageSquare,
    CreditCard,
    Receipt,
    ChevronRight,
} from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission: Permission;
};

type AdminSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard" },
    { label: "Live Billing (POS)", href: "/admin/billing-pos", icon: CreditCard, permission: "billing" },
    { label: "POS Orders", href: "/admin/pos-orders", icon: Receipt, permission: "billing" },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "orders" },
    { label: "Contact Messages", href: "/admin/contact-messages", icon: MessageSquare, permission: "contact-messages" },
    { label: "Delivery", href: "/admin/delivery", icon: Truck, permission: "delivery" },
    { label: "Products", href: "/admin/products", icon: Package, permission: "products" },
    { label: "Users", href: "/admin/users", icon: Users, permission: "users" },
    { label: "Promo Codes", href: "/admin/promo-codes", icon: Tag, permission: "promo-codes" },
    { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag, permission: "feature-flags" },
    { label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings" },
];

const SETTINGS_HREF = "/admin/settings";

function getRoleLabel(role: string | null): string {
    if (!role) return "";
    return role.charAt(0) + role.slice(1).toLowerCase();
}

function getInitials(fullName: string, phone: string): string {
    if (fullName && fullName.trim().length > 0) {
        const parts = fullName.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return fullName.trim()[0].toUpperCase();
    }
    if (phone && phone.length >= 2) {
        return phone.slice(-2);
    }
    return "?";
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { newMessagesCount } = useNewMessagesCount();
    const { userRole, isManager } = useUserRole();
    const fullName = userStore((s) => s.fullName);
    const phone = userStore((s) => s.phone);

    const allowedNavItems = navItems.filter(item => hasPermission(userRole, item.permission));
    const mainItems = allowedNavItems.filter(item => item.href !== SETTINGS_HREF);
    const settingsItem = allowedNavItems.find(item => item.href === SETTINGS_HREF);

    const handleNavClick = () => {
        onClose();
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    const renderNavItem = (item: NavItem) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const isContactMessages = item.href === "/admin/contact-messages";
        const showBadge = isContactMessages && newMessagesCount > 0;

        return (
            <div key={item.href} className="relative">
                <Link href={item.href} onClick={handleNavClick}>
                    <div className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-200 cursor-pointer
                        ${isActive
                            ? "bg-white/15 shadow-sm"
                            : "hover:bg-white/8"
                        }
                    `}>
                        {/* Left accent bar for active */}
                        <div className={`
                            absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
                            transition-all duration-200
                            ${isActive ? "h-6 bg-white/80" : "h-0 bg-white/30 group-hover:h-4"}
                        `} />

                        {/* Icon */}
                        <div className={`
                            flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                            transition-all duration-200
                            ${isActive
                                ? "bg-white/20"
                                : "bg-white/5 group-hover:bg-white/12"
                            }
                        `}>
                            <Icon className={`
                                h-[18px] w-[18px] transition-colors duration-200
                                ${isActive
                                    ? "text-white"
                                    : "text-white/60 group-hover:text-white/90"
                                }
                            `} />
                        </div>

                        {/* Label + badge */}
                        <div className="flex flex-1 items-center justify-between min-w-0">
                            <span className={`
                                text-sm transition-all duration-200 truncate
                                ${isActive
                                    ? "font-semibold text-white"
                                    : "font-medium text-white/70 group-hover:text-white/95"
                                }
                            `}>
                                {item.label}
                            </span>

                            {showBadge ? (
                                <Badge className="ml-2 bg-red-500 hover:bg-red-500 text-white text-[10px] font-bold px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full flex-shrink-0 animate-pulse">
                                    {newMessagesCount > 99 ? "99+" : newMessagesCount}
                                </Badge>
                            ) : isActive ? (
                                <ChevronRight className="h-3.5 w-3.5 text-white/50 flex-shrink-0 ml-1" />
                            ) : null}
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    const panelTitle = isManager ? "Manager Panel" : "Admin Panel";
    const panelSubtitle = isManager ? "Billing Console" : "Management Console";
    const initials = getInitials(fullName, phone);
    const roleLabel = getRoleLabel(userRole);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 h-full lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                onWheel={handleWheel}
                className={`
                    fixed top-0 left-0 h-screen w-[240px] bg-primary
                    flex flex-col z-50 transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    shadow-2xl border-r border-white/8
                    overflow-hidden
                `}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="relative flex-shrink-0 px-4 pt-5 pb-4">
                    {/* Subtle top gradient */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                    {/* Mobile close button */}
                    <div className="relative flex items-center justify-between lg:hidden mb-1">
                        <div className="flex items-center gap-2.5">
                            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-white/10 flex items-center justify-center">
                                <Image src="/logo-nalan2.jpg" alt="Logo" fill sizes="36px" className="object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-base text-white leading-tight">{panelTitle}</div>
                                <div className="text-[11px] text-white/55 leading-tight">{panelSubtitle}</div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Desktop header */}
                    <div className="relative hidden lg:flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                            <Image src="/logo-nalan2.jpg" alt="Logo" fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-[15px] text-white leading-tight truncate">{panelTitle}</div>
                            <div className="text-[11px] text-white/55 leading-tight">{panelSubtitle}</div>
                        </div>
                    </div>
                </div>

                {/* ── Nav divider ─────────────────────────────────────── */}
                <div className="mx-4 h-px bg-white/8 flex-shrink-0" />

                {/* ── Navigation ──────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden px-2 py-3">
                    <ScrollArea className="h-full [&>[data-slot=scroll-area-scrollbar]]:bg-white/5 [&>[data-slot=scroll-area-thumb]]:bg-white/20 [&>[data-slot=scroll-area-thumb]]:hover:bg-white/35">
                        <nav className="space-y-0.5 pr-1">
                            {mainItems.map(renderNavItem)}
                        </nav>

                        {/* Divider before Settings */}
                        {settingsItem && (
                            <>
                                <div className="mx-1 my-3 h-px bg-white/8" />
                                <nav className="pr-1">
                                    {renderNavItem(settingsItem)}
                                </nav>
                            </>
                        )}
                    </ScrollArea>
                </div>

                {/* ── User Footer ─────────────────────────────────────── */}
                <div className="flex-shrink-0 mx-4 mb-4">
                    <div className="h-px bg-white/8 mb-3" />
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/6 transition-colors duration-200">
                        {/* Avatar */}
                        <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/10">
                            <span className="text-white text-xs font-bold leading-none">{initials}</span>
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <div className="text-white/90 text-xs font-semibold truncate leading-tight">
                                {fullName || phone || "Admin"}
                            </div>
                            {roleLabel && (
                                <div className="text-white/45 text-[10px] leading-tight mt-0.5 truncate">
                                    {roleLabel}
                                </div>
                            )}
                        </div>
                        {/* Role badge */}
                        {roleLabel && (
                            <div className="flex-shrink-0">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 uppercase tracking-wide">
                                    {roleLabel}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
