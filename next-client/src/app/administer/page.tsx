"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  KeyRound,
  LayoutDashboard,
  Mail,
  Shield,
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";

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
        <linearGradient id={`mini-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
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
  { title: "Total Users", value: "24", change: "+3", trend: "up" as const, icon: Users, color: "#3b82f6", sparkline: [12, 14, 16, 18, 20, 22, 24] },
  { title: "Active Sessions", value: "8", change: "+2", trend: "up" as const, icon: Activity, color: "#10b981", sparkline: [3, 5, 4, 6, 7, 5, 8] },
  { title: "System Uptime", value: "99.98%", change: "+0.02%", trend: "up" as const, icon: Server, color: "#8b5cf6", sparkline: [99.9, 99.95, 99.92, 99.97, 99.96, 99.98, 99.98] },
  { title: "API Calls (24h)", value: "12.4K", change: "+18%", trend: "up" as const, icon: Cpu, color: "#f59e0b", sparkline: [8, 9.5, 10, 11, 10.5, 12, 12.4] },
];

const RECENT_ACTIVITIES = [
  { title: "Allan Admin logged in to admin console", time: "5 min ago", type: "success" as const, icon: CheckCircle2 },
  { title: "Mia Recruiter updated job-order #1843", time: "23 min ago", type: "info" as const, icon: Activity },
  { title: "New user Leo Client created", time: "2 hours ago", type: "info" as const, icon: Users },
  { title: "SMTP configuration updated", time: "5 hours ago", type: "warning" as const, icon: AlertCircle },
  { title: "API key rotated for OpenAI provider", time: "1 day ago", type: "success" as const, icon: KeyRound },
];

const QUICK_LINKS = [
  { label: "Manage Users", desc: "Create, edit, delete accounts", href: "/administer/users", icon: Users, color: "#3b82f6" },
  { label: "User Roles", desc: "Permissions and access levels", href: "/administer/roles", icon: Shield, color: "#8b5cf6" },
  { label: "Activity Logs", desc: "Audit sign-ins and actions", href: "/administer/activity", icon: Activity, color: "#10b981" },
  { label: "Email Server", desc: "SMTP and sender identity", href: "/administer/email", icon: Mail, color: "#f59e0b" },
  { label: "AI API Keys", desc: "Provider credentials", href: "/administer/ai", icon: KeyRound, color: "#ef4444" },
  { label: "AI Models", desc: "Model configuration", href: "/administer/models", icon: Cpu, color: "#06b6d4" },
];

const SAMPLE_USERS = [
  { name: "Allan Admin", email: "allan@example.com", role: "Owner", lastActive: "2h ago", status: "active" },
  { name: "Mia Recruiter", email: "mia@example.com", role: "Recruiter", lastActive: "35m ago", status: "active" },
  { name: "Leo Client", email: "leo@contoso.com", role: "Client", lastActive: "1d ago", status: "disabled" },
];

export default function AdminDashboard() {
  const trafficData: SeriesPoint[] = [
    { label: "00:00", value: 120 },
    { label: "04:00", value: 80 },
    { label: "08:00", value: 450 },
    { label: "12:00", value: 890 },
    { label: "16:00", value: 760 },
    { label: "20:00", value: 340 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor system health, manage users, and configure settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white text-sm h-9 border-slate-200 text-slate-600 hover:text-slate-800">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2 text-sm h-9" asChild>
            <Link href="/administer/users">
              <Users className="h-4 w-4" />
              Add User
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

      {/* Traffic Chart + Quick Links */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* System Traffic Chart */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">System Traffic</h3>
              <p className="text-xs text-slate-500 mt-0.5">Requests per hour (24h)</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Requests
              </span>
              <button className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">View Logs</button>
            </div>
          </div>
          <div className="p-6">
            <AreaChart data={trafficData} color="#3b82f6" id="traffic" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <div className="grid gap-4">
            {QUICK_LINKS.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${link.color}12` }}>
                  <link.icon className="h-5 w-5" style={{ color: link.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">{link.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{link.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activities & Users Row */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Recent Activity</h3>
            <Link href="/administer/activity" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_ACTIVITIES.map((item, idx) => {
              const colors = { success: "text-emerald-500 bg-emerald-50", warning: "text-amber-500 bg-amber-50", info: "text-blue-500 bg-blue-50" };
              return (
                <div key={idx} className="flex gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50/50">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors[item.type]}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-slate-700 leading-snug">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Recent Users</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest account activity</p>
            </div>
            <Link href="/administer/users" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Manage all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {SAMPLE_USERS.map((u) => (
                  <tr key={u.email} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{u.role}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-600">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
