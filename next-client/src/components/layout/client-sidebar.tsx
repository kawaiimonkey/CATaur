"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BriefcaseBusiness,
    Users,
    FileCheck2,
    LogOut,
    Settings,
    Search,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Building2,
    Home,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/client", icon: LayoutDashboard },
    { label: "Job Orders", href: "/client/orders", icon: BriefcaseBusiness },
    { label: "Candidates", href: "/client/candidates", icon: Users, badge: "New", badgeColor: "bg-indigo-500" },
    { label: "Decisions", href: "/client/decisions", icon: FileCheck2 },
];

export function ClientSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const update = () =>
            setLoggedIn(localStorage.getItem("clientLoggedIn") === "1");
        update();
        const onStorage = (e: StorageEvent) => {
            if (e.key === "clientLoggedIn") update();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const signOut = () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("clientLoggedIn");
        setLoggedIn(false);
        window.location.replace("/login?role=client&redirect=%2Fclient");
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300 ease-in-out",
                collapsed ? "w-[72px]" : "w-[264px]"
            )}
            style={{
                background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)", // Indigo theme
            }}
        >
            {/* Logo */}
            <div className={cn(
                "flex h-16 items-center shrink-0",
                collapsed ? "justify-center px-2" : "px-5 gap-3"
            )}>
                {collapsed ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                        <Building2 className="h-5 w-5 text-indigo-300" />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-white tracking-tight">CatATS</h1>
                            <p className="text-[10px] font-medium text-indigo-200 -mt-0.5">Client Portal</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="px-4 pb-2 pt-1">
                    <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-indigo-200 transition-colors hover:bg-white/[0.1] cursor-pointer">
                        <Search className="h-4 w-4 text-indigo-300" />
                        <span className="text-indigo-300">Search...</span>
                        <kbd className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-white/[0.06]">
                            /
                        </kbd>
                    </div>
                </div>
            )}

            {/* Section Label */}
            {!collapsed && (
                <div className="px-6 pt-4 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-400">
                        Menu
                    </span>
                </div>
            )}

            {/* Main Navigation */}
            <nav className={cn("flex-1 overflow-y-auto px-3 py-1", collapsed && "pt-3")}>
                <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isRoot = item.href === "/client";
                        const isActive = isRoot
                            ? pathname === "/client"
                            : pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                                        collapsed && "justify-center px-2",
                                        isActive
                                            ? "bg-white/[0.12] text-white shadow-sm"
                                            : "text-indigo-300 hover:bg-white/[0.06] hover:text-indigo-100"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-indigo-400" />
                                    )}
                                    <item.icon className={cn(
                                        "h-[18px] w-[18px] shrink-0 transition-colors",
                                        isActive ? "text-indigo-400" : "text-indigo-400 group-hover:text-indigo-200"
                                    )} />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1">{item.label}</span>
                                            {item.badge && (
                                                <span className={cn(
                                                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white",
                                                    isActive ? "bg-indigo-500" : (item.badgeColor || "bg-slate-600")
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            {/* Bottom Section */}
            <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-indigo-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-indigo-100",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Back to Home" : undefined}
                >
                    <Home className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>Back to Home</span>}
                </Link>
                <Link
                    href="#"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-indigo-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-indigo-100",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Settings" : undefined}
                >
                    <Settings className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>
                <Link
                    href="#"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-indigo-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-indigo-100",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Help & Support" : undefined}
                >
                    <HelpCircle className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>Help & Support</span>}
                </Link>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-indigo-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-indigo-100",
                        collapsed && "justify-center px-2"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="h-[18px] w-[18px] shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>

            {/* User Profile */}
            {loggedIn && (
                <div className={cn(
                    "border-t border-white/[0.06] p-3",
                    collapsed ? "flex justify-center" : ""
                )}>
                    {collapsed ? (
                        <button
                            onClick={signOut}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] transition-colors hover:bg-red-500/20"
                            title="Sign out"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-[11px] font-bold text-white">
                                CC
                            </div>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/10">
                                CC
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-white truncate">Client Contact</p>
                                <p className="text-[11px] text-indigo-300 truncate">client@example.com</p>
                            </div>
                            <button
                                onClick={signOut}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-indigo-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                title="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
