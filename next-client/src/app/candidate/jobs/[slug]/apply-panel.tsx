"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  FileText,
  X,
  PartyPopper,
} from "lucide-react";

type Props = { slug: string; jobTitle?: string; company?: string };

const STORAGE_KEY = "candidateAppliedJobs";

function getAppliedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveApplied(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch { }
}


// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({
  jobTitle,
  company,
  onClose,
}: {
  jobTitle?: string;
  company?: string;
  onClose: () => void;
}) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card — stop click propagation so it doesn't close on card click */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition cursor-pointer hover:bg-slate-100 cursor-pointer hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Green top banner */}
        <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-emerald-500 to-green-600 px-8 pb-10 pt-10 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">Application Submitted!</p>
            <p className="mt-1 text-sm text-white/80">
              {jobTitle && company ? (
                <>Your application for <strong>{jobTitle}</strong> at <strong>{company}</strong> has been sent.</>
              ) : (
                "Your application has been successfully sent to the recruiter."
              )}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            The recruiter will review your profile and reach out if there's a match.
            You can track the status of your application in real time.
          </p>

          {/* What's next */}
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              What happens next
            </p>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                Your profile has been sent to the recruiter
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                The recruiter will review and follow up if there&apos;s a match
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                Track your application status in the Applications tab
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Button variant="primary" size="md" className="w-full" asChild>
              <Link href="/candidate/applications" className="flex items-center justify-center gap-2">
                View My Applications
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="md" className="w-full" onClick={onClose}>
              <PartyPopper className="mr-2 h-4 w-4" />
              Browse More Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Apply Panel ──────────────────────────────────────────────────────────────
export default function ApplyPanel({ slug, jobTitle, company }: Props) {
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setApplied(getAppliedSet().has(slug));
  }, [slug]);

  const handleApply = () => {
    const set = getAppliedSet();
    set.add(slug);
    saveApplied(set);
    setApplied(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* ── Success modal (portal-like overlay) ─────────────────────────── */}
      {showModal && (
        <SuccessModal
          jobTitle={jobTitle}
          company={company}
          onClose={handleCloseModal}
        />
      )}

      {/* ── Panel content ────────────────────────────────────────────────── */}
      {applied ? (
        // Post-apply panel state
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-secondary">Application Submitted</p>
            <p className="mt-1 text-xs text-slate-500">
              Your profile has been sent to the recruiter.
            </p>
          </div>
          <Button variant="primary" size="sm" className="w-full" asChild>
            <Link href="/candidate/applications" className="flex items-center justify-center gap-2">
              View My Applications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Link
            href="/candidate/jobs"
            className="text-xs text-slate-400 underline-offset-2 cursor-pointer hover:text-primary hover:underline transition"
          >
            Browse more jobs
          </Link>
        </div>
      ) : (
        // Pre-apply panel state
        <div className="space-y-5">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>Your saved profile &amp; resume will be attached to the application.</span>
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={handleApply}>
            Submit Application
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
