"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  BarChart3,
  X,
  Zap,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
  { label: "Job Orders", href: "/recruiter/job-orders", icon: FileText },
  { label: "Candidates", href: "/recruiter/candidates", icon: Users },
  { label: "Companies", href: "/recruiter/clients", icon: Building2 },
  { label: "Reports", href: "/recruiter/reports", icon: BarChart3 },
];

export function RecruiterSidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-[var(--surface)] border-[var(--border)] transition-all duration-200 ease-in-out",
          /* Mobile: slide in/out */
          open ? "translate-x-0" : "-translate-x-full",
          /* Desktop: always visible, width controlled by collapsed */
          collapsed ? "lg:translate-x-0 lg:w-[64px]" : "lg:translate-x-0 lg:w-[240px]",
          /* Mobile always 240px wide */
          "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-14 items-center shrink-0 border-b border-[var(--border)]", collapsed ? "lg:justify-center px-0" : "justify-between px-5")}>
          <div className={cn("flex items-center gap-2.5", collapsed && "lg:justify-center")}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div className="lg:block">
                <h1 className="text-sm font-semibold text-[var(--gray-900)] leading-tight">CatATS</h1>
                <p className="text-[11px] text-[var(--gray-500)] -mt-0.5">Recruiter</p>
              </div>
            )}
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
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
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                      collapsed && "lg:justify-center lg:px-0",
                      isActive
                        ? "bg-[var(--accent-light)] text-[var(--accent)]"
                        : "text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[var(--accent)]" />
                    )}
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-[var(--accent)]" : "text-[var(--gray-400)] group-hover:text-[var(--gray-600)]"
                      )}
                    />
                    {/* Hide label on desktop when collapsed */}
                    <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop collapse toggle */}
        <div className={cn("hidden lg:flex border-t border-[var(--border)] py-2", collapsed ? "justify-center" : "justify-end px-3")}>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)] transition-colors"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
