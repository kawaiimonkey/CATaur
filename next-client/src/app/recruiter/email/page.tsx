"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function EmailServerPage() {
    const [form, setForm] = useState({
        host: "smtp.sendgrid.net",
        port: "587",
        secure: "STARTTLS",
        user: "apikey",
        pass: "",
        fromName: "CATaur",
        fromEmail: "noreply@cataur.app",
    });
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const handleSave = () => setStatus({ type: "success", msg: "Settings saved." });

    const handleTest = async () => {
        setStatus(null);
        await new Promise(r => setTimeout(r, 800));
        if (!form.host.trim()) { setStatus({ type: "error", msg: "SMTP host is required." }); return; }
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
                <div className="p-5 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">SMTP Host <span className="text-red-500">*</span></label>
                            <input value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} className={field} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Port</label>
                                <input type="number" value={form.port} onChange={e => setForm({ ...form, port: e.target.value })} className={field} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Security</label>
                                <select value={form.secure} onChange={e => setForm({ ...form, secure: e.target.value })}
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-700)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] cursor-pointer">
                                    <option>STARTTLS</option>
                                    <option>SSL/TLS</option>
                                    <option>None</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Username</label>
                            <input value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} className={field} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Password / API Key</label>
                            <input type="password" value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })} placeholder="••••••" className={field} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">From Name</label>
                            <input value={form.fromName} onChange={e => setForm({ ...form, fromName: e.target.value })} className={field} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">From Email</label>
                            <input type="email" value={form.fromEmail} onChange={e => setForm({ ...form, fromEmail: e.target.value })} className={field} />
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
                    <p className="mr-auto text-xs text-[var(--gray-400)]">Changes are local only in demo mode.</p>
                    <button onClick={handleTest}
                        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                        Send test email
                    </button>
                    <button onClick={handleSave}
                        className="rounded-md border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors">
                        Save settings
                    </button>
                </div>
            </div>
        </div>
    );
}
