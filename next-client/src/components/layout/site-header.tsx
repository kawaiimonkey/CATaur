"use client";

import { Logo } from "@/components/branding/logo";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  User,
  LogOut,
  Info,
  ALargeSmall,
  ChevronDown,
  Minus,
  Plus,
  Check,
  Home,
  BriefcaseBusiness,
  FileText,
  Sparkles,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Font-size levels ─────────────────────────────────────────────────────────
// Small = 17px (was Large), Default = 20px (was X-Large), Large = 24px (new)
const FONT_SIZES = [
  { label: "Small", value: "17px" },
  { label: "Default", value: "20px" },
  { label: "Large", value: "24px" },
] as const;

const FONT_SIZE_KEY = "candidateFontSize";
const THEME_KEY = "candidateTheme";

function applyFontSize(size: string) {
  document.documentElement.style.setProperty("--page-font-size", size);
  localStorage.setItem(FONT_SIZE_KEY, size);
}

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem(THEME_KEY, theme);
}

// ─── Nav items ────────────────────────────────────────────────────────────────
type NavItem = { label: string; href: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/candidate", icon: Home },
  { label: "Profile", href: "/candidate/profile", icon: User },
  { label: "Job Search", href: "/candidate/jobs", icon: BriefcaseBusiness },
  { label: "Applications", href: "/candidate/applications", icon: FileText },
  { label: "AI Assistant", href: "/candidate/assistant", icon: Sparkles },
];

