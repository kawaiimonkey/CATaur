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
  Pencil,
  Trash2,
  X,
  AlertCircle
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
  active: { label: "Active", bg: "bg-[var(--status-green-bg)]", text: "text-[var(--status-green-text)]", dot: "bg-[var(--status-green-text)]" },
  sourcing: { label: "Sourcing", bg: "bg-[var(--status-blue-bg)]", text: "text-[var(--status-blue-text)]", dot: "bg-[var(--status-blue-text)]" },
  interview: { label: "Interview", bg: "bg-[var(--status-amber-bg)]", text: "text-[var(--status-amber-text)]", dot: "bg-[var(--status-amber-text)]" },
  offer: { label: "Offer", bg: "bg-[var(--status-green-bg)]", text: "text-[var(--status-green-text)]", dot: "bg-[var(--status-green-text)]" },
  filled: { label: "Closed", bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-600)]", dot: "bg-[var(--gray-400)]" },
  paused: { label: "On Hold", bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-600)]", dot: "bg-[var(--gray-400)]" },
};

const priorityConfig: Record<string, { label: string; dot: string; text: string }> = {
  high: { label: "High", dot: "bg-[var(--status-red-text)]", text: "text-[var(--status-red-text)]" },
  medium: { label: "Medium", dot: "bg-[var(--status-amber-text)]", text: "text-[var(--status-amber-text)]" },
  low: { label: "Low", dot: "bg-[var(--gray-400)]", text: "text-[var(--gray-500)]" },
};

