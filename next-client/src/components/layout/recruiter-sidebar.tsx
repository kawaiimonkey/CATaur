"use client";

import { Logo } from "@/components/branding/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  BarChart3,
  LogOut,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Zap,
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
  { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
  { label: "Job Orders", href: "/recruiter/job-orders", icon: FileText, badge: "10", badgeColor: "bg-blue-500" },
  { label: "Candidates", href: "/recruiter/candidates", icon: Users, badge: "24", badgeColor: "bg-emerald-500" },
  { label: "Companies", href: "/recruiter/clients", icon: Building2 },
  { label: "Reports", href: "/recruiter/reports", icon: BarChart3 },
];

export function RecruiterSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [recruiterLoggedIn, setRecruiterLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () =>
      setRecruiterLoggedIn(localStorage.getItem("recruiterLoggedIn") === "1");
    update();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "recruiterLoggedIn") update();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("recruiterLoggedIn");
    setRecruiterLoggedIn(false);
    window.location.replace("/login?role=recruiter&redirect=%2Frecruiter");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[264px]"
      )}
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      }}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center shrink-0",
        collapsed ? "justify-center px-2" : "px-5 gap-3"
      )}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Zap className="h-5 w-5 text-blue-400" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight">CatATS</h1>
              <p className="text-[10px] font-medium text-slate-400 -mt-0.5">Recruiter Console</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 pb-2 pt-1">
          <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.1] cursor-pointer">
            <Search className="h-4 w-4 text-slate-500" />
            <span className="text-slate-500">Search...</span>
            <kbd className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-500 border border-white/[0.06]">
              /
            </kbd>
          </div>
        </div>
      )}

      {/* Section Label */}
      {!collapsed && (
        <div className="px-6 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Navigation
          </span>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={cn("flex-1 overflow-y-auto px-3 py-1", collapsed && "pt-3")}>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isRoot = item.href === "/recruiter";
            const isActive = isRoot
              ? pathname === "/recruiter"
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
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-blue-400" />
                  )}
                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white",
                          isActive ? "bg-blue-500" : (item.badgeColor || "bg-slate-600")
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
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-slate-300",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Back to Home" : undefined}
        >
          <Home className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </Link>
        <Link
          href="/recruiter/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
            collapsed && "justify-center px-2",
            pathname.startsWith("/recruiter/settings")
              ? "bg-white/[0.12] text-white"
              : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Link
          href="#"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-slate-300",
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
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-slate-300",
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
      {recruiterLoggedIn && (
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white">
                AR
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-lg shadow-blue-500/10">
                AR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">Allan Recruiter</p>
                <p className="text-[11px] text-slate-500 truncate">allan@cataur.com</p>
              </div>
              <button
                onClick={signOut}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
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

export function useSidebarWidth() {
  return { collapsed: "72px", expanded: "264px" };
}
