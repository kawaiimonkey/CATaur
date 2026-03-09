"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CANDIDATE_RECORDS,
  type ApplicationStatus,
  type CandidateRecord,
  type ClientDecision,
} from "@/data/recruiter";
import {
  ArrowLeft, Mail, Phone, MapPin, Linkedin, ExternalLink,
  CalendarClock, BadgeDollarSign, X,
  ChevronRight, Clock, CheckCircle2,
  ChevronDown, Briefcase, GraduationCap, Award, FileText,
  Download, Inbox, DollarSign, Target, PenSquare, Save, Check, AlertCircle, MessageCircle,
  Trash2, UserCheck, Globe
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type MessageType = "interview_invite" | "offer_notification";

interface CommunicationEntry {
  id: string; type: MessageType; round?: number;
  subject: string; content: string;
  sender: "recruiter";
  sentAt: string;
  interviewType?: "Zoom" | "Phone" | "Onsite";
  interviewDate?: string; interviewTime?: string;
  confirmed?: boolean;
}

interface WorkExp { role: string; company: string; duration: string; highlights: string[]; }
interface Education { school: string; degree: string; year: string; }
interface Skill { name: string; level: "Expert" | "Intermediate" | "Beginner"; }
interface CandidateProfile {
  email: string; phone: string; linkedin: string;
  targetSalary: string; preferredLocation: string; yearsExp: number;
  summary: string; skills: Skill[]; work: WorkExp[]; education: Education[];
  resumeFile: string; resumeSize: string; resumeUploaded: string;
}

/* ─── Profile builder ─────────────────────────────────────────────────────── */
const SKILL_POOLS: Record<string, Skill[]> = {
  "Backend": [
    { name: "Go", level: "Expert" }, { name: "PostgreSQL", level: "Expert" },
    { name: "Kubernetes", level: "Intermediate" }, { name: "gRPC", level: "Expert" },
    { name: "AWS", level: "Intermediate" }, { name: "Redis", level: "Intermediate" },
    { name: "Docker", level: "Expert" }, { name: "Terraform", level: "Intermediate" },
  ],
  "Frontend": [
    { name: "React", level: "Expert" }, { name: "TypeScript", level: "Expert" },
    { name: "Next.js", level: "Expert" }, { name: "CSS/Tailwind", level: "Intermediate" },
    { name: "GraphQL", level: "Intermediate" }, { name: "Figma", level: "Beginner" },
    { name: "Cypress", level: "Intermediate" },
  ],
  "DevOps": [
    { name: "Kubernetes", level: "Expert" }, { name: "Terraform", level: "Expert" },
    { name: "CI/CD", level: "Expert" }, { name: "AWS", level: "Expert" },
    { name: "Prometheus", level: "Intermediate" }, { name: "Helm", level: "Intermediate" },
    { name: "Python", level: "Intermediate" },
  ],
  "Data": [
    { name: "Python", level: "Expert" }, { name: "SQL", level: "Expert" },
    { name: "Spark", level: "Intermediate" }, { name: "Airflow", level: "Intermediate" },
    { name: "dbt", level: "Intermediate" }, { name: "Snowflake", level: "Intermediate" },
    { name: "TensorFlow", level: "Beginner" },
  ],
  "Security": [
    { name: "Penetration Testing", level: "Expert" }, { name: "SIEM", level: "Expert" },
    { name: "AWS Security", level: "Intermediate" }, { name: "Python", level: "Intermediate" },
    { name: "Compliance (SOC 2)", level: "Intermediate" }, { name: "Incident Response", level: "Expert" },
  ],
  "Mobile": [
    { name: "Swift", level: "Expert" }, { name: "SwiftUI", level: "Expert" },
    { name: "Objective-C", level: "Intermediate" }, { name: "Xcode", level: "Expert" },
    { name: "CoreData", level: "Intermediate" }, { name: "Firebase", level: "Intermediate" },
  ],
  "QA": [
    { name: "Selenium", level: "Expert" }, { name: "Playwright", level: "Expert" },
    { name: "Python", level: "Intermediate" }, { name: "Jest", level: "Intermediate" },
    { name: "CI/CD", level: "Intermediate" }, { name: "JIRA", level: "Expert" },
  ],
};

const COMPANIES = ["Maple Fintech", "Aurora Health", "Shopify", "RBC Ventures", "Hootsuite", "Elastic", "Mattermost", "Cohere", "Wealthsimple", "1Password"];
const SCHOOLS = ["University of Toronto", "University of British Columbia", "McGill University", "Waterloo", "Queen's University", "Concordia"];
const DEGREES = ["B.Sc. Computer Science", "B.Eng. Software Engineering", "M.Sc. Data Science", "M.Eng. Software Engineering", "B.Sc. Mathematics", "B.Comp. Honours"];
const SALARIES = ["CA$140k – CA$160k", "CA$150k – CA$175k", "CA$130k – CA$150k", "CA$160k – CA$185k", "CA$120k – CA$140k"];
const LOCATIONS_PREF = ["Toronto, ON (Hybrid)", "Vancouver, BC (Remote OK)", "Remote · Canada", "Montreal, QC (Onsite)", "Calgary, AB (Hybrid)"];
const SUMMARIES: string[] = [
  "Seasoned engineer with {n}+ years building high-throughput distributed systems. Passionate about clean APIs and developer experience.",
  "Results-driven professional with {n}+ years specializing in scalable cloud infrastructure and modern tooling.",
  "Full-cycle engineer with {n}+ years across early-stage startups and enterprise. Thrives in ambiguous environments.",
  "Technical leader with {n}+ years delivering production-grade software. Strong focus on observability and reliability.",
];

function buildProfile(c: CandidateRecord): CandidateProfile {
  const n = parseInt(c.id.replace(/\D/g, "")) || 700;
  const role = c.role.toLowerCase();
  let pool = SKILL_POOLS["Backend"];
  if (role.includes("frontend") || role.includes("react") || role.includes("next")) pool = SKILL_POOLS["Frontend"];
  else if (role.includes("devops") || role.includes("sre")) pool = SKILL_POOLS["DevOps"];
  else if (role.includes("data") || role.includes("scientist") || role.includes("ml")) pool = SKILL_POOLS["Data"];
  else if (role.includes("security")) pool = SKILL_POOLS["Security"];
  else if (role.includes("mobile") || role.includes("ios") || role.includes("android")) pool = SKILL_POOLS["Mobile"];
  else if (role.includes("qa") || role.includes("test")) pool = SKILL_POOLS["QA"];

  const yrsExp = 4 + (n % 9);
  const handle = c.name.toLowerCase().replace(/[^a-z]/g, ".");

  const work: WorkExp[] = [
    {
      role: c.role,
      company: COMPANIES[n % COMPANIES.length],
      duration: `${2021 - (n % 3)} – Present`,
      highlights: [
        "Led architecture of core platform service handling 2M+ daily requests with 99.9% SLA",
        "Mentored a team of 4 engineers and drove adoption of modern testing practices",
        "Reduced deployment cycle time by 40% by implementing automated CI/CD pipeline",
      ],
    },
    {
      role: c.role.replace("Senior", "").replace("Lead", "").trim() || "Software Engineer",
      company: COMPANIES[(n + 3) % COMPANIES.length],
      duration: `${2018 - (n % 2)} – ${2021 - (n % 3)}`,
      highlights: [
        "Built and shipped core product features used by 10k+ users",
        "Collaborated with design and product on defining technical requirements",
        "Contributed to open-source tooling adopted by the engineering community",
      ],
    },
  ];

  const education: Education[] = [
    { school: SCHOOLS[n % SCHOOLS.length], degree: DEGREES[n % DEGREES.length], year: String(2014 + (n % 5)) },
    { school: SCHOOLS[(n + 2) % SCHOOLS.length], degree: DEGREES[(n + 3) % DEGREES.length], year: String(2016 + (n % 4)) },
  ];

  const summary = SUMMARIES[n % SUMMARIES.length].replace("{n}", String(yrsExp));

  return {
    email: `${handle}@example.com`,
    phone: `${[416, 604, 514, 403, 613, 780, 519][n % 7]}-555-0${100 + (n % 899)}`,
    linkedin: `https://linkedin.com/in/${handle.replace(/\./g, "-")}`,
    targetSalary: SALARIES[n % SALARIES.length],
    preferredLocation: LOCATIONS_PREF[n % LOCATIONS_PREF.length],
    yearsExp: yrsExp,
    summary,
    skills: pool,
    work,
    education,
    resumeFile: `${c.name.replace(" ", "_")}_Resume.pdf`,
    resumeSize: `${180 + (n % 180)} KB`,
    resumeUploaded: c.appliedAt,
  };
}

/* ─── Status config ───────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; badge: string }> = {
  new: { label: "New", badge: "border-l-[var(--status-blue-text)] text-[var(--status-blue-text)] bg-[var(--status-blue-bg)]" },
  interview: { label: "Interview", badge: "border-l-[var(--status-amber-text)] text-[var(--status-amber-text)] bg-[var(--status-amber-bg)]" },
  offer: { label: "Offer", badge: "border-l-[var(--status-green-text)] text-[var(--status-green-text)] bg-[var(--status-green-bg)]" },
  closed: { label: "Closed", badge: "border-l-[var(--gray-400)] text-[var(--gray-500)] bg-[var(--gray-100)]" },
};
const STATUS_ORDER: ApplicationStatus[] = ["new", "interview", "offer", "closed"];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-r border-l-[3px] px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Skill level badge ────────────────────────────────────────────────────── */
const LEVEL_STYLE: Record<string, string> = {
  Expert: "bg-[var(--accent-light)] text-[var(--accent)]",
  Intermediate: "bg-[var(--gray-100)] text-[var(--gray-600)]",
  Beginner: "bg-[var(--gray-50)] text-[var(--gray-400)]",
};

/* ─── Seed messages ────────────────────────────────────────────────────────── */
function seedMessages(c: CandidateRecord): CommunicationEntry[] {
  const msgs: CommunicationEntry[] = [];
  if (c.interviewMessage) {
    msgs.push({
      id: "msg-1", type: "interview_invite", round: 1,
      subject: c.interviewMessage.subject, content: c.interviewMessage.content,
      sender: "recruiter", sentAt: c.interviewMessage.sentAt,
      interviewType: c.interviewMessage.type as "Zoom" | "Phone" | "Onsite",
      interviewDate: c.interviewMessage.date, interviewTime: c.interviewMessage.time,
      confirmed: true,
    });
  }
  return msgs;
}

/* ─── MSG config ───────────────────────────────────────────────────────────── */
const MSG_CONFIG: Record<MessageType, { label: string; iconBg: string; icon: React.ComponentType<{ className?: string }> }> = {
  interview_invite: { label: "Interview Invitation", iconBg: "bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]", icon: CalendarClock },
  offer_notification: { label: "Offer Notification", iconBg: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]", icon: BadgeDollarSign },
};

/* ─── Interview Modal ─────────────────────────────────────────────────────── */
interface InterviewDraft { subject: string; type: "Zoom" | "Phone" | "Onsite"; date: string; time: string; content: string; }

function InterviewModal({ round, candidateName, jobTitle, draft, onChange, onSend, onClose }: {
  round: number; candidateName: string; jobTitle: string;
  draft: InterviewDraft; onChange: (p: Partial<InterviewDraft>) => void;
  onSend: () => void; onClose: () => void;
}) {
  const inp = "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] text-[var(--gray-900)]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--gray-900)]">{round > 1 ? `Send Round ${round} Interview` : "Send Interview Invitation"}</h3>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">To: <span className="font-medium text-[var(--gray-700)]">{candidateName}</span> · {jobTitle}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] transition"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--status-blue-bg)] px-3 py-2 text-xs text-[var(--status-blue-text)]">
            <Mail className="h-3.5 w-3.5 shrink-0" /> An email will be sent to the candidate simultaneously.
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wider">Subject</label>
            <input type="text" className={inp} value={draft.subject} onChange={e => onChange({ subject: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "type", label: "Type", el: <select className={inp} value={draft.type} onChange={e => onChange({ type: e.target.value as InterviewDraft["type"] })}><option>Zoom</option><option>Phone</option><option>Onsite</option></select> },
              { key: "date", label: "Date", el: <input type="text" className={inp} placeholder="e.g. Mar 10, 2026" value={draft.date} onChange={e => onChange({ date: e.target.value })} /> },
              { key: "time", label: "Time", el: <input type="text" className={inp} placeholder="e.g. 2:30 PM EST" value={draft.time} onChange={e => onChange({ time: e.target.value })} /> },
            ].map(({ key, label, el }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wider">{label}</label>
                {el}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wider">Message</label>
            <textarea rows={4} className={inp} value={draft.content} onChange={e => onChange({ content: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--gray-50)] px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={onSend} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">Send Invitation</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Status Dialog ───────────────────────────────────────────────── */
function ConfirmStatusDialog({ candidateName, newStatus, onConfirm, onCancel }: {
  candidateName: string; newStatus: ApplicationStatus;
  onConfirm: () => void; onCancel: () => void;
}) {
  const cfg = STATUS_CONFIG[newStatus];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--status-amber-bg)] text-[var(--status-amber-text)]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--gray-900)]">Confirm Status Change</h3>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Move <span className="font-semibold text-[var(--gray-700)]">{candidateName}</span> to{" "}
              <span className={`inline-flex items-center rounded-r border-l-[3px] px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${cfg.badge}`}>
                {cfg.label}
              </span>?
            </p>
            {newStatus === "interview" && (
              <p className="mt-2 text-xs text-[var(--gray-400)]">You'll be prompted to compose an interview invitation email.</p>
            )}
            {newStatus === "offer" && (
              <p className="mt-2 text-xs text-[var(--gray-400)]">An offer notification email will be sent to the candidate.</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Delete Dialog ───────────────────────────────────────────────── */
function ConfirmDeleteDialog({ candidateName, onConfirm, onCancel }: {
  candidateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--danger-bg)] text-[var(--danger)]">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--gray-900)]">Delete Candidate</h3>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Are you sure you want to delete <span className="font-semibold text-[var(--gray-700)]">{candidateName}</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:opacity-90 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section header ──────────────────────────────────────────────────────── */
function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--gray-100)] text-[var(--gray-500)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--gray-800)]">{title}</h3>
    </div>
  );
}

