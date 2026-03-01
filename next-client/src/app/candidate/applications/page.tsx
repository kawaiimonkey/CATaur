"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Clock, MapPin, Building2, CalendarClock, ChevronRight, Inbox, CheckCircle2 } from "lucide-react";

// ─── Status mapping: Recruiter internal → Candidate-facing ───────────────────
type RecruiterStatus = "New" | "Interview" | "Offer" | "Closed";

const STATUS_DISPLAY: Record<
  RecruiterStatus,
  { label: string; color: string }
> = {
  New: {
    label: "Application Received",
    color: "bg-blue-50 text-blue-600",
  },
  Interview: {
    label: "Interview Scheduled",
    color: "bg-amber-50 text-amber-600",
  },
  Offer: {
    label: "Offer Received",
    color: "bg-emerald-50 text-emerald-700",
  },
  Closed: {
    label: "Position Filled",
    color: "bg-slate-100 text-slate-400",
  },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
// `recruiterStatus` is the internal status set by the Recruiter.
// The Candidate never sees this raw value.

interface Application {
  id: number;
  jobSlug: string;
  role: string;
  company: string;
  location: string;
  appliedDate: string;
  recruiterStatus: RecruiterStatus;
  // Only present when recruiterStatus === "Interview"
  interview?: {
    recruiterName: string;
    date: string;
    time: string;
    format: string;
    type: string;
    message: string; // Recruiter's written message
  };
}

const APPLICATIONS: Application[] = [
  {
    id: 1,
    jobSlug: "senior-backend-engineer-neptune",
    role: "Senior Backend Engineer",
    company: "Neptune Pay",
    location: "Toronto, ON, Canada",
    appliedDate: "Feb 25, 2025",
    recruiterStatus: "Interview",
    interview: {
      recruiterName: "Sarah Chen",
      date: "Thu, Mar 6",
      time: "2:30 PM EST",
      format: "Zoom",
      type: "Technical Interview",
      message:
        "Hi, thank you for applying to Neptune Pay! We were impressed with your background and would like to invite you to a Technical Interview.\n\nPlease join us via Zoom at the time listed below. The session will be approximately 60 minutes and will include a system design discussion and a live coding exercise.\n\nPlease confirm your availability by replying to this message or via email. Looking forward to speaking with you!",
    },
  },
  {
    id: 2,
    jobSlug: "frontend-engineer-eurora",
    role: "Frontend Engineer",
    company: "Aurora Cloud Platform",
    location: "Toronto, ON, Canada",
    appliedDate: "Feb 24, 2025",
    recruiterStatus: "New",
  },
  {
    id: 3,
    jobSlug: "devops-sre-atlas",
    role: "DevOps / SRE",
    company: "Atlas Ventures",
    location: "Vancouver, BC, Canada",
    appliedDate: "Feb 22, 2025",
    recruiterStatus: "Offer",
  },
  {
    id: 4,
    jobSlug: "data-engineer-nova",
    role: "Data Engineer",
    company: "Polar Analytics",
    location: "Montreal, QC, Canada",
    appliedDate: "Feb 18, 2025",
    recruiterStatus: "Closed",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ── Application list ───────────────────────────────────────────── */}
        {APPLICATIONS.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {APPLICATIONS.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationCard({ app }: { app: Application }) {
  const status = STATUS_DISPLAY[app.recruiterStatus];
  const storageKey = `interviewConfirmed_${app.id}`;
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setConfirmed(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  const handleConfirm = () => {
    localStorage.setItem(storageKey, "1");
    setConfirmed(true);
  };

  return (
    <div className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${app.recruiterStatus === "Closed"
      ? "border-slate-100 opacity-60 grayscale-[40%]"
      : "border-slate-200"
      }`}>
      {/* Main row */}
      <div className="flex items-start justify-between gap-4 p-5">
        {/* Left: job info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-secondary truncate">{app.role}</h2>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {app.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {app.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Applied {app.appliedDate}
            </span>
          </div>
        </div>

        {/* Right: view job link */}
        <Link
          href={`/candidate/jobs/${app.jobSlug}`}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition cursor-pointer hover:border-primary cursor-pointer hover:text-primary"
        >
          View Job
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Interview message block */}
      {app.recruiterStatus === "Interview" && app.interview && (
        <div className="border-t border-amber-200 bg-amber-50">
          {/* Message header */}
          <div className="flex items-center justify-between border-b border-amber-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                {app.interview.recruiterName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-900">{app.interview.recruiterName} · Recruiter at {app.company}</p>
                <p className="text-xs text-amber-600">Interview Invitation · {app.interview.type}</p>
              </div>
            </div>
            {/* Interview meta */}
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700">
              <CalendarClock className="h-3.5 w-3.5" />
              {app.interview.date} · {app.interview.time} · {app.interview.format}
            </div>
          </div>
          {/* Message body */}
          <div className="px-5 py-4">
            {app.interview.message.split("\n\n").map((para, i) => (
              <p key={i} className={`text-sm text-amber-900 ${i > 0 ? "mt-3" : ""}`}>
                {para}
              </p>
            ))}
          </div>
          {/* Confirm button */}
          <div className="flex items-center justify-end border-t border-amber-100 px-5 py-3">
            {confirmed ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Interview Confirmed
              </span>
            ) : (
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition cursor-pointer hover:bg-amber-600 active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Interview
              </button>
            )}
          </div>
        </div>
      )}

      {/* Offer notification strip */}
      {app.recruiterStatus === "Offer" && (
        <div className="flex items-center gap-3 border-t border-emerald-100 bg-emerald-50 px-5 py-3">
          <span className="text-base">🎉</span>
          <p className="text-sm font-medium text-emerald-800">
            You've received an offer! The recruiter will be in touch with next steps.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Inbox className="h-7 w-7 text-slate-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-secondary">No applications yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Start applying to jobs and your applications will appear here.
        </p>
      </div>
      <Link
        href="/candidate/jobs"
        className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Browse Jobs
      </Link>
    </div>
  );
}
