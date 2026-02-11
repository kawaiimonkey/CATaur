"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCcw,
  Search,
  Users,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Clock,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "disabled";
  lastActive: string;
};

const INITIAL: User[] = [
  { id: "1", name: "Allan Admin", email: "allan@example.com", role: "Owner", status: "active", lastActive: "2h ago" },
  { id: "2", name: "Mia Recruiter", email: "mia@example.com", role: "Recruiter", status: "active", lastActive: "35m ago" },
  { id: "3", name: "Leo Client", email: "leo@contoso.com", role: "Client", status: "disabled", lastActive: "1d ago" },
  { id: "4", name: "Sarah Chen", email: "sarah@example.com", role: "Recruiter", status: "active", lastActive: "4h ago" },
  { id: "5", name: "James Wilson", email: "james@example.com", role: "Client", status: "active", lastActive: "12h ago" },
];

const ROLE_COLORS: Record<string, string> = {
  Owner: "bg-violet-50 text-violet-700",
  Recruiter: "bg-blue-50 text-blue-700",
  Client: "bg-amber-50 text-amber-700",
  Admin: "bg-emerald-50 text-emerald-700",
};

export default function UsersPage() {
  const [list, setList] = useState<User[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Recruiter" });
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return list.filter((u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      [u.name, u.email, u.role].some((v) => v.toLowerCase().includes(q))
    );
  }, [list, query, roleFilter]);

  const addUser = () => {
    if (!form.name || !form.email) return;
    setList((prev) => [
      { id: String(Date.now()), name: form.name, email: form.email, role: form.role, status: "active", lastActive: "Just now" },
      ...prev,
    ]);
    setForm({ name: "", email: "", role: "Recruiter" });
    setShowForm(false);
  };

  const toggleStatus = (id: string) => setList((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "disabled" : "active" } : u)));
  const remove = (id: string) => setList((prev) => prev.filter((u) => u.id !== id));

  const stats = {
    total: list.length,
    active: list.filter((u) => u.status === "active").length,
    disabled: list.filter((u) => u.status === "disabled").length,
    roles: [...new Set(list.map((u) => u.role))].length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">Create, edit, and manage user accounts and permissions.</p>
        </div>
        <Button className="gap-2 text-sm h-9" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "#3b82f6" },
          { label: "Active", value: stats.active, icon: Users, color: "#10b981" },
          { label: "Disabled", value: stats.disabled, icon: Users, color: "#ef4444" },
          { label: "Roles", value: stats.roles, icon: Shield, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}12` }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Client">Client</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[user.role] || "bg-slate-100 text-slate-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === "active" ? "text-emerald-600" : "text-slate-500"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {user.status === "active" ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.lastActive}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
