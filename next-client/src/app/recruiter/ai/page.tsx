"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrainCircuit, Trash2, X, Plus, Save, RefreshCw } from "lucide-react";
import { request } from "@/lib/request";

/* ─── Static config ───────────────────────────────────────────────────────── */
const BUILTIN_PROVIDERS = [
    { id: "openai", label: "OpenAI", placeholder: "sk-…" },
    { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-…" },
    { id: "azure", label: "Azure OpenAI", placeholder: "Azure API key" },
    { id: "google", label: "Google", placeholder: "AIza…" },
];

/* ─── API types ───────────────────────────────────────────────────────────── */
type ProviderConfig = {
    provider: string;
    apiKey?: string;
    defaultModel?: string;
    baseUrl?: string;
    apiVersion?: string;
    [key: string]: unknown;
};

type ProviderModelsResponse = {
    provider: string;
    models: string[];
    defaultModel?: string;
    updatedAt: number;
};

type CustomProvider = {
    id: string;
    label: string;
    baseUrl: string;
    providerType?: "openai" | "anthropic" | "gemini" | "ollama";
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function AIProviderConfigPage() {
    const [provider, setProvider] = useState("openai");
    const [key, setKey] = useState("");
    const [maskedKey, setMaskedKey] = useState("");
    const [model, setModel] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [apiVersion, setApiVersion] = useState("");
    const [models, setModels] = useState<Record<string, ProviderModelsResponse>>({});
    const [customProviders, setCustomProviders] = useState<CustomProvider[]>([]);
    const [customDraft, setCustomDraft] = useState<CustomProvider>({ id: "", label: "", baseUrl: "", providerType: "openai" });
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingCustom, setSavingCustom] = useState(false);
    const [refreshingModels, setRefreshingModels] = useState(false);
    const [resetConfirm, setResetConfirm] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [modelStatus, setModelStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const providers = useMemo(() => {
        const custom = customProviders.map((customProvider) => ({
            id: customProvider.id,
            label: customProvider.label,
            placeholder: "API key",
        }));
        return [...BUILTIN_PROVIDERS, ...custom];
    }, [customProviders]);

    const currentProvider = providers.find(p => p.id === provider) ?? providers[0];

    /* ── GET /admin/ai-providers/custom ── */
    const loadCustomProviders = useCallback(async () => {
        try {
            const data = await request<{ providers: CustomProvider[] }>("/admin/ai-providers/custom");
            setCustomProviders((data?.providers ?? []).map((item) => ({
                ...item,
                providerType: item.providerType ?? "openai",
            })));
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to load custom providers." });
        }
    }, []);

    /* ── GET /admin/ai-providers/{provider} ── */
    const loadProvider = useCallback(async (id: string) => {
        setLoading(true);
        setStatus(null);
        setModelStatus(null);
        try {
            const data = await request<ProviderConfig>(`/admin/ai-providers/${id}`);
            setMaskedKey(data?.apiKey ?? "");
            setKey("");
            setModel(data?.defaultModel ?? "");
            setBaseUrl(data?.baseUrl ?? "");
            setApiVersion(data?.apiVersion ?? "");
        } catch (err: any) {
            // 404 = not yet configured – silently clear the form
            if (err.status !== 404) {
                setStatus({ type: "error", msg: err.message ?? "Failed to load provider." });
            }
            setKey("");
            setMaskedKey("");
            setModel("");
            setBaseUrl("");
            setApiVersion("");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadModels = useCallback(async (id: string, { refresh = false } = {}) => {
        setModelStatus(null);
        try {
            const path = refresh
                ? `/admin/ai-providers/${id}/models/refresh`
                : `/admin/ai-providers/${id}/models`;
            const data = await request<ProviderModelsResponse>(path, {
                method: refresh ? "POST" : "GET",
            });
            if (data?.models) {
                setModels((prev) => ({ ...prev, [id]: data }));
                if (!model || !data.models.includes(model)) {
                    setModel(data.defaultModel ?? data.models[0] ?? "");
                }
            }
        } catch (err: any) {
            if (err.status !== 404) {
                setModelStatus({ type: "error", msg: err.message ?? "Failed to load models." });
            }
        }
    }, [model]);

    useEffect(() => { loadCustomProviders(); }, [loadCustomProviders]);

    useEffect(() => { loadProvider(provider); }, [provider, loadProvider]);

    useEffect(() => { loadModels(provider); }, [provider, loadModels]);

    const handleProviderChange = (id: string) => {
        setProvider(id);
        setModel("");
    };

    /* ── PUT /admin/ai-providers/{provider} ── */
    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await request(`/admin/ai-providers/${provider}`, {
                method: "PUT",
                json: {
                    provider,
                    apiKey: key || undefined,
                    defaultModel: model,
                    baseUrl: baseUrl || undefined,
                    apiVersion: apiVersion || undefined,
                },
            });
            await loadModels(provider, { refresh: true });
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
            setMaskedKey("");
            setModel("");
            setBaseUrl("");
            setApiVersion("");
            setStatus({ type: "success", msg: res?.message ?? "Provider configuration removed." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to remove provider." });
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshModels = async () => {
        setRefreshingModels(true);
        try {
            await loadModels(provider, { refresh: true });
            setModelStatus({ type: "success", msg: "Model list refreshed." });
        } catch (err: any) {
            setModelStatus({ type: "error", msg: err.message ?? "Failed to refresh models." });
        } finally {
            setRefreshingModels(false);
        }
    };

    const handleSaveCustom = async () => {
        setSavingCustom(true);
        setStatus(null);
        try {
            const payload = { ...customDraft, id: customDraft.id.trim(), providerType: customDraft.providerType ?? "openai" };
            await request("/admin/ai-providers/custom", {
                method: "POST",
                json: payload,
            });
            setCustomDraft({ id: "", label: "", baseUrl: "", providerType: "openai" });
            setShowCustomForm(false);
            await loadCustomProviders();
            setStatus({ type: "success", msg: "Custom provider saved." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to save custom provider." });
        } finally {
            setSavingCustom(false);
        }
    };

    const handleDeleteCustom = async (id: string) => {
        setStatus(null);
        try {
            await request(`/admin/ai-providers/custom/${id}`, { method: "DELETE" });
            await loadCustomProviders();
            if (provider === id) {
                setProvider("openai");
            }
            setStatus({ type: "success", msg: "Custom provider deleted." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message ?? "Failed to delete custom provider." });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--gray-900)]">AI Provider Config</h1>
                <p className="text-sm text-[var(--gray-500)] mt-1">Securely manage AI provider credentials and model configuration.</p>
            </div>

            {/* Provider selector tabs */}
            <div className="flex flex-wrap gap-2">
                {providers.map(p => (
                    <button key={p.id} onClick={() => handleProviderChange(p.id)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium border transition-colors cursor-pointer ${provider === p.id
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--gray-700)] border-[var(--border)] hover:bg-[var(--gray-50)]"}`}>
                        {p.label}
                    </button>
                ))}
                <button onClick={() => setShowCustomForm(true)}
                    className="rounded-md px-3 py-1.5 text-sm font-medium border border-dashed border-[var(--border)] text-[var(--gray-600)] hover:bg-[var(--gray-50)]">
                    <span className="inline-flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add custom
                    </span>
                </button>
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
                            <input
                                type="password"
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                placeholder={loading ? "Loading…" : currentProvider.placeholder}
                                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-900)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] placeholder:text-[var(--gray-400)]"
                            />
                            <p className="text-xs text-[var(--gray-500)]">Stored: {maskedKey || "Not set"}. Enter a new key to update.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Default Model</label>
                            <select value={model} onChange={e => setModel(e.target.value)}
                                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-700)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] cursor-pointer">
                                {(models[provider]?.models ?? []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {provider === "azure" && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Azure Base URL</label>
                                <input
                                    value={baseUrl}
                                    onChange={e => setBaseUrl(e.target.value)}
                                    placeholder="https://{resource}.openai.azure.com"
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                                />
                            </div>
                        )}

                        {provider === "azure" && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Azure API Version</label>
                                <input
                                    value={apiVersion}
                                    onChange={e => setApiVersion(e.target.value)}
                                    placeholder="2024-02-01"
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                                />
                            </div>
                        )}

                        {provider === "google" && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Gemini endpoint</label>
                                <input
                                    value="https://generativelanguage.googleapis.com/v1beta/models"
                                    readOnly
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--gray-50)] px-3 text-sm text-[var(--gray-500)]"
                                />
                            </div>
                        )}
                    </div>

                    {modelStatus && (
                        <div className={`rounded-md px-4 py-2.5 text-sm ${modelStatus.type === "success" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]" : "bg-[var(--status-red-bg)] text-[var(--status-red-text)]"}`}>
                            {modelStatus.msg}
                        </div>
                    )}

                    {status && (
                        <div className={`rounded-md px-4 py-2.5 text-sm ${status.type === "success" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]" : "bg-[var(--status-red-bg)] text-[var(--status-red-text)]"}`}>
                            {status.msg}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--gray-50)] px-5 py-3 flex-wrap">
                    <button onClick={() => setResetConfirm(true)} disabled={loading || saving || (!key.trim() && !maskedKey)}
                        className="mr-auto flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--danger)] cursor-pointer hover:bg-[var(--danger-bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Trash2 className="h-3.5 w-3.5" /> Reset
                    </button>
                    <button onClick={handleRefreshModels} disabled={loading || saving || refreshingModels}
                        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <span className="inline-flex items-center gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5" /> {refreshingModels ? "Refreshing…" : "Refresh models"}
                        </span>
                    </button>
                    <button onClick={handleSave} disabled={loading || saving}
                        className="rounded-md border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {saving ? "Saving…" : "Save settings"}
                    </button>
                </div>
            </div>

            {/* ── Custom providers list ── */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--gray-50)] px-5 py-3">
                    <div>
                        <p className="text-sm font-semibold text-[var(--gray-900)]">Custom Providers</p>
                        <p className="text-xs text-[var(--gray-500)]">OpenAI-compatible providers (base URL + API key)</p>
                    </div>
                    <button onClick={() => setShowCustomForm(true)} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-50)]">
                        <span className="inline-flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5" /> Add
                        </span>
                    </button>
                </div>
                <div className="p-5 space-y-3">
                    {customProviders.length === 0 && (
                        <p className="text-sm text-[var(--gray-500)]">No custom providers yet.</p>
                    )}
                    {customProviders.map((customProvider) => (
                        <div key={customProvider.id} className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm">
                            <div>
                                <div className="font-medium text-[var(--gray-900)]">{customProvider.label}</div>
                                <div className="text-xs text-[var(--gray-500)]">{customProvider.baseUrl} · {customProvider.providerType ?? "openai"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setCustomDraft(customProvider);
                                        setShowCustomForm(true);
                                    }}
                                    className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCustom(customProvider.id)}
                                    className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════ CUSTOM PROVIDER DIALOG ═══════════════════ */}
            {showCustomForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-xl bg-[var(--surface)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                            <h2 className="text-lg font-semibold text-[var(--gray-900)]">Custom Provider</h2>
                            <button onClick={() => setShowCustomForm(false)} className="rounded-md text-[var(--gray-400)] hover:text-[var(--gray-600)] hover:bg-[var(--gray-100)] p-1.5 transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Provider ID</label>
                                <input
                                    value={customDraft.id}
                                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, id: e.target.value }))}
                                    placeholder="my-provider"
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                                />
                                <p className="text-xs text-[var(--gray-500)]">Lowercase letters, numbers, dash or underscore.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Label</label>
                                <input
                                    value={customDraft.label}
                                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, label: e.target.value }))}
                                    placeholder="My Provider"
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Endpoint Type</label>
                                <select
                                    value={customDraft.providerType ?? "openai"}
                                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, providerType: e.target.value as CustomProvider["providerType"] }))}
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                                >
                                    <option value="openai">OpenAI-compatible</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="gemini">Gemini</option>
                                    <option value="ollama">Ollama</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[var(--gray-700)]">Base URL</label>
                                <input
                                    value={customDraft.baseUrl}
                                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, baseUrl: e.target.value }))}
                                    placeholder="https://api.example.com"
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                                />
                                <p className="text-xs text-[var(--gray-500)]">
                                    {customDraft.providerType === "gemini" && "Example: https://generativelanguage.googleapis.com"}
                                    {customDraft.providerType === "anthropic" && "Example: https://api.anthropic.com"}
                                    {customDraft.providerType === "openai" && "Example: https://api.openai.com"}
                                    {customDraft.providerType === "ollama" && "Example: http://localhost:11434"}
                                </p>
                                <div className="rounded-md border border-[var(--border)] bg-[var(--gray-50)] px-3 py-2 text-xs text-[var(--gray-600)]">
                                    Endpoint preview: {
                                        customDraft.providerType === "gemini"
                                            ? `${(customDraft.baseUrl || "<baseUrl>").replace(/\/+$/, "")}/v1beta/models?key=...`
                                            : customDraft.providerType === "anthropic"
                                                ? `${(customDraft.baseUrl || "<baseUrl>").replace(/\/+$/, "")}/v1/models`
                                                : customDraft.providerType === "ollama"
                                                    ? `${(customDraft.baseUrl || "<baseUrl>").replace(/\/+$/, "")}/api/tags`
                                                    : `${(customDraft.baseUrl || "<baseUrl>").replace(/\/+$/, "")}/v1/models`
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--gray-50)] px-6 py-4">
                            <button onClick={() => setShowCustomForm(false)}
                                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] hover:bg-[var(--gray-50)] transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleSaveCustom} disabled={savingCustom}
                                className="rounded-md border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer">
                                {savingCustom ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
