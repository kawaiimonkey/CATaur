"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/client/cards";
import { JOB_ORDERS, CANDIDATE_RECORDS } from "@/data/recruiter";
import { ArrowLeft, Download, ListChecks, Users, Clock, MapPin, Building2, Send } from "lucide-react";

export default function ClientOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const job = JOB_ORDERS.find((j) => j.id === id);
  const [note, setNote] = useState("");

  const candidates = useMemo(
    () => CANDIDATE_RECORDS.filter((c) => c.role === job?.title),
    [job?.title],
  );

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-7xl px-8 pb-20 pt-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Job order not found.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-8 pb-24 pt-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link href="/client/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${(job.status === 'sourcing' || job.status === 'interview' || job.status === 'offer')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {job.client}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
            <span className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{job.id}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white">
            Edit Requirements
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200">
            Close Position
          </Button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Left Column: Details & Progress */}
        <div className="lg:col-span-2 space-y-8">
          <Section title="Recruitment Progress" subtitle="Current stage status" icon={<ListChecks className="h-5 w-5" />}>
            <div className="p-6">
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                <div className="relative z-10 grid grid-cols-4 gap-4">
                  {[
                    "Sourcing",
                    "Interview",
                    "Offer",
                    "Filled",
                  ].map((stage, idx) => {
                    const activeIdx = ["sourcing", "interview", "offer", "filled"].indexOf(job.status || "sourcing");
                    const isActive = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;
                    return (
                      <div key={stage} className="text-center">
                        <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all duration-300 ${isActive
                          ? "bg-indigo-600 border-indigo-50 text-white shadow-md shadow-indigo-200"
                          : "bg-white border-slate-200 text-slate-400"
                          }`}>
                          {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />}
                        </div>
                        <div className={`mt-3 text-xs font-semibold uppercase tracking-wider ${isActive ? "text-indigo-700" : "text-slate-400"}`}>
                          {stage}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Last updated {job.updatedAt || "today"}
              </div>
              <Link href="/client/candidates" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View detailed timeline</Link>
            </div>
          </Section>

          <Section title="Submitted Candidates" subtitle={`${candidates.length} candidates for review`} icon={<Users className="h-5 w-5" />}>
            <div className="divide-y divide-slate-50">
              {candidates.length === 0 && (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">No candidates submitted yet.</div>
              )}
              {candidates.map((c) => (
                <div key={c.id} className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80">
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className={`font-medium ${c.stage === 'Interview' ? 'text-indigo-600' : 'text-slate-600'}`}>{c.stage}</span>
                      <span>•</span>
                      <span>Available: {c.availability}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-white" onClick={() => alert("Downloading resume…")}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />Resume
                    </Button>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => alert("Requested follow-up interview.")}>
                      Request Follow-up
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Right Column: Chat/Notes */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-indigo-50/50 px-5 py-4 border-b border-indigo-100">
              <h3 className="font-bold text-slate-900 text-sm">Notes to Recruiter</h3>
            </div>
            <div className="p-5">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share feedback, new requirements, or questions..."
                className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => { setNote(""); alert("Feedback sent to recruiter."); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  Send Feedback <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Job Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Openings</dt>
                <dd className="font-medium text-slate-900">{job.openings}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Salary Range</dt>
                <dd className="font-medium text-slate-900">{job.salary || "$120k - $150k"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-2">Technicals</dt>
                <dd className="flex flex-wrap gap-2">
                  {job.tags.map((t) => (
                    <span key={t} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200">{t}</span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>

      </div>
    </div>
  );
}
