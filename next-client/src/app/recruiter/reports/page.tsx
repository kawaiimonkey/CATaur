"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { REPORTS, JOB_ORDERS, CANDIDATE_RECORDS } from "@/data/recruiter";
import {
  Download,
  Printer,
  Calendar as CalendarIcon,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type SeriesPoint = { label: string; value: number };

/* ------------------------------------------------------------------ */
/*  SVG Line / Area Chart                                              */
/* ------------------------------------------------------------------ */
function LineChart({
  data, color = "#3b82f6", height = 260, id,
}: {
  data: SeriesPoint[]; color?: string; height?: number; id: string;
}) {
  const W = 800, H = height, P = 48;
  const max = Math.max(1, ...data.map((d) => d.value));
  const points = data.map((d, i) => {
    const x = P + (i * (W - 2 * P)) / Math.max(1, data.length - 1);
    const y = H - P - (d.value / max) * (H - 2 * P);
    return { x, y, value: d.value, label: d.label };
  });
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x},${H - P} L ${points[0].x},${H - P} Z`;

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={P} y1={H - P - t * (H - 2 * P)} x2={W - P} y2={H - P - t * (H - 2 * P)} stroke="#e2e8f0" strokeDasharray="4 4" />
        ))}
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={P - 12} y={H - P - t * (H - 2 * P) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{Math.round(t * max).toLocaleString()}</text>
        ))}
        {/* X-axis labels */}
        {points.map((p, i) => (data.length < 10 || i % 2 === 0) && (
          <text key={i} x={p.x} y={H - 12} textAnchor="middle" fontSize="11" fill="#94a3b8">{p.label}</text>
        ))}
        <path d={areaD} fill={`url(#grad-${id})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" className="opacity-0 hover:opacity-100 transition-opacity duration-200" />
            <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal Bar Chart                                               */
/* ------------------------------------------------------------------ */
function HorizontalBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-5">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
            <span className="text-[13px] font-bold text-slate-900">{item.value}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100/80 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pipeline Funnel                                                    */
/* ------------------------------------------------------------------ */
function PipelineFunnel({ steps }: { steps: { stage: string; count: number; rate: string; color: string }[] }) {
  const maxCount = Math.max(...steps.map((s) => s.count));
  return (
    <div className="space-y-3.5">
      {steps.map((step, i) => {
        const widthPct = Math.max(14, (step.count / maxCount) * 100);
        return (
          <div key={step.stage}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{i + 1}</span>
                <span className="text-[13px] font-medium text-slate-700">{step.stage}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-slate-500">{step.count.toLocaleString()}</span>
                <span className="min-w-[48px] rounded-md bg-slate-50 px-2 py-0.5 text-center text-xs font-bold text-slate-700">{step.rate}</span>
              </div>
            </div>
            <div className="h-8 w-full rounded-lg bg-slate-50 overflow-hidden">
              <div className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3" style={{ width: `${widthPct}%`, backgroundColor: step.color }}>
                {widthPct > 20 && <span className="text-[11px] font-semibold text-white/90">{step.count.toLocaleString()}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function RecruiterReportsPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const revenueData = useMemo<SeriesPoint[]>(() => [
    { label: "Jan", value: 28400 }, { label: "Feb", value: 31200 }, { label: "Mar", value: 26800 },
    { label: "Apr", value: 34500 }, { label: "May", value: 38900 }, { label: "Jun", value: 35200 },
    { label: "Jul", value: 41600 }, { label: "Aug", value: 37800 }, { label: "Sep", value: 43200 },
    { label: "Oct", value: 39500 }, { label: "Nov", value: 45100 }, { label: "Dec", value: 48300 },
  ], []);

  const placementData = useMemo<SeriesPoint[]>(() => [
    { label: "Jan", value: 5 }, { label: "Feb", value: 7 }, { label: "Mar", value: 4 },
    { label: "Apr", value: 8 }, { label: "May", value: 6 }, { label: "Jun", value: 9 },
    { label: "Jul", value: 11 }, { label: "Aug", value: 8 }, { label: "Sep", value: 10 },
    { label: "Oct", value: 12 }, { label: "Nov", value: 9 }, { label: "Dec", value: 14 },
  ], []);

  const sourceData = useMemo(() => [
    { label: "LinkedIn Recruiter", value: 42, color: "#3b82f6" },
    { label: "Employee Referrals", value: 28, color: "#10b981" },
    { label: "Job Boards (Indeed/ZipRecruiter)", value: 18, color: "#f59e0b" },
    { label: "Direct Applications", value: 8, color: "#8b5cf6" },
    { label: "Agency Partners", value: 4, color: "#ec4899" },
  ], []);

  const funnelSteps = useMemo(() => [
    { stage: "Applications Received", count: 1240, rate: "100%", color: "#3b82f6" },
    { stage: "Recruiter Screen", count: 620, rate: "50%", color: "#6366f1" },
    { stage: "Hiring Manager Review", count: 310, rate: "25%", color: "#8b5cf6" },
    { stage: "Interview Stage", count: 155, rate: "12.5%", color: "#a855f7" },
    { stage: "Offer Extended", count: 52, rate: "4.2%", color: "#c084fc" },
    { stage: "Placement", count: 41, rate: "3.3%", color: "#10b981" },
  ], []);

  const totalOpenJobs = JOB_ORDERS.filter((j) => j.status !== "filled").length;
  const totalCandidates = CANDIDATE_RECORDS.length;

  return (
    <div className="p-8 space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Performance metrics, pipeline health, and recruitment insights</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 rounded-lg border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                {dateRange}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200/80">
              {["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year", "All Time"].map((range) => (
                <DropdownMenuItem key={range} onClick={() => setDateRange(range)} className="text-[13px]">{range}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4 text-slate-400" /> Print
          </Button>
          <Button size="sm" className="h-9 gap-2 rounded-lg bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-700">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* ---- KPI Stat Cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$450.2K", change: "+12.5%", trend: "up" as const, icon: DollarSign, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
          { title: "Placements", value: "103", change: "+8.2%", trend: "up" as const, icon: Briefcase, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { title: "Avg Time to Fill", value: "18 days", change: "-3.1 days", trend: "up" as const, icon: Clock, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
          { title: "Fill Rate", value: "87%", change: "-2.4%", trend: "down" as const, icon: Users, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${kpi.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-[28px] font-bold tracking-tight text-slate-900">{kpi.value}</h3>
              <p className="mt-1 text-[13px] font-medium text-slate-500">{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Revenue & Placement Trend Charts ---- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Revenue Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly revenue over the past 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> +18.3% YoY
            </div>
          </div>
          <div className="p-4">
            <LineChart data={revenueData} color="#3b82f6" id="revenue" height={260} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Placement Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly placements over the past 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> +22.1% YoY
            </div>
          </div>
          <div className="p-4">
            <LineChart data={placementData} color="#10b981" id="placements" height={260} />
          </div>
        </div>
      </div>

      {/* ---- Source Effectiveness & Pipeline Funnel ---- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Source Effectiveness</h3>
            <p className="mt-0.5 text-xs text-slate-500">Candidate sourcing channels ranked by placement conversion</p>
          </div>
          <div className="px-6 py-5">
            <HorizontalBarChart data={sourceData} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-[15px] font-semibold text-slate-900">Recruitment Pipeline Funnel</h3>
            <p className="mt-0.5 text-xs text-slate-500">Conversion rates across each hiring stage</p>
          </div>
          <div className="px-6 py-5">
            <PipelineFunnel steps={funnelSteps} />
          </div>
        </div>
      </div>

      {/* ---- Summary Footer ---- */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[13px] text-slate-500">Active Job Orders</p>
              <p className="text-lg font-bold text-slate-900">{totalOpenJobs}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[13px] text-slate-500">Candidates in Pipeline</p>
              <p className="text-lg font-bold text-slate-900">{totalCandidates}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[13px] text-slate-500">Report Snapshots</p>
              <p className="text-lg font-bold text-slate-900">{REPORTS.length}</p>
            </div>
          </div>
          <p className="text-[13px] text-slate-400">Data refreshed automatically. Last update: just now.</p>
        </div>
      </div>
    </div>
  );
}