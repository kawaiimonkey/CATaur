"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GuestGate } from "@/components/candidate/guest-gate";
import {
  BriefcaseBusiness,
  FileText,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ChevronRight,
  MapPin,
  Building2,
  TrendingUp,
  Inbox,
  User,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileState {
  email: string;
  hasBasicInfo: boolean;
  hasResume: boolean;
}

type AppStatus = "New" | "Interview" | "Offer" | "Closed";

interface Application {
  id: number;
  jobSlug: string;
  role: string;
  company: string;
  location: string;
  appliedDate: string;
  recruiterStatus: AppStatus;
  interview?: {
    recruiterName: string;
    date: string;
    time: string;
    format: string;
    type: string;
  };
}

// ─── Mock data (shared with /candidate/applications) ──────────────────────────

const APPLICATIONS: Application[] = [
  {
    id: 1,
    jobSlug: "senior-backend-engineer-neptune",
    role: "Senior Backend Engineer",
    company: "Neptune Pay",
    location: "Toronto, ON",
    appliedDate: "Feb 25",
    recruiterStatus: "Interview",
    interview: {
      recruiterName: "Sarah Chen",
      date: "Thu, Mar 6",
      time: "2:30 PM EST",
      format: "Zoom",
      type: "Technical Interview",
    },
  },
  {
    id: 2,
    jobSlug: "frontend-engineer-eurora",
    role: "Frontend Engineer",
    company: "Aurora Cloud Platform",
    location: "Toronto, ON",
    appliedDate: "Feb 24",
    recruiterStatus: "New",
  },
  {
    id: 3,
    jobSlug: "devops-sre-atlas",
    role: "DevOps / SRE",
    company: "Atlas Ventures",
    location: "Vancouver, BC",
    appliedDate: "Feb 22",
    recruiterStatus: "Offer",
  },
  {
    id: 4,
    jobSlug: "data-engineer-nova",
    role: "Data Engineer",
    company: "Polar Analytics",
    location: "Montreal, QC",
    appliedDate: "Feb 18",
    recruiterStatus: "Closed",
  },
];

const STATUS_META: Record<
  AppStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  New: { label: "Application Received", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  Interview: { label: "Interview Scheduled", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  Offer: { label: "Offer Received", bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  Closed: { label: "Position Filled", bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
};

const RECOMMENDED_JOBS = [
  {
    slug: "fullstack-engineer-lunaris",
    role: "Full-stack Engineer",
    company: "Lunaris AI",
    location: "Ottawa, ON",
    type: "Permanent",
    match: 92,
  },
  {
    slug: "mobile-engineer-ios-orbit",
    role: "Mobile Engineer (iOS)",
    company: "Orbit Health",
    location: "Montréal, QC",
    type: "Full-time",
    match: 85,
  },
  {
    slug: "qa-engineer-granite",
    role: "QA Engineer",
    company: "Granite AI",
    location: "Calgary, AB",
    type: "Part-time",
    match: 78,
  },
];

// ─── Onboarding section (profile not yet complete) ─────────────────────────────

function OnboardingSection({ profile }: { profile: ProfileState }) {
  const steps = [
    {
      key: "info",
      icon: User,
      title: "Complete your profile",
      description: "Add your contact info, location, and about section",
      done: profile.hasBasicInfo,
      href: "/candidate/profile",
    },
    {
      key: "resume",
      icon: FileText,
      title: "Upload your resume",
      description: "Attach a resume so recruiters can review your background",
      done: profile.hasResume,
      href: "/candidate/profile#resume",
    },
    {
      key: "jobs",
      icon: BriefcaseBusiness,
      title: "Browse & apply to jobs",
      description: "Find your first opportunity and submit an application",
      done: false,
      href: "/candidate/jobs",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-[#111827]">Welcome to CATaur 👋</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Complete a few quick steps to start your job search.
        </p>
        <div className="mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#1D4ED8] transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-[#6B7280]">
          {doneCount} of {steps.length} steps completed
        </p>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${step.done
                ? "border-[#E5E7EB] bg-white opacity-60"
                : "border-[#E5E7EB] bg-white hover:border-[#1D4ED8]"
                }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${step.done ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#EFF6FF] text-[#1D4ED8]"
                  }`}
              >
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${step.done ? "text-[#6B7280] line-through" : "text-[#111827]"
                    }`}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="mt-0.5 text-xs text-[#6B7280]">{step.description}</p>
                )}
              </div>
              {!step.done && <ChevronRight className="h-4 w-4 shrink-0 text-[#6B7280]" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── A. Stats Row ─────────────────────────────────────────────────────────────

function StatsRow({ apps }: { apps: Application[] }) {
  const total = apps.length;
  const inProgress = apps.filter((a) => a.recruiterStatus === "New" || a.recruiterStatus === "Interview").length;
  const interviews = apps.filter((a) => a.recruiterStatus === "Interview").length;
  const offers = apps.filter((a) => a.recruiterStatus === "Offer").length;

  const stats = [
    { label: "Total Applied", value: total, icon: FileText, color: "#1D4ED8", bg: "#EFF6FF" },
    { label: "In Progress", value: inProgress, icon: TrendingUp, color: "#92400E", bg: "#FFFBEB" },
    { label: "Interviews", value: interviews, icon: CalendarClock, color: "#0369A1", bg: "#E0F2FE" },
    { label: "Offers", value: offers, icon: CheckCircle2, color: "#166534", bg: "#F0FDF4" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
              style={{ background: s.bg }}
            >
              <Icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-[#111827] leading-none">{s.value}</p>
              <p className="mt-0.5 text-xs text-[#6B7280] leading-tight truncate">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── C. Upcoming Interviews ───────────────────────────────────────────────────

function UpcomingInterviews({ apps }: { apps: Application[] }) {
  const interviews = apps.filter((a) => a.recruiterStatus === "Interview" && a.interview);

  if (interviews.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB]">
      <div className="flex items-center gap-2 border-b border-[#FDE68A] px-5 py-3">
        <CalendarClock className="h-4 w-4 text-[#92400E]" />
        <h2 className="text-sm font-semibold text-[#92400E]">Upcoming Interviews</h2>
      </div>
      <div className="divide-y divide-[#FDE68A]">
        {interviews.map((app) => (
          <Link
            key={app.id}
            href="/candidate/applications"
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#FEF3C7]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111827]">{app.interview!.type}</p>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {app.role} · {app.company}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-[#92400E]">{app.interview!.date}</p>
              <p className="text-xs text-[#6B7280]">
                {app.interview!.time} · {app.interview!.format}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#92400E]" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── B. Recent Activity ───────────────────────────────────────────────────────

function RecentActivity({ apps }: { apps: Application[] }) {
  const recent = apps.slice(0, 4);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-[#6B7280]" />
          <h2 className="text-sm font-semibold text-[#111827]">Recent Applications</h2>
        </div>
        <Link
          href="/candidate/applications"
          className="flex items-center gap-1 text-xs font-medium text-[#1D4ED8] hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {recent.map((app) => {
          const meta = STATUS_META[app.recruiterStatus];
          return (
            <Link
              key={app.id}
              href="/candidate/applications"
              className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#F9FAFB]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#F3F4F6]">
                <Building2 className="h-4 w-4 text-[#6B7280]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[#111827]">{app.role}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-[#6B7280]">{app.company}</span>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="flex items-center gap-0.5 text-xs text-[#9CA3AF]">
                    <Clock className="h-3 w-3" />
                    {app.appliedDate}
                  </span>
                </div>
              </div>
              <span
                className="shrink-0 rounded px-2 py-0.5 text-xs font-medium border"
                style={{ background: meta.bg, color: meta.text, borderColor: meta.border }}
              >
                {meta.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── D. Pipeline Funnel ───────────────────────────────────────────────────────

function PipelineFunnel({ apps }: { apps: Application[] }) {
  const stages: { key: AppStatus; label: string; color: string; bar: string }[] = [
    { key: "New", label: "Applied", color: "#1E40AF", bar: "#BFDBFE" },
    { key: "Interview", label: "Interview", color: "#92400E", bar: "#FDE68A" },
    { key: "Offer", label: "Offer", color: "#166534", bar: "#BBF7D0" },
    { key: "Closed", label: "Closed", color: "#6B7280", bar: "#E5E7EB" },
  ];

  const total = Math.max(apps.length, 1);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-5 py-3">
        <TrendingUp className="h-4 w-4 text-[#6B7280]" />
        <h2 className="text-sm font-semibold text-[#111827]">Application Pipeline</h2>
      </div>
      <div className="space-y-3 px-5 py-4">
        {stages.map((stage) => {
          const count = apps.filter((a) => a.recruiterStatus === stage.key).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={stage.key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[#374151]">{stage.label}</span>
                <span className="text-xs font-semibold" style={{ color: stage.color }}>
                  {count}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: stage.bar }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── E. Recommended Jobs ──────────────────────────────────────────────────────

function RecommendedJobs() {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#1D4ED8]" />
          <h2 className="text-sm font-semibold text-[#111827]">Recommended for You</h2>
        </div>
        <Link
          href="/candidate/jobs"
          className="flex items-center gap-1 text-xs font-medium text-[#1D4ED8] hover:underline"
        >
          Browse all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {RECOMMENDED_JOBS.map((job) => (
          <Link
            key={job.slug}
            href="/candidate/jobs"
            className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#F9FAFB]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#EFF6FF]">
              <BriefcaseBusiness className="h-4 w-4 text-[#1D4ED8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[#111827]">{job.role}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-[#6B7280]">{job.company}</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="flex items-center gap-0.5 text-xs text-[#6B7280]">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">

              <p className="mt-0.5 text-xs text-[#9CA3AF]">{job.type}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Full dashboard (profile complete) ───────────────────────────────────────

function Dashboard({ profile }: { profile: ProfileState }) {
  const displayName = profile.email
    ? profile.email.split("@")[0]
    : "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">
          Hi, {displayName} 👋
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Here&apos;s a summary of your job search activity.
        </p>
      </div>

      {/* A. Stats Row */}
      <StatsRow apps={APPLICATIONS} />

      {/* C. Upcoming Interviews — full width alert banner */}
      <UpcomingInterviews apps={APPLICATIONS} />

      {/* B + D. Recent Activity + Pipeline — side by side on lg */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentActivity apps={APPLICATIONS} />
        </div>
        <div className="lg:col-span-2">
          <PipelineFunnel apps={APPLICATIONS} />
        </div>
      </div>

      {/* E. Recommended Jobs */}
      <RecommendedJobs />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateHomePage() {
  const [profile, setProfile] = useState<ProfileState>({
    email: "",
    hasBasicInfo: false,
    hasResume: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasBasicInfo = localStorage.getItem("candidateProfileBasic") === "1";
    const hasResume = localStorage.getItem("candidateProfileResume") === "1";
    const email = localStorage.getItem("candidateEmail") || "";
    setProfile({ email, hasBasicInfo, hasResume });
    setReady(true);
  }, []);

  if (!ready) return null;

  const profileComplete = profile.hasBasicInfo && profile.hasResume;

  return (
    <GuestGate>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {profileComplete ? (
          <Dashboard profile={profile} />
        ) : (
          <OnboardingSection profile={profile} />
        )}
      </div>
    </GuestGate>
  );
}
