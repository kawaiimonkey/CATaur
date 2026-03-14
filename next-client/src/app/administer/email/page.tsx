"use client";

import { useState } from "react";
import { Section } from "@/components/recruiter/cards";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function EmailSettingsPage() {
  const [form, setForm] = useState({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: "STARTTLS",
    user: "apikey",
    pass: "",
    fromName: "CATaur",
    fromEmail: "noreply@cataur.app",
  });
  const [status, setStatus] = useState<string | null>(null);

  const testDelivery = async () => {
    setStatus("Sending test email…");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("Delivered! Check your inbox.");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
      <Section title="Email server settings" subtitle="SMTP configuration and sender identity" icon={<Mail className="h-4 w-4" />}>
        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">SMTP host</label>
            <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Port</label>
              <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Security</label>
              <select value={form.secure} onChange={(e) => setForm({ ...form, secure: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3">
                <option>STARTTLS</option>
                <option>SSL/TLS</option>
                <option>None</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Password / API key</label>
            <input type="password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">From name</label>
            <input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">From email</label>
            <input value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} className="h-10 w-full rounded-md border border-slate-300 px-3" />
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <div className="text-sm text-slate-600">Changes are saved locally for demo. Connect backend later.</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" onClick={() => setStatus("Saved")}>Save</Button>
              <Button size="sm" onClick={testDelivery}>Send test</Button>
            </div>
          </div>
          {status && <div className="md:col-span-2 text-sm text-slate-700">{status}</div>}
        </div>
      </Section>
    </div>
  );
}

