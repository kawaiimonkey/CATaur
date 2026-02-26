"use client";

import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/candidate" },
  { label: "Profile", href: "/candidate/profile" },
  { label: "Job Search", href: "/candidate/jobs" },
  { label: "Applications", href: "/candidate/applications" },
  { label: "AI Assistant", href: "/candidate/assistant" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [candidateLoggedIn, setCandidateLoggedIn] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setCandidateLoggedIn(localStorage.getItem("candidateLoggedIn") === "1");
    update();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "candidateLoggedIn") update();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("candidateLoggedIn");
    setCandidateLoggedIn(false);
    // Redirect to login for candidate since candidate pages are now protected
    window.location.replace("/login?role=candidate&redirect=%2Fcandidate");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isHome = item.href === "/candidate";
            const isActive = isHome
              ? pathname === item.href // Home only active on exact path
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium tracking-tight transition-colors",
                  isActive
                    ? "text-primary after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-slate-600 hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {candidateLoggedIn ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Create profile</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-primary" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="hidden xl:inline">Switch Portal</span>
            </Link>
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-primary hover:text-primary lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => {
              const isHome = item.href === "/candidate";
              const isActive = isHome
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "text-base font-medium transition-colors",
                    isActive ? "text-primary" : "text-slate-600 hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {candidateLoggedIn ? (
              <Button variant="outline" size="sm" onClick={() => { signOut(); closeMenu(); }}>
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" onClick={closeMenu}>
                    Log in
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register" onClick={closeMenu}>
                    Create profile
                  </Link>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/" onClick={closeMenu}>
                <Home className="h-4 w-4" /> Switch Portal
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