// ─── Avatar dropdown ──────────────────────────────────────────────────────────
function AvatarDropdown({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [fontSizeValue, setFontSizeValue] = useState("20px");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Init from localStorage on mount
  useEffect(() => {
    const savedFont = localStorage.getItem(FONT_SIZE_KEY) ?? "20px";
    setFontSizeValue(savedFont);
    applyFontSize(savedFont);

    const savedTheme = (localStorage.getItem(THEME_KEY) ?? "light") as "light" | "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleFontSize = (value: string) => {
    setFontSizeValue(value);
    applyFontSize(value);
  };

  const handleThemeToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  };

  const currentIdx = FONT_SIZES.findIndex((f) => f.value === fontSizeValue);

  const decrease = () => {
    if (currentIdx > 0) handleFontSize(FONT_SIZES[currentIdx - 1].value);
  };
  const increase = () => {
    if (currentIdx < FONT_SIZES.length - 1) handleFontSize(FONT_SIZES[currentIdx + 1].value);
  };

  const email = (() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("candidateEmail") ?? "";
  })();

  const initial = email ? email[0].toUpperCase() : "U";
  const isDark = theme === "dark";

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-1 py-1 pr-2.5 text-sm transition",
          open
            ? "border-[var(--accent)] bg-[var(--accent-light)]"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white select-none">
          {initial}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[var(--gray-400)] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)]">

          {/* ── User info ── */}
          <div className="bg-[var(--gray-50)] px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white select-none">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--gray-900)]">
                  {email || "—"}
                </p>
                <p className="truncate text-xs text-[var(--gray-400)]">Candidate Account</p>
              </div>
            </div>
          </div>

          {/* ── Account info link ── */}
          <div className="py-1">
            <Link
              href="/candidate/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--gray-600)] transition hover:bg-[var(--gray-50)] hover:text-[var(--gray-900)]"
            >
              <Info className="h-4 w-4 text-[var(--gray-400)]" />
              Account Information
            </Link>
          </div>

          {/* ── Theme toggle ── */}
          <div className="border-t border-[var(--border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isDark ? (
                  <Moon className="h-3.5 w-3.5 text-[var(--gray-400)]" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-[var(--gray-400)]" />
                )}
                <span className="text-xs font-medium text-[var(--gray-600)]">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </span>
              </div>

              {/* Pill toggle */}
              <button
                onClick={handleThemeToggle}
                aria-label="Toggle dark mode"
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200 focus:outline-none",
                  isDark
                    ? "bg-[var(--accent)] border-[var(--accent)]"
                    : "bg-[var(--gray-200)] border-[var(--border)]"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-200",
                    isDark ? "translate-x-[22px]" : "translate-x-[2px]"
                  )}
                >
                  {isDark ? (
                    <Moon className="h-2.5 w-2.5 text-[var(--accent)]" />
                  ) : (
                    <Sun className="h-2.5 w-2.5 text-amber-600" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* ── Font size ── */}
          <div className="border-t border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <ALargeSmall className="h-3.5 w-3.5 text-[var(--gray-400)]" />
              <span className="text-xs font-medium text-[var(--gray-600)]">Text Size</span>
            </div>

            {/* Size buttons */}
            <div className="flex items-center gap-1 mb-2">
              {FONT_SIZES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFontSize(f.value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-0.5 rounded border px-1 py-1.5 text-xs whitespace-nowrap transition",
                    fontSizeValue === f.value
                      ? "border-[var(--accent)] bg-[var(--accent-light)] font-semibold text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--gray-400)] hover:border-[var(--gray-300)]"
                  )}
                >
                  {fontSizeValue === f.value && <Check className="h-2.5 w-2.5" />}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between rounded border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
              <button
                onClick={decrease}
                disabled={currentIdx <= 0}
                className="flex h-8 w-8 items-center justify-center text-[var(--gray-600)] transition hover:bg-[var(--gray-100)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-center text-xs font-medium text-[var(--gray-600)]">
                {FONT_SIZES.find((f) => f.value === fontSizeValue)?.label ?? "Default"}
              </span>
              <button
                onClick={increase}
                disabled={currentIdx >= FONT_SIZES.length - 1}
                className="flex h-8 w-8 items-center justify-center text-[var(--gray-600)] transition hover:bg-[var(--gray-100)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Sign out ── */}
          <div className="border-t border-[var(--border)] py-1">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--danger)] transition hover:bg-[var(--danger-bg)]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Site Header ──────────────────────────────────────────────────────────────

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [candidateLoggedIn, setCandidateLoggedIn] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () =>
      setCandidateLoggedIn(localStorage.getItem("candidateLoggedIn") === "1");
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
    // Stay on the portal — guest can still browse Job Search
    window.location.replace("/candidate/jobs");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
        <Logo />

        {/* Desktop nav — absolutely centered */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isHome = item.href === "/candidate";
            const isActive = isHome
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "group relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[var(--accent)] bg-[var(--accent-light)]"
                    : "text-[var(--gray-600)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--accent)] lg:hidden" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right: avatar or login */}
        <div className="hidden items-center md:flex">
          {candidateLoggedIn ? (
            <AvatarDropdown onSignOut={signOut} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/candidate-login"
                className="text-sm font-medium text-[var(--gray-600)] hover:text-[var(--accent)] transition"
              >
                Log in
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded border border-[var(--border)] text-[var(--gray-600)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open navigation menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isHome = item.href === "/candidate";
              const isActive = isHome
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--accent-light)] text-[var(--accent)]"
                      : "text-[var(--gray-600)] hover:bg-[var(--gray-50)] hover:text-[var(--accent)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-5">
            {candidateLoggedIn ? (
              <>
                <Link
                  href="/candidate/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-sm font-medium text-[var(--gray-600)] hover:text-[var(--accent)] transition"
                >
                  <User className="h-4 w-4" />
                  Account Information
                </Link>
                <button
                  onClick={() => { signOut(); closeMenu(); }}
                  className="flex items-center gap-2 text-sm font-medium text-[var(--danger)] hover:opacity-80 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/candidate-login"
                onClick={closeMenu}
                className="flex items-center gap-2 text-sm font-medium text-[var(--gray-600)] hover:text-[var(--accent)] transition"
              >
                <LogOut className="h-4 w-4" />
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
