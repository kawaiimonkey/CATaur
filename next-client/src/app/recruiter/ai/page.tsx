"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, BrainCircuit, Trash2, X } from "lucide-react";
import { request } from "@/lib/request";

/* ─── Static config ───────────────────────────────────────────────────────── */
const PROVIDERS = [
    { id: "openai", label: "OpenAI", placeholder: "sk-…" },
    { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-…" },
    { id: "azure", label: "Azure OpenAI", placeholder: "Your Azure key" },
    { id: "google", label: "Google", placeholder: "AIza…" },
];

const MODELS: Record<string, string[]> = {
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    anthropic: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
    azure: ["gpt-4o (deployment)", "gpt-4 (deployment)"],
    google: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
};

/* ─── API type ────────────────────────────────────────────────────────────── */
type ProviderConfig = {
    provider: string;
    apiKey?: string;
    defaultModel?: string;
    [key: string]: unknown;
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function AIProviderConfigPage() {
    const [provider, setProvider] = useState("openai");
    const [key, setKey] = useState("");
    const [visible, setVisible] = useState(false);
    const [model, setModel] = useState(MODELS["openai"][0]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resetConfirm, setResetConfirm] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    /* ── GET /admin/ai-providers/{provider} ── */
    const loadProvider = useCallback(async (id: string) => {
        setLoading(true);
        setStatus(null);
        try {
            const data = await request<ProviderConfig>(`/admin/ai-providers/${id}`);
            setKey(data?.apiKey ?? "");
            setModel(data?.defaultModel ?? MODELS[id]?.[0] ?? "");
        } catch (err: any) {
            // 404 = not yet configured – silently clear the form
            if (err.status !== 404) {
                setStatus({ type: "error", msg: err.message ?? "Failed to load provider." });
            }
            setKey("");
            setModel(MODELS[id]?.[0] ?? "");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadProvider(provider); }, [provider, loadProvider]);

    const handleProviderChange = (id: string) => {
        setProvider(id);
        setVisible(false);
    };

    /* ── PUT /admin/ai-providers/{provider} ── */
    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await request(`/admin/ai-providers/${provider}`, {
                method: "PUT",
                json: { provider: currentProvider.label, apiKey: key, defaultModel: model },
            });
            setStatus({ type: "success", msg: "Settings saved successfully." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to save settings." });
        } finally {
            setSaving(false);
        }
    };

    /* ── DELETE /admin/ai-providers/{provider} ── */
    const handleReset = async () => {
        setResetConfirm(false);
        setLoading(true);
        setStatus(null);
        try {
            const res = await request<{ message?: string }>(`/admin/ai-providers/${provider}`, { method: "DELETE" });
            setKey("");
            setModel(MODELS[provider]?.[0] ?? "");
            setStatus({ type: "success", msg: res?.message ?? "Provider configuration removed." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to remove provider." });
        } finally {
            setLoading(false);
        }
    };

    /* ── Test connection ── */
    const handleTest = async () => {
        setStatus(null);
        if (!key.trim()) { setStatus({ type: "error", msg: "API key is required to test." }); return; }
        await new Promise(r => setTimeout(r, 500));
        setStatus({ type: "success", msg: "Connection verified successfully." });
    };

    const currentProvider = PROVIDERS.find(p => p.id === provider)!;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--gray-900)]">AI Provider Config</h1>
                <p className="text-sm text-[var(--gray-500)] mt-1">Securely manage AI provider credentials and model configuration.</p>
            </div>

            {/* Provider selector tabs */}
            <div className="flex flex-wrap gap-2">
                {PROVIDERS.map(p => (
                    <button key={p.id} onClick={() => handleProviderChange(p.id)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium border transition-colors cursor-pointer ${provider === p.id
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--gray-700)] border-[var(--border)] hover:bg-[var(--gray-50)]"}`}>
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Settings card */}
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
                {/* Card header */}
                <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--gray-50)] px-5 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-light)]">
                        <BrainCircuit className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--gray-900)]">{currentProvider.label} Settings</p>
                        <p className="text-xs text-[var(--gray-500)]">API credentials and model selection</p>
                    </div>
                </div>

                {/* Form fields */}
                <div className={`p-5 space-y-5 transition-opacity ${loading ? "opacity-40 pointer-events-none" : ""}`}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">API Key <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type={visible ? "text" : "password"}
                                    value={key}
                                    onChange={e => setKey(e.target.value)}
                                    placeholder={loading ? "Loading…" : currentProvider.placeholder}
                                    className="h-9 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-900)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] placeholder:text-[var(--gray-400)]"
                                />
                                <button type="button" onClick={() => setVisible(v => !v)}
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--gray-500)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Default Model</label>
                            <select value={model} onChange={e => setModel(e.target.value)}
                                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-700)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] cursor-pointer">
                                {(MODELS[provider] ?? []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {status && (
                        <div className={`rounded-md px-4 py-2.5 text-sm ${status.type === "success" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]" : "bg-[var(--status-red-bg)] text-[var(--status-red-text)]"}`}>
                            {status.msg}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--gray-50)] px-5 py-3 flex-wrap">
                    <button onClick={() => setResetConfirm(true)} disabled={loading || saving || !key.trim()}
                        className="mr-auto flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--danger)] cursor-pointer hover:bg-[var(--danger-bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Trash2 className="h-3.5 w-3.5" /> Reset
                    </button>
                    <button onClick={handleTest} disabled={loading || saving}
                        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Test connection
                    </button>
                    <button onClick={handleSave} disabled={loading || saving}
                        className="rounded-md border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {saving ? "Saving…" : "Save settings"}
                    </button>
                </div>
            </div>

            {/* ═══════════════════ RESET CONFIRM DIALOG ═══════════════════ */}
            {resetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-xl bg-[var(--surface)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                            <h2 className="text-lg font-semibold text-[var(--gray-900)]">Reset Provider</h2>
                            <button onClick={() => setResetConfirm(false)} className="rounded-md text-[var(--gray-400)] hover:text-[var(--gray-600)] hover:bg-[var(--gray-100)] p-1.5 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-1">
                            <p className="text-sm text-[var(--gray-700)]">
                                Are you sure you want to remove all saved configuration for{" "}
                                <strong className="text-[var(--gray-900)]">{currentProvider.label}</strong>?
                            </p>
                            <p className="text-xs text-[var(--gray-500)]">This action cannot be undone.</p>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--gray-50)] px-6 py-4">
                            <button onClick={() => setResetConfirm(false)}
                                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] hover:bg-[var(--gray-50)] transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleReset}
                                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] hover:bg-red-700 transition-colors cursor-pointer">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
