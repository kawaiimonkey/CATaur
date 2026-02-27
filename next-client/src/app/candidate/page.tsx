"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BriefcaseBusiness,
  User,
  FileText,
  CheckCircle2,
  Circle,
  ArrowRight,
  CalendarClock,
  ChevronRight,
} from "lucide-react";

// ─── Mock: profile completion state ──────────────────────────────────────────
// In production, derive from the candidate's actual profile API response.
interface ProfileState {
  name: string;
  hasBasicInfo: boolean;  // name / contact / location filled
  hasResume: boolean;     // resume uploaded
}

// ─── Mock: pending interview confirmations ────────────────────────────────────
interface PendingInterview {
  applicationId: number;
  role: string;
  company: string;
  date: string;
  time: string;
  format: string;
}

const MOCK_PENDING_INTERVIEWS: PendingInterview[] = [
  {
    applicationId: 1,
    role: "Senior Backend Engineer",
    company: "Neptune Pay",
    date: "Thu, Mar 6",
    time: "2:30 PM EST",
    format: "Zoom",
  },
];

// ─── Onboarding steps ─────────────────────────────────────────────────────────
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
      {/* Welcome heading */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-secondary">
          Welcome to CATaur! 👋
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Complete a few quick steps to start your job search.
        </p>
        {/* Progress bar */}
        <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          {doneCount} of {steps.length} steps completed
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`flex items-center gap-4 rounded-xl border p-5 transition-all hover:shadow-md ${step.done
                  ? "border-emerald-100 bg-emerald-50/60 opacity-70"
                  : "border-slate-200 bg-white hover:border-primary/30"
                }`}
            >
              {/* Step number / check */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.done
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-primary/10 text-primary"
                  }`}
              >
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{i + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${step.done ? "text-slate-400 line-through" : "text-secondary"
                    }`}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {step.description}
                  </p>
                )}
              </div>

              {!step.done && (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Returning user dashboard ─────────────────────────────────────────────────
function ReturnDashboard({
  profile,
  pendingInterviews,
}: {
  profile: ProfileState;
  pendingInterviews: PendingInterview[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">
          Hi, {profile.name}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's a quick look at what needs your attention.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/candidate/jobs"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-secondary">Browse Jobs</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          href="/candidate/applications"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-secondary">My Applications</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>

      {/* Pending interview confirmations */}
      {pendingInterviews.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Needs your attention
          </p>
          <div className="space-y-3">
            {pendingInterviews.map((interview) => (
              <Link
                key={interview.applicationId}
                href="/candidate/applications"
                className="flex items-center gap-4 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400">
                  <CalendarClock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">
                    Interview invitation — {interview.role}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    {interview.company} · {interview.date} at {interview.time} · {interview.format}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-white">
                  Confirm
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Application count summary */}
      <p className="text-center text-sm text-slate-400">
        You have <strong className="text-slate-600">4 active applications</strong>.{" "}
        <Link
          href="/candidate/applications"
          className="text-primary underline-offset-2 hover:underline"
        >
          View all
        </Link>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateHomePage() {
  // Simulate profile state from localStorage (replace with API in production)
  const [profile, setProfile] = useState<ProfileState>({
    name: "Alex",
    hasBasicInfo: false,
    hasResume: false,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // In real app: fetch /api/candidate/profile
    // For now, read from localStorage flags set by the Profile page
    const hasBasicInfo = localStorage.getItem("candidateProfileBasic") === "1";
    const hasResume = localStorage.getItem("candidateProfileResume") === "1";
    const name = localStorage.getItem("candidateName") || "Alex";
    setProfile({ name, hasBasicInfo, hasResume });
    setReady(true);
  }, []);

  if (!ready) return null;

  const profileComplete = profile.hasBasicInfo && profile.hasResume;

  // Pending interviews: those not yet confirmed by the candidate
  const pendingInterviews = MOCK_PENDING_INTERVIEWS.filter(
    (i) => localStorage.getItem(`interviewConfirmed_${i.applicationId}`) !== "1"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {profileComplete ? (
          <ReturnDashboard
            profile={profile}
            pendingInterviews={pendingInterviews}
          />
        ) : (
          <OnboardingSection profile={profile} />
        )}
      </div>
    </div>
  );
}
