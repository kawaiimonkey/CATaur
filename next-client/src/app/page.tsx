import Link from "next/link";
import { Users, Briefcase, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/branding/logo";

const portals = [
  {
    title: "Candidate",
    subtitle: "Job search & applications",
    href: "/login?role=candidate&redirect=%2Fcandidate",
    icon: Users,
    iconBg: "bg-[#EFF6FF]",
    iconColor: "text-[#1D4ED8]",
    accent: "hover:border-[#1D4ED8]",
    badge: null,
  },
  {
    title: "Recruiter & Admin",
    subtitle: "Job orders, pipelines & system settings",
    href: "/login?role=recruiter&redirect=%2Frecruiter",
    icon: Briefcase,
    iconBg: "bg-[#FFF7ED]",
    iconColor: "text-[#C2410C]",
    accent: "hover:border-[#C2410C]",
    badge: "Admin included",
  },
  {
    title: "Client",
    subtitle: "Requisitions & feedback",
    href: "/login?role=client&redirect=%2Fclient",
    icon: Building2,
    iconBg: "bg-[#FDF4FF]",
    iconColor: "text-[#7E22CE]",
    accent: "hover:border-[#7E22CE]",
    badge: null,
  },
] as const;

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      {/* Minimal top bar */}
      <header className="flex items-center px-8 pt-8">
        <Logo />
      </header>

      {/* Main content — centered */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <h1 className="mb-1 text-2xl font-bold text-[#111827]">Select your workspace</h1>
        <p className="mb-10 text-sm text-[#6B7280]">Choose the portal that matches your role</p>

        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {portals.map(({ title, subtitle, href, icon: Icon, iconBg, iconColor, accent, badge }) => (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${accent}`}
            >
              {/* Badge */}
              {badge && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">
                  <ShieldCheck className="h-3 w-3" />
                  {badge}
                </span>
              )}

              {/* Icon */}
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="font-semibold text-[#111827]">{title}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">{subtitle}</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-1 text-xs font-medium text-[#1D4ED8]">
                Enter <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Admin hint */}
        <p className="mt-8 text-xs text-[#9CA3AF]">
          Admin features are available within the Recruiter portal based on your account role.
        </p>
      </main>

      <footer className="py-6 text-center text-xs text-[#9CA3AF]">
        © 2026 CATaur Talent Suite
      </footer>
    </div>
  );
}
