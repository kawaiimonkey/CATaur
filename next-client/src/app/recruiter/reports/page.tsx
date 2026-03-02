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
  data, color = "var(--accent)", height = 260, id,
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
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={P} y1={H - P - t * (H - 2 * P)} x2={W - P} y2={H - P - t * (H - 2 * P)} stroke="var(--border-light)" strokeDasharray="4 4" />
        ))}
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={P - 12} y={H - P - t * (H - 2 * P) + 4} textAnchor="end" fontSize="11" fill="var(--gray-400)">{Math.round(t * max).toLocaleString()}</text>
        ))}
        {/* X-axis labels */}
        {points.map((p, i) => (data.length < 10 || i % 2 === 0) && (
          <text key={i} x={p.x} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--gray-400)">{p.label}</text>
        ))}
        <path d={areaD} fill={`url(#grad-${id})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke={color} strokeWidth="2" className="opacity-0 hover:opacity-100 transition-opacity duration-200" />
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
            <span className="text-sm font-medium text-[var(--gray-700)]">{item.label}</span>
            <span className="text-sm font-bold text-[var(--gray-900)]">{item.value}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[var(--gray-100)] overflow-hidden border border-[var(--border-light)]">
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
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--gray-100)] text-[10px] font-bold text-[var(--gray-600)] border border-[var(--border-light)]">{i + 1}</span>
                <span className="text-sm font-medium text-[var(--gray-700)]">{step.stage}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--gray-500)]">{step.count.toLocaleString()}</span>
                <span className="min-w-[48px] rounded-md border border-[var(--border-light)] bg-[var(--gray-50)] px-2 py-0.5 text-center text-xs font-bold text-[var(--gray-700)]">{step.rate}</span>
              </div>
            </div>
            <div className="h-8 w-full rounded-md bg-[var(--gray-100)] overflow-hidden border border-[var(--border-light)]">
              <div className="h-full rounded-md transition-all duration-700 ease-out flex items-center justify-end pr-3" style={{ width: `${widthPct}%`, backgroundColor: step.color }}>
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
    { label: "LinkedIn Recruiter", value: 42, color: "var(--accent)" },
    { label: "Employee Referrals", value: 28, color: "var(--status-green-text)" },
    { label: "Job Boards (Indeed/ZipRecruiter)", value: 18, color: "var(--status-amber-text)" },
    { label: "Direct Applications", value: 8, color: "#8b5cf6" },
    { label: "Agency Partners", value: 4, color: "#ec4899" },
  ], []);

  const funnelSteps = useMemo(() => [
    { stage: "Applications Received", count: 1240, rate: "100%", color: "var(--accent)" },
    { stage: "Recruiter Screen", count: 620, rate: "50%", color: "#6366f1" },
    { stage: "Hiring Manager Review", count: 310, rate: "25%", color: "#8b5cf6" },
    { stage: "Interview Stage", count: 155, rate: "12.5%", color: "#a855f7" },
    { stage: "Offer Extended", count: 52, rate: "4.2%", color: "#c084fc" },
    { stage: "Placement", count: 41, rate: "3.3%", color: "var(--status-green-text)" },
  ], []);

  const totalOpenJobs = JOB_ORDERS.filter((j) => j.status !== "filled").length;
  const totalCandidates = CANDIDATE_RECORDS.length;

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8 bg-[var(--background)] min-h-screen">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--gray-900)]">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-[var(--gray-500)]">Performance metrics, pipeline health, and recruitment insights</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-[var(--border)] bg-[var(--surface)] text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-50)]">
                <CalendarIcon className="h-4 w-4 text-[var(--gray-400)]" />
                {dateRange}
                <ChevronDown className="h-3.5 w-3.5 text-[var(--gray-400)]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[var(--surface)] border-[var(--border)]">
              {["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year", "All Time"].map((range) => (
                <DropdownMenuItem key={range} onClick={() => setDateRange(range)} className="text-sm cursor-pointer cursor-pointer hover:bg-[var(--gray-50)] focus:bg-[var(--gray-50)]">{range}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2 border-[var(--border)] bg-[var(--surface)] text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-50)]">
            <Printer className="h-4 w-4 text-[var(--gray-400)]" /> Print
          </Button>
          <Button size="sm" className="gap-2 bg-[var(--accent)] text-white cursor-pointer hover:bg-[var(--accent-hover)]">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* ---- KPI Stat Cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$450.2K", change: "+12.5%", trend: "up" as const, icon: DollarSign, iconBg: "bg-[var(--status-blue-bg)]", iconColor: "text-[var(--status-blue-text)]" },
          { title: "Placements", value: "103", change: "+8.2%", trend: "up" as const, icon: Briefcase, iconBg: "bg-[var(--status-green-bg)]", iconColor: "text-[var(--status-green-text)]" },
          { title: "Avg Time to Fill", value: "18 days", change: "-3.1 days", trend: "up" as const, icon: Clock, iconBg: "bg-[var(--gray-100)]", iconColor: "text-[var(--gray-600)]" },
          { title: "Fill Rate", value: "87%", change: "-2.4%", trend: "down" as const, icon: Users, iconBg: "bg-[var(--status-amber-bg)]", iconColor: "text-[var(--status-amber-text)]" },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition-all shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 rounded bg-[var(--gray-50)] border border-[var(--border-light)] px-2 py-0.5 text-xs font-semibold ${kpi.trend === "up" ? "text-[var(--status-green-text)]" : "text-[var(--status-red-text)]"}`}>
                {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold tracking-tight text-[var(--gray-900)]">{kpi.value}</h3>
              <p className="text-sm font-medium text-[var(--gray-500)] mt-0.5">{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Revenue & Placement Trend Charts ---- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <h3 className="text-base font-semibold text-[var(--gray-900)]">Revenue Trend</h3>
              <p className="text-xs text-[var(--gray-500)] mt-1">Monthly revenue over the past 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded bg-[var(--gray-50)] border border-[var(--border-light)] px-2 py-1 text-xs font-semibold text-[var(--status-green-text)]">
              <TrendingUp className="h-3 w-3" /> +18.3% YoY
            </div>
          </div>
          <div className="p-4">
            <LineChart data={revenueData} color="var(--accent)" id="revenue" height={260} />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <h3 className="text-base font-semibold text-[var(--gray-900)]">Placement Trend</h3>
              <p className="text-xs text-[var(--gray-500)] mt-1">Monthly placements over the past 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded bg-[var(--gray-50)] border border-[var(--border-light)] px-2 py-1 text-xs font-semibold text-[var(--status-green-text)]">
              <TrendingUp className="h-3 w-3" /> +22.1% YoY
            </div>
          </div>
          <div className="p-4">
            <LineChart data={placementData} color="var(--status-green-text)" id="placements" height={260} />
          </div>
        </div>
      </div>

      {/* ---- Source Effectiveness & Pipeline Funnel ---- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h3 className="text-base font-semibold text-[var(--gray-900)]">Source Effectiveness</h3>
            <p className="mt-1 text-xs text-[var(--gray-500)]">Candidate sourcing channels ranked by placement conversion</p>
          </div>
          <div className="px-6 py-5">
            <HorizontalBarChart data={sourceData} />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h3 className="text-base font-semibold text-[var(--gray-900)]">Recruitment Pipeline Funnel</h3>
            <p className="mt-1 text-xs text-[var(--gray-500)]">Conversion rates across each hiring stage</p>
          </div>
          <div className="px-6 py-5">
            <PipelineFunnel steps={funnelSteps} />
          </div>
        </div>
      </div>

      {/* ---- Summary Footer ---- */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">Active Orders</p>
              <p className="text-lg font-bold text-[var(--gray-900)] mt-1">{totalOpenJobs}</p>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">Candidates</p>
              <p className="text-lg font-bold text-[var(--gray-900)] mt-1">{totalCandidates}</p>
            </div>
            <div className="h-8 w-px bg-[var(--border)]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">Reports</p>
              <p className="text-lg font-bold text-[var(--gray-900)] mt-1">{REPORTS.length}</p>
            </div>
          </div>
          <p className="text-xs text-[var(--gray-400)]">Data refreshed automatically. Last update: just now.</p>
        </div>
      </div>
    </div>
  );
}