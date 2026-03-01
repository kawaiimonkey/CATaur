import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, ShieldCheck, Building2, ArrowRight } from "lucide-react";

function Card({
  title,
  description,
  href,
  icon: Icon,
  gradient,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
        {/* Gradient accent bar */}
        <div className={`absolute left-0 top-0 h-1 w-full ${gradient}`} />

        {/* Icon */}
        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${gradient} shadow-md`}>
          <Icon className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="mb-2 text-2xl font-bold text-secondary">
          {title}
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-semibold text-primary transition-colors group-cursor-pointer hover:text-primary-dark">
          <span>Enter workspace</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function RootPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-hero px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">
            CATaur Talent Suite
          </h1>
          <p className="text-lg text-blue-100">
            Enterprise recruitment platform for modern teams
          </p>
        </div>
      </div>

      {/* Cards Section */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-secondary">
            Select Your Workspace
          </h2>
          <p className="text-slate-600">
            Choose the portal that matches your role
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Candidate"
            description="Search opportunities, track applications, and manage your career journey"
            href="/candidate"
            icon={Users}
            gradient="bg-gradient-primary"
          />
          <Card
            title="Recruiter"
            description="Manage job orders, candidates, and client relationships efficiently"
            href="/recruiter"
            icon={Briefcase}
            gradient="bg-gradient-accent"
          />
          <Card
            title="Admin"
            description="Configure system settings, manage users, and oversee operations"
            href="/administer"
            icon={ShieldCheck}
            gradient="bg-gradient-secondary"
          />
          <Card
            title="Client"
            description="Review candidates, manage job requisitions, and provide feedback"
            href="/client"
            icon={Building2}
            gradient="bg-gradient-success"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          © 2026 CATaur Talent Suite. Enterprise Recruitment Platform.
        </div>
      </div>
    </main>
  );
}
