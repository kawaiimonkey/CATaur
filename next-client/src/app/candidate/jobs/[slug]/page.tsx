import { JOBS } from "@/data/jobs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  DollarSign,
  Building2,
  Clock,
} from "lucide-react";
import ApplyPanel from "./apply-panel";

// ─── Static params for Next.js pre-render ─────────────────────────────────────

export function generateStaticParams() {
  return JOBS.map((job) => ({ slug: job.slug }));
}

// ─── Lightweight Markdown renderer ───────────────────────────────────────────
// Supports: ## headings, **bold**, bullet lists (- or •), paragraphs.
// No external dependency needed.

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let keyIndex = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${keyIndex++}`} className="mb-5 space-y-2 pl-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span dangerouslySetInnerHTML={{ __html: boldify(item) }} />
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const boldify = (text: string) =>
    text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  for (const raw of lines) {
    const line = raw.trim();

    // H2
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={keyIndex++} className="mb-3 mt-8 first:mt-0 text-lg font-bold text-secondary">
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={keyIndex++} className="mb-2 mt-6 text-base font-semibold text-slate-800">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Bullet list items
    if (line.startsWith("- ") || line.startsWith("• ")) {
      listBuffer.push(line.slice(2));
      continue;
    }

    // Empty line: flush list, skip
    if (line === "") {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    elements.push(
      <p
        key={keyIndex++}
        className="mb-4 text-sm leading-relaxed text-slate-700"
        dangerouslySetInnerHTML={{ __html: boldify(line) }}
      />
    );
  }

  flushList();
  return <div>{elements}</div>;
}

// ─── Work arrangement badge ───────────────────────────────────────────────────

function ArrangementBadge({ arrangement }: { arrangement: string }) {
  const style =
    arrangement === "Remote"
      ? "bg-success/10 text-success border border-success/20"
      : arrangement === "Hybrid"
        ? "bg-info/10 text-info border border-info/20"
        : "bg-warning/10 text-warning border border-warning/20";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {arrangement}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type JobDetailPageProps = { params: Promise<{ slug: string }> };

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = JOBS.find((j) => j.slug === slug);
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Back bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-600">
            <Link href="/candidate/jobs">
              <ArrowLeft className="h-4 w-4" />
              Back to Job Search
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* ── Main content ───────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Header card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-5">
                {/* Company avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-500 select-none">
                  {job.company.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-secondary">{job.title}</h1>
                    <ArrangementBadge arrangement={job.workArrangement} />
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {job.company}
                    {job.department && (
                      <span className="text-slate-400">· {job.department}</span>
                    )}
                  </p>

                  {/* Meta chips */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      {job.type}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                        <DollarSign className="h-3.5 w-3.5" />
                        {job.salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {job.openings} {job.openings === 1 ? "opening" : "openings"}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Posted {job.postedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description card */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <MarkdownRenderer content={job.description} />
            </div>

          </div>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <ApplyPanel slug={job.slug} jobTitle={job.title} company={job.company} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
