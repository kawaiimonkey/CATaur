"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, GradientCard, Section } from "@/components/client/cards";
import { JOB_ORDERS, CANDIDATE_RECORDS } from "@/data/recruiter";
import {
  BarChart2,
  BriefcaseBusiness,
  Download,
  FileCheck2,
  FileText,
  Sparkles,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const KPI = [
  { label: "Active Roles", value: String(JOB_ORDERS.filter(j => j.status !== 'filled').length), icon: BriefcaseBusiness },
  { label: "Submitted Candidates", value: String(CANDIDATE_RECORDS.length), icon: Users },
  { label: "Pending Decisions", value: "3", icon: FileCheck2 },
];

export default function ClientDashboard() {
  const kpiGradients = [
    "bg-gradient-to-br from-indigo-500 to-violet-600",
    "bg-gradient-to-br from-violet-600 to-purple-600",
    "bg-gradient-to-br from-fuchsia-600 to-pink-600",
  ];

  const recentCandidates = CANDIDATE_RECORDS.slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-8 pb-20 pt-10">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-xl shadow-indigo-100/50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-white" />
        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-indigo-600 border border-indigo-100">
                  Client Portal
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 mt-1">Here's what's happening with your hiring pipeline today.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 w-full md:w-auto">
            {KPI.map((k, i) => (
              <GradientCard
                key={k.label}
                title={k.value}
                subtitle={k.label}
                accent={kpiGradients[i % kpiGradients.length]}
                icon={k.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Job Orders Section */}
        <Section
          title="Active Job Orders"
          subtitle="Monitor status and applicant flow"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          action={
            <Button variant="outline" size="sm" className="h-8 gap-1 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200" asChild>
              <Link href="/client/orders">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <DataTable
            columns={[
              { key: "title", label: "Role & Location" },
              { key: "status", label: "Status", className: "px-3" },
              { key: "applicants", label: "Candidates", className: "px-3" },
              { key: "actions", label: "Action", className: "px-3 text-right" },
            ]}
            rows={JOB_ORDERS.slice(0, 5).map((o) => ({
              title: (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{o.title}</span>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{o.id} · {o.location}</span>
                </div>
              ),
              status: (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${(o.status === 'sourcing' || o.status === 'interview' || o.status === 'offer')
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                  {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                </span>
              ),
              applicants: (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{o.applicants}</span>
                </div>
              ),
              actions: (
                <div className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" asChild>
                    <Link href={`/client/orders/${encodeURIComponent(o.id)}`}>Details</Link>
                  </Button>
                </div>
              ),
            }))}
          />
        </Section>

        <div className="space-y-8">
          {/* Quick Actions */}
          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" /> Quick Actions
            </h3>
            <div className="grid gap-3">
              <Link href="/client/candidates" className="group flex items-center justify-between rounded-xl border border-white bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">Approve Interview</h4>
                    <p className="text-xs text-slate-500">Move candidates to next stage</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </Link>

              <Link href="/client/candidates" className="group flex items-center justify-between rounded-xl border border-white bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">Provide Feedback</h4>
                    <p className="text-xs text-slate-500">Review interview notes</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </Link>
            </div>
          </section>

          {/* Submitted Candidates */}
          <Section
            title="Recent Candidates"
            subtitle="Latest submissions for review"
            icon={<Users className="h-5 w-5" />}
            action={
              <Link href="/client/candidates" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View All
              </Link>
            }
          >
            <div className="divide-y divide-slate-50">
              {recentCandidates.map((c) => (
                <div key={c.id} className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{c.role}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-xs font-medium text-indigo-600">{c.stage}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200" title="Download Resume">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs shadow-sm shadow-indigo-200" asChild>
                      <Link href="/client/candidates">Review</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
