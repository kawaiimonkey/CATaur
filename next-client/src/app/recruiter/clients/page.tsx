"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CLIENTS, JOB_ORDERS } from "@/data/recruiter";
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
  Building2,
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  MapPin,
  Briefcase,
  Users,
  Activity,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
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
/*  Data helpers                                                       */
/* ------------------------------------------------------------------ */
type Row = {
  name: string; industry: string; jobs: number; openRoles: number;
  contact: string; satisfaction: string; lastReview: string;
  city: string; state: string; phone: string; owner: string; created: string;
};

const CITIES: Array<[string, string]> = [
  ["Toronto", "ON"], ["Vancouver", "BC"], ["Calgary", "AB"], ["Montreal", "QC"],
  ["Ottawa", "ON"], ["Waterloo", "ON"], ["Victoria", "BC"], ["Edmonton", "AB"],
];

function buildRows(): Row[] {
  return CLIENTS.map((c, idx) => {
    const [city, state] = CITIES[idx % CITIES.length];
    const jobs = JOB_ORDERS.filter((j) => j.client === c.company).length;
    const phone = `256-${String(200 + idx).padStart(3, "0")}-${String(8000 + idx).slice(-4)}`;
    const created = `05-${String(12 + (idx % 10)).padStart(2, "0")}-25`;
    return { name: c.company, industry: c.industry, jobs, openRoles: c.openRoles, contact: c.contact, satisfaction: c.satisfaction, lastReview: c.lastReview, city, state, phone, owner: "Allan J.", created };
  });
}

const healthConfig: Record<string, { bg: string; text: string; dot: string }> = {
  High: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Low: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function RecruiterClientsPage() {
  const allRows = useMemo(() => buildRows(), []);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [industryFilter, setIndustryFilter] = useState("all");

  const industries = useMemo(() => Array.from(new Set(allRows.map((r) => r.industry))), [allRows]);

  const filtered = useMemo(() => {
    let rows = [...allRows];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.contact.toLowerCase().includes(q));
    }
    if (industryFilter !== "all") rows = rows.filter((r) => r.industry === industryFilter);
    return rows;
  }, [allRows, query, industryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalActiveJobs = allRows.reduce((acc, curr) => acc + curr.jobs, 0);

  return (
    <div className="p-8 space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Companies</h2>
          <p className="text-sm text-slate-500 mt-1">Manage client accounts and relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4 text-slate-400" />
            Export
          </Button>
          <Button size="sm" className="h-9 gap-2 rounded-lg bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* ---- Stats Row ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[28px] font-bold tracking-tight text-slate-900">{allRows.length}</p>
            <p className="text-[13px] font-medium text-slate-500">Total Clients</p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <TrendingUp className="h-3 w-3" /> +2
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
            <Briefcase className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[28px] font-bold tracking-tight text-slate-900">{totalActiveJobs}</p>
            <p className="text-[13px] font-medium text-slate-500">Active Jobs</p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <TrendingUp className="h-3 w-3" /> +12%
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[28px] font-bold tracking-tight text-slate-900">{allRows.length}</p>
            <p className="text-[13px] font-medium text-slate-500">Key Contacts</p>
          </div>
        </div>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search companies, contacts..." className="h-10 bg-white pl-9 text-[13px] border-slate-200 rounded-xl shadow-sm" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100" value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}>
            <option value="all">All Industries</option>
            {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
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
        </div>
      </div>

      {/* ---- Content: List View ---- */}
      {viewMode === "list" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="w-10 pl-5 pr-0">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 min-w-[200px]">Company</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Industry</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Open Roles</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Contact</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Location</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Health</TableHead>
                <TableHead className="w-[60px] pr-5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-slate-300" />
                      <p className="text-[13px] text-slate-500">No companies match your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((r) => {
                  const hc = healthConfig[r.satisfaction] ?? healthConfig.Medium;
                  return (
                    <TableRow key={r.name} className="group border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                      <TableCell className="pl-5 pr-0">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl border border-slate-200/80">
                            <AvatarFallback className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-[11px] font-bold text-slate-600">
                              {r.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/recruiter/clients/${encodeURIComponent(r.name)}`} className="text-[13px] font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                              {r.name}
                            </Link>
                            <p className="text-[11px] text-slate-400 mt-0.5">{r.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] text-slate-600">{r.industry}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-2 text-xs font-semibold text-slate-700">{r.openRoles}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[13px] font-medium text-slate-700">{r.contact}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {r.city}, {r.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${hc.bg} ${hc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${hc.dot}`} />
                          {r.satisfaction}
                        </span>
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
                            <DropdownMenuItem className="text-[13px]">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px]">View Jobs</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-[13px]">Email Contact</DropdownMenuItem>
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
              Showing <span className="font-semibold text-slate-700">{(page - 1) * pageSize + 1}</span>
              {" "}to <span className="font-semibold text-slate-700">{Math.min(page * pageSize, filtered.length)}</span>
              {" "}of <span className="font-semibold text-slate-700">{filtered.length}</span> clients
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
              <Building2 className="h-8 w-8 text-slate-300" />
              <p className="text-[13px] text-slate-500">No companies match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((r) => {
                const hc = healthConfig[r.satisfaction] ?? healthConfig.Medium;
                return (
                  <div key={r.name} className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:shadow-md hover:border-slate-300/80">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-100">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <Link href={`/recruiter/clients/${encodeURIComponent(r.name)}`} className="text-[15px] font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            {r.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.industry}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200/80">
                          <DropdownMenuItem className="text-[13px]">Edit Company</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px]">View Jobs</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12px] text-slate-400"><MapPin className="h-3.5 w-3.5" /> Location</span>
                        <span className="text-[13px] font-medium text-slate-700">{r.city}, {r.state}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12px] text-slate-400"><Users className="h-3.5 w-3.5" /> Contact</span>
                        <span className="text-[13px] font-medium text-slate-700">{r.contact}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12px] text-slate-400"><Activity className="h-3.5 w-3.5" /> Health</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${hc.bg} ${hc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${hc.dot}`} />
                          {r.satisfaction}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="text-[12px] text-slate-500">
                        <span className="text-[15px] font-semibold text-slate-900">{r.openRoles}</span> Open Roles
                      </div>
                      <Link href={`/recruiter/clients/${encodeURIComponent(r.name)}`} className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid Pagination */}
          <div className="flex items-center justify-center gap-3">
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