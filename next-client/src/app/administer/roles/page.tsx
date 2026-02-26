"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/recruiter/cards";
import { ShieldCheck } from "lucide-react";

type Role = {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
};

const DEFAULT_PERMS = ["users", "jobs", "candidates", "clients", "reports", "admin"] as const;

const INITIAL: Role[] = [
  { id: "r1", name: "Owner", permissions: { users: true, jobs: true, candidates: true, clients: true, reports: true, admin: true } },
  { id: "r2", name: "Recruiter", permissions: { users: false, jobs: true, candidates: true, clients: true, reports: true, admin: false } },
  { id: "r3", name: "Client", permissions: { users: false, jobs: false, candidates: false, clients: true, reports: true, admin: false } },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL);
  const [newRole, setNewRole] = useState("");

  const toggle = (roleId: string, perm: string) =>
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, permissions: { ...r.permissions, [perm]: !r.permissions[perm as keyof typeof r.permissions] } } : r)));

  const addRole = () => {
    if (!newRole.trim()) return;
    setRoles((prev) => [
      { id: String(Date.now()), name: newRole.trim(), permissions: Object.fromEntries(DEFAULT_PERMS.map((p) => [p, false])) as Role["permissions"] },
      ...prev,
    ]);
    setNewRole("");
  };

  const remove = (id: string) => setRoles((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
      <Section title="User roles" subtitle="Define permissions and access levels" icon={<ShieldCheck className="h-4 w-4" />}>
        <div className="grid gap-4 px-5 py-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-sm font-medium text-slate-700">Create new role</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Role name (e.g., Hiring Manager)" className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm" />
              <Button onClick={addRole} size="sm">Add role</Button>
            </div>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="font-semibold text-slate-900">{role.name}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" onClick={() => remove(role.id)}>Delete</Button>
                  </div>
                </div>
                <div className="grid gap-4 px-4 py-4 sm:grid-cols-3 md:grid-cols-6">
                  {DEFAULT_PERMS.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={!!role.permissions[p]} onChange={() => toggle(role.id, p)} />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

