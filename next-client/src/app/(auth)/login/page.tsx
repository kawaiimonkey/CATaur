"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const inputClass =
  "w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm text-foreground shadow-[0_8px_24px_-18px_rgba(12,24,55,0.3)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") ?? "candidate";

  const { title, subtitle } = useMemo(() => {
    switch (role) {
      case "recruiter":
        return {
          title: "Recruiter Console Login",
          subtitle: "Internal access for recruiters to manage job orders and pipelines.",
        };
      case "client":
        return {
          title: "Client Portal Login",
          subtitle: "Review submitted candidates and decisions for your roles.",
        };
      case "administer":
      case "admin":
        return {
          title: "Admin Console Login",
          subtitle: "Manage users, roles, email, and AI settings.",
        };
      default:
        return {
          title: "Candidate Login",
          subtitle: "Sign in to track your applications and manage your profile.",
        };
    }
  }, [role]);

  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const role = params.get("role") ?? "candidate";
      const redirect = params.get("redirect");

      // Set lightweight auth flag per role
      switch (role) {
        case "recruiter":
          localStorage.setItem("recruiterLoggedIn", "1");
          router.push(redirect || "/recruiter");
          break;
        case "client":
          localStorage.setItem("clientLoggedIn", "1");
          router.push(redirect || "/client");
          break;
        case "administer":
        case "admin":
          localStorage.setItem("adminLoggedIn", "1");
          router.push(redirect || "/administer");
          break;
        default:
          localStorage.setItem("candidateLoggedIn", "1");
          router.push(redirect || "/candidate");
      }
    },
    [params, router]
  );

  return (
    <div className="rounded-[32px] border border-border bg-white/95 p-8 shadow-[0_32px_80px_-60px_rgba(12,24,55,0.65)]">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input id="email" type="email" className={inputClass} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input id="password" type="password" className={inputClass} placeholder="Enter password" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
            Remember me
          </label>
          <Link href="#" className="font-medium text-primary transition cursor-pointer hover:text-primary-soft">
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" type="submit">
          Log in
        </Button>
      </form>
      {(!params.get("role") || params.get("role") === "candidate") && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to CATaur?{" "}
          <Link href="/register" className="font-medium text-primary transition cursor-pointer hover:text-primary-soft">
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}
