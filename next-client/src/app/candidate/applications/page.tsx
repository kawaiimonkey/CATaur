import { Button } from "@/components/ui/button";
import { Section } from "@/components/recruiter/cards";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  Building2,
  MapPin,
} from "lucide-react";

const APPLICATIONS = [
  {
    id: 1,
    role: "Senior Backend Engineer (Go)",
    company: "Maple Fintech",
    location: "Toronto",
    appliedDate: "Oct 24, 2025",
    status: "Interview Scheduled",
    statusType: "success" as const,
    nextStep: "Panel interview on Thu, Oct 26 at 2:30 PM",
  },
  {
    id: 2,
    role: "Frontend Engineer (React/Next.js)",
    company: "Aurora Health",
    location: "Vancouver",
    appliedDate: "Oct 24, 2025",
    status: "Under Review",
    statusType: "info" as const,
    nextStep: "Awaiting recruiter feedback",
  },
  {
    id: 3,
    role: "DevOps / SRE",
    company: "Granite AI",
    location: "Calgary",
    appliedDate: "Oct 23, 2025",
    status: "Interview Scheduled",
    statusType: "success" as const,
    nextStep: "Technical round on Fri, Oct 27 at 9:00 AM",
  },
  {
    id: 4,
    role: "Data Engineer",
    company: "Polar Analytics",
    location: "Montreal",
    appliedDate: "Oct 23, 2025",
    status: "Application Sent",
    statusType: "warning" as const,
    nextStep: "Application submitted, awaiting response",
  },
  {
    id: 5,
    role: "Mobile Engineer (iOS)",
    company: "Lighthouse Mobility",
    location: "Ottawa",
    appliedDate: "Oct 22, 2025",
    status: "Offer Discussion",
    statusType: "success" as const,
    nextStep: "Compensation negotiation in progress",
  },
];

const UPCOMING_INTERVIEWS = [
  {
    date: "Thu, Oct 26",
    time: "2:30 PM EDT",
    role: "Senior Backend Engineer",
    company: "Maple Fintech",
    type: "Panel Interview",
    format: "Zoom",
  },
  {
    date: "Fri, Oct 27",
    time: "9:00 AM PDT",
    role: "DevOps / SRE",
    company: "Granite AI",
    type: "Technical Round",
    format: "Zoom",
  },
  {
    date: "Mon, Oct 30",
    time: "11:00 AM EST",
    role: "Frontend Engineer",
    company: "Aurora Health",
    type: "Portfolio Review",
    format: "Google Meet",
  },
];

const TASKS = [
  { task: "Confirm availability for Maple Fintech panel interview", urgent: true },
  { task: "Share GitHub/portfolio links with Aurora Health", urgent: false },
  { task: "Add references for Lighthouse Mobility offer", urgent: true },
  { task: "Prepare system design examples for Granite AI", urgent: false },
];

function StatusBadge({ status, type }: { status: string; type: "success" | "info" | "warning" }) {
  const colors = {
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors[type]}`}>
      {status}
    </span>
  );
}

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary">My Applications</h1>
              <p className="mt-1 text-sm text-slate-600">Track your job applications and interviews</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="md">
                <FileText className="h-4 w-4" />
                Export List
              </Button>
              <Button variant="primary" size="md">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Applications</p>
                <p className="mt-2 text-3xl font-bold text-secondary">{APPLICATIONS.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming Interviews</p>
                <p className="mt-2 text-3xl font-bold text-secondary">{UPCOMING_INTERVIEWS.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning shadow-md">
                <CalendarClock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Tasks</p>
                <p className="mt-2 text-3xl font-bold text-secondary">{TASKS.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info shadow-md">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-8 lg:col-span-2">
            {/* All Applications */}
            <Section
              title="All Applications"
              subtitle={`${APPLICATIONS.length} active applications`}
              icon={<FileText className="h-5 w-5" />}
            >
              <div className="space-y-4 p-6">
                {APPLICATIONS.map((app) => (
                  <div
                    key={app.id}
                    className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-secondary">{app.role}</h3>
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                              <Building2 className="h-4 w-4" />
                              <span>{app.company}</span>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              <span>{app.location}</span>
                            </div>
                          </div>
                          <StatusBadge status={app.status} type={app.statusType} />
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Applied {app.appliedDate}
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                          <span className="font-semibold">Next step:</span> {app.nextStep}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        Withdraw
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Upcoming Interviews */}
            <Section
              title="Upcoming Interviews"
              subtitle={`${UPCOMING_INTERVIEWS.length} scheduled`}
              icon={<CalendarClock className="h-5 w-5" />}
            >
              <div className="space-y-4 p-6">
                {UPCOMING_INTERVIEWS.map((interview, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-warning/30 bg-warning/5 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-warning">
                        <CalendarClock className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-warning">{interview.date}</p>
                        <p className="mt-1 text-sm font-bold text-secondary">{interview.role}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{interview.company}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span>{interview.time}</span>
                          <span>•</span>
                          <span>{interview.type}</span>
                          <span>•</span>
                          <span>{interview.format}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Pending Tasks */}
            <Section
              title="Pending Tasks"
              subtitle={`${TASKS.filter(t => t.urgent).length} urgent`}
              icon={<ClipboardCheck className="h-5 w-5" />}
            >
              <div className="space-y-3 p-6">
                {TASKS.map((task, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${task.urgent
                      ? "border-warning/30 bg-warning/5"
                      : "border-slate-200 bg-white"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{task.task}</p>
                      {task.urgent && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-warning">
                          <AlertCircle className="h-3 w-3" />
                          <span>Urgent</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Add Task
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
