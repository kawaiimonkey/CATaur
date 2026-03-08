"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { request } from "@/lib/request";

/* ─── Types ───────────────────────────────────────────────────────────────── */
type EmailConfig = {
    host: string;
    port: number;
    auth: { user: string; pass: string };
    emailFrom: string;
    fromName: string;
};

const EMPTY: EmailConfig = {
    host: "", port: 587, auth: { user: "", pass: "" }, emailFrom: "", fromName: "",
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function EmailServerPage() {
    const [form, setForm] = useState<EmailConfig>(EMPTY);
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    /* ── GET /admin/email-config ── */
    useEffect(() => {
        setLoading(true);
        request<EmailConfig>("/admin/email-config")
            .then(data => setForm(data ?? EMPTY))
            .catch(err => setStatus({ type: "error", msg: err.message ?? "Failed to load configuration." }))
            .finally(() => setLoading(false));
    }, []);

    /* ── PUT /admin/email-config ── */
    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await request("/admin/email-config", {
                method: "PUT",
                json: form,
            });
            setStatus({ type: "success", msg: "Settings saved successfully." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to save settings." });
        } finally {
            setSaving(false);
        }
    };

    /* ── Test connection (client-side check only, no dedicated endpoint) ── */
    const handleTest = async () => {
        setStatus(null);
        if (!form.host.trim()) { setStatus({ type: "error", msg: "SMTP host is required." }); return; }
        await new Promise(r => setTimeout(r, 800));
        setStatus({ type: "success", msg: "Test email delivered successfully (simulated)." });
    };

    const field = "h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-900)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] placeholder:text-[var(--gray-400)]";

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--gray-900)]">Email Server</h1>
                <p className="text-sm text-[var(--gray-500)] mt-1">SMTP configuration and sender identity for outgoing emails.</p>
            </div>

            {/* Card */}
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
                {/* Card header */}
                <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--gray-50)] px-5 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-light)]">
                        <Mail className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--gray-900)]">SMTP Settings</p>
                        <p className="text-xs text-[var(--gray-500)]">Configure outbound mail server and sender identity</p>
                    </div>
                </div>

                {/* Form */}
                <div className={`p-5 space-y-5 transition-opacity ${loading ? "opacity-40 pointer-events-none" : ""}`}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* SMTP Host */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">SMTP Host <span className="text-red-500">*</span></label>
                            <input value={form.host} onChange={e => setForm({ ...form, host: e.target.value })}
                                placeholder="smtp.gmail.com" className={field} />
                        </div>

                        {/* Port */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Port</label>
                            <input type="number" value={form.port}
                                onChange={e => setForm({ ...form, port: Number(e.target.value) })}
                                placeholder="587" className={field} />
                        </div>

                        {/* Auth Username */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Username</label>
                            <input value={form.auth.user}
                                onChange={e => setForm({ ...form, auth: { ...form.auth, user: e.target.value } })}
                                placeholder="smtp-user@example.com" className={field} />
                        </div>

                        {/* Auth Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Password / App Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={form.auth.pass}
                                    onChange={e => setForm({ ...form, auth: { ...form.auth, pass: e.target.value } })}
                                    placeholder="••••••••" className={field + " pr-10"} />
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--gray-600)]">
                                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* From Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">From Name</label>
                            <input value={form.fromName}
                                onChange={e => setForm({ ...form, fromName: e.target.value })}
                                placeholder="CATaur System" className={field} />
                        </div>

                        {/* Email From */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">From Email</label>
                            <input type="email" value={form.emailFrom}
                                onChange={e => setForm({ ...form, emailFrom: e.target.value })}
                                placeholder="no-reply@cataur.com" className={field} />
                        </div>
                    </div>

                    {status && (
                        <div className={`rounded-md px-4 py-2.5 text-sm ${status.type === "success" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]" : "bg-[var(--status-red-bg)] text-[var(--status-red-text)]"}`}>
                            {status.msg}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--gray-50)] px-5 py-3">
                    <button onClick={handleTest} disabled={loading || saving}
                        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Send test email
                    </button>
                    <button onClick={handleSave} disabled={loading || saving}
                        className="rounded-md border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {saving ? "Saving…" : "Save settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}
