"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JOB_ORDERS, type JobOrder } from "@/data/recruiter";
type JobOrderExtra = JobOrder & { description?: string; notes?: string };
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CircleCheck,
  PauseCircle,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type StatusGroup = "all" | "active" | "onhold" | "full";

function getStatusGroup(status: string): "active" | "onhold" | "full" {
  if (status === "filled") return "full";
  if (status === "paused") return "onhold";
  return "active";
}

function toCreatedAndAgeFromId(id: string) {
  const digits = parseInt(id.replace(/\D/g, "")) || 1;
  const ageDays = (digits % 180) + 1;
  const created = new Date(Date.now() - ageDays * 86400000);
  const mm = String(created.getMonth() + 1).padStart(2, "0");
  const dd = String(created.getDate()).padStart(2, "0");
  const yy = String(created.getFullYear()).slice(-2);
  return { created: `${mm}/${dd}/${yy}`, ageDays };
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  sourcing: { label: "Sourcing", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  interview: { label: "Interview", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  offer: { label: "Offer", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  filled: { label: "Filled", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  paused: { label: "On Hold", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const priorityConfig: Record<string, { label: string; dot: string; text: string }> = {
  high: { label: "High", dot: "bg-red-500", text: "text-red-700" },
  medium: { label: "Medium", dot: "bg-amber-400", text: "text-amber-700" },
  low: { label: "Low", dot: "bg-slate-300", text: "text-slate-500" },
};

export default function RecruiterJobOrdersPage() {
  const [query, setQuery] = useState("");
  const [statusGroup, setStatusGroup] = useState<StatusGroup>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [onlyHot, setOnlyHot] = useState(false);
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [localAdds, setLocalAdds] = useState<JobOrderExtra[]>([]);

  const STORAGE_KEY = "ADDED_JOB_ORDERS";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setLocalAdds(raw ? (JSON.parse(raw) as JobOrderExtra[]) : []);
      } catch {
        setLocalAdds([]);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const allItems: JobOrderExtra[] = useMemo(
    () => [...JOB_ORDERS, ...localAdds],
    [localAdds],
  );

  const filtered = useMemo(() => {
    let items = [...allItems];
    if (statusGroup !== "all") {
      items = items.filter((j) => getStatusGroup(j.status) === statusGroup);
    }
    if (priorityFilter !== "all") {
      items = items.filter((j) => j.priority === priorityFilter);
    }
    if (onlyHot) items = items.filter((j) => j.priority === "high");
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.client.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q),
      );
    }
    return items;
  }, [allItems, statusGroup, priorityFilter, onlyHot, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const total = allItems.length;
    const active = allItems.filter((j) => getStatusGroup(j.status) === "active").length;
    const onHold = allItems.filter((j) => getStatusGroup(j.status) === "onhold").length;
    const filled = allItems.filter((j) => getStatusGroup(j.status) === "full").length;
    return { total, active, onHold, filled };
  }, [allItems]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Job Orders</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track all open requisitions</p>
        </div>
        <Button size="sm" className="gap-2 shrink-0" asChild>
          <Link href="/recruiter/job-orders/new">
            <Plus className="h-4 w-4" />
            New Job Order
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Briefcase className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-[11px] font-medium text-slate-500">Total</p>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <CircleCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-900">{stats.active}</p>
            <p className="text-[11px] font-medium text-emerald-600">Active</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <PauseCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-amber-900">{stats.onHold}</p>
            <p className="text-[11px] font-medium text-amber-600">On Hold</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Users className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-700">{stats.filled}</p>
            <p className="text-[11px] font-medium text-slate-500">Filled</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search jobs, clients, IDs..."
            className="h-10 bg-white pl-9 text-[13px] border-slate-200 rounded-xl shadow-sm"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={statusGroup}
            onChange={(e) => { setStatusGroup(e.target.value as StatusGroup); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="onhold">On Hold</option>
            <option value="full">Filled</option>
          </select>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as "all" | "high" | "medium" | "low"); setPage(1); }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pl-6 w-[90px]">Job ID</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 min-w-[220px]">Position</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Priority</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Created</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Applicants</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right pr-6 w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-slate-300" />
                    <p className="text-[13px] text-slate-500">No job orders match your filters.</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or filter criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((j) => {
                const { created, ageDays } = toCreatedAndAgeFromId(j.id);
                const sc = statusConfig[j.status] ?? statusConfig.sourcing;
                const pc = priorityConfig[j.priority] ?? priorityConfig.medium;
                return (
                  <TableRow key={j.id} className="group cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-mono text-xs text-slate-400">
                      {j.id}
                    </TableCell>
                    <TableCell>
                      <Link href={`/recruiter/job-orders/${encodeURIComponent(j.id)}`} className="block">
                        <span className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {j.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">{j.location}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                            {j.client.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px] text-slate-700">{j.client}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${pc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                        {pc.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-slate-600">{created}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{ageDays}d ago</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                        {j.applicants}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs text-slate-500">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-[13px]">Edit Job Order</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px]">View Candidates</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-[13px] text-red-600">Close Job</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-[13px] text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {pageItems.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>
            {" "}to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(page * pageSize, filtered.length)}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-slate-700">{filtered.length}</span>
            {" "}results
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    page === pageNum
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
