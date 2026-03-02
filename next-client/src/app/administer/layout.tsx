"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Bell, Search, MessageSquare, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/administer": { title: "Dashboard", subtitle: "System overview and health monitoring" },
  "/administer/users": { title: "Users", subtitle: "Manage user accounts and access" },
  "/administer/roles": { title: "Roles", subtitle: "Define permissions and access levels" },
  "/administer/activity": { title: "Activity", subtitle: "Audit sign-ins, updates, and admin actions" },
  "/administer/email": { title: "Email", subtitle: "SMTP configuration and sender identity" },
  "/administer/ai": { title: "AI Key", subtitle: "Securely manage provider credentials" },
  "/administer/models": { title: "AI Models", subtitle: "Configure summarization, matching, and embeddings" },
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const info = PAGE_TITLES[path];
    crumbs.push({
      label: info?.title || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
      href: path,
    });
  }
  return crumbs;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = localStorage.getItem("recruiterLoggedIn") === "1";
    if (!loggedIn) {
      setAuthorized(false);
      const redirect = encodeURIComponent(pathname || "/administer");
      window.location.replace(`/login?role=recruiter&redirect=${redirect}`);
      return;
    }
    setAuthorized(true);
  }, [pathname]);
  if (authorized !== true) {
    return null;
  }

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col pl-[264px] transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-slate-200/60 bg-white/90 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-slate-900">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors cursor-pointer hover:bg-slate-100 cursor-pointer hover:text-slate-600">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors cursor-pointer hover:bg-slate-100 cursor-pointer hover:text-slate-600">
              <MessageSquare className="h-[18px] w-[18px]" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors cursor-pointer hover:bg-slate-100 cursor-pointer hover:text-slate-600">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="ml-2 h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-slate-800">Allan Admin</p>
                <p className="text-[11px] text-slate-400 -mt-0.5">System Administrator</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[11px] font-bold text-white">
                AA
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
