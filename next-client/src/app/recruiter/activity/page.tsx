"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type ActionType = "login" | "create" | "update" | "delete" | "export";

type Role = "Recruiter" | "Client" | "Admin";

type Log = {
    id: string;
    user: string;
    email: string;
    role: Role;
    action: ActionType;
    resource: string;
    details: string;
    ip: string;
    ts: string; // ISO datetime
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmtTs(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { date, time };
}

/* ─── Badge colours ───────────────────────────────────────────────────────── */
const ROLE_STYLE: Record<Role, { bg: string; text: string }> = {
    Admin: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-700)]" },
    Recruiter: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-700)]" },
    Client: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-700)]" },
};

const ACTION_STYLE: Record<ActionType, { bg: string; text: string }> = {
    login: { bg: "bg-[var(--status-blue-bg)]", text: "text-[var(--status-blue-text)]" },
    create: { bg: "bg-[var(--status-green-bg)]", text: "text-[var(--status-green-text)]" },
    update: { bg: "bg-[var(--status-amber-bg)]", text: "text-[var(--status-amber-text)]" },
    delete: { bg: "bg-[var(--status-red-bg)]", text: "text-[var(--status-red-text)]" },
    export: { bg: "bg-[var(--gray-100)]", text: "text-[var(--gray-600)]" },
};

/* ─── chevron SVG ─────────────────────────────────────────────────────────── */
const CHEV = 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")';
const CHEV_SM = `url('data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m6 9 6 6 6-6"/%3E%3C/svg%3E')`;

