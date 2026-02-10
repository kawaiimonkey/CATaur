"use client";

import { Button } from "@/components/ui/button";
import {
  CLIENT_REMINDERS,
  JOB_ORDERS,
  CANDIDATE_RECORDS,
} from "@/data/recruiter";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Clock,
  DollarSign,
  Activity,
} from "lucide-react";
import Link from "next/link";

type SeriesPoint = { label: string; value: number };

function MiniChart({ data, color = "#0066cc" }: { data: SeriesPoint[]; color?: string }) {
  const W = 120, H = 40, P = 4;
  const max = Math.max(1, ...data.map((d) => d.value));
  const pts = data.map((d, i) => {
    const x = P + (i * (W - 2 * P)) / (data.length - 1);
    const y = H - P - (d.value / max) * (H - 2 * P);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-full">
      <defs>
        <linearGradient id={`mini-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

function AreaChart({ data, color = "#0066cc", id = "chart" }: { data: SeriesPoint[]; color?: string; id?: string }) {
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
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={P} y1={H - P - t * (H - 2 * P)} x2={W - P} y2={H - P - t * (H - 2 * P)} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.label}</text>
      ))}
      <path d={areaD} fill={`url(#grad-${id})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

const KPI_DATA = [
  { title: "Active Candidates", value: "1,247", change: "+12.5%", trend: "up" as const, icon: Users, color: "#3b82f6", sparkline: [8, 12, 10, 15, 18, 14, 19] },
  { title: "Open Positions", value: "38", change: "+8.2%", trend: "up" as const, icon: BriefcaseBusiness, color: "#10b981", sparkline: [5, 8, 6, 9, 7, 10, 12] },
  { title: "Placements MTD", value: "25", change: "+15.3%", trend: "up" as const, icon: Target, color: "#8b5cf6", sparkline: [3, 5, 4, 7, 6, 8, 9] },
  { title: "Pipeline Value", value: "$2.4M", change: "+22.1%", trend: "up" as const, icon: DollarSign, color: "#f59e0b", sparkline: [20, 25, 22, 30, 28, 35, 40] },
];

const ACTIVITIES = [
  { title: "New candidate submitted for Senior Developer", time: "5 min ago", type: "success" as const, icon: CheckCircle2 },
  { title: "Interview scheduled with John Smith", time: "1 hour ago", type: "info" as const, icon: Calendar },
  { title: "Client feedback pending for 3 candidates", time: "2 hours ago", type: "warning" as const, icon: AlertCircle },
  { title: "Placement confirmed: Sarah Johnson at Maple Fintech", time: "3 hours ago", type: "success" as const, icon: CheckCircle2 },
  { title: "New job order from Aurora Health", time: "5 hours ago", type: "info" as const, icon: BriefcaseBusiness },
];

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
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, Allan</h2>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s what&apos;s happening with your recruitment pipeline today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white text-sm h-9 border-slate-200 text-slate-600 hover:text-slate-800">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 text-sm h-9" asChild>
            <Link href="/recruiter/job-orders/new">
              <Sparkles className="h-4 w-4" />
              New Job Order
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {KPI_DATA.map((kpi) => (
          <div key={kpi.title} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/80">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${kpi.color}12` }}>
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
              <div className="w-20">
                <MiniChart data={kpi.sparkline.map((v, i) => ({ label: String(i), value: v }))} color={kpi.color} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-[28px] font-bold text-slate-900 tracking-tight">{kpi.value}</h3>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[13px] text-slate-500 font-medium">{kpi.title}</p>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                  {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Activity Row */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Placement Trend Chart */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Placement Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Placements
              </span>
              <button className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">View Report</button>
            </div>
          </div>
          <div className="p-6">
            <AreaChart data={placementData} color="#3b82f6" id="placement" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {ACTIVITIES.map((activity, idx) => {
              const colors = { success: "text-emerald-500 bg-emerald-50", warning: "text-amber-500 bg-amber-50", info: "text-blue-500 bg-blue-50" };
              return (
                <div key={idx} className="flex gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50/50">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors[activity.type]}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-slate-700 leading-snug">{activity.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Orders + Sidebar */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Active Job Orders */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Active Job Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">{JOB_ORDERS.filter(j => j.status !== "filled").length} open positions</p>
            </div>
            <Link href="/recruiter/job-orders" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 text-left">Position</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Priority</th>
                  <th className="px-6 py-3 text-right">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {JOB_ORDERS.slice(0, 5).map((job) => (
                  <tr key={job.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <Link href={`/recruiter/job-orders/${encodeURIComponent(job.id)}`} className="block">
                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{job.location}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                          {job.client.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-600">{job.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        job.status === "interview" ? "bg-blue-50 text-blue-700" :
                        job.status === "sourcing" ? "bg-emerald-50 text-emerald-700" :
                        job.status === "offer" ? "bg-violet-50 text-violet-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          job.status === "interview" ? "bg-blue-500" :
                          job.status === "sourcing" ? "bg-emerald-500" :
                          job.status === "offer" ? "bg-violet-500" :
                          "bg-slate-400"
                        }`} />
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        job.priority === "high" ? "text-red-600" : job.priority === "medium" ? "text-amber-600" : "text-slate-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          job.priority === "high" ? "bg-red-500" : job.priority === "medium" ? "bg-amber-500" : "bg-slate-400"
                        }`} />
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 text-xs font-semibold text-slate-700">{job.applicants}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Client Reminders */}
          <div className="rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h3 className="text-[15px] font-semibold text-slate-900">Client Reminders</h3>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
                {CLIENT_REMINDERS.length}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {CLIENT_REMINDERS.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-900">{reminder.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{reminder.topic}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    reminder.status === "overdue" ? "bg-red-50 text-red-700" :
                    reminder.status === "pending" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {reminder.due}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-5">Pipeline Summary</h3>
            <div className="space-y-4">
              {[
                { label: "Sourcing", count: CANDIDATE_RECORDS.filter(c => c.stage === "Sourcing").length, total: CANDIDATE_RECORDS.length, color: "bg-slate-400" },
                { label: "Interview", count: CANDIDATE_RECORDS.filter(c => c.stage === "Interview" || c.stage === "Client Interview").length, total: CANDIDATE_RECORDS.length, color: "bg-blue-500" },
                { label: "Offer", count: CANDIDATE_RECORDS.filter(c => c.stage === "Offer").length, total: CANDIDATE_RECORDS.length, color: "bg-violet-500" },
                { label: "Review", count: CANDIDATE_RECORDS.filter(c => c.stage === "Recruiter Review").length, total: CANDIDATE_RECORDS.length, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="text-slate-900 font-bold">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${Math.max(5, (item.count / item.total) * 100)}%` }} />
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
