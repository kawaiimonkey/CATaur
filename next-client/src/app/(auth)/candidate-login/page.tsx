"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputBase =
    "w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15";

// ─── Social login button ───────────────────────────────────────────────────────

function SocialButton({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:border-[#9CA3AF] hover:bg-[#F9FAFB]"
        >
            {icon}
            {label}
        </button>
    );
}

// ─── Google SVG ───────────────────────────────────────────────────────────────

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.252 17.64 11.945 17.64 9.2z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
);

// ─── LinkedIn SVG ─────────────────────────────────────────────────────────────

const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect width="18" height="18" rx="3" fill="#0A66C2" />
        <path d="M4.5 7.2H6.6V13.5H4.5V7.2ZM5.55 6.3C4.87 6.3 4.5 5.91 4.5 5.4C4.5 4.89 4.88 4.5 5.565 4.5C6.25 4.5 6.6 4.89 6.6 5.4C6.6 5.91 6.23 6.3 5.55 6.3ZM13.5 13.5H11.4V10.2C11.4 9.36 11.07 8.82 10.35 8.82C9.81 8.82 9.495 9.18 9.345 9.525C9.3 9.63 9.285 9.78 9.285 9.945V13.5H7.185V7.2H9.285V8.115C9.585 7.65 10.11 7.05 11.07 7.05C12.255 7.05 13.5 7.74 13.5 9.93V13.5Z" fill="white" />
    </svg>
);

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E5E7EB]" />
            <span className="text-xs text-[#9CA3AF]">{label}</span>
            <div className="h-px flex-1 bg-[#E5E7EB]" />
        </div>
    );
}

// ─── Password form ────────────────────────────────────────────────────────────

function PasswordForm({ onSubmit }: { onSubmit: (email: string) => void }) {
    const [showPw, setShowPw] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(emailRef.current?.value?.trim() ?? "");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#374151]">Password</label>
                    <Link href="/forgot-password" className="text-xs font-medium text-[#1D4ED8] hover:underline underline-offset-2">
                        Forgot password?
                    </Link>
                </div>
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

// ─── OTP form ─────────────────────────────────────────────────────────────────

function OtpForm({ onSubmit }: { onSubmit: (email: string) => void }) {
    const [sent, setSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const emailRef = useRef<HTMLInputElement>(null);

    const sendCode = () => {
        if (!emailRef.current?.value?.trim()) return;
        setSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) { clearInterval(timer); return 0; }
                return c - 1;
            });
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(emailRef.current?.value?.trim() ?? "");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Email address</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            ref={emailRef}
                            type="email"
                            required
                            placeholder="you@example.com"
                            className={cn(inputBase, "pl-9")}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={sendCode}
                        disabled={countdown > 0}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1D4ED8] px-3 py-2 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#EFF6FF] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {countdown > 0 ? (
                            <><RefreshCw className="h-3.5 w-3.5 animate-spin" />{countdown}s</>
                        ) : (
                            sent ? "Resend" : "Send code"
                        )}
                    </button>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Verification code</label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    className={inputBase}
                    disabled={!sent}
                />
                {!sent && (
                    <p className="text-xs text-[#9CA3AF]">Enter your email and click Send code first.</p>
                )}
            </div>

            <button
                type="submit"
                disabled={!sent}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Sign in <ArrowRight className="h-4 w-4" />
            </button>
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateLoginPage() {
    const router = useRouter();
    const params = useSearchParams();
    const [tab, setTab] = useState<"password" | "otp">("password");

    const handleLogin = useCallback(
        (email: string) => {
            const redirect = params.get("redirect");
            localStorage.setItem("candidateLoggedIn", "1");
            if (email) localStorage.setItem("candidateEmail", email);
            router.push(redirect || "/candidate");
        },
        [params, router]
    );

    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_4px_24px_-4px_rgba(12,24,55,0.12)]">
            {/* Header */}
            <div className="mb-7 text-center">
                <h1 className="text-xl font-bold text-[#111827]">Sign in to CATaur</h1>
                <p className="mt-1 text-sm text-[#6B7280]">Find your next opportunity</p>
            </div>

            {/* Social login */}
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <SocialButton icon={<GoogleIcon />} label="Google" onClick={() => handleLogin("google-user@gmail.com")} />
                    <SocialButton icon={<LinkedInIcon />} label="LinkedIn" onClick={() => handleLogin("linkedin-user@linkedin.com")} />
                </div>

                <Divider label="or sign in with email" />

                {/* Tabs */}
                <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-1">
                    <button
                        type="button"
                        onClick={() => setTab("password")}
                        className={cn(
                            "flex-1 rounded-md py-1.5 text-xs font-medium transition",
                            tab === "password" ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                        )}
                    >
                        Password
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("otp")}
                        className={cn(
                            "flex-1 rounded-md py-1.5 text-xs font-medium transition",
                            tab === "otp" ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                        )}
                    >
                        Verification code
                    </button>
                </div>

                {tab === "password" ? (
                    <PasswordForm onSubmit={handleLogin} />
                ) : (
                    <OtpForm onSubmit={handleLogin} />
                )}

                {/* Create account */}
                <p className="text-center text-xs text-[#6B7280]">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-[#1D4ED8] hover:underline underline-offset-2">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