/* ─── Seed data ───────────────────────────────────────────────────────────── */
const ALL_LOGS: Log[] = [
    { id: "l01", user: "Allan Admin", email: "allan@cataur.com", role: "Admin", action: "login", resource: "Admin Console", details: "Signed in via password", ip: "203.0.113.45", ts: "2026-03-02T09:12:00" },
    { id: "l02", user: "Mia Chan", email: "mia@example.com", role: "Recruiter", action: "update", resource: "Job Order #1843", details: "Changed status to Active", ip: "198.51.100.12", ts: "2026-03-02T09:02:33" },
    { id: "l03", user: "Allan Admin", email: "allan@cataur.com", role: "Admin", action: "create", resource: "User: Leo Petrov", details: "Created new Client account", ip: "203.0.113.45", ts: "2026-03-01T17:54:09" },
    { id: "l04", user: "Leo Petrov", email: "leo@contoso.com", role: "Client", action: "login", resource: "Client Portal", details: "Signed in via password", ip: "192.0.2.73", ts: "2026-03-01T10:30:55" },
    { id: "l05", user: "Mia Chan", email: "mia@example.com", role: "Recruiter", action: "login", resource: "Recruiter Portal", details: "Signed in via SSO", ip: "198.51.100.12", ts: "2026-03-01T09:00:11" },
    { id: "l06", user: "Allan Admin", email: "allan@cataur.com", role: "Admin", action: "delete", resource: "User #44", details: "Permanently removed user account", ip: "203.0.113.45", ts: "2026-02-28T15:21:47" },
    { id: "l07", user: "Sarah Chen", email: "sarah@example.com", role: "Recruiter", action: "update", resource: "Candidate #291", details: "Updated resume and work history", ip: "198.51.100.88", ts: "2026-02-28T11:05:24" },
    { id: "l08", user: "Sarah Chen", email: "sarah@example.com", role: "Recruiter", action: "create", resource: "Job Order #1901", details: "Published new senior engineer role", ip: "198.51.100.88", ts: "2026-02-27T16:30:02" },
    { id: "l09", user: "Allan Admin", email: "allan@cataur.com", role: "Admin", action: "update", resource: "Email Settings", details: "Updated SMTP host and port", ip: "203.0.113.45", ts: "2026-02-27T09:44:18" },
    { id: "l10", user: "James Wilson", email: "james@example.com", role: "Client", action: "login", resource: "Client Portal", details: "Signed in via password", ip: "192.0.2.201", ts: "2026-02-26T14:15:36" },
    { id: "l11", user: "Allan Admin", email: "allan@cataur.com", role: "Admin", action: "export", resource: "Candidates List", details: "Exported 42 candidates to CSV", ip: "203.0.113.45", ts: "2026-02-26T11:03:00" },
    { id: "l12", user: "Mia Chan", email: "mia@example.com", role: "Recruiter", action: "create", resource: "Candidate #308", details: "Imported from LinkedIn profile", ip: "198.51.100.12", ts: "2026-02-25T10:22:49" },
    { id: "l13", user: "Allan Admin", email: "allan@cataur.com", role: "Admin", action: "update", resource: "AI Config", details: "Changed default model to GPT-4o", ip: "203.0.113.45", ts: "2026-02-24T16:50:07" },
    { id: "l14", user: "Sarah Chen", email: "sarah@example.com", role: "Recruiter", action: "delete", resource: "Job Order #1788", details: "Deleted draft job order", ip: "198.51.100.88", ts: "2026-02-24T09:38:21" },
    { id: "l15", user: "James Wilson", email: "james@example.com", role: "Client", action: "update", resource: "Client Profile", details: "Updated billing contact", ip: "192.0.2.201", ts: "2026-02-23T13:17:44" },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function AuditLogsPage() {
    const [query, setQuery] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return ALL_LOGS.filter(l =>
            (actionFilter === "all" || l.action === actionFilter) &&
            [l.user, l.email, l.action, l.resource, l.details, l.ip].some(v => v.toLowerCase().includes(q))
        );
    }, [query, actionFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
    const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const endIdx = Math.min(safePage * pageSize, filtered.length);

    const pageNums = useMemo(() => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
        else {
            pages.push(1);
            if (safePage > 3) pages.push("...");
            for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
            if (safePage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    }, [totalPages, safePage]);

    const navBtn = "flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-400)] cursor-pointer hover:bg-[var(--gray-100)] disabled:opacity-30 disabled:cursor-not-allowed";

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-900)]">Audit Logs</h1>
                    <p className="text-sm text-[var(--gray-500)] mt-1">Track sign-ins, updates, and admin actions across all users.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--gray-700)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors shadow-[var(--shadow-sm)]">
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => { setQuery(""); setActionFilter("all"); setPage(1); }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-[var(--accent-hover)] transition-colors">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Search + Filter ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
                    <input
                        placeholder="Search user, action, resource, IP…"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setPage(1); }}
                        className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--gray-900)] placeholder:text-[var(--gray-400)] shadow-[var(--shadow-sm)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)]"
                    />
                </div>
                <select
                    value={actionFilter}
                    onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                    style={{ backgroundImage: CHEV, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1em" }}
                    className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 pr-8 text-sm text-[var(--gray-700)] shadow-[var(--shadow-sm)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] appearance-none">
                    <option value="all">✓ All Actions</option>
                    <option value="login">Login</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="export">Export</option>
                </select>
            </div>

            {/* ── Table ── */}
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left w-44">Timestamp</th>
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left min-w-[160px]">User</th>
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left w-28 hidden sm:table-cell">Role</th>
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left w-24">Action</th>
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left">Resource</th>
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left hidden lg:table-cell">Details</th>
                                <th className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)] px-5 py-2.5 text-left hidden md:table-cell w-36">IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.length === 0 ? (
                                <tr><td colSpan={7} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <ClipboardList className="h-7 w-7 text-[var(--gray-300)]" />
                                        <p className="text-sm text-[var(--gray-500)]">No logs match your filters.</p>
                                    </div>
                                </td></tr>
                            ) : paged.map(l => {
                                const ac = ACTION_STYLE[l.action] ?? ACTION_STYLE.update;
                                const { date, time } = fmtTs(l.ts);
                                return (
                                    <tr key={l.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--gray-50)] transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="text-xs font-medium text-[var(--gray-700)]">{date}</p>
                                            <p className="text-xs text-[var(--gray-400)]">{time}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium text-[var(--gray-900)]">{l.user}</p>
                                            <p className="text-xs text-[var(--gray-500)]">{l.email}</p>
                                        </td>
                                        <td className="px-5 py-3 hidden sm:table-cell">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLE[l.role].bg} ${ROLE_STYLE[l.role].text}`}>{l.role}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ac.bg} ${ac.text}`}>
                                                {l.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-[var(--gray-700)] max-w-[160px] truncate">{l.resource}</td>
                                        <td className="px-5 py-3 text-sm text-[var(--gray-500)] hidden lg:table-cell max-w-[220px] truncate">{l.details}</td>
                                        <td className="px-5 py-3 font-mono text-xs text-[var(--gray-500)] hidden md:table-cell">{l.ip}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {filtered.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border)] px-5 py-3 bg-[var(--surface)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--gray-500)]">
                            <span>Rows</span>
                            <select
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                style={{ backgroundImage: CHEV_SM, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center", backgroundSize: "12px 12px" }}
                                className="h-7 w-[4.5rem] bg-[var(--surface)] appearance-none rounded-md border border-[var(--border)] px-2 pr-6 text-xs font-medium text-[var(--gray-600)] cursor-pointer focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)]">
                                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span>
                                <span className="font-medium text-[var(--gray-700)]">{startIdx}–{endIdx}</span>
                                {" "}of{" "}
                                <span className="font-medium text-[var(--gray-700)]">{filtered.length}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(1)} disabled={safePage === 1} className={navBtn}><ChevronsLeft className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={navBtn}><ChevronLeft className="h-3.5 w-3.5" /></button>
                            {pageNums.map((p, i) => p === "..." ? (
                                <span key={`e${i}`} className="flex h-7 w-7 items-center justify-center text-xs text-[var(--gray-400)]">…</span>
                            ) : (
                                <button key={p} onClick={() => setPage(p as number)}
                                    className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md text-xs font-medium transition ${p === safePage ? "bg-[var(--accent)] text-white" : "text-[var(--gray-500)] cursor-pointer hover:bg-[var(--gray-100)]"}`}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className={navBtn}><ChevronRight className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className={navBtn}><ChevronsRight className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
