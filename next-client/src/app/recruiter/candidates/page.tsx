"use client";

import Link from "next/link";
import { useState, useMemo, useRef } from "react";
import {
  CANDIDATE_RECORDS,
  JOB_ORDERS,
  type ApplicationStatus,
  type CandidateRecord,
} from "@/data/recruiter";
import {
  Search,
  MapPin,
  X,
  UserPlus,
  CalendarClock,
  BadgeDollarSign,
  XCircle,
  Users,
  ChevronDown,
  AlertCircle,
  Mail,
  Briefcase,
  Plus,
  Upload,
  FileUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/* ─── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badge: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  new: { label: "New", badge: "border-l-[var(--status-blue-text)] text-[var(--status-blue-text)] bg-[var(--status-blue-bg)]", Icon: UserPlus },
  interview: { label: "Interview", badge: "border-l-[var(--status-amber-text)] text-[var(--status-amber-text)] bg-[var(--status-amber-bg)]", Icon: CalendarClock },
  offer: { label: "Offer", badge: "border-l-[var(--status-green-text)] text-[var(--status-green-text)] bg-[var(--status-green-bg)]", Icon: BadgeDollarSign },
  closed: { label: "Closed", badge: "border-l-[var(--gray-400)] text-[var(--gray-500)] bg-[var(--gray-100)]", Icon: XCircle },
};

const STATUS_ORDER: ApplicationStatus[] = ["new", "interview", "offer", "closed"];

// Coloring for the styled status select dropdown
const STATUS_SELECT: Record<ApplicationStatus, { bg: string; text: string }> = {
  new: { bg: "var(--status-blue-bg)", text: "var(--status-blue-text)" },
  interview: { bg: "var(--status-amber-bg)", text: "var(--status-amber-text)" },
  offer: { bg: "var(--status-green-bg)", text: "var(--status-green-text)" },
  closed: { bg: "var(--gray-100)", text: "var(--gray-500)" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}
function toPhone(id: string) {
  const n = parseInt(id.replace(/\D/g, "")) || 1;
  const area = 400 + (n % 500);
  const mid = 200 + ((n * 3) % 800);
  const last = 1000 + ((n * 7) % 9000);
  return `(${area}) ${mid}-${last}`;
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-r border-l-[3px] px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Filter Tab ────────────────────────────────────────────────────────── */
function FilterTab({ label, count, active, Icon, onClick }: {
  label: string; count: number; active: boolean;
  Icon: React.ComponentType<{ className?: string }>; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors ${active
        ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)]"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      <span className={`ml-auto text-xs font-semibold ${active ? "text-[var(--accent)]" : "text-[var(--gray-400)]"}`}>{count}</span>
    </button>
  );
}

