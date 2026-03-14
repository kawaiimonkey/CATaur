"use client";

import { useState } from "react";
import { Section } from "@/components/recruiter/cards";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";

type ModelConfig = {
  summarization: string;
  matching: string;
  embeddings: string;
  temperature: number;
  topP: number;
};

export default function ModelsPage() {
  const [cfg, setCfg] = useState<ModelConfig>({
    summarization: "gpt-4o-mini",
    matching: "gpt-4o-mini",
    embeddings: "text-embedding-3-large",
    temperature: 0.2,
    topP: 0.9,
  });
  const [status, setStatus] = useState<string | null>(null);

  const save = () => setStatus("Configuration saved locally (demo). Connect persistence later.");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
      <Section title="AI models" subtitle="Configure summarization, matching, and embeddings" icon={<Cpu className="h-4 w-4" />}>
        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Summarization model</label>
            <input value={cfg.summarization} onChange={(e) => setCfg({ ...cfg, summarization: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Matching model</label>
            <input value={cfg.matching} onChange={(e) => setCfg({ ...cfg, matching: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Embeddings model</label>
            <input value={cfg.embeddings} onChange={(e) => setCfg({ ...cfg, embeddings: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Temperature</label>
              <input type="number" min={0} max={1} step={0.1} value={cfg.temperature} onChange={(e) => setCfg({ ...cfg, temperature: Number(e.target.value) })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Top P</label>
              <input type="number" min={0} max={1} step={0.05} value={cfg.topP} onChange={(e) => setCfg({ ...cfg, topP: Number(e.target.value) })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" onClick={() => setStatus("Reset to defaults (not persisted)")}>Reset</Button>
            <Button size="sm" onClick={save}>Save configuration</Button>
          </div>
          {status && <div className="md:col-span-2 text-sm text-slate-700">{status}</div>}
        </div>
      </Section>
    </div>
  );
}