export default function RecruiterJobOrdersPage() {
  const [query, setQuery] = useState("");
  const [statusGroup, setStatusGroup] = useState<StatusGroup>("all");
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [localAdds, setLocalAdds] = useState<JobOrderExtra[]>([]);

  // Status Confirmation Modal State
  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
    newStatus: string;
  }>({
    isOpen: false,
    jobId: "",
    jobTitle: "",
    newStatus: "active"
  });

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
  }, [allItems, statusGroup, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const total = allItems.length;
    const active = allItems.filter((j) => getStatusGroup(j.status) === "active").length;
    const onHold = allItems.filter((j) => getStatusGroup(j.status) === "onhold").length;
    const filled = allItems.filter((j) => getStatusGroup(j.status) === "full").length;
    return { total, active, onHold, filled };
  }, [allItems]);

  const handleStatusChangeClick = (jobId: string, jobTitle: string, newStatus: string) => {
    setStatusConfirmModal({
      isOpen: true,
      jobId,
      jobTitle,
      newStatus
    });
  };

  const confirmStatusChange = () => {
    // In a real app, you would dispatch an API call or update state here.
    // We update localAdds to mock this behavior if the item exists there, 
    // or just console/close modal for static data.
    const { jobId, newStatus } = statusConfirmModal;

    // Simple mock update for locally added jobs:
    setLocalAdds(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: newStatus as any } : job
    ));

    setStatusConfirmModal({ isOpen: false, jobId: "", jobTitle: "", newStatus: "active" });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--gray-900)] tracking-tight">Job Orders</h2>
          <p className="text-sm text-[var(--gray-500)] mt-1">Manage and track all open requisitions</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
              <Input
                placeholder="Search jobs,"
                className="h-9 bg-[var(--surface)] pl-9 text-sm border-[var(--border)] rounded-md shadow-[var(--shadow-sm)] text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus-visible:ring-1 focus-visible:ring-[var(--accent-ring)]"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 pr-8 text-sm text-[var(--gray-700)] shadow-[var(--shadow-sm)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] appearance-none relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1em" }}
              value={statusGroup}
              onChange={(e) => { setStatusGroup(e.target.value as StatusGroup); setPage(1); }}
            >
              <option value="all">✓ All Statuses</option>
              <option value="active">Active</option>
              <option value="onhold">On Hold</option>
              <option value="full">Closed</option>
            </select>
          </div>
          <Button size="sm" className="h-9 gap-2 shrink-0 bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--accent-hover)]" asChild>
            <Link href="/recruiter/job-orders/new">
              <Plus className="h-4 w-4" />
              New Job Order
            </Link>
          </Button>
        </div>
      </div>



      {/* Data Table */}
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-[var(--gray-50)]">
              <TableRow className="border-b border-[var(--border)] hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] pl-6 min-w-[200px]">Title</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">Company</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">Type</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">Owner</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">Created</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] text-center">Action</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] text-right pr-6 w-[120px]">Applicants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center cursor-pointer hover:bg-transparent">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-[var(--gray-300)]" />
                      <p className="text-sm text-[var(--gray-500)]">No job orders match your filters.</p>
                      <p className="text-xs text-[var(--gray-400)]">Try adjusting your search or filter criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((j) => {
                  const { created, ageDays } = toCreatedAndAgeFromId(j.id);
                  const pc = priorityConfig[j.priority] ?? priorityConfig.medium;

                  // Consolidate status for display in dropdown
                  const unifiedStatus = ["sourcing", "interview", "offer", "active"].includes(j.status) ? "active" : j.status === "paused" ? "paused" : "filled";
                  const sc = statusConfig[unifiedStatus] ?? statusConfig.active;

                  return (
                    <TableRow key={j.id} className="group cursor-pointer border-b border-[var(--border-light)] transition-colors hover:bg-[var(--gray-50)]">
                      <TableCell className="pl-6 py-4">
                        <Link href={`/recruiter/job-orders/${encodeURIComponent(j.id)}`} className="text-sm font-semibold text-[var(--gray-900)] hover:text-[var(--accent)] transition-colors">
                          {j.title}
                        </Link>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-[var(--gray-700)]">{j.client}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-[var(--gray-600)]">Full-time</span>
                      </TableCell>
                      <TableCell className="py-4 relative">
                        <select
                          className={`appearance-none cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] ${sc.bg} ${sc.text} transition-colors border-none`}
                          style={{
                            paddingRight: "1.5rem",
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(sc.dot.includes('green') ? '#166534' : sc.dot.includes('amber') ? '#92400e' : sc.dot.includes('blue') ? '#1e40af' : '#4b5563')}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.35rem center",
                            backgroundSize: "0.8em"
                          }}
                          value={unifiedStatus}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = e.target.value;
                            const newStatus = value === "filled" ? "filled" : value === "paused" ? "paused" : "active";
                            if (newStatus !== unifiedStatus) {
                              handleStatusChangeClick(j.id, j.title, newStatus);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="active">Active</option>
                          <option value="paused">On Hold</option>
                          <option value="filled">Closed</option>
                        </select>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-[var(--gray-700)]">Allan J.</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-[var(--gray-600)]">
                          {(() => {
                            const d = new Date(Date.now() - ageDays * 86400000);
                            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                          })()}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 border-l border-transparent">
                        <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/recruiter/job-orders/${encodeURIComponent(j.id)}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-500)] cursor-pointer hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-500)] cursor-pointer hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <span className="inline-flex items-center justify-center font-medium text-sm text-[var(--gray-900)]">
                          {j.applicants}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4 bg-[var(--surface)]">
          <p className="text-sm text-[var(--gray-500)]">
            Showing{" "}
            <span className="font-semibold text-[var(--gray-700)]">
              {pageItems.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>
            {" "}to{" "}
            <span className="font-semibold text-[var(--gray-700)]">
              {Math.min(page * pageSize, filtered.length)}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-[var(--gray-700)]">{filtered.length}</span>
            {" "}results
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--gray-500)] transition-colors cursor-pointer hover:bg-[var(--gray-50)] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${page === pageNum
                    ? "bg-[var(--accent)] text-white border border-[var(--accent)]"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--gray-600)] cursor-pointer hover:bg-[var(--gray-50)]"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--gray-500)] transition-colors cursor-pointer hover:bg-[var(--gray-50)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Status Confirmation Modal */}
      {statusConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md rounded-xl bg-[var(--surface)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-[var(--gray-900)]">
                <AlertCircle className="h-5 w-5 text-[var(--status-amber-text)]" />
                Confirm Status Change
              </div>
              <button
                onClick={() => setStatusConfirmModal({ ...statusConfirmModal, isOpen: false })}
                className="rounded-md text-[var(--gray-400)] hover:text-[var(--gray-600)] hover:bg-[var(--gray-100)] p-1.5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-[var(--gray-600)]">
                Are you sure you want to change the status of <strong>{statusConfirmModal.jobTitle}</strong> to <strong>{statusConfig[statusConfirmModal.newStatus]?.label || statusConfirmModal.newStatus}</strong>?
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--gray-50)] px-6 py-4">
              <button
                onClick={() => setStatusConfirmModal({ ...statusConfirmModal, isOpen: false })}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] hover:bg-[var(--gray-50)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="rounded-md border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