/* ─── Confirm Dialog ────────────────────────────────────────────────────── */
function ConfirmStatusDialog({ candidate, newStatus, onConfirm, onCancel }: {
  candidate: CandidateRecord; newStatus: ApplicationStatus;
  onConfirm: () => void; onCancel: () => void;
}) {
  const cfg = STATUS_CONFIG[newStatus];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Confirm Status Change</h3>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Move <span className="font-medium text-[var(--gray-700)]">{candidate.name}</span> to{" "}
              <StatusBadge status={newStatus} />?
            </p>
            {newStatus === "interview" && <p className="mt-2 text-xs text-[var(--gray-400)]">You'll be prompted to compose an interview invitation email.</p>}
            {newStatus === "offer" && <p className="mt-2 text-xs text-[var(--gray-400)]">You'll be prompted to send an offer notification email.</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Email notice ──────────────────────────────────────────────────────── */
function EmailNotice() {
  return (
    <div className="flex items-center gap-2 rounded-md bg-[var(--status-blue-bg)] px-3 py-2 text-xs text-[var(--status-blue-text)]">
      <Mail className="h-3.5 w-3.5 shrink-0" />
      An email will be sent to the candidate simultaneously.
    </div>
  );
}

/* ─── Interview Modal ───────────────────────────────────────────────────── */
interface InterviewDraft {
  candidateId: string; candidateName: string; jobTitle: string;
  subject: string; type: "Zoom" | "Phone" | "Onsite"; date: string; time: string; content: string;
}

function InterviewModal({ draft, onChange, onSend, onClose }: {
  draft: InterviewDraft; onChange: (d: Partial<InterviewDraft>) => void;
  onSend: () => void; onClose: () => void;
}) {
  const inp = "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Send Interview Invitation</h3>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">To: <span className="font-medium text-[var(--gray-700)]">{draft.candidateName}</span> · {draft.jobTitle}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] transition"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <EmailNotice />
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--gray-500)]">Subject</label>
            <input type="text" className={inp} value={draft.subject} onChange={(e) => onChange({ subject: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--gray-500)]">Type</label>
              <select className={inp} value={draft.type} onChange={(e) => onChange({ type: e.target.value as InterviewDraft["type"] })}>
                <option value="Zoom">Zoom</option><option value="Phone">Phone</option><option value="Onsite">Onsite</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--gray-500)]">Date</label>
              <input type="text" className={inp} placeholder="e.g. Mar 10, 2026" value={draft.date} onChange={(e) => onChange({ date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--gray-500)]">Time</label>
              <input type="text" className={inp} placeholder="e.g. 2:30 PM EST" value={draft.time} onChange={(e) => onChange({ time: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--gray-500)]">Message</label>
            <textarea rows={4} className={inp} value={draft.content} onChange={(e) => onChange({ content: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={onSend} className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">Send Invitation</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Offer Modal ───────────────────────────────────────────────────────── */
interface OfferDraft {
  candidateId: string; candidateName: string; jobTitle: string; content: string;
}

function OfferModal({ draft, onChange, onSend, onClose }: {
  draft: OfferDraft; onChange: (d: Partial<OfferDraft>) => void;
  onSend: () => void; onClose: () => void;
}) {
  const inp = "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Send Offer Notification</h3>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">To: <span className="font-medium text-[var(--gray-700)]">{draft.candidateName}</span> · {draft.jobTitle}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] transition"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <EmailNotice />
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--gray-500)]">Message to Candidate</label>
            <textarea rows={5} className={inp} value={draft.content} onChange={(e) => onChange({ content: e.target.value })} />
            <p className="text-[11px] text-[var(--gray-400)]">This is a notification only. No action is required from the candidate at this stage.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={onSend} className="rounded-md bg-[var(--status-green-text)] px-3.5 py-1.5 text-sm font-medium text-white hover:opacity-90 transition">Send Notification</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Candidate Modal ──────────────────────────────────────────────── */
function AddCandidateModal({ activeJobs, onAdd, onClose }: {
  activeJobs: { id: string; title: string }[];
  onAdd: (c: CandidateRecord) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", jobId: activeJobs[0]?.id ?? "", location: "", availability: "" });
  const [resume, setResume] = useState<File | null>(null);
  const inp = "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]";
  const lbl = "text-xs font-medium text-[var(--gray-500)]";
  const valid = form.name.trim() && form.email.trim() && form.phone.trim() && form.jobId;

  const handleSubmit = () => {
    if (!valid) return;
    const job = activeJobs.find(j => j.id === form.jobId);
    const rec: CandidateRecord = {
      id: `CAN-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name.trim(), role: job?.title ?? "—", jobTitle: job?.title ?? "—", jobId: form.jobId,
      status: "new", appliedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: form.location.trim() || "—", availability: form.availability.trim() || "—", lastContact: "Today",
    };
    onAdd(rec);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Add New Candidate</h3>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">Manually add a candidate to the system</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] transition"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className={lbl}>Full Name *</label>
              <input type="text" className={inp} placeholder="e.g. Jane Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Email *</label>
              <input type="email" className={inp} placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Phone *</label>
              <input type="tel" className={inp} placeholder="416-555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className={lbl}>Assign to Job Order *</label>
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gray-400)]" />
              <select className={`${inp} pl-9`} value={form.jobId} onChange={e => setForm(f => ({ ...f, jobId: e.target.value }))}>
                {activeJobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.id})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={lbl}>Location</label>
              <input type="text" className={inp} placeholder="e.g. Toronto, ON" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Availability</label>
              <input type="text" className={inp} placeholder="e.g. 2 weeks" value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className={lbl}>Resume (PDF)</label>
            <label className="flex items-center gap-2 rounded-md border border-dashed border-[var(--gray-300)] px-3 py-3 text-sm text-[var(--gray-500)] cursor-pointer cursor-pointer hover:border-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-50)] transition">
              <FileUp className="h-4 w-4 text-[var(--gray-400)]" />
              {resume ? resume.name : "Click to upload resume…"}
              <input type="file" accept=".pdf" className="hidden" onChange={e => setResume(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={handleSubmit} disabled={!valid}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium text-white transition ${valid ? "bg-[var(--accent)] cursor-pointer hover:bg-[var(--accent-hover)]" : "bg-[var(--gray-300)] cursor-not-allowed"}`}>Add Candidate</button>
        </div>
      </div>
    </div>
  );
}

/* ─── CSV Import Modal ─────────────────────────────────────────────────── */
type CSVRow = { name: string; email: string; phone: string; location: string; availability: string };

function ImportCSVModal({ activeJobs, onImport, onClose }: {
  activeJobs: { id: string; title: string }[];
  onImport: (rows: CandidateRecord[]) => void; onClose: () => void;
}) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [jobId, setJobId] = useState(activeJobs[0]?.id ?? "");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").map(l => l.split(",").map(c => c.trim().replace(/^"|"$/g, "")));
    if (lines.length < 2) return;
    const header = lines[0].map(h => h.toLowerCase());
    const ni = header.findIndex(h => h.includes("name"));
    const ei = header.findIndex(h => h.includes("email"));
    const pi = header.findIndex(h => h.includes("phone"));
    const li = header.findIndex(h => h.includes("location"));
    const ai = header.findIndex(h => h.includes("avail"));
    const parsed: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const c = lines[i];
      if (!c[ni]?.trim()) continue;
      parsed.push({ name: c[ni] ?? "", email: c[ei] ?? "", phone: c[pi] ?? "", location: c[li] ?? "", availability: c[ai] ?? "" });
    }
    setRows(parsed);
    if (parsed.length > 0) setStep("preview");
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };

  const handleConfirm = () => {
    const job = activeJobs.find(j => j.id === jobId);
    const candidates: CandidateRecord[] = rows.map((r) => ({
      id: `CAN-${Math.floor(100 + Math.random() * 900)}`, name: r.name, role: job?.title ?? "—",
      jobTitle: job?.title ?? "—", jobId, status: "new" as ApplicationStatus,
      appliedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: r.location || "—", availability: r.availability || "—", lastContact: "Today",
    }));
    onImport(candidates);
    setStep("done");
  };

  const inp = "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--gray-900)]">Import Candidates from CSV</h3>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">
              {step === "upload" && "Upload a CSV file with candidate data"}
              {step === "preview" && `${rows.length} candidates found in ${fileName}`}
              {step === "done" && "Import completed successfully!"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] transition"><X className="h-4 w-4" /></button>
        </div>

        {step === "upload" && (
          <div className="px-5 py-8">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-14 cursor-pointer transition-colors ${dragOver ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--gray-300)] bg-[var(--gray-50)] cursor-pointer hover:border-[var(--gray-400)]"}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--gray-100)]">
                <Upload className="h-5 w-5 text-[var(--gray-400)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--gray-700)]">Drag & drop your CSV file here</p>
                <p className="text-xs text-[var(--gray-400)] mt-1">or click to browse</p>
              </div>
              <p className="text-[11px] text-[var(--gray-400)]">Expected columns: Name, Email, Phone, Location, Availability</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="px-5 py-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--gray-500)]">Assign all to Job Order *</label>
              <div className="relative max-w-sm">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gray-400)]" />
                <select className={`${inp} pl-9`} value={jobId} onChange={e => setJobId(e.target.value)}>
                  {activeJobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.id})</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-[var(--border)]">
              <div className="hidden sm:grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr] border-b border-[var(--border)] bg-[var(--gray-50)] px-4 py-2">
                {["Name", "Email", "Phone", "Location", "Availability"].map(h => (
                  <span key={h} className="text-[11px] font-medium uppercase tracking-wider text-[var(--gray-400)]">{h}</span>
                ))}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {rows.slice(0, 50).map((r, i) => (
                  <div key={i} className="flex flex-col sm:grid sm:grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr] border-b border-[var(--border-light)] px-4 py-2 last:border-0">
                    <span className="text-sm text-[var(--gray-700)] font-medium truncate">{r.name}</span>
                    <span className="text-sm text-[var(--gray-500)] truncate">{r.email}</span>
                    <span className="text-sm text-[var(--gray-500)] truncate">{r.phone}</span>
                    <span className="text-sm text-[var(--gray-500)] truncate">{r.location || "—"}</span>
                    <span className="text-sm text-[var(--gray-500)] truncate">{r.availability || "—"}</span>
                  </div>
                ))}
              </div>
              {rows.length > 50 && (
                <div className="border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--gray-400)] text-center">
                  … and {rows.length - 50} more
                </div>
              )}
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-14">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-green-bg)]">
              <CheckCircle2 className="h-6 w-6 text-[var(--status-green-text)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--gray-900)]">{rows.length} candidates imported!</p>
            <p className="text-sm text-[var(--gray-500)]">Assigned to <span className="font-medium text-[var(--gray-700)]">{activeJobs.find(j => j.id === jobId)?.title}</span></p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
          {step === "upload" && (
            <button onClick={onClose} className="rounded-md border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          )}
          {step === "preview" && (<>
            <button onClick={() => { setStep("upload"); setRows([]); }} className="rounded-md border border-[var(--border)] px-3.5 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Back</button>
            <button onClick={handleConfirm} className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">
              Import {rows.length} Candidates
            </button>
          </>)}
          {step === "done" && (
            <button onClick={onClose} className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">Done</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function RecruiterCandidatesPage() {
  const [records, setRecords] = useState<CandidateRecord[]>(CANDIDATE_RECORDS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [confirmPending, setConfirmPending] = useState<{ id: string; newStatus: ApplicationStatus } | null>(null);
  const [interviewDraft, setInterviewDraft] = useState<InterviewDraft | null>(null);
  const [offerDraft, setOfferDraft] = useState<OfferDraft | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeJobs = useMemo(() => JOB_ORDERS.filter(j => j.status !== "filled" && j.status !== "paused"), []);

  const counts = useMemo(() => {
    const c: Record<ApplicationStatus, number> = { new: 0, interview: 0, offer: 0, closed: 0 };
    records.forEach((r) => { c[r.status]++; });
    return c;
  }, [records]);

  const filtered = useMemo(() => {
    let rows = [...records];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    if (jobFilter !== "all") rows = rows.filter((r) => r.jobId === jobFilter);
    return rows;
  }, [records, query, statusFilter, jobFilter]);

  useMemo(() => { setCurrentPage(1); }, [query, statusFilter, jobFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, filtered.length);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const handleStatusSelect = (id: string, newStatus: ApplicationStatus) => {
    const current = records.find((r) => r.id === id)!;
    if (current.status === newStatus) return;
    setConfirmPending({ id, newStatus });
  };

  const handleConfirm = () => {
    if (!confirmPending) return;
    const { id, newStatus } = confirmPending;
    setConfirmPending(null);
    if (newStatus === "interview") {
      const rec = records.find((r) => r.id === id)!;
      setInterviewDraft({
        candidateId: id, candidateName: rec.name, jobTitle: rec.jobTitle,
        subject: `Interview Invitation — ${rec.jobTitle}`, type: "Zoom", date: "", time: "",
        content: `Hi ${rec.name.split(" ")[0]}, we'd like to invite you to an interview for the ${rec.jobTitle} role. Please see the details below.`,
      });
    } else if (newStatus === "offer") {
      const rec = records.find((r) => r.id === id)!;
      setOfferDraft({
        candidateId: id, candidateName: rec.name, jobTitle: rec.jobTitle,
        content: `Hi ${rec.name.split(" ")[0]}, we are pleased to inform you that you have been selected for the ${rec.jobTitle} position.`,
      });
    } else { applyStatus(id, newStatus); }
  };

  const applyStatus = (id: string, newStatus: ApplicationStatus, extra?: Partial<CandidateRecord>) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus, ...extra } : r));
  };

  const handleSendInterview = () => {
    if (!interviewDraft) return;
    applyStatus(interviewDraft.candidateId, "interview", {
      interviewMessage: { subject: interviewDraft.subject, type: interviewDraft.type, date: interviewDraft.date, time: interviewDraft.time, content: interviewDraft.content, sentAt: "Just now" },
    });
    setInterviewDraft(null);
  };

  const handleSendOffer = () => { if (!offerDraft) return; applyStatus(offerDraft.candidateId, "offer"); setOfferDraft(null); };

  const confirmCandidate = confirmPending ? records.find((r) => r.id === confirmPending.id) : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">Candidates</h2>
          <p className="mt-0.5 text-sm text-[var(--gray-500)]">Manage applications and track your pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">
            <Plus className="h-4 w-4" /> Add Candidate
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <FilterTab label="All" count={records.length} active={statusFilter === "all"} Icon={Users} onClick={() => setStatusFilter("all")} />
        {STATUS_ORDER.map((s) => (
          <FilterTab key={s} label={STATUS_CONFIG[s].label} count={counts[s]} active={statusFilter === s}
            Icon={STATUS_CONFIG[s].Icon} onClick={() => setStatusFilter((prev) => (prev === s ? "all" : s))} />
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
          <input type="text" placeholder="Search by name or job title…" value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]" />
        </div>
        <div className="relative">
          <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gray-400)]" />
          <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}
            className="h-9 appearance-none rounded-md border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] cursor-pointer">
            <option value="all">All Job Orders</option>
            {activeJobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.id})</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gray-400)]" />
        </div>
        {statusFilter !== "all" && (
          <div className={`flex items-center gap-1.5 rounded-r border-l-[3px] px-2.5 py-1 text-xs font-bold uppercase ${STATUS_CONFIG[statusFilter].badge}`}>
            {STATUS_CONFIG[statusFilter].label}
            <button onClick={() => setStatusFilter("all")} className="ml-1 cursor-pointer hover:opacity-70"><X className="h-3 w-3" /></button>
          </div>
        )}
        {jobFilter !== "all" && (
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] px-2.5 py-1 text-xs font-medium">
            <Briefcase className="h-3 w-3" />
            {activeJobs.find(j => j.id === jobFilter)?.title}
            <button onClick={() => setJobFilter("all")} className="ml-0.5 hover:opacity-70"><X className="h-3 w-3" /></button>
          </div>
        )}
        <p className="ml-auto text-sm text-[var(--gray-400)] hidden sm:block">
          <span className="font-medium text-[var(--gray-600)]">{filtered.length}</span> of <span className="font-medium text-[var(--gray-600)]">{records.length}</span>
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Desktop header */}
        <div className="hidden lg:grid grid-cols-[2fr_2fr_1.2fr_1fr_1fr_1fr] items-center border-b border-[var(--border)] px-5 py-2.5 bg-[var(--gray-50)]">
          {["Candidate", "Applied For", "Status", "Applied", "Location", "Phone"].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-[var(--gray-400)]">
            <Users className="h-7 w-7" />
            <p className="text-sm">No candidates match your filters.</p>
          </div>
        ) : (
          paginatedRows.map((c) => (
            <div key={c.id}
              className={`flex flex-col lg:grid lg:grid-cols-[2fr_2fr_1.2fr_1fr_1fr_1fr] lg:items-center gap-2 lg:gap-4 border-b border-[var(--border-light)] px-5 py-3 transition-colors last:border-0 cursor-pointer hover:bg-[var(--gray-50)] ${c.status === "closed" ? "opacity-55" : ""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gray-200)] text-xs font-semibold text-[var(--gray-600)]">
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <Link href={`/recruiter/candidates/${encodeURIComponent(c.id)}`}
                    className="text-sm font-medium text-[var(--gray-900)] cursor-pointer hover:text-[var(--accent)] transition-colors block truncate">{c.name}</Link>
                  <p className="text-xs text-[var(--gray-400)]">{c.id}</p>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[var(--gray-700)] truncate">{c.jobTitle}</p>
                <p className="text-xs text-[var(--gray-400)]">{c.jobId}</p>
              </div>
              {/* Status — merged colored dropdown */}
              <div className="relative w-fit">
                <select
                  value={c.status}
                  onChange={(e) => handleStatusSelect(c.id, e.target.value as ApplicationStatus)}
                  style={{
                    backgroundColor: STATUS_SELECT[c.status].bg,
                    color: STATUS_SELECT[c.status].text,
                    paddingRight: "1.6rem",
                  }}
                  className="appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors"
                >
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2" style={{ color: STATUS_SELECT[c.status].text }} />
              </div>
              <span className="text-sm text-[var(--gray-500)]">{c.appliedAt}</span>
              <div className="flex items-center gap-1 text-sm text-[var(--gray-500)] min-w-0">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--gray-400)]" />
                <span className="truncate">{c.location}</span>
              </div>
              {/* Phone */}
              <span className="text-sm text-[var(--gray-500)]">{toPhone(c.id)}</span>
            </div>
          ))
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border)] px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-[var(--gray-500)]">
              <span>Rows</span>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="h-7 appearance-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 pr-6 text-xs font-medium text-[var(--gray-600)] cursor-pointer">
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span><span className="font-medium text-[var(--gray-700)]">{startIdx}–{endIdx}</span> of <span className="font-medium text-[var(--gray-700)]">{filtered.length}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={safePage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="flex h-7 w-7 items-center justify-center text-xs text-[var(--gray-400)]">…</span>
                ) : (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md text-xs font-medium transition ${p === safePage
                      ? "bg-[var(--accent)] text-white" : "text-[var(--gray-500)] cursor-pointer hover:bg-[var(--gray-100)]"
                      }`}>{p}</button>
                )
              )}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {confirmPending && confirmCandidate && (
        <ConfirmStatusDialog candidate={confirmCandidate} newStatus={confirmPending.newStatus}
          onConfirm={handleConfirm} onCancel={() => setConfirmPending(null)} />
      )}
      {interviewDraft && (
        <InterviewModal draft={interviewDraft} onChange={(d) => setInterviewDraft((p) => p ? { ...p, ...d } : p)}
          onSend={handleSendInterview} onClose={() => setInterviewDraft(null)} />
      )}
      {offerDraft && (
        <OfferModal draft={offerDraft} onChange={(d) => setOfferDraft((p) => p ? { ...p, ...d } : p)}
          onSend={handleSendOffer} onClose={() => setOfferDraft(null)} />
      )}
      {showAddModal && (
        <AddCandidateModal activeJobs={activeJobs.map(j => ({ id: j.id, title: j.title }))}
          onAdd={(c) => { setRecords((p) => [c, ...p]); setShowAddModal(false); }} onClose={() => setShowAddModal(false)} />
      )}
      {showImportModal && (
        <ImportCSVModal activeJobs={activeJobs.map(j => ({ id: j.id, title: j.title }))}
          onImport={(rows) => setRecords((p) => [...rows, ...p])} onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
