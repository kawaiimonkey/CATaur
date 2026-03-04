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
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Font-size levels ─────────────────────────────────────────────────────────
const FONT_SIZES = [
  { label: "Small", value: "13px" },
  { label: "Default", value: "15px" },
  { label: "Large", value: "17px" },
  { label: "X-Large", value: "20px" },
] as const;

const FONT_SIZE_KEY = "candidateFontSize";

function applyFontSize(size: string) {
  document.documentElement.style.setProperty("--page-font-size", size);
  localStorage.setItem(FONT_SIZE_KEY, size);
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

  const [fontSizeValue, setFontSizeValue] = useState("15px");

  useEffect(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY) ?? "15px";
    setFontSizeValue(saved);
    applyFontSize(saved);
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

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-1 py-1 pr-2.5 text-sm transition",
          open
            ? "border-[#1D4ED8] bg-[#EFF6FF]"
            : "border-[#D1D5DB] bg-white hover:border-[#1D4ED8]"
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D4ED8] text-xs font-bold text-white select-none">
          {initial}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[#6B7280] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div ref={ref} className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">

          {/* User info header */}
          <div className="bg-[#F9FAFB] px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8] text-sm font-bold text-white select-none">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">
                  {email || "—"}
                </p>
                <p className="truncate text-xs text-[#6B7280]">Candidate Account</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/candidate/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              <Info className="h-4 w-4 text-[#6B7280]" />
              Account Information
            </Link>
          </div>

          {/* Font size section */}
          <div className="border-t border-[#E5E7EB] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <ALargeSmall className="h-3.5 w-3.5 text-[#6B7280]" />
              <span className="text-xs font-medium text-[#374151]">Text Size</span>
            </div>

            {/* Size options */}
            <div className="flex items-center gap-1 mb-2">
              {FONT_SIZES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFontSize(f.value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-0.5 rounded border px-1 py-1.5 text-xs whitespace-nowrap transition",
                    fontSizeValue === f.value
                      ? "border-[#1D4ED8] bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]"
                  )}
                >
                  {fontSizeValue === f.value && <Check className="h-2.5 w-2.5" />}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between rounded border border-[#E5E7EB] overflow-hidden">
              <button
                onClick={decrease}
                disabled={currentIdx <= 0}
                className="flex h-8 w-8 items-center justify-center text-[#374151] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-center text-xs font-medium text-[#374151]">
                {FONT_SIZES.find((f) => f.value === fontSizeValue)?.label ?? "Default"}
              </span>
              <button
                onClick={increase}
                disabled={currentIdx >= FONT_SIZES.length - 1}
                className="flex h-8 w-8 items-center justify-center text-[#374151] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="border-t border-[#E5E7EB] py-1">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#DC2626] transition hover:bg-[#FEF2F2]"
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
    window.location.replace("/login?role=candidate&redirect=%2Fcandidate");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
        <Logo />

        {/* Desktop nav — lg+: icon + text | md–lg: icon only with tooltip */}
        <nav className="hidden items-center gap-1 md:flex">
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
                    ? "text-[#1D4ED8] bg-[#EFF6FF]"
                    : "text-[#374151] hover:text-[#1D4ED8] hover:bg-[#F5F7FF]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {/* Hide text on md, show on lg */}
                <span className="hidden lg:inline">{item.label}</span>
                {/* Active underline indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#1D4ED8] lg:hidden" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center md:flex">
          {candidateLoggedIn ? (
            <AvatarDropdown onSignOut={signOut} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-[#374151] hover:text-[#1D4ED8] transition"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#1E40AF]"
              >
                Create profile
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger — only on < md */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded border border-[#D1D5DB] text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open navigation menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu — < md */}
      {isOpen && (
        <div className="border-t border-[#E5E7EB] bg-white px-6 py-5 md:hidden">
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
                      ? "bg-[#EFF6FF] text-[#1D4ED8]"
                      : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#1D4ED8]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 flex flex-col gap-2 border-t border-[#E5E7EB] pt-5">
            <Link
              href="/candidate/profile"
              onClick={closeMenu}
              className="flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#1D4ED8] transition"
            >
              <User className="h-4 w-4" />
              Account Information
            </Link>
            <button
              onClick={() => { signOut(); closeMenu(); }}
              className="flex items-center gap-2 text-sm font-medium text-[#DC2626] hover:text-red-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
