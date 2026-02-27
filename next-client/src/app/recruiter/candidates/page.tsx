"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  CANDIDATE_RECORDS,
  type ApplicationStatus,
  type CandidateRecord,
} from "@/data/recruiter";
import {
  Search,
  MapPin,
  ChevronRight,
  X,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badge: string; dot: string; card: string; cardBorder: string }
> = {
  new: {
    label: "New",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    card: "bg-white",
    cardBorder: "border-blue-200",
  },
  interview: {
    label: "Interview",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
    card: "bg-white",
    cardBorder: "border-amber-200",
  },
  offer: {
    label: "Offer",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    card: "bg-white",
    cardBorder: "border-emerald-200",
  },
  closed: {
    label: "Closed",
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
    card: "bg-slate-50",
    cardBorder: "border-slate-200",
  },
};

const STATUS_ORDER: ApplicationStatus[] = ["new", "interview", "offer", "closed"];

/* ─── Interview modal state ──────────────────────────────────────────────── */
interface InterviewDraft {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  subject: string;
  type: "Zoom" | "Phone" | "Onsite";
  date: string;
  time: string;
  content: string;
}

/* ─── Initials helper ────────────────────────────────────────────────────── */
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Status card (top filter) ───────────────────────────────────────────── */
function StatusCard({
  status,
  count,
  active,
  onClick,
}: {
  status: ApplicationStatus;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${active
          ? `${cfg.cardBorder} ring-1 ring-current/10 shadow-sm`
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm"
        } ${cfg.card}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? cfg.badge : "bg-slate-100"
          }`}
      >
        <UserCheck
          className={`h-5 w-5 ${active
              ? cfg.badge.split(" ")[1]
              : "text-slate-500"
            }`}
        />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{count}</p>
        <p className="text-[11px] font-medium text-slate-500">{cfg.label}</p>
      </div>
    </button>
  );
}

/* ─── Interview Invitation Modal ─────────────────────────────────────────── */
function InterviewModal({
  draft,
  onChange,
  onSend,
  onClose,
}: {
  draft: InterviewDraft;
  onChange: (d: Partial<InterviewDraft>) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  const inputCls =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Send Interview Invitation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              To: <span className="font-medium text-slate-700">{draft.candidateName}</span>
              {" · "}
              {draft.jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 px-6 py-5">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subject
            </label>
            <input
              type="text"
              className={inputCls}
              value={draft.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
            />
          </div>

          {/* Type + Date + Time — 3 cols */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Type
              </label>
              <select
                className={inputCls}
                value={draft.type}
                onChange={(e) =>
                  onChange({ type: e.target.value as InterviewDraft["type"] })
                }
              >
                <option value="Zoom">Zoom</option>
                <option value="Phone">Phone</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Mar 10, 2026"
                value={draft.date}
                onChange={(e) => onChange({ date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Time
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. 2:30 PM EST"
                value={draft.time}
                onChange={(e) => onChange({ time: e.target.value })}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Message
            </label>
            <textarea
              rows={4}
              className={inputCls}
              placeholder="Write your message to the candidate…"
              value={draft.content}
              onChange={(e) => onChange({ content: e.target.value })}
            />
            <p className="text-[11px] text-slate-400">
              This message will be displayed in the candidate's Applications page and sent to their email.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function RecruiterCandidatesPage() {
  const [records, setRecords] = useState<CandidateRecord[]>(CANDIDATE_RECORDS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  // Interview modal
  const [interviewDraft, setInterviewDraft] = useState<InterviewDraft | null>(
    null
  );
  const [pendingInterviewId, setPendingInterviewId] = useState<string | null>(
    null
  );

  /* ── Counts ── */
  const counts = useMemo(() => {
    const c: Record<ApplicationStatus, number> = {
      new: 0, interview: 0, offer: 0, closed: 0,
    };
    records.forEach((r) => { c[r.status]++; });
    return c;
  }, [records]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let rows = [...records];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.jobTitle.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    return rows;
  }, [records, query, statusFilter]);

  /* ── Status change ── */
  const changeStatus = (id: string, newStatus: ApplicationStatus) => {
    if (newStatus === "interview") {
      const rec = records.find((r) => r.id === id)!;
      setPendingInterviewId(id);
      setInterviewDraft({
        candidateId: id,
        candidateName: rec.name,
        jobTitle: rec.jobTitle,
        subject: `Interview Invitation — ${rec.jobTitle}`,
        type: "Zoom",
        date: "",
        time: "",
        content: `Hi ${rec.name.split(" ")[0]}, we'd like to invite you to an interview for the ${rec.jobTitle} role. Please see the details below.`,
      });
    } else {
      applyStatusChange(id, newStatus);
    }
  };

  const applyStatusChange = (id: string, newStatus: ApplicationStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleSendInterview = () => {
    if (!pendingInterviewId || !interviewDraft) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === pendingInterviewId
          ? {
            ...r,
            status: "interview" as ApplicationStatus,
            interviewMessage: {
              subject: interviewDraft.subject,
              type: interviewDraft.type,
              date: interviewDraft.date,
              time: interviewDraft.time,
              content: interviewDraft.content,
              sentAt: "Just now",
            },
          }
          : r
      )
    );
    setInterviewDraft(null);
    setPendingInterviewId(null);
  };

  return (
    <div className="p-8 space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Candidates
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage applications and track your pipeline
        </p>
      </div>

      {/* ── Status Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_ORDER.map((s) => (
          <StatusCard
            key={s}
            status={s}
            count={counts[s]}
            active={statusFilter === s}
            onClick={() =>
              setStatusFilter((prev) => (prev === s ? "all" : s))
            }
          />
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or job title…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); }}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] items-center border-b border-slate-100 px-6 py-3">
          {["Candidate", "Applied For", "Status", "Applied", "Location", ""].map(
            (h) => (
              <span
                key={h}
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              >
                {h}
              </span>
            )
          )}
        </div>

        {/* Table rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
            <UserCheck className="h-8 w-8" />
            <p className="text-sm">No candidates match your filters.</p>
          </div>
        ) : (
          filtered.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <div
                key={c.id}
                className={`grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-slate-50 px-6 py-4 transition-colors last:border-0 hover:bg-slate-50/50 ${c.status === "closed" ? "opacity-60" : ""
                  }`}
              >
                {/* Candidate */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0 border border-slate-200/80">
                    <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-[11px] font-bold">
                      {initials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      href={`/recruiter/candidates/${encodeURIComponent(c.id)}`}
                      className="text-[13px] font-semibold text-slate-900 hover:text-primary transition-colors block truncate"
                    >
                      {c.name}
                    </Link>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.id}
                    </p>
                  </div>
                </div>

                {/* Applied For */}
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-700 truncate">
                    {c.jobTitle}
                  </p>
                  <p className="text-[11px] text-slate-400">{c.jobId}</p>
                </div>

                {/* Status */}
                <StatusBadge status={c.status} />

                {/* Applied */}
                <span className="text-[13px] text-slate-500">{c.appliedAt}</span>

                {/* Location */}
                <div className="flex items-center gap-1 text-[13px] text-slate-500 min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{c.location}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Status change dropdown */}
                  <div className="relative group">
                    <select
                      value={c.status}
                      onChange={(e) =>
                        changeStatus(c.id, e.target.value as ApplicationStatus)
                      }
                      className="h-8 rounded-lg border border-slate-200 bg-white pl-2 pr-6 text-xs font-medium text-slate-600 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-slate-50 transition"
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 text-slate-400" />
                  </div>

                  {/* View Profile */}
                  <Link
                    href={`/recruiter/candidates/${encodeURIComponent(c.id)}`}
                    className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 h-8 flex items-center text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-3">
            <p className="text-[13px] text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {records.length}
              </span>{" "}
              candidates
            </p>
          </div>
        )}
      </div>

      {/* ── Interview Modal ── */}
      {interviewDraft && (
        <InterviewModal
          draft={interviewDraft}
          onChange={(patch) => setInterviewDraft((d) => d ? { ...d, ...patch } : d)}
          onSend={handleSendInterview}
          onClose={() => {
            setInterviewDraft(null);
            setPendingInterviewId(null);
          }}
        />
      )}
    </div>
  );
}