/* ─── Edit Candidate Modal ─────────────────────────────────────────────────── */
function EditCandidateModal({
  cand,
  profileEmail,
  profilePhone,
  onSave,
  onClose,
}: {
  cand: CandidateRecord;
  profileEmail: string;
  profilePhone: string;
  onSave: (updates: Partial<CandidateRecord>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: cand.name,
    email: profileEmail,
    phone: profilePhone,
    role: cand.jobTitle,
    location: cand.location,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      jobTitle: form.role.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
    });
  };

  const inp = "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--gray-900)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] transition";
  const lbl = "text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--gray-900)]">Edit Profile</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={lbl}>Full Name</label>
            <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Email</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Role / Title</label>
              <input required type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={lbl}>Location</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inp} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-50)] transition">Cancel</button>
            <button type="submit" className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function CandidateDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? decodeURIComponent(rawId) : Array.isArray(rawId) ? decodeURIComponent(rawId[0]) : "";

  const foundRecord = CANDIDATE_RECORDS.find((c) => c.id === id);
  const [cand, setCand] = useState<CandidateRecord | null>(foundRecord ?? null);
  const [messages, setMessages] = useState<CommunicationEntry[]>(() => foundRecord ? seedMessages(foundRecord) : []);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDraft, setInterviewDraft] = useState<InterviewDraft>({ subject: "", type: "Zoom", date: "", time: "", content: "" });
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  // Recruiter Notes state
  const [noteText, setNoteText] = useState("Candidate submitted via portal. Strong technical background. Consider for fast-track interview.");
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);
  const [noteSaveToast, setNoteSaveToast] = useState(false);
  const [confirmPending, setConfirmPending] = useState<ApplicationStatus | null>(null);

  if (!cand) return notFound();

  const profile = buildProfile(cand);
  const ini = cand.name.split(" ").map(n => n[0]).join("").toUpperCase();
  const interviewRound = messages.filter(m => m.type === "interview_invite").length + 1;
  const hasActiveInterview = messages.some(m => m.type === "interview_invite");

  // Deterministic source: even ID number = Self-applied, odd = Recruiter Import
  const idNum = parseInt(cand.id.replace(/\D/g, "")) || 0;
  const source = idNum % 2 === 0 ? "Self-applied" : "Recruiter Import";
  const SourceIcon = idNum % 2 === 0 ? Globe : UserCheck;

  const openInterviewModal = () => {
    setInterviewDraft({
      subject: `${interviewRound > 1 ? `Round ${interviewRound} ` : ""}Interview Invitation — ${cand.jobTitle}`,
      type: "Zoom", date: "", time: "",
      content: `Hi ${cand.name.split(" ")[0]}, we'd like to invite you to${interviewRound > 1 ? ` a Round ${interviewRound}` : " an"} interview for the ${cand.jobTitle} position.`,
    });
    setShowInterviewModal(true);
  };

  const handleSendInterview = () => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`, type: "interview_invite", round: interviewRound,
      subject: interviewDraft.subject, content: interviewDraft.content,
      sender: "recruiter", sentAt: "Just now",
      interviewType: interviewDraft.type, interviewDate: interviewDraft.date, interviewTime: interviewDraft.time,
      confirmed: false,
    }]);
    setCand(prev => prev ? { ...prev, status: "interview" } : prev);
    setShowInterviewModal(false);
  };

  const confirmInterview = (msgId: string) => setMessages(prev => prev.map(m => m.id === msgId ? { ...m, confirmed: true } : m));

  const handleSaveNote = () => {
    const now = new Date();
    const timeStr = now.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    setNoteSavedAt(timeStr);
    setNoteEditing(false);
    setNoteSaveToast(true);
    setTimeout(() => setNoteSaveToast(false), 2500);
  };

  const requestStatusChange = (newStatus: ApplicationStatus) => {
    setStatusDropdown(false);
    if (newStatus === cand.status) return;
    setConfirmPending(newStatus);
  };

  const handleConfirmStatus = () => {
    if (!confirmPending) return;
    const newStatus = confirmPending;
    setConfirmPending(null);
    if (newStatus === "interview") {
      openInterviewModal();
      return;
    }
    setCand(prev => prev ? { ...prev, status: newStatus } : prev);
    if (newStatus === "offer") {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`, type: "offer_notification",
        subject: `Offer Notification — ${cand.jobTitle}`,
        content: `Hi ${cand.name.split(" ")[0]}, we are pleased to inform you that you have been selected for the ${cand.jobTitle} position. Our team will be in touch shortly with the formal offer details.`,
        sender: "recruiter", sentAt: "Just now",
      }]);
    }
  };

  const handleSaveEdit = (updates: Partial<CandidateRecord>) => {
    setCand(prev => prev ? { ...prev, ...updates } : prev);
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-[var(--gray-500)]">
          <Link href="/recruiter/candidates" className="flex items-center gap-1 cursor-pointer hover:text-[var(--accent)] transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Candidates
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--gray-300)]" />
          <span className="text-[var(--gray-700)] font-medium">{cand.name}</span>
        </div>

        {/* Hero Card */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="flex flex-col md:flex-row items-center gap-5 px-6 py-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--gray-100)] text-[var(--gray-700)] text-xl font-bold shrink-0">
              {ini}
            </div>
            <div className="flex-1 min-w-0 md:text-left text-center">
              <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-[var(--gray-900)]">{cand.name}</h1>
              </div>
              <p className="mt-1 text-sm text-[var(--gray-500)]">{cand.jobTitle}</p>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-[var(--gray-500)]">
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1 cursor-pointer hover:text-[var(--accent)] transition"><Mail className="h-3.5 w-3.5" />{profile.email}</a>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{cand.location}</span>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 cursor-pointer hover:text-[var(--accent)] transition"><Linkedin className="h-3.5 w-3.5" />LinkedIn <ExternalLink className="h-2.5 w-2.5" /></a>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 md:self-start mt-4 md:mt-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-50)] transition"
              >
                <PenSquare className="h-4 w-4" /> Edit Profile
              </button>
              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 rounded-md border border-[var(--danger)]/30 bg-[var(--danger-bg)] px-3 py-1.5 text-sm font-medium text-[var(--danger)] cursor-pointer hover:bg-[var(--danger)]/5 transition"
              >
                <Trash2 className="h-4 w-4 text-[var(--danger)]" /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Body: 2 columns */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── Left: Main Profile ── */}
          <div className="space-y-6">

            {/* Summary & Preferences */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <p className="text-sm text-[var(--gray-700)] leading-relaxed">{profile.summary}</p>
              <div className="mt-5 flex flex-wrap gap-4 text-xs bg-[var(--gray-50)] border border-[var(--border-light)] p-3 rounded-lg">
                <span className="flex items-center gap-1.5 text-[var(--gray-600)] font-medium"><Briefcase className="h-3.5 w-3.5 text-[var(--gray-400)]" />{profile.yearsExp}+ years xp</span>
                <span className="flex items-center gap-1.5 text-[var(--gray-600)] font-medium"><DollarSign className="h-3.5 w-3.5 text-[var(--gray-400)]" />{profile.targetSalary}</span>
                <span className="flex items-center gap-1.5 text-[var(--gray-600)] font-medium"><MapPin className="h-3.5 w-3.5 text-[var(--gray-400)]" />{profile.preferredLocation}</span>
              </div>
            </div>

            {/* Work Experience */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <SectionTitle icon={Briefcase} title="Work Experience" />
              <div className="space-y-6 mt-4">
                {profile.work.map((w, i) => (
                  <div key={i} className="relative pl-5">
                    <div className="absolute left-0 top-1.5 h-full w-px bg-[var(--border)]" />
                    <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full border border-[var(--border)] bg-[var(--surface)]" />
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-[var(--gray-900)]">{w.role}</span>
                      <span className="text-[var(--gray-400)]">·</span>
                      <span className="text-sm text-[var(--gray-600)]">{w.company}</span>
                      <span className="ml-auto text-xs text-[var(--gray-400)] font-medium">{w.duration}</span>
                    </div>
                    <ul className="space-y-1.5 mt-2.5">
                      {w.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--gray-600)] leading-relaxed">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--gray-400)]" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <SectionTitle icon={GraduationCap} title="Education" />
              <div className="space-y-4 mt-4">
                {profile.education.map((e, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4 border-b border-[var(--border-light)] pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-[var(--gray-900)]">{e.school}</p>
                      <p className="text-sm text-[var(--gray-600)] mt-0.5">{e.degree}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[var(--gray-500)] bg-[var(--gray-50)] px-2 py-0.5 rounded-full border border-[var(--border-light)]">{e.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">

            {/* Quick Connect */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)] mb-3">Quick Connect</h3>
              <div className="space-y-2">
                <a href={`mailto:${profile.email}`}
                  className="flex items-center gap-2.5 rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition">
                  <Mail className="h-4 w-4 text-[var(--gray-400)]" /> Send Email
                </a>
                <a href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp Connect
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition">
                  <Linkedin className="h-4 w-4 text-[#0077B5]" /> View LinkedIn
                </a>
              </div>
            </div>

            {/* Resume */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)] mb-3">Resume</h3>
              <div className="flex flex-col gap-3 rounded-md border border-[var(--border-light)] bg-[var(--gray-50)] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] shadow-[var(--shadow-xs)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--gray-900)] truncate">{profile.resumeFile}</p>
                    <p className="text-xs text-[var(--gray-500)]">{profile.resumeSize} PDF</p>
                  </div>
                </div>
                <button className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition cursor-pointer">
                  <Download className="h-3.5 w-3.5" /> Download File
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)] mb-3">Key Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s.name} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 border border-transparent text-xs font-semibold ${LEVEL_STYLE[s.level]}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">Recruiter Notes</h3>
                {!noteEditing && (
                  <button onClick={() => setNoteEditing(true)}
                    className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition font-medium cursor-pointer">
                    <PenSquare className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              {noteEditing ? (
                <>
                  <textarea rows={5} value={noteText} onChange={e => setNoteText(e.target.value)}
                    className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--gray-700)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] transition" autoFocus />
                  <div className="flex items-center justify-between mt-2">
                    <button onClick={() => setNoteEditing(false)} className="text-xs text-[var(--gray-400)] hover:text-[var(--gray-600)] transition font-medium cursor-pointer">Cancel</button>
                    <button onClick={handleSaveNote}
                      className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition cursor-pointer">
                      <Save className="h-3 w-3" /> Save Note
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative rounded-md bg-[#FFFBEA] dark:bg-[var(--status-amber-bg)]/20 border border-[#FDE68A] dark:border-[var(--status-amber-text)]/20 p-3">
                    <p className="text-sm text-[#92400E] dark:text-[var(--status-amber-text)] leading-relaxed whitespace-pre-wrap">
                      {noteText || <span className="opacity-70 italic">No notes yet. Click "Edit" to add one.</span>}
                    </p>
                  </div>
                  {noteSavedAt && (
                    <p className="mt-2.5 text-[11px] font-medium text-[var(--gray-400)] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[var(--status-green-text)]" /> Last saved: {noteSavedAt}
                    </p>
                  )}
                </>
              )}

              {/* Note save toast */}
              {noteSaveToast && (
                <div className="absolute top-[-48px] right-0 z-50 flex items-center gap-2 rounded-md bg-[var(--gray-900)] px-4 py-3 text-sm font-medium text-[var(--surface)] shadow-[var(--shadow-md)] animate-slide-in">
                  <Check className="h-4 w-4 text-[var(--status-green-text)]" /> Note saved successfully
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {confirmPending && (
        <ConfirmStatusDialog candidateName={cand.name} newStatus={confirmPending}
          onConfirm={handleConfirmStatus} onCancel={() => setConfirmPending(null)} />
      )}

      {showInterviewModal && (
        <InterviewModal round={interviewRound} candidateName={cand.name} jobTitle={cand.jobTitle}
          draft={interviewDraft} onChange={p => setInterviewDraft(d => ({ ...d, ...p }))}
          onSend={handleSendInterview} onClose={() => setShowInterviewModal(false)} />
      )}

      {showEditModal && (
        <EditCandidateModal
          cand={cand}
          profileEmail={profile.email}
          profilePhone={profile.phone}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDeleteDialog
          candidateName={cand.name}
          onConfirm={() => { setShowDeleteConfirm(false); router.push("/recruiter/candidates"); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
