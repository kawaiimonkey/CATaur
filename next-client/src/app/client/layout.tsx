"use client";

import { ClientSidebar } from "@/components/layout/client-sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Require login for client portal without flashing content
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

  if (authorized !== true) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ClientSidebar />
      <div className="flex-1 lg:pl-[264px] transition-all duration-300 ease-in-out">
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
