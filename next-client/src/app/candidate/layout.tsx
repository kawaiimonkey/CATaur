"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth check here — guests are allowed.
  // Individual protected pages use <GuestGate> to show a login screen.
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
