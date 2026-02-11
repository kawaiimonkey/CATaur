"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, Section } from "@/components/client/cards";
import { JOB_ORDERS } from "@/data/recruiter";
import { BriefcaseBusiness, Search, Filter, Plus } from "lucide-react";

export default function ClientOrdersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-8 pb-20 pt-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Orders</h1>
          <p className="text-slate-500 mt-1">Manage your open positions and track applicant status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200">
            <Plus className="h-4 w-4" /> Request New Role
          </Button>
        </div>
      </div>

      <Section
        title="Active Job Orders"
        subtitle="All open positions"
        icon={<BriefcaseBusiness className="h-5 w-5" />}
        action={
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        }
      >
        <DataTable
          columns={[
            { key: "title", label: "Role Details" },
            { key: "status", label: "Status", className: "px-3" },
            { key: "id", label: "Req ID", className: "px-3" },
            { key: "applicants", label: "Candidates", className: "px-3" },
            { key: "actions", label: "Action", className: "px-3 text-right" },
          ]}
          rows={JOB_ORDERS.map((o) => ({
            title: (
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{o.title}</span>
                <span className="text-xs text-slate-500">{o.location} · {o.tags.slice(0, 2).join(", ")}</span>
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
            id: <span className="font-mono text-xs text-slate-500">{o.id}</span>,
            applicants: <span className="font-medium text-slate-700">{o.applicants}</span>,
            actions: (
              <div className="text-right">
                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white" asChild>
                  <Link href={`/client/orders/${encodeURIComponent(o.id)}`}>View Details</Link>
                </Button>
              </div>
            ),
          }))}
        />
      </Section>
    </div>
  );
}
