"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15";

// ─── Staff login form (email + password) ──────────────────────────────────────

function StaffLoginForm({ onSubmit }: { onSubmit: (email: string) => void }) {
  const emailRef = useRef<HTMLInputElement>(null);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(emailRef.current?.value?.trim() ?? "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#374151]">Email address</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            ref={emailRef}
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className={cn(inputBase, "pl-9")}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#374151]">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            id="password"
            type={showPw ? "text" : "password"}
            required
            placeholder="Enter password"
            className={cn(inputBase, "pl-9 pr-9")}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E40AF]"
      >
        Sign in <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") ?? "recruiter";

  const { title, subtitle } = useMemo(() => {
    switch (role) {
      case "client":
        return { title: "Client Portal", subtitle: "Review submitted candidates and decisions" };
      default:
        return { title: "Recruiter Console", subtitle: "Sign in to manage job orders and pipelines" };
    }
  }, [role]);

  const handleLogin = useCallback(
    (email: string) => {
      const redirect = params.get("redirect");
      if (role === "client") {
        localStorage.setItem("clientLoggedIn", "1");
        router.push(redirect || "/client");
      } else {
        // recruiter role — also handles admin distinction by email
        localStorage.setItem("recruiterLoggedIn", "1");
        const isAdmin = email === "allan@cataur.com" || email === "admin@cataur.com";
        localStorage.setItem("userRole", isAdmin ? "admin" : "recruiter");
        router.push(redirect || "/recruiter");
      }
    },
    [params, role, router]
  );

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_4px_24px_-4px_rgba(12,24,55,0.12)]">
      {/* Header */}
      <div className="mb-7 text-center">
        <h1 className="text-xl font-bold text-[#111827]">{title}</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
      </div>

      <StaffLoginForm onSubmit={handleLogin} />

      {/* Role switcher */}
      <p className="mt-5 text-center text-xs text-[#6B7280]">
        {role === "client" ? (
          <>
            Recruiter?{" "}
            <Link href="/login?role=recruiter" className="font-semibold text-[#1D4ED8] hover:underline underline-offset-2">
              Sign in here
            </Link>
          </>
        ) : (
          <>
            Client?{" "}
            <Link href="/login?role=client" className="font-semibold text-[#1D4ED8] hover:underline underline-offset-2">
              Sign in here
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
