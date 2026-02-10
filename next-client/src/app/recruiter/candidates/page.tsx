"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CANDIDATE_RECORDS } from "@/data/recruiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  MapPin,
  Briefcase,
  Phone,
  Clock,
  Users,
  UserCheck,
  MessageSquare,
  Send,
  Archive,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const CITIES = ["Toronto, ON", "Vancouver, BC", "Montreal, QC", "Calgary, AB", "Ottawa, ON", "Waterloo, ON"];
const SKILLS = ["React", "Node.js", "TypeScript", "Python", "AWS", "Go", "Java", "Kubernetes", "Docker", "GraphQL"];

function getCandidateDetails(id: string, idx: number) {
  const city = CITIES[idx % CITIES.length];
  const skillSet = SKILLS.slice(idx % 4, (idx % 4) + 3 + (idx % 2));
  return { city, skillSet };
}

const stageConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  "Client Interview": { label: "Client Interview", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "Recruiter Review": { label: "Recruiter Review", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  "Offer": { label: "Offer", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Client Feedback": { label: "Client Feedback", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Interview": { label: "Interview", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  "Sourcing": { label: "Sourcing", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

const stageIconConfig: Record<string, { bg: string; iconColor: string }> = {
  "Client Interview": { bg: "bg-blue-100", iconColor: "text-blue-600" },
  "Recruiter Review": { bg: "bg-violet-100", iconColor: "text-violet-600" },
  "Offer": { bg: "bg-emerald-100", iconColor: "text-emerald-600" },
  "Client Feedback": { bg: "bg-amber-100", iconColor: "text-amber-600" },
  "Interview": { bg: "bg-sky-100", iconColor: "text-sky-600" },
  "Sourcing": { bg: "bg-slate-100", iconColor: "text-slate-500" },
};

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  borderColor,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 flex items-center gap-3 transition-all text-left ${
        active
          ? `${borderColor} shadow-sm ring-1 ring-inset ring-current/5`
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-[11px] font-medium text-slate-500">{title}</p>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function RecruiterCandidatesPage() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const stages = useMemo(() => Array.from(new Set(CANDIDATE_RECORDS.map((c) => c.stage))), []);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CANDIDATE_RECORDS.forEach((c) => { counts[c.stage] = (counts[c.stage] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let rows = [...CANDIDATE_RECORDS];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) || r.stage.toLowerCase().includes(q));
    }
    if (stageFilter !== "all") rows = rows.filter((r) => r.stage === stageFilter);
    return rows;
  }, [query, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const allSelected = pageItems.length > 0 && pageItems.every((c) => selectedIds.has(c.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(pageItems.map((c) => c.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  return (
    <div className="p-8 space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track your talent pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 text-slate-400" />
            Export
          </Button>
          <Button size="sm" className="h-9 gap-2 rounded-lg bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-700" asChild>
            <Link href="/recruiter/candidates/new">
              <Plus className="h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        </div>
      </div>

      {/* ---- Stats Row ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard title="Total" value={CANDIDATE_RECORDS.length} icon={Users} iconBg="bg-slate-100" iconColor="text-slate-600" borderColor="border-slate-400 bg-slate-50/50" active={stageFilter === "all"} onClick={() => { setStageFilter("all"); setPage(1); }} />
        {stages.map((stage) => {
          const ic = stageIconConfig[stage] ?? stageIconConfig.Sourcing;
          const sc = stageConfig[stage] ?? stageConfig.Sourcing;
          return (
            <StatCard key={stage} title={stage} value={stageCounts[stage] || 0} icon={UserCheck} iconBg={ic.bg} iconColor={ic.iconColor} borderColor={`${sc.dot.replace("bg-", "border-")} ${sc.bg}`} active={stageFilter === stage} onClick={() => { setStageFilter(stageFilter === stage ? "all" : stage); setPage(1); }} />
          );
        })}
      </div>

      {/* ---- Filters & View Toggle ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, role, or stage..."
              className="h-10 bg-white pl-9 text-[13px] border-slate-200 rounded-xl shadow-sm"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Stages</option>
            {stages.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200/80 bg-slate-50/50 p-1">
            <button onClick={() => setViewMode("list")} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          {selectedIds.size > 0 && (
            <span className="text-[13px] text-slate-500">{selectedIds.size} selected</span>
          )}
        </div>
      </div>

      {/* ---- Content: List View ---- */}
      {viewMode === "list" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="w-[44px] pl-5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 min-w-[200px]">Candidate</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 min-w-[180px]">Current Role</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Stage</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Location</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last Contact</TableHead>
                <TableHead className="w-[60px] pr-5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p className="text-[13px] text-slate-500">No candidates match your filters.</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filter criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((c, idx) => {
                  const { city, skillSet } = getCandidateDetails(c.id, idx);
                  const displayPhone = "416-555-01" + String(idx).padStart(2, "0");
                  const isSelected = selectedIds.has(c.id);
                  const sc = stageConfig[c.stage] ?? stageConfig.Sourcing;
                  return (
                    <TableRow key={c.id} className={`group cursor-pointer border-b border-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/50"}`}>
                      <TableCell className="pl-5">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(c.id)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200/80">
                            <AvatarFallback className="bg-gradient-to-br from-slate-50 to-slate-100 text-[11px] font-bold text-slate-600">
                              {c.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link href={`/recruiter/candidates/${encodeURIComponent(c.id)}`} className="text-[13px] font-semibold text-slate-900 hover:text-blue-600 transition-colors block truncate">
                              {c.name}
                            </Link>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {displayPhone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[13px] font-medium text-slate-700">{c.role}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {skillSet.slice(0, 2).map((skill) => (
                            <span key={skill} className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{skill}</span>
                          ))}
                          {skillSet.length > 2 && (
                            <span className="text-[10px] text-slate-400 self-center">+{skillSet.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] text-slate-600 truncate max-w-[140px] block" title={c.status}>{c.status}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] text-slate-500">{c.lastContact}</span>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200/80">
                            <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-[13px]"><Eye className="h-4 w-4" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[13px]"><Pencil className="h-4 w-4" /> Edit Details</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[13px]"><Send className="h-4 w-4" /> Send Email</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[13px]"><MessageSquare className="h-4 w-4" /> Add Note</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-[13px] text-red-600 focus:text-red-600"><Archive className="h-4 w-4" /> Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* List Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              Showing <span className="font-semibold text-slate-700">{pageItems.length > 0 ? (page - 1) * pageSize + 1 : 0}</span>
              {" "}to <span className="font-semibold text-slate-700">{Math.min(page * pageSize, filtered.length)}</span>
              {" "}of <span className="font-semibold text-slate-700">{filtered.length}</span> candidates
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === pageNum ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {pageNum}
                  </button>
                );
              })}
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ---- Content: Grid View ---- */
        <>
          {pageItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white flex flex-col items-center justify-center h-40 gap-2">
              <Users className="h-8 w-8 text-slate-300" />
              <p className="text-[13px] text-slate-500">No candidates match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pageItems.map((c, idx) => {
                const { city, skillSet } = getCandidateDetails(c.id, idx);
                const sc = stageConfig[c.stage] ?? stageConfig.Sourcing;
                return (
                  <div key={c.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300/80">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-11 w-11 border border-slate-200/80 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-semibold">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link href={`/recruiter/candidates/${encodeURIComponent(c.id)}`} className="text-[13px] font-semibold text-slate-900 hover:text-blue-600 transition-colors block truncate">
                            {c.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.role}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200/80">
                          <DropdownMenuItem className="gap-2 text-[13px]"><Eye className="h-4 w-4" /> View Profile</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-[13px]"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-[13px] text-red-600 focus:text-red-600"><Archive className="h-4 w-4" /> Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-[12px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.availability} notice</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Active: {c.lastContact}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {skillSet.slice(0, 3).map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{skill}</span>
                      ))}
                      {skillSet.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[10px] text-slate-400">+{skillSet.length - 3}</span>
                      )}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <Link href={`/recruiter/candidates/${encodeURIComponent(c.id)}`} className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid Pagination */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[13px] text-slate-600">
              Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
