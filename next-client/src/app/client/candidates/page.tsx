"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Section } from "@/components/client/cards";
import { CANDIDATE_RECORDS } from "@/data/recruiter";
import { Download, Filter, MessageSquare, ThumbsUp, ThumbsDown, UserCheck, Search, Users } from "lucide-react";

type Decision = "none" | "approve" | "reject" | "follow-up";

export default function ClientCandidatesPage() {
  const [stage, setStage] = useState("all");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const list = useMemo(() => CANDIDATE_RECORDS, []);
  const filtered = useMemo(() => list.filter((c) => stage === "all" || c.stage.toLowerCase().includes(stage)), [list, stage]);

  const setDecision = (id: string, d: Decision) => setDecisions((prev) => ({ ...prev, [id]: d }));
  const setNote = (id: string, v: string) => setFeedback((prev) => ({ ...prev, [id]: v }));

  return (
    <div className="mx-auto w-full max-w-7xl px-8 pb-20 pt-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates</h1>
          <p className="text-slate-500 mt-1">Review profiles, provide feedback, and make hiring decisions.</p>
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
        title="Submitted Candidates"
        subtitle="Approve for interview, reject, or request follow-up"
        icon={<Users className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="all">All stages</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="feedback">Client Feedback</option>
            </select>
          </div>
        }
      >
        <div className="px-5 pb-6">
          <DataTable
            columns={[
              { key: "name", label: "Candidate Profile" },
              { key: "role", label: "Role", className: "px-3" },
              { key: "stage", label: "Current Stage", className: "px-3" },
              { key: "actions", label: "Feedback & Actions", className: "px-3 text-right" },
            ]}
            rows={filtered.map((c) => ({
              name: (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="font-medium">Availability:</span> {c.availability}
                    </div>
                  </div>
                </div>
              ),
              role: <span className="text-slate-700 font-medium">{c.role}</span>,
              stage: (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.stage === 'Interview' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    c.stage === 'Offer' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                  {c.stage}
                </span>
              ),
              actions: (
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className={`h-8 gap-1.5 border-slate-200 ${decisions[c.id] === 'approve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'}`} onClick={() => setDecision(c.id, "approve")}>
                      <ThumbsUp className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className={`h-8 gap-1.5 border-slate-200 ${decisions[c.id] === 'reject' ? 'bg-red-50 text-red-700 border-red-200' : 'text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200'}`} onClick={() => setDecision(c.id, "reject")}>
                      <ThumbsDown className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white" onClick={() => alert("Downloading resume…")}>
                      <Download className="h-3.5 w-3.5" /> Resume
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        value={feedback[c.id] || ""}
                        onChange={(e) => setNote(c.id, e.target.value)}
                        placeholder="Add note..."
                        className="h-8 w-48 rounded-md border border-slate-200 px-3 pl-8 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all focus:w-64"
                      />
                    </div>
                  </div>
                  {decisions[c.id] && decisions[c.id] !== "none" && (
                    <div className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Decision recorded: <span className="font-bold text-slate-700 uppercase">{decisions[c.id]}</span>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        </div>
      </Section>
    </div>
  );
}
