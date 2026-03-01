"use client";

import {
  CLIENT_REMINDERS,
  JOB_ORDERS,
  CANDIDATE_RECORDS,
} from "@/data/recruiter";
import {
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react";
import Link from "next/link";

/* ─── Tiny Spark Chart ───────────────────────────────────────────────────── */

type SeriesPoint = { label: string; value: number };

function MiniChart({ data }: { data: SeriesPoint[] }) {
  const W = 100, H = 32, P = 2;
  const max = Math.max(1, ...data.map((d) => d.value));
  const pts = data.map((d, i) => {
    const x = P + (i * (W - 2 * P)) / (data.length - 1);
    const y = H - P - (d.value / max) * (H - 2 * P);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-20">
      <polyline
        fill="none" stroke="var(--accent)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

/* ─── Area Chart ─────────────────────────────────────────────────────────── */

function AreaChart({ data, id = "chart" }: { data: SeriesPoint[]; id?: string }) {
  const W = 600, H = 200, P = 30;
  const max = Math.max(1, ...data.map((d) => d.value));
  const points = data.map((d, i) => {
    const x = P + (i * (W - 2 * P)) / (data.length - 1);
    const y = H - P - (d.value / max) * (H - 2 * P);
    return { x, y, value: d.value, label: d.label };
  });
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x},${H - P} L ${points[0].x},${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={P} y1={H - P - t * (H - 2 * P)} x2={W - P} y2={H - P - t * (H - 2 * P)} stroke="var(--gray-200)" strokeWidth="1" />
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--gray-400)">{p.label}</text>
      ))}
      <path d={areaD} fill={`url(#grad-${id})`} />
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="var(--accent)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ─── Data ────────────────────────────────────────────────────────────────── */

const KPI_DATA = [
  { title: "Active Candidates", value: "1,247", change: "+12.5%", trend: "up" as const, icon: Users, sparkline: [8, 12, 10, 15, 18, 14, 19] },
  { title: "Open Positions", value: "38", change: "+8.2%", trend: "up" as const, icon: BriefcaseBusiness, sparkline: [5, 8, 6, 9, 7, 10, 12] },
  { title: "Placements MTD", value: "25", change: "+15.3%", trend: "up" as const, icon: Target, sparkline: [3, 5, 4, 7, 6, 8, 9] },
  { title: "Pipeline Value", value: "$2.4M", change: "+22.1%", trend: "up" as const, icon: DollarSign, sparkline: [20, 25, 22, 30, 28, 35, 40] },
];

const ACTIVITIES = [
  { title: "New candidate submitted for Senior Developer", time: "5 min ago", type: "success" as const, icon: CheckCircle2 },
  { title: "Interview scheduled with John Smith", time: "1 hour ago", type: "info" as const, icon: Calendar },
  { title: "Client feedback pending for 3 candidates", time: "2 hours ago", type: "warning" as const, icon: AlertCircle },
  { title: "Placement confirmed: Sarah Johnson at Maple Fintech", time: "3 hours ago", type: "success" as const, icon: CheckCircle2 },
  { title: "New job order from Aurora Health", time: "5 hours ago", type: "info" as const, icon: BriefcaseBusiness },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function RecruiterPage() {
  const placementData: SeriesPoint[] = [
    { label: "Jan", value: 12 },
    { label: "Feb", value: 19 },
    { label: "Mar", value: 15 },
    { label: "Apr", value: 22 },
    { label: "May", value: 28 },
    { label: "Jun", value: 25 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">Welcome back, Allan</h2>
          <p className="text-sm text-[var(--gray-500)] mt-0.5">Here&apos;s what&apos;s happening with your pipeline today.</p>
        </div>
        <Link
          href="/recruiter/job-orders/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition-colors self-start"
        >
          <Plus className="h-4 w-4" />
          New Job Order
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_DATA.map((kpi) => (
          <div key={kpi.title} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--gray-50)]">
                <kpi.icon className="h-4 w-4 text-[var(--gray-500)]" />
              </div>
              <div className="w-20">
                <MiniChart data={kpi.sparkline.map((v, i) => ({ label: String(i), value: v }))} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-semibold text-[var(--gray-900)] font-[family-name:ui-monospace,monospace] tracking-tight">{kpi.value}</h3>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-[var(--gray-500)]">{kpi.title}</p>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.trend === "up" ? "text-[var(--status-green-text)]" : "text-[var(--status-red-text)]"}`}>
                  {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Placement Trend */}
        <div className="xl:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--gray-900)]">Placement Trend</h3>
              <p className="text-xs text-[var(--gray-500)] mt-0.5">Last 6 months</p>
            </div>
            <Link href="/recruiter/reports" className="text-xs font-medium text-[var(--accent)] hover:underline">View Report</Link>
          </div>
          <div className="p-5">
            <AreaChart data={placementData} id="placement" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Recent Activity</h3>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {ACTIVITIES.map((act, idx) => {
              const iconClr = act.type === "success" ? "text-[var(--status-green-text)] bg-[var(--status-green-bg)]"
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

      {/* Job Orders + Sidebar */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Active Job Orders */}
        <div className="xl:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--gray-900)]">Active Job Orders</h3>
              <p className="text-xs text-[var(--gray-500)] mt-0.5">{JOB_ORDERS.filter(j => j.status !== "filled").length} open positions</p>
            </div>
            <Link href="/recruiter/job-orders" className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-[11px] font-medium uppercase tracking-wider text-[var(--gray-400)]">
                  <th className="px-5 py-2.5 text-left">Position</th>
                  <th className="px-5 py-2.5 text-left hidden sm:table-cell">Client</th>
                  <th className="px-5 py-2.5 text-left">Status</th>
                  <th className="px-5 py-2.5 text-left hidden md:table-cell">Priority</th>
                  <th className="px-5 py-2.5 text-right">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {JOB_ORDERS.slice(0, 5).map((job) => (
                  <tr key={job.id} className="cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/recruiter/job-orders/${encodeURIComponent(job.id)}`} className="block">
                        <div className="font-medium text-[var(--gray-900)] cursor-pointer hover:text-[var(--accent)]">{job.title}</div>
                        <div className="text-xs text-[var(--gray-400)] mt-0.5">{job.location}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-[var(--gray-600)]">{job.client}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${job.status === "interview" ? "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]" :
                          job.status === "sourcing" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]" :
                            job.status === "offer" ? "bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]" :
                              "bg-[var(--gray-100)] text-[var(--gray-600)]"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${job.status === "interview" ? "bg-[var(--accent)]" :
                            job.status === "sourcing" ? "bg-[var(--status-green-text)]" :
                              job.status === "offer" ? "bg-[var(--status-amber-text)]" :
                                "bg-[var(--gray-400)]"
                          }`} />
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium ${job.priority === "high" ? "text-[var(--status-red-text)]" : job.priority === "medium" ? "text-[var(--status-amber-text)]" : "text-[var(--gray-500)]"
                        }`}>
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs font-medium text-[var(--gray-700)] font-[family-name:ui-monospace,monospace]">{job.applicants}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Client Reminders */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--gray-900)]">Client Reminders</h3>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--status-amber-bg)] px-1.5 text-[10px] font-semibold text-[var(--status-amber-text)]">
                {CLIENT_REMINDERS.length}
              </span>
            </div>
            <div className="divide-y divide-[var(--border-light)]">
              {CLIENT_REMINDERS.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--gray-900)]">{r.company}</p>
                    <p className="text-xs text-[var(--gray-500)] mt-0.5">{r.topic}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${r.status === "overdue" ? "bg-[var(--status-red-bg)] text-[var(--status-red-text)]" :
                      r.status === "pending" ? "bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]" :
                        "bg-[var(--gray-100)] text-[var(--gray-500)]"
                    }`}>
                    {r.due}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Summary */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-4">Pipeline Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Sourcing", count: CANDIDATE_RECORDS.filter(c => c.stage === "Sourcing").length, total: CANDIDATE_RECORDS.length },
                { label: "Interview", count: CANDIDATE_RECORDS.filter(c => c.stage === "Interview" || c.stage === "Client Interview").length, total: CANDIDATE_RECORDS.length },
                { label: "Offer", count: CANDIDATE_RECORDS.filter(c => c.stage === "Offer").length, total: CANDIDATE_RECORDS.length },
                { label: "Review", count: CANDIDATE_RECORDS.filter(c => c.stage === "Recruiter Review").length, total: CANDIDATE_RECORDS.length },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[var(--gray-600)]">{item.label}</span>
                    <span className="text-[var(--gray-900)] font-medium font-[family-name:ui-monospace,monospace]">{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--gray-100)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${Math.max(5, (item.count / item.total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
