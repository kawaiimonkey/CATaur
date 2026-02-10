"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const inputClass =
  "w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm text-foreground shadow-[0_8px_24px_-18px_rgba(12,24,55,0.3)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();

  const handleRegister = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const role = params.get("role") ?? "candidate";
      const redirect = params.get("redirect");

      // For demo, register = login
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
        <h1 className="text-2xl font-semibold text-foreground">Create your CATaur account</h1>
        <p className="text-sm text-muted">
          Build your profile once and track every opportunity in one place.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input id="name" className={inputClass} placeholder="Alex Rivera" />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-foreground">
              Preferred location
            </label>
            <input id="location" className={inputClass} placeholder="Remote · EU" />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input id="email" type="email" className={inputClass} placeholder="you@example.com" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input id="password" type="password" className={inputClass} placeholder="Create password" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <input id="confirm" type="password" className={inputClass} placeholder="Repeat password" />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="focus" className="text-sm font-medium text-foreground">
            Current search focus
          </label>
          <select id="focus" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            <option value="leadership">Leadership roles</option>
            <option value="product">Product & growth</option>
            <option value="sales">Sales & revenue</option>
            <option value="operations">Operations & delivery</option>
          </select>
        </div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border accent-primary" />
          I agree to receive job updates and accept the CATaur terms of service.
        </label>
        <Button className="w-full" type="submit">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary transition hover:text-primary-soft">
          Log in
        </Link>
      </p>
    </div>
  );
}
