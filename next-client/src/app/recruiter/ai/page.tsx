"use client";

import { useState } from "react";
import { Eye, EyeOff, BrainCircuit } from "lucide-react";

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

export default function AIProviderConfigPage() {
    const [provider, setProvider] = useState("openai");
    const [key, setKey] = useState("");
    const [visible, setVisible] = useState(false);
    const [model, setModel] = useState(MODELS["openai"][0]);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const handleProviderChange = (id: string) => {
        setProvider(id);
        setModel(MODELS[id][0]);
        setStatus(null);
    };

    const handleSave = () => setStatus({ type: "success", msg: "Settings saved." });

    const handleTest = async () => {
        setStatus(null);
        await new Promise(r => setTimeout(r, 700));
        if (!key.trim()) { setStatus({ type: "error", msg: "API key is required to test." }); return; }
        setStatus({ type: "success", msg: "Connection verified successfully (simulated)." });
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
                        <p className="text-sm font-semibold text-[var(--gray-900)]">{PROVIDERS.find(p => p.id === provider)?.label} Settings</p>
                        <p className="text-xs text-[var(--gray-500)]">API credentials and model selection</p>
                    </div>
                </div>

                {/* Form fields */}
                <div className="p-5 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">API Key <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type={visible ? "text" : "password"}
                                    value={key}
                                    onChange={e => setKey(e.target.value)}
                                    placeholder={PROVIDERS.find(p => p.id === provider)?.placeholder}
                                    className="h-9 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-900)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] placeholder:text-[var(--gray-400)]"
                                />
                                <button type="button" onClick={() => setVisible(v => !v)}
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--gray-500)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[var(--gray-400)]">Stored locally for demo. Use a secret vault in production.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--gray-700)]">Default Model</label>
                            <select value={model} onChange={e => setModel(e.target.value)}
                                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--gray-700)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] cursor-pointer">
                                {MODELS[provider].map(m => <option key={m} value={m}>{m}</option>)}
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
                <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--gray-50)] px-5 py-3">
                    <p className="mr-auto text-xs text-[var(--gray-400)]">Rotate keys periodically and restrict scope by environment.</p>
                    <button onClick={handleTest}
                        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--gray-50)] transition-colors">
                        Test connection
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
