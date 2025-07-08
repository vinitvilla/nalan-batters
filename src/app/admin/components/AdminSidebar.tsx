import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    subItems?: NavItem[];
};

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Products", href: "/admin/products" },
    { label: "Users", href: "/admin/users" },
    { label: "Feature Flags", href: "/admin/feature-flags" },
    { label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState<{ [key: string]: boolean }>({});

    const handleToggle = (key: string) => {
        setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
    };


    return (
        <aside className="w-60 bg-primary text-primary-foreground flex flex-col py-6">
            <div className="font-bold text-2xl text-center mb-8">Admin Panel</div>
            <ScrollArea className="flex-1">
                <nav>
                    <ul className="space-y-2 px-4">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <div className="flex items-center w-full">
                                    <Link href={item.href} className="w-full">
                                        <Button
                                            variant={pathname === item.href ? "secondary" : "ghost"}
                                            className="w-full justify-start"
                                            style={{ cursor: "pointer" }}
                                            onClick={item.subItems ? (e) => { e.preventDefault(); handleToggle(item.href); } : undefined}
                                        >
                                            {item.label}
                                        </Button>
                                    </Link>
                                    {item.subItems && item.subItems.length != 0 && (
                                        <button
                                            type="button"
                                            aria-label={open[item.href] ? "Collapse" : "Expand"}
                                            className="ml-1 text-xs text-primary-foreground flex items-center"
                                            style={{ cursor: "pointer", background: "none", border: "none" }}
                                            onClick={() => handleToggle(item.href)}
                                        >
                                            {open[item.href] ? (
                                                <ChevronUpIcon size={16} />
                                            ) : (
                                                <ChevronDownIcon size={16} />
                                            )}
                                        </button>
                                    )}
                                </div>
                                {item.subItems && open[item.href] && (
                                    <ul className="ml-4 mt-1 space-y-1">
                                        {item.subItems.map((sub) => (
                                            <li key={sub.href}>
                                                <Link href={sub.href} className="w-full">
                                                    <Button
                                                        variant={pathname === sub.href ? "secondary" : "ghost"}
                                                        className="w-full justify-start text-sm"
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        {sub.label}
                                                    </Button>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </ScrollArea>
        </aside>
    );
}
