"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Section } from "@/components/client/cards";
import { CANDIDATE_RECORDS } from "@/data/recruiter";
import { FileCheck2, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";

export default function ClientDecisionsPage() {
  const offers = useMemo(() => CANDIDATE_RECORDS.filter((c) => c.stage.toLowerCase().includes("offer")), []);
  const [decision, setDecision] = useState<Record<string, "make-offer" | "decline" | "hold" | undefined>>({});

  return (
    <div className="mx-auto w-full max-w-7xl px-8 pb-20 pt-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Decisions</h1>
          <p className="text-slate-500 mt-1">Approve, decline, or place candidates on hold for final offers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <Section
        title="Pending Decisions"
        subtitle="Candidates awaiting offer confirmation"
        icon={<FileCheck2 className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="all">All Roles</option>
              <option value="fe">Frontend Engineer</option>
              <option value="be">Backend Engineer</option>
            </select>
          </div>
        }
      >
        <div className="px-5 pb-6">
          {offers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No pending decisions found.</div>
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Candidate" },
                { key: "role", label: "Role", className: "px-3" },
                { key: "status", label: "Status", className: "px-3" },
                { key: "actions", label: "Action", className: "px-3 text-right" },
              ]}
              rows={offers.map((c) => ({
                name: (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Recommended by Recruiter</div>
                    </div>
                  </div>
                ),
                role: <span className="text-slate-700 font-medium">{c.role}</span>,
                status: (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
                    {c.stage}
                  </span>
                ),
                actions: (
                  <div className="flex items-center justify-end gap-2">
                    {decision[c.id] ? (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${decision[c.id] === 'make-offer' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          decision[c.id] === 'decline' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                        {decision[c.id] === 'make-offer' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {decision[c.id] === 'decline' && <XCircle className="h-3.5 w-3.5" />}
                        {decision[c.id] === 'hold' && <Clock className="h-3.5 w-3.5" />}
                        {decision[c.id]?.replace('-', ' ').toUpperCase()}
                      </div>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 bg-white" onClick={() => setDecision((d) => ({ ...d, [c.id]: "make-offer" }))}>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Make Offer
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 bg-white" onClick={() => setDecision((d) => ({ ...d, [c.id]: "decline" }))}>
                          Decline
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 bg-white" onClick={() => setDecision((d) => ({ ...d, [c.id]: "hold" }))}>
                          Hold
                        </Button>
                      </>
                    )}
                  </div>
                ),
              }))}
            />
          )}

          {Object.keys(decision).length > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-indigo-900">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Clock className="h-4 w-4" />
                </div>
                <p>You have unsaved changes. Decisions are currently simulated.</p>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => alert("Decisions submitted successfully!")}>
                Submit Decisions
              </Button>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
