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
    Crown,
    MessageSquare,
    CreditCard,
    Receipt
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

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { newMessagesCount } = useNewMessagesCount();
    const { userRole, isManager } = useUserRole();

    // Filter nav items based on user permissions
    const allowedNavItems = navItems.filter(item => hasPermission(userRole, item.permission));

    const handleNavClick = () => {
        onClose(); // Close sidebar on mobile after navigation
    };

    // Prevent scroll from propagating to the main page
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 h-full lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Redesigned Sidebar */}
            <aside
                onWheel={handleWheel}
                className={`
                    fixed top-0 left-0 h-screen w-64 bg-primary
                    flex flex-col z-50 transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    shadow-xl border-r border-primary-foreground/10
                    overflow-hidden
                `}
            >
                {/* Header Section */}
                <div className="relative flex-shrink-0">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/5 to-transparent"></div>

                    {/* Mobile Close Button */}
                    <div className="relative flex items-center justify-between p-6 lg:hidden">
                        <div className="flex items-center space-x-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                                <Image src="/logo-nalan2.jpg" alt="Logo" width={40} height={40} className="object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-primary-foreground">
                                    {isManager ? 'Manager Panel' : 'Admin Panel'}
                                </div>
                                <div className="text-xs text-primary-foreground/70">
                                    {isManager ? 'Billing Console' : 'Management Console'}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Desktop Header */}
                    <div className="relative hidden lg:block p-6 pb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                                <Image src="/logo-nalan2.jpg" alt="Logo" width={56} height={56} className="object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-xl text-primary-foreground">
                                    {isManager ? 'Manager Panel' : 'Admin Panel'}
                                </div>
                                <div className="text-sm text-primary-foreground/70">
                                    {isManager ? 'Billing Console' : 'Management Console'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 overflow-hidden px-3 pb-4">
                    <ScrollArea className="h-full [&>[data-slot=scroll-area-scrollbar]]:bg-primary-foreground/10 [&>[data-slot=scroll-area-thumb]]:bg-primary-foreground/40 [&>[data-slot=scroll-area-thumb]]:hover:bg-primary-foreground/60">
                        <nav className="space-y-1 pr-2">
                            {allowedNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                const isContactMessages = item.href === "/admin/contact-messages";
                                const showBadge = isContactMessages && newMessagesCount > 0;

                                return (
                                    <div key={item.href} className="relative">
                                        <Link href={item.href} onClick={handleNavClick}>
                                            <div className={`
                                            group flex items-center space-x-3 px-4 py-3 rounded-xl
                                            transition-all duration-200 cursor-pointer
                                            ${isActive
                                                    ? 'bg-primary-foreground/15 border border-primary-foreground/20 shadow-sm'
                                                    : 'hover:bg-primary-foreground/8 hover:translate-x-1'
                                                }
                                        `}>
                                                <div className={`
                                                p-2 rounded-lg transition-all duration-200
                                                ${isActive
                                                        ? 'bg-primary-foreground/20 shadow-md'
                                                        : 'bg-primary-foreground/5 group-hover:bg-primary-foreground/15'
                                                    }
                                            `}>
                                                    <Icon className={`
                                                    h-5 w-5 transition-colors duration-200
                                                    ${isActive
                                                            ? 'text-primary-foreground'
                                                            : 'text-primary-foreground/70 group-hover:text-primary-foreground'
                                                        }
                                                `} />
                                                </div>

                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className={`
                                                    font-medium transition-colors duration-200
                                                    ${isActive
                                                            ? 'text-primary-foreground'
                                                            : 'text-primary-foreground/80 group-hover:text-primary-foreground'
                                                        }
                                                `}>
                                                        {item.label}
                                                    </div>

                                                    {/* New Messages Badge */}
                                                    {showBadge && (
                                                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                                                            {newMessagesCount > 99 ? "99+" : newMessagesCount}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Active Indicator */}
                                                {isActive && (
                                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-foreground/60 rounded-l-full"></div>
                                                )}

                                                {/* Hover Indicator */}
                                                <div className={`
                                                absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0 bg-primary-foreground/40 rounded-r-full
                                                transition-all duration-200 group-hover:h-6
                                                ${isActive ? 'opacity-0' : ''}
                                            `}></div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                </div>
            </aside>
        </>
    );
}
