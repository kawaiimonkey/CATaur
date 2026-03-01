"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { JOB_ORDERS, CANDIDATE_RECORDS, CLIENTS, type JobOrder } from "@/data/recruiter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Building2, MapPin, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";

function toCreatedAndAgeFromId(id: string) {
  const digits = parseInt(id.replace(/\D/g, "")) || 1;
  const ageDays = (digits % 180) + 1; // 1..180 days
  const created = new Date(Date.now() - ageDays * 86400000);
  const mm = String(created.getMonth() + 1).padStart(2, "0");
  const dd = String(created.getDate()).padStart(2, "0");
  const yy = String(created.getFullYear()).slice(-2);
  return { created: `${mm}-${dd}-${yy}`, ageDays };
}

type JobOrderExtra = JobOrder & {
  department?: string;
  salary?: string;
  type?: string;
  workArrangement?: string;
  description?: string;
  notes?: string;
};

export default function JobOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [localJob, setLocalJob] = useState<JobOrderExtra | null>(null);
  const job = useMemo<JobOrderExtra | null>(() => {
    return JOB_ORDERS.find((j) => j.id === id) || localJob || null;
  }, [id, localJob]);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("ADDED_JOB_ORDERS");
      if (raw) {
        const arr = JSON.parse(raw) as JobOrderExtra[];
        const found = arr.find((j) => j.id === id);
        if (found) setLocalJob(found);
      }
    } catch { }
  }, [id]);

  if (!job) return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--gray-600)] shadow-[var(--shadow-sm)]">Job order not found.</div>
    </div>
  );

  const { created, ageDays } = toCreatedAndAgeFromId(job.id);
  const candidates = CANDIDATE_RECORDS.slice(0, 12);
  const company = CLIENTS.find((c) => c.company === job.client);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      <div className="text-sm text-[var(--gray-500)] flex items-center gap-2">
        <Link href="/recruiter/job-orders" className="cursor-pointer hover:text-[var(--accent)] transition">Job Orders</Link>
        <span className="text-[var(--gray-300)]">/</span>
        <span className="text-[var(--gray-800)] font-medium">{job.title}</span>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] px-6 py-5 gap-4 bg-[var(--surface)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--gray-900)] tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-[var(--gray-500)]">
              <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{job.client}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="border-[var(--border)] text-[var(--gray-700)] bg-[var(--surface)] cursor-pointer hover:bg-[var(--gray-50)] shadow-sm">Edit</Button>
            <Button size="sm" className="bg-[var(--accent)] text-white shadow-sm cursor-pointer hover:bg-[var(--accent-hover)]">Generate Report</Button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[var(--gray-900)] mb-5 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[var(--gray-400)]" />
                Job Order Details
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm text-[var(--gray-700)] md:grid-cols-3">
                <div>
                  <span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Company</span>
                  <Link href={`/recruiter/clients/${encodeURIComponent(job.client)}`} className="text-[var(--accent)] hover:underline font-semibold">{job.client}</Link>
                </div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">ID</span><span className="font-mono bg-[var(--gray-50)] border border-[var(--border-light)] px-1.5 py-0.5 rounded text-xs text-[var(--gray-700)] font-medium">{job.id}</span></div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Status</span>
                  <span className="capitalize font-semibold text-[var(--gray-800)]">{job.status}</span>
                </div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Type</span><span className="font-medium text-[var(--gray-800)]">{job.type || "Full-time"}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Location</span><span className="font-medium text-[var(--gray-800)]">{job.location}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Arrangement</span><span className="font-medium text-[var(--gray-800)]">{job.workArrangement || "Remote"}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Department</span><span className="font-medium text-[var(--gray-800)]">{job.department || "—"}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Salary</span><span className="font-medium text-[var(--gray-800)]">{job.salary || "—"}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Openings</span><span className="font-medium text-[var(--gray-800)]">{job.openings}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Created</span><span className="font-medium text-[var(--gray-800)]">{created}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Days Open</span><span className="font-medium text-[var(--gray-800)]">{ageDays}</span></div>
                <div><span className="text-[11px] font-bold text-[var(--gray-400)] uppercase tracking-wider block mb-1">Owner</span><span className="font-medium text-[var(--gray-800)]">Allan Jones</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-[var(--gray-900)]">Description</h3>
              <div className="rounded-md border border-[var(--border-light)] text-sm text-[var(--gray-800)] overflow-hidden">
                <div className="min-h-[150px] prose prose-sm prose-blue dark:prose-invert max-w-none px-5 py-4">
                  <ReactMarkdown>{job.description || "*No description provided yet.*"}</ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-[var(--gray-900)]">Internal Notes</h3>
              <div className="rounded-md bg-[var(--gray-50)] border border-[var(--border-light)] p-5 text-sm text-[var(--gray-700)] whitespace-pre-wrap leading-relaxed">
                {job.notes || "Key stakeholders aligned. Offer band confirmed."}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h3 className="mb-5 text-base font-bold text-[var(--gray-900)]">Company Profile</h3>
              <div className="text-sm text-[var(--gray-700)]">
                <div className="mb-3 font-bold text-[var(--gray-900)] text-base">
                  <Link href={`/recruiter/clients/${encodeURIComponent(job.client)}`} className="cursor-pointer hover:text-[var(--accent)] transition">{job.client}</Link>
                </div>
                <ul className="space-y-3">
                  <li className="flex justify-between items-start"><span className="text-[var(--gray-500)] font-medium">Industry</span><span className="font-semibold text-[var(--gray-900)]">{company?.industry ?? "—"}</span></li>
                  <li className="flex justify-between items-start"><span className="text-[var(--gray-500)] font-medium">Open roles</span><span className="font-semibold text-[var(--gray-900)]">{company?.openRoles ?? 0}</span></li>
                  <li className="flex justify-between items-start"><span className="text-[var(--gray-500)] font-medium">Primary contact</span><span className="font-semibold text-[var(--gray-900)] text-right">{company?.contact ?? "—"}</span></li>
                  <li className="flex justify-between items-start"><span className="text-[var(--gray-500)] font-medium">Satisfaction</span><span className="font-semibold text-[var(--gray-900)]">{company?.satisfaction ?? "—"}</span></li>
                  <li className="flex justify-between items-start"><span className="text-[var(--gray-500)] font-medium">Last review</span><span className="font-semibold text-[var(--gray-900)]">{company?.lastReview ?? "—"}</span></li>
                </ul>
                <div className="mt-6">
                  <Button size="sm" variant="outline" className="w-full border-[var(--border)] text-[var(--gray-700)] bg-[var(--surface)] font-semibold cursor-pointer hover:bg-[var(--gray-50)] shadow-sm" asChild>
                    <Link href={`/recruiter/clients/${encodeURIComponent(job.client)}`}>View company profile</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h3 className="mb-5 text-base font-bold text-[var(--gray-900)]">Pipeline Status</h3>
              <div className="space-y-3 text-sm text-[var(--gray-700)]">
                <div className="flex items-center justify-between font-semibold"><span>Applicants</span><span className="text-[var(--gray-900)]">{job.applicants}</span></div>
                <div className="h-2.5 rounded-full bg-[var(--gray-100)] overflow-hidden border border-[var(--border-light)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: "75%" }} />
                </div>
                <div className="flex justify-between text-xs font-medium text-[var(--gray-500)] mt-1.5">
                  <span>0</span>
                  <span>Target: {job.openings * 10}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-[var(--gray-900)]">Attachments</h3>
              <p className="text-sm text-[var(--gray-500)] font-medium leading-relaxed">No attachments. Add during migration.</p>
              <div className="mt-5">
                <Button size="sm" variant="outline" className="w-full border-[var(--border)] font-semibold text-[var(--gray-700)] bg-[var(--surface)] cursor-pointer shadow-sm hover:bg-[var(--gray-50)]">Add Attachment</Button>
              </div>
            </div>
          </aside>
        </div>

        <div className="border-t border-[var(--border)]">
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--gray-50)]">
            <h2 className="text-base font-bold text-[var(--gray-900)]">Candidates in Job Order</h2>
            <div className="relative max-w-sm w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]" />
              <input type="text" placeholder="Search candidates..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] shadow-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] focus:border-[var(--accent)] transition text-[var(--gray-900)] placeholder:text-[var(--gray-400)]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans whitespace-nowrap">
              <thead className="bg-[var(--gray-50)] text-[11px] font-bold uppercase tracking-wider text-[var(--gray-500)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Added</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] text-sm text-[var(--gray-700)] bg-[var(--surface)]">
                {candidates.map((c) => {
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-[var(--gray-50)] transition-colors group">
                      <td className="px-6 py-4 font-semibold text-[var(--gray-900)] group-hover:text-[var(--accent)] transition-colors">{c.name}</td>
                      <td className="px-6 py-4 font-medium text-[var(--gray-500)]">{c.lastContact}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-[var(--gray-100)] px-2.5 py-1 rounded text-xs text-[var(--gray-700)] font-semibold capitalize border border-[var(--border-light)]">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--gray-500)] overflow-hidden text-ellipsis max-w-[200px]">Auto-imported · demo</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

