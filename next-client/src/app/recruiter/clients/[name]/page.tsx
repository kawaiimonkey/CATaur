import { notFound } from "next/navigation";
import Link from "next/link";
import { CLIENTS, JOB_ORDERS } from "@/data/recruiter";
import { ArrowLeft, Building2, Phone, Mail, MapPin, Globe, Users, Code2, Briefcase, ChevronRight } from "lucide-react";

/**
 * Helper to build extended mock info based on the company name
 */
function buildMockClientDetails(name: string) {
  // deterministic string to number logic
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const emails = ["admin@", "contact@", "info@", "hello@"];
  const emailPrefix = emails[hash % emails.length];

  const states = ["CA", "NY", "TX", "ON", "BC", "QC", "WA"];
  const cities = ["San Francisco", "New York", "Austin", "Toronto", "Vancouver", "Montreal", "Seattle"];
  const state = states[hash % states.length];
  const city = cities[hash % cities.length];
  const country = ["ON", "BC", "QC"].includes(state) ? "Canada" : "United States";

  const techStacks = [
    "React, Node.js, AWS",
    "Python, Django, PostgreSQL",
    "Go, Kubernetes, GCP",
    "Java, Spring Boot, Azure",
    "Ruby on Rails, React",
    "Vue.js, Laravel, MySQL"
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const created = `${months[(hash + 4) % 12]} ${String(12 + (hash % 15))}, 2026`;

  return {
    name,
    email: `${emailPrefix}${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    contact: `John Doe ${hash % 5}`, // Placeholder contact
    phone: `(555) ${String(200 + (hash % 800))}-${String(1000 + (hash % 9000))}`,
    website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    location: `${city}, ${state} • ${country}`,
    keyTechnologies: techStacks[hash % techStacks.length],
    clientAccount: `Enterprise Account - Level ${hash % 3 + 1}`,
    owner: "Allan J.",
    created,
  };
}

export default async function ClientDetails({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const companyRecord = decodeURIComponent(name);

  // Real check against existing data, fallback to generated. (assuming mock nature of CLIENTS array)
  const baseRecord = CLIENTS.find((c) => c.company === companyRecord);
  if (!baseRecord) return notFound();

  const details = buildMockClientDetails(companyRecord);
  // Override generated contact with base contact if available
  details.contact = baseRecord.contact;

  const jobs = JOB_ORDERS.filter((j) => j.client === companyRecord);

  // Styling token matches Candidate
  const labelStyle = "text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]";
  const valStyle = "text-sm font-medium text-[var(--gray-900)] mt-1";

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Breadcrumb / Top actions */}
      <div className="flex items-center justify-between">
        <Link href="/recruiter/clients" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gray-500)] hover:text-[var(--gray-900)] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Companies
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <button className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--gray-700)] shadow-[var(--shadow-sm)] hover:bg-[var(--gray-50)] transition-colors cursor-pointer">
            Edit Company
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column (Main Info) */}
        <div className="space-y-6">

          {/* Header Card */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--gray-100)] text-xl font-bold text-[var(--gray-700)] shadow-sm">
                {details.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--gray-900)]">{details.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--gray-600)]">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--gray-400)]" /> {details.location}</div>
                  <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-[var(--gray-400)]" />
                    <a href={details.website} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">{details.website}</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[var(--border-light)]">
              <div>
                <span className={labelStyle}>Primary Contact</span>
                <div className="mt-1 flex items-center gap-2"><Users className="h-4 w-4 text-[var(--gray-400)]" /><span className="text-sm font-medium text-[var(--gray-900)]">{details.contact}</span></div>
              </div>
              <div>
                <span className={labelStyle}>Email</span>
                <div className="mt-1 flex items-center gap-2 truncate"><Mail className="h-4 w-4 text-[var(--gray-400)] shrink-0" /><span className="text-sm font-medium text-[var(--gray-900)] truncate pr-2">{details.email}</span></div>
              </div>
              <div>
                <span className={labelStyle}>Phone</span>
                <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--gray-400)]" /><span className="text-sm font-medium text-[var(--gray-900)]">{details.phone}</span></div>
              </div>
              <div>
                <span className={labelStyle}>Owner</span>
                <div className="mt-1 text-sm font-medium text-[var(--gray-900)]">{details.owner}</div>
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-base font-bold text-[var(--gray-900)] tracking-tight">Company Overview</h2>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <span className={labelStyle}>Key Technologies</span>
                <div className="mt-2 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[var(--gray-400)] shrink-0" />
                  <span className={valStyle.replace("mt-1", "")}>{details.keyTechnologies}</span>
                </div>
              </div>

              <div>
                <span className={labelStyle}>Client Account</span>
                <div className="mt-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[var(--gray-400)] shrink-0" />
                  <span className={valStyle.replace("mt-1", "")}>{details.clientAccount}</span>
                </div>
              </div>

              <div>
                <span className={labelStyle}>Created Time</span>
                <div className="mt-2 text-sm font-[family-name:ui-monospace,monospace] text-[var(--gray-600)]">
                  {details.created}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--gray-900)]">Open Job Orders</h3>
              <Link href="/recruiter/job-orders/new" className="text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer">
                + Add New
              </Link>
            </div>

            <ul className="space-y-3">
              {jobs.length === 0 ? (
                <li className="text-sm text-[var(--gray-500)] text-center py-4">No open job orders</li>
              ) : (
                jobs.map(j => (
                  <li key={j.id} className="group flex items-center justify-between rounded-lg border border-[var(--border-light)] p-3 hover:border-[var(--border)] hover:bg-[var(--gray-50)] transition-all cursor-pointer">
                    <div className="flex-1 min-w-0 pr-3">
                      <Link href={`/recruiter/job-orders/${encodeURIComponent(j.id)}`} className="truncate text-sm font-semibold text-[var(--gray-900)] group-hover:text-[var(--accent)] transition-colors block">
                        {j.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[var(--gray-500)]">
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium
                          ${j.status === 'interview' ? 'bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]' :
                            j.status === 'sourcing' ? 'bg-[var(--status-green-bg)] text-[var(--status-green-text)]' :
                              'bg-[var(--gray-100)] text-[var(--gray-600)]'}`}>
                          {j.status.charAt(0).toUpperCase() + j.status.slice(1)}
                        </span>
                        <span className="truncate">{j.location}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--gray-300)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
}
