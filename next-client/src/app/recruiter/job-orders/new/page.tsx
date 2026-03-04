"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Code, Eye, Briefcase, MapPin, Building2, CircleDollarSign, Loader2 } from "lucide-react";
import { CLIENTS } from "@/data/recruiter";

const STORAGE_KEY = "ADDED_JOB_ORDERS";
const DRAFT_KEY = "DRAFT_JOB_ORDER";

type JobOrderInput = {
  title: string;
  client: string;
  location: string;
  department: string;
  salary: string;
  status: "active" | "onhold" | "closed";
  openings: number | "";
  type: string;
  workArrangement: string;
  description: string;
};

const defaultForm: JobOrderInput = {
  title: "",
  client: "",
  location: "",
  department: "",
  salary: "",
  status: "active",
  openings: 1,
  type: "Full-time",
  workArrangement: "Remote",
  description: "## Job Description\n\n- Responsibilities\n- Requirements\n\n",
};

export default function NewJobOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState<JobOrderInput>(defaultForm);
  const [mounted, setMounted] = useState(false);

  // Ref to prevent aggressive auto-saving while typing rapidly
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load draft on mount
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setForm({ ...defaultForm, ...parsedDraft });
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    setMounted(true);
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!mounted) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 1000); // 1-second debounce
  }, [form, mounted]);

  const companyOptions = CLIENTS.map((c) => c.company);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !form.title.trim() || !form.status) return; // Basic validation
    setSaving(true);

    const now = new Date();
    const id = `JO-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
        .getHours()
        .toString()
        .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;

    const record = {
      id,
      title: form.title.trim(),
      client: form.client.trim() || companyOptions[0] || "New Client",
      status: form.status,
      openings: Number(form.openings) || 1,
      priority: "medium", // Default priority since it wasn't requested in redesign
      location: form.location.trim() || "Remote",
      updatedAt: "Just now",
      tags: form.department ? [form.department] : [],
      applicants: 0,
      description: form.description.trim(),
      type: form.type,
      workArrangement: form.workArrangement,
      salary: form.salary,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      list.unshift(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Clear draft after successful creation
      localStorage.removeItem(DRAFT_KEY);

      // Redirect to list
      router.push("/recruiter/job-orders");
    } catch {
      setSaving(false);
    }
  };

  if (!mounted) return null; // Wait to hydrate

  const inpClass = "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] transition";
  const labelClass = "text-sm font-semibold text-[var(--gray-800)] block mb-1.5 flex items-center gap-2";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--gray-900)] tracking-tight">Create Job Order</h1>
          <p className="text-sm text-[var(--gray-500)] mt-1">
            Fill out the details for the new requisition. Title and Status are required.
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--accent-light)] text-[var(--accent)]">
              Auto-saving draft
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-[var(--shadow-sm)]">
        <form className="grid gap-6 md:grid-cols-2" onSubmit={onSubmit}>

          {/* Title - Required */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              <Briefcase className="w-4 h-4 text-[var(--gray-400)]" />
              Job Title <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              required
              className={inpClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Senior Full-stack Engineer"
            />
          </div>

          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className={labelClass}>
                <Building2 className="w-4 h-4 text-[var(--gray-400)]" />
                Company
              </label>
              <select
                className={inpClass}
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
              >
                <option value="" disabled>Select a company</option>
                {companyOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <MapPin className="w-4 h-4 text-[var(--gray-400)]" />
                Location
              </label>
              <input
                className={inpClass}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Calgary, CA"
              />
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <input
                className={inpClass}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>

            <div>
              <label className={labelClass}>
                <CircleDollarSign className="w-4 h-4 text-[var(--gray-400)]" />
                Salary
              </label>
              <input
                className={inpClass}
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="e.g., $120k - $150k"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className={labelClass}>
                Status <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                required
                className={inpClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="active">Active</option>
                <option value="onhold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Openings</label>
              <input
                type="number"
                min={1}
                className={inpClass}
                value={form.openings}
                onChange={(e) => setForm({ ...form, openings: e.target.value === "" ? "" : Number(e.target.value) })}
                placeholder="Number of headcount"
              />
            </div>

            <div>
              <label className={labelClass}>Type</label>
              <select
                className={inpClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
                <option value="Permanent">Permanent</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Work Arrangement</label>
              <select
                className={inpClass}
                value={form.workArrangement}
                onChange={(e) => setForm({ ...form, workArrangement: e.target.value })}
              >
                <option value="Remote">Remote</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Markdown Editor Section */}
          <div className="md:col-span-2 mt-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2 mb-2">
              <label className="text-sm font-semibold text-[var(--gray-800)] flex items-center gap-2">
                Description
              </label>
              <div className="flex gap-1 bg-[var(--gray-50)] p-1 rounded-md border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors ${activeTab === "edit" ? "bg-[var(--surface)] shadow-sm text-[var(--gray-900)] border border-[var(--border-light)]" : "text-[var(--gray-500)] hover:text-[var(--gray-900)]"
                    }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Edit Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors ${activeTab === "preview" ? "bg-[var(--surface)] shadow-sm text-[var(--gray-900)] border border-[var(--border-light)]" : "text-[var(--gray-500)] hover:text-[var(--gray-900)]"
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            </div>

            <div className="rounded-md border border-[var(--border)] overflow-hidden bg-[var(--surface)] transition-all">
              {activeTab === "edit" ? (
                <textarea
                  className="w-full min-h-[400px] resize-y bg-transparent px-4 py-4 text-sm font-mono text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus:outline-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="# Write the full job description here..."
                />
              ) : (
                <div className="w-full min-h-[400px] prose prose-sm prose-blue dark:prose-invert max-w-none px-6 py-4">
                  <ReactMarkdown>{form.description || "*No description provided yet.*"}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <Link
              href="/recruiter/job-orders"
              className="px-4 py-2 border border-[var(--border)] rounded-md text-sm font-semibold text-[var(--gray-700)] bg-[var(--surface)] hover:bg-[var(--gray-50)] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-md font-semibold text-sm bg-[var(--accent)] text-white hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

