"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useEffect, useState } from "react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = localStorage.getItem("candidateLoggedIn") === "1";
    if (!loggedIn) {
      setAuthorized(false);
      const redirect = encodeURIComponent("/candidate");
      window.location.replace(`/login?role=candidate&redirect=${redirect}`);
      return;
    }
    setAuthorized(true);
  }, []);

  if (authorized !== true) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
