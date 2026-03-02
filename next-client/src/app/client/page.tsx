"use client";

import {
  JOB_ORDERS,
  CANDIDATE_RECORDS,
} from "@/data/recruiter";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

/* ─── KPI ─────────────────────────────────────────────────────────────────── */

const KPI_DATA = [
  {
    label: "Active Roles",
    value: String(JOB_ORDERS.filter((j) => j.status !== "filled").length),
    icon: BriefcaseBusiness,
    change: "+2 this month",
  },
  {
    label: "Submitted Candidates",
    value: String(CANDIDATE_RECORDS.length),
    icon: Users,
    change: "+8 this week",
  },
  {
    label: "Pending Decisions",
    value: "3",
    icon: FileCheck2,
    change: "Action required",
  },
  {
    label: "Placements (MTD)",
    value: "5",
    icon: CheckCircle2,
    change: "+2 vs last month",
  },
];

/* ─── Recent activity ─────────────────────────────────────────────────────── */

const ACTIVITIES = [
  { title: "New candidate submitted for Senior Developer", time: "5 min ago", type: "success" as const, icon: CheckCircle2 },
  { title: "Interview scheduled with Ethan Wong", time: "1 hour ago", type: "info" as const, icon: Calendar },
  { title: "Client feedback pending for 3 candidates", time: "2 hours ago", type: "warning" as const, icon: AlertCircle },
  { title: "Placement confirmed: Sarah Johnson at Maple Fintech", time: "3 hours ago", type: "success" as const, icon: CheckCircle2 },
  { title: "New job order opened: QA Automation Engineer", time: "5 hours ago", type: "info" as const, icon: BriefcaseBusiness },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ClientDashboard() {
  const recentCandidates = CANDIDATE_RECORDS.slice(0, 5);
  const activeOrders = JOB_ORDERS.filter((j) => j.status !== "filled").slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--gray-900)]">Welcome back, Client Contact</h2>
        <p className="text-sm text-[var(--gray-500)] mt-0.5">Here&apos;s what&apos;s happening with your hiring pipeline today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_DATA.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--gray-50)]">
                <kpi.icon className="h-4 w-4 text-[var(--gray-500)]" />
              </div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--status-green-text)]">
                <TrendingUp className="h-3 w-3" />
                {kpi.change}
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-semibold text-[var(--gray-900)] tracking-tight">{kpi.value}</h3>
              <p className="text-xs text-[var(--gray-500)] mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Active Job Orders */}
        <div className="xl:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--gray-900)]">Active Job Orders</h3>
              <p className="text-xs text-[var(--gray-500)] mt-0.5">{activeOrders.length} open positions</p>
            </div>
            <Link
              href="/client/orders"
              className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-[11px] font-medium uppercase tracking-wider text-[var(--gray-400)]">
                  <th className="px-5 py-2.5 text-left">Position</th>
                  <th className="px-5 py-2.5 text-left hidden sm:table-cell">Status</th>
                  <th className="px-5 py-2.5 text-right">Candidates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {activeOrders.map((job) => (
                  <tr key={job.id} className="cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/client/orders/${encodeURIComponent(job.id)}`} className="block">
                        <div className="font-medium text-[var(--gray-900)] hover:text-[var(--accent)]">{job.title}</div>
                        <div className="text-xs text-[var(--gray-400)] mt-0.5">{job.location}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${job.status === "interview" ? "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]"
                          : job.status === "sourcing" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]"
                            : job.status === "offer" ? "bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]"
                              : "bg-[var(--gray-100)] text-[var(--gray-600)]"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${job.status === "interview" ? "bg-[var(--accent)]"
                            : job.status === "sourcing" ? "bg-[var(--status-green-text)]"
                              : job.status === "offer" ? "bg-[var(--status-amber-text)]"
                                : "bg-[var(--gray-400)]"
                          }`} />
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs font-medium text-[var(--gray-700)]">{job.applicants}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border-light)] px-5 py-4">
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Recent Activity</h3>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {ACTIVITIES.map((act, idx) => {
              const iconClr =
                act.type === "success" ? "text-[var(--status-green-text)] bg-[var(--status-green-bg)]"
                  : act.type === "warning" ? "text-[var(--status-amber-text)] bg-[var(--status-amber-bg)]"
                    : "text-[var(--status-blue-text)] bg-[var(--status-blue-bg)]";
              return (
                <div key={idx} className="flex gap-3 px-5 py-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconClr}`}>
                    <act.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[var(--gray-700)] leading-snug">{act.title}</p>
                    <p className="text-[11px] text-[var(--gray-400)] mt-0.5">{act.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Recent Candidates</h3>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">Latest submissions for your review</p>
          </div>
          <Link href="/client/candidates" className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)] text-[11px] font-medium uppercase tracking-wider text-[var(--gray-400)]">
                <th className="px-5 py-2.5 text-left">Name</th>
                <th className="px-5 py-2.5 text-left hidden sm:table-cell">Role</th>
                <th className="px-5 py-2.5 text-left">Stage</th>
                <th className="px-5 py-2.5 text-right hidden md:table-cell">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {recentCandidates.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/client/candidates`} className="block font-medium text-[var(--gray-900)] hover:text-[var(--accent)]">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-[var(--gray-500)] text-xs">{c.role}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]">
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right hidden md:table-cell">
                    <Link
                      href="/client/candidates"
                      className="text-xs font-medium text-[var(--accent)] hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
