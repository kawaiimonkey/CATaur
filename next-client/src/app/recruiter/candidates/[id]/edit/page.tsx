"use client";

import { notFound, useRouter, useParams } from "next/navigation";
import { CANDIDATE_RECORDS } from "@/data/recruiter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo, useState } from "react";

const CITIES: Array<[string, string]> = [
  ["Pittsburgh", "PA"],
  ["Woodland Park", "MI"],
  ["Midland", "TX"],
  ["Hewlett", "NY"],
  ["Perkasie", "PA"],
  ["Dickinson", "TX"],
  ["Burlingame", "CA"],
  ["Tacoma", "WA"],
  ["Van Nuys", "CA"],
  ["Springfield", "IL"],
  ["Farmingdale", "NY"],
  ["Atlanta", "GA"],
  ["Newark", "CA"],
  ["Worcester", "MA"],
  ["Los Angeles", "CA"],
];

function derivedContact(id: string, name: string) {
  const n = (parseInt(id.replace(/\D/g, "")) || 1000);
  const phone = `${Math.floor(200 + (n % 700))}-${String(200 + (n % 700)).padStart(3, "0")}-${String(1000 + (n % 9000)).slice(-4)}`;
  const [city, state] = CITIES[n % CITIES.length];
  const handle = name.toLowerCase().replace(/[^a-z]/g, "-");
  const linkedin = `https://www.linkedin.com/in/${handle}`;
  const address = `${city}, ${state}, USA`;
  return { phone, linkedin, address };
}

export default function EditCandidate() {
  const params = useParams<{ id: string }>();
  const cand = useMemo(() => CANDIDATE_RECORDS.find((c) => c.id === params.id), [params.id]);
  const router = useRouter();
  if (!cand) return notFound();

  const [name, setName] = useState(cand.name);
  const [role, setRole] = useState(cand.role);
  const [jobTitle, setJobTitle] = useState(cand.jobTitle);
  const [status, setStatus] = useState(cand.status);
  const contact = useMemo(() => derivedContact(cand.id, cand.name), [cand.id, cand.name]);
  const [email] = useState(cand.name.toLowerCase().replace(/[^a-z]/g, ".") + "@example.com");
  const [phone, setPhone] = useState(contact.phone);
  const [linkedin, setLinkedin] = useState(contact.linkedin);
  const [address, setAddress] = useState(contact.address);
  const [resumeName, setResumeName] = useState<string | null>(null);

  const inpClass = "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] transition";
  const labelClass = "block text-sm font-medium text-[var(--gray-700)]";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-4 text-sm text-[var(--gray-600)]">
        <Link href={`/recruiter/candidates/${encodeURIComponent(cand.id)}`} className="text-[var(--accent)] hover:underline font-medium">Back to details</Link>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] md:p-8">
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-[var(--gray-900)]">Edit Candidate</h1>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inpClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input className={inpClass} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Job Title</label>
              <input className={inpClass} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inpClass} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="new">New</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>E-Mail</label>
              <input className={`${inpClass} opacity-80 cursor-not-allowed`} value={email} readOnly />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inpClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input className={inpClass} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input className={inpClass} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Resume (PDF/DOC)</label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--gray-50)] px-4 text-sm font-medium text-[var(--gray-700)] transition cursor-pointer hover:bg-[var(--gray-100)]">
                Choose File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.rtf"
                  className="hidden"
                  onChange={(e) => setResumeName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
              {resumeName ? (
                <span className="text-sm font-medium text-[var(--gray-900)] max-w-xs truncate">{resumeName}</span>
              ) : (
                <span className="text-sm text-[var(--gray-500)]">No file chosen</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)] mt-6">
            <Button variant="outline" className="border-[var(--border)] text-[var(--gray-700)] bg-[var(--surface)] cursor-pointer hover:bg-[var(--gray-50)]" onClick={() => router.back()}>Cancel</Button>
            <Button className="bg-[var(--accent)] text-white cursor-pointer hover:bg-[var(--accent-hover)]">Save details</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
