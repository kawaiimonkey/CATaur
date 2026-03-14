"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CANDIDATE_RECORDS,
  JOB_ORDERS,
  type ApplicationStatus,
} from "@/data/recruiter";
import {
  Search,
  MapPin,
  Users,
  UserPlus,
  CalendarClock,
  BadgeDollarSign,
  XCircle,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
} from "lucide-react";

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  new: { label: "New", bg: "bg-[var(--status-blue-bg)]", text: "text-[var(--status-blue-text)]", Icon: UserPlus },
  interview: { label: "Interview", bg: "bg-[var(--status-amber-bg)]", text: "text-[var(--status-amber-text)]", Icon: CalendarClock },
  offer: { label: "Offer", bg: "bg-[var(--status-green-bg)]", text: "text-[var(--status-green-text)]", Icon: BadgeDollarSign },
  closed: { label: "Closed", bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-500)]", Icon: XCircle },
};

const STATUS_ORDER: ApplicationStatus[] = ["new", "interview", "offer", "closed"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

/* ─── Filter Tab ─────────────────────────────────────────────────────────── */
function FilterTab({
  label, count, active, Icon, onClick,
}: {
  label: string; count: number; active: boolean;
  Icon: React.ComponentType<{ className?: string }>; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors ${active
        ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)]"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      <span className={`ml-auto text-xs font-semibold ${active ? "text-[var(--accent)]" : "text-[var(--gray-400)]"}`}>
        {count}
      </span>
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function ClientCandidatesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const allJobs = useMemo(() => JOB_ORDERS, []);

  const counts = useMemo(() => {
    const c: Record<ApplicationStatus, number> = { new: 0, interview: 0, offer: 0, closed: 0 };
    CANDIDATE_RECORDS.forEach((r) => { c[r.status]++; });
    return c;
  }, []);

  const interviewCount = counts["interview"];

  const filtered = useMemo(() => {
    let rows = [...CANDIDATE_RECORDS];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    if (jobFilter !== "all") rows = rows.filter((r) => r.jobId === jobFilter);
    return rows;
  }, [query, statusFilter, jobFilter]);

  useMemo(() => { setPage(1); }, [query, statusFilter, jobFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, filtered.length);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">Candidates</h2>
          <p className="mt-0.5 text-sm text-[var(--gray-500)]">Track candidate progress across all of your job orders</p>
        </div>
      </div>

      {/* Action nudge: interview-stage candidates pending decision */}
      {interviewCount > 0 && (
        <div className="flex items-center justify-between rounded-md border border-[var(--status-amber-text)]/25 bg-[var(--status-amber-bg)] px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[var(--status-amber-text)] shrink-0" />
            <p className="text-sm text-[var(--status-amber-text)]">
              <span className="font-semibold">{interviewCount} candidate{interviewCount > 1 ? "s" : ""}</span>
              {" "}have completed interviews — ready for your decision.
            </p>
          </div>
          <Link
            href="/client/decisions"
            className="flex items-center gap-1 shrink-0 text-xs font-medium text-[var(--status-amber-text)] hover:underline"
          >
            Go to Decisions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <FilterTab label="All" count={CANDIDATE_RECORDS.length} active={statusFilter === "all"} Icon={Users} onClick={() => setStatusFilter("all")} />
        {STATUS_ORDER.map((s) => (
          <FilterTab
            key={s}
            label={STATUS_CONFIG[s].label}
            count={counts[s]}
            active={statusFilter === s}
            Icon={STATUS_CONFIG[s].Icon}
            onClick={() => setStatusFilter((prev) => (prev === s ? "all" : s))}
          />
        ))}
      </div>

      {/* Search + Job Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
          <input
            type="text"
            placeholder="Search by name or job title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
          />
        </div>
        <div className="relative">
          <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gray-400)]" />
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-9 appearance-none rounded-md border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] cursor-pointer"
          >
            <option value="all">All Job Orders</option>
            {allJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} ({j.id})</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gray-400)]" />
        </div>
        <p className="ml-auto text-sm text-[var(--gray-400)] hidden sm:block">
          <span className="font-medium text-[var(--gray-600)]">{filtered.length}</span> of{" "}
          <span className="font-medium text-[var(--gray-600)]">{CANDIDATE_RECORDS.length}</span>
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Desktop header */}
        <div className="hidden lg:grid grid-cols-[2fr_2fr_1.2fr_1fr_1.2fr] items-center border-b border-[var(--border)] px-5 py-2.5 bg-[var(--gray-50)]">
          {["Candidate", "Applied For", "Status", "Applied", "Location"].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-[var(--gray-400)]">
            <Users className="h-7 w-7" />
            <p className="text-sm">No candidates match your filters.</p>
          </div>
        ) : (
          pageItems.map((c) => {
            const sc = STATUS_CONFIG[c.status];
            return (
              <Link
                key={c.id}
                href={`/client/candidates/${encodeURIComponent(c.id)}`}
                className={`flex flex-col lg:grid lg:grid-cols-[2fr_2fr_1.2fr_1fr_1.2fr] lg:items-center gap-2 lg:gap-4 border-b border-[var(--border-light)] px-5 py-3 transition-colors last:border-0 hover:bg-[var(--gray-50)] ${c.status === "closed" ? "opacity-55" : ""}`}
              >
                {/* Candidate */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${c.status === "interview" ? "bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]" : "bg-[var(--gray-200)] text-[var(--gray-600)]"}`}>
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--gray-900)] truncate">{c.name}</p>
                    <p className="text-xs text-[var(--gray-400)] truncate">{c.email}</p>
                  </div>
                </div>

                {/* Applied For */}
                <div className="min-w-0">
                  <p className="text-sm text-[var(--gray-700)] truncate">{c.jobTitle}</p>
                </div>

                {/* Status badge */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {sc.label}
                  </span>
                </div>

                {/* Applied date */}
                <span className="text-sm text-[var(--gray-500)]">{c.appliedAt}</span>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-[var(--gray-500)] min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--gray-400)]" />
                  <span className="truncate">{c.location}</span>
                </div>
              </Link>
            );
          })
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border)] px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-[var(--gray-500)]">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-7 appearance-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 pr-6 text-xs font-medium text-[var(--gray-600)] cursor-pointer"
              >
                {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>
                <span className="font-medium text-[var(--gray-700)]">{startIdx}–{endIdx}</span>
                {" "}of{" "}
                <span className="font-medium text-[var(--gray-700)]">{filtered.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={safePage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="flex h-7 w-7 items-center justify-center text-xs text-[var(--gray-400)]">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md text-xs font-medium transition ${p === safePage ? "bg-[var(--accent)] text-white" : "text-[var(--gray-500)] cursor-pointer hover:bg-[var(--gray-100)]"
                      }`}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
