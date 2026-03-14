"use client";

import { useMemo, useState } from "react";
import { Section, DataTable } from "@/components/recruiter/cards";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

type Log = { id: string; user: string; action: string; resource: string; ts: string };

const LOGS: Log[] = [
  { id: "l1", user: "Allan Admin", action: "login", resource: "admin console", ts: "2025-10-25 09:12" },
  { id: "l2", user: "Mia Recruiter", action: "update", resource: "job-order #1843", ts: "2025-10-25 09:02" },
  { id: "l3", user: "Allan Admin", action: "create", resource: "user Leo Client", ts: "2025-10-24 17:54" },
  { id: "l4", user: "Leo Client", action: "login", resource: "client portal", ts: "2025-10-24 10:30" },
];

export default function ActivityPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return LOGS.filter((l) => (type === "all" || l.action === type) && [l.user, l.action, l.resource, l.ts].some((v) => v.toLowerCase().includes(q)));
  }, [query, type]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
      <Section title="Activity logs" subtitle="Audit sign-ins, updates, and admin actions" icon={<Activity className="h-4 w-4" />}>
        <div className="flex flex-col items-stretch gap-3 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search user, action, resource" className="h-9 w-72 rounded-md border border-slate-300 px-3 text-sm" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border border-slate-300 px-3 text-sm">
              <option value="all">All actions</option>
              <option value="login">Logins</option>
              <option value="create">Creates</option>
              <option value="update">Updates</option>
              <option value="delete">Deletes</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">Export CSV</Button>
            <Button size="sm">Refresh</Button>
          </div>
        </div>
        <div className="px-5 pb-6">
          <DataTable
            columns={[
              { key: "ts", label: "Timestamp" },
              { key: "user", label: "User", className: "px-3" },
              { key: "action", label: "Action", className: "px-3" },
              { key: "resource", label: "Resource", className: "px-3" },
            ]}
            rows={filtered.map((l) => ({ ts: l.ts, user: l.user, action: l.action, resource: l.resource }))}
          />
        </div>
      </Section>
    </div>
  );
}

