"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { JOB_ORDERS, CANDIDATE_RECORDS } from "@/data/recruiter";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
  DollarSign,
} from "lucide-react";

/* ── Status helpers ──────────────────────────────────────────────────────── */

function getStatusGroup(status: string) {
  if (status === "filled") return "closed";
  if (status === "paused") return "onhold";
  return "active";
}

const STATUS_STYLE: Record<"active" | "onhold" | "closed", { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: "bg-[var(--status-green-bg)]", text: "text-[var(--status-green-text)]", dot: "bg-[var(--status-green-text)]", label: "Active" },
  onhold: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-600)]", dot: "bg-[var(--gray-400)]", label: "On Hold" },
  closed: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-600)]", dot: "bg-[var(--gray-400)]", label: "Closed" },
};

const CAND_STAGE_STYLE: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-600)]" },
  interview: { bg: "bg-[var(--status-blue-bg)]", text: "text-[var(--status-blue-text)]" },
  offer: { bg: "bg-[var(--status-amber-bg)]", text: "text-[var(--status-amber-text)]" },
  closed: { bg: "bg-[var(--status-red-bg)]", text: "text-[var(--status-red-text)]" },
};

const STAGE_LABEL: Record<string, string> = {
  new: "Submitted",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};

/* ── Recruitment pipeline stages ─────────────────────────────────────────── */

const PIPELINE_STAGES = ["Sourcing", "Interview", "Offer", "Filled"];
const STAGE_STATUS_ORDER = ["sourcing", "interview", "offer", "filled"];

function getPipelineIdx(status: string) {
  if (status === "paused") return -1;
  return STAGE_STATUS_ORDER.indexOf(status);
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function ClientOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);

  const job = JOB_ORDERS.find((j) => j.id === id);

  const candidates = useMemo(
    () => CANDIDATE_RECORDS.filter((c) => c.jobId === id),
    [id]
  );

  if (!job) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-bg)] p-6 text-sm text-[var(--danger)]">
          Job order not found.
        </div>
      </div>
    );
  }

  const group = getStatusGroup(job.status);
  const sc = STATUS_STYLE[group];
  const pipelineIdx = getPipelineIdx(job.status);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Back */}
      <Link
        href="/client/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--gray-500)] hover:text-[var(--accent)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Job Orders
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-[var(--gray-900)] tracking-tight">{job.title}</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--gray-500)]">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{job.openings} opening{job.openings !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Pipeline + Candidates */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recruitment Pipeline */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--gray-900)]">Recruitment Pipeline</h3>
              <p className="text-xs text-[var(--gray-500)] mt-0.5">Current stage of this position</p>
            </div>
            <div className="p-6">
              {job.status === "paused" ? (
                <div className="flex items-center gap-3 rounded-lg bg-[var(--gray-50)] px-4 py-3 text-sm text-[var(--gray-600)]">
                  <Clock className="h-4 w-4 text-[var(--gray-400)]" />
                  This position is currently on hold. The recruiter will resume sourcing shortly.
                </div>
              ) : (
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-[var(--gray-100)]" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${pipelineIdx >= 0 ? (pipelineIdx / (PIPELINE_STAGES.length - 1)) * 100 : 0}%`, right: "auto" }}
                  />
                  <div className="relative grid grid-cols-4 gap-4">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const done = idx < pipelineIdx;
                      const current = idx === pipelineIdx;
                      return (
                        <div key={stage} className="flex flex-col items-center gap-2">
                          <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${done ? "border-[var(--accent)] bg-[var(--accent)]"
                            : current ? "border-[var(--accent)] bg-[var(--surface)] ring-4 ring-[var(--accent-light)]"
                              : "border-[var(--gray-200)] bg-[var(--surface)]"
                            }`}>
                            {done ? <CheckCircle2 className="h-5 w-5 text-white" />
                              : current ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                                : <span className="h-2.5 w-2.5 rounded-full bg-[var(--gray-200)]" />}
                          </div>
                          <span className={`text-[11px] font-semibold uppercase tracking-wider text-center ${done || current ? "text-[var(--accent)]" : "text-[var(--gray-400)]"
                            }`}>{stage}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-[var(--border-light)] flex items-center gap-2 px-5 py-3 text-xs text-[var(--gray-400)]">
              <Clock className="h-3.5 w-3.5" />
              Last updated {job.updatedAt}
            </div>
          </div>

          {/* Submitted Candidates */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--gray-900)]">Submitted Candidates</h3>
                <p className="text-xs text-[var(--gray-500)] mt-0.5">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} for this position</p>
              </div>
              <Link href="/client/candidates" className="text-xs font-medium text-[var(--accent)] hover:underline">
                View all →
              </Link>
            </div>

            {candidates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10">
                <UserCheck className="h-8 w-8 text-[var(--gray-300)]" />
                <p className="text-sm text-[var(--gray-500)]">No candidates submitted for this position yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-light)]">
                {candidates.map((c) => {
                  const cs = CAND_STAGE_STYLE[c.status] ?? CAND_STAGE_STYLE.new;
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--gray-50)] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--gray-900)] truncate">{c.name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[var(--gray-500)]">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                          <span>Available: {c.availability}</span>
                          <span>Applied: {c.appliedAt}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cs.bg} ${cs.text}`}>
                          {STAGE_LABEL[c.status] ?? c.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Job Details */}
        <div className="space-y-5">
          {/* Job Details Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--gray-900)]">Position Details</h3>
            </div>
            <dl className="divide-y divide-[var(--border-light)] text-sm">
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="flex items-center gap-2 text-[var(--gray-500)]">
                  <Briefcase className="h-3.5 w-3.5" /> Type
                </dt>
                <dd className="font-medium text-[var(--gray-900)]">Full-time</dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="flex items-center gap-2 text-[var(--gray-500)]">
                  <Users className="h-3.5 w-3.5" /> Openings
                </dt>
                <dd className="font-medium text-[var(--gray-900)]">{job.openings}</dd>
              </div>

              {job.salary && (
                <div className="flex items-center justify-between px-5 py-3">
                  <dt className="flex items-center gap-2 text-[var(--gray-500)]">
                    <DollarSign className="h-3.5 w-3.5" /> Salary
                  </dt>
                  <dd className="font-medium text-[var(--gray-900)]">{job.salary}</dd>
                </div>
              )}
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="flex items-center gap-2 text-[var(--gray-500)]">
                  <Users className="h-3.5 w-3.5" /> Submitted
                </dt>
                <dd className="font-medium text-[var(--gray-900)]">{job.applicants}</dd>
              </div>
            </dl>
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-[var(--border)] bg-[var(--gray-50)] px-2.5 py-1 text-xs font-medium text-[var(--gray-700)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Candidates summary */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-3">Candidate Summary</h3>
            <div className="space-y-2">
              {(["new", "interview", "offer", "closed"] as const).map((s) => {
                const count = candidates.filter((c) => c.status === s).length;
                const cs = CAND_STAGE_STYLE[s];
                return (
                  <div key={s} className="flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cs.bg} ${cs.text}`}>
                      {STAGE_LABEL[s]}
                    </span>
                    <span className="font-medium text-[var(--gray-700)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
