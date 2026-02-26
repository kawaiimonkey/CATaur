"use client";

import { useState } from "react";
import { Section } from "@/components/recruiter/cards";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

export default function AIKeyPage() {
  const [provider, setProvider] = useState("OpenAI");
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const save = () => setStatus("Saved locally (demo). Secure vault recommended.");
  const test = async () => {
    setStatus("Verifying credentials…");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("Key valid (simulated).");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
      <Section title="AI API key" subtitle="Securely manage provider credentials" icon={<KeyRound className="h-4 w-4" />}>
        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3">
              <option>OpenAI</option>
              <option>Anthropic</option>
              <option>Azure OpenAI</option>
              <option>Google</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">API Key</label>
            <div className="flex gap-2">
              <input type={visible ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-…" className="h-10 w-full rounded-md border border-slate-300 px-3" />
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" onClick={() => setVisible((v) => !v)}>
                {visible ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <div className="text-sm text-slate-600">Rotate keys periodically and restrict scope by environment.</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" onClick={save}>Save</Button>
              <Button size="sm" onClick={test}>Test key</Button>
            </div>
          </div>
          {status && <div className="md:col-span-2 text-sm text-slate-700">{status}</div>}
        </div>
      </Section>
    </div>
  );
}

