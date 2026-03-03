"use client";

import { ClientSidebar } from "@/components/layout/client-sidebar";
import { Bell, ChevronRight, Menu, User, Type, Sun, Moon, LogOut, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/client": { title: "Dashboard", subtitle: "Overview of your hiring pipeline" },
  "/client/orders": { title: "Job Orders", subtitle: "Track active positions for your company" },
  "/client/candidates": { title: "Candidates", subtitle: "Review submitted candidates" },
  "/client/decisions": { title: "Decisions", subtitle: "Approve or reject candidates" },
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

const FONT_SIZES = [
  { label: "Small", value: 0.875 },
  { label: "Medium", value: 1 },
  { label: "Large", value: 1.125 },
] as const;

/* ─── Avatar Dropdown ────────────────────────────────────────────────────── */

function AvatarDropdown({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [fontIdx, setFontIdx] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("catats-theme") as "light" | "dark" | null;
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);

    const savedFont = localStorage.getItem("catats-font-idx");
    if (savedFont !== null) {
      const idx = Number(savedFont);
      setFontIdx(idx);
      document.documentElement.style.setProperty("--font-scale", String(FONT_SIZES[idx]?.value ?? 1));
    }
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleFontChange = (idx: number) => {
    setFontIdx(idx);
    localStorage.setItem("catats-font-idx", String(idx));
    document.documentElement.style.setProperty("--font-scale", String(FONT_SIZES[idx].value));
  };

  const handleThemeChange = (t: "light" | "dark") => {
    setTheme(t);
    localStorage.setItem("catats-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const signOut = () => {
    localStorage.removeItem("clientLoggedIn");
    window.location.replace("/login?role=client&redirect=%2Fclient");
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white transition-shadow hover:ring-2 hover:ring-[var(--accent-ring)] hover:ring-offset-1"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] animate-scale-in z-50">
          {/* User info */}
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--gray-900)]">{userName}</p>
            <p className="text-xs text-[var(--gray-500)]">client@example.com</p>
          </div>

          {/* Profile */}
          <div className="py-1">
            <Link
              href="/client/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-100)]"
            >
              <User className="h-4 w-4 text-[var(--gray-400)]" />
              Profile
            </Link>
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Font Size */}
          <div className="py-1">
            <div className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--gray-400)]">
              Font Size
            </div>
            {FONT_SIZES.map((fs, i) => (
              <button
                key={fs.label}
                onClick={() => handleFontChange(i)}
                className="flex w-full items-center gap-3 px-4 py-1.5 text-sm text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-100)]"
              >
                <Type className="h-4 w-4 text-[var(--gray-400)]" />
                <span className="flex-1 text-left">{fs.label}</span>
                {fontIdx === i && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Theme */}
          <div className="py-1">
            <div className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--gray-400)]">
              Theme
            </div>
            <button
              onClick={() => handleThemeChange("light")}
              className="flex w-full items-center gap-3 px-4 py-1.5 text-sm text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-100)]"
            >
              <Sun className="h-4 w-4 text-[var(--gray-400)]" />
              <span className="flex-1 text-left">Light</span>
              {theme === "light" && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className="flex w-full items-center gap-3 px-4 py-1.5 text-sm text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-100)]"
            >
              <Moon className="h-4 w-4 text-[var(--gray-400)]" />
              <span className="flex-1 text-left">Dark</span>
              {theme === "dark" && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
            </button>
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--danger)] cursor-pointer hover:bg-[var(--danger-bg)]"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Notification Button ─────────────────────────────────────────────────── */

function NotificationButton() {
  return (
    <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)] transition-colors">
      <Bell className="h-[18px] w-[18px]" />
    </button>
  );
}

/* ─── Layout ─────────────────────────────────────────────────────────────── */

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const userName = "Client Contact";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = localStorage.getItem("clientLoggedIn") === "1";
    if (!loggedIn) {
      setAuthorized(false);
      const redirect = encodeURIComponent(pathname || "/client");
      window.location.replace(`/login?role=client&redirect=${redirect}`);
      return;
    }
    setAuthorized(true);
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (authorized !== true) return null;

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div data-portal="client" className="flex min-h-screen bg-[var(--background)]">
      <ClientSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={desktopCollapsed}
        onToggleCollapse={() => setDesktopCollapsed((v) => !v)}
        userName={userName}
      />

      <div className={`flex flex-1 flex-col transition-all duration-200 ${desktopCollapsed ? "lg:pl-[64px]" : "lg:pl-[240px]"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-500)] cursor-pointer hover:bg-[var(--gray-100)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-[var(--gray-300)]" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-[var(--gray-900)]">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-[var(--gray-400)] cursor-pointer hover:text-[var(--gray-600)] transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {/* Mobile: just current page title */}
            <span className="sm:hidden text-sm font-semibold text-[var(--gray-900)]">
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationButton />

            <div className="ml-1 h-6 w-px bg-[var(--gray-200)]" />

            <div className="ml-1">
              <AvatarDropdown userName={userName} />
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
