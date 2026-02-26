import { Button } from "@/components/ui/button";
import { Section } from "@/components/recruiter/cards";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  FolderCheck,
  Mail,
  MapPin,
  Sparkles,
  TrendingUp,
  FileText,
  Target,
  Clock,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const RECOMMENDED_JOBS = [
  {
    title: "Senior Backend Engineer (Go)",
    company: "Neptune Pay",
    location: "Remote · Canada",
    match: "93%",
    salary: "$140K - $180K",
    tags: ["Go", "PostgreSQL", "Microservices"],
  },
  {
    title: "Frontend Engineer (React/Next.js)",
    company: "Eurora Cloud Platform",
    location: "Hybrid · Toronto",
    match: "90%",
    salary: "$120K - $160K",
    tags: ["TypeScript", "React", "Tailwind"],
  },
  {
    title: "DevOps / SRE",
    company: "Atlas Robotics",
    location: "Hybrid · Vancouver",
    match: "88%",
    salary: "$130K - $170K",
    tags: ["Kubernetes", "AWS", "Terraform"],
  },
];

const APPLICATION_SUMMARY = [
  { label: "In Review", value: "4", icon: FileText, color: "bg-info" },
  { label: "Interviews", value: "3", icon: CalendarClock, color: "bg-warning" },
  { label: "Offers", value: "1", icon: Star, color: "bg-success" },
  { label: "Archived", value: "6", icon: FolderCheck, color: "bg-secondary" },
];

type Reminder = {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  type: "urgent" | "normal";
};

const REMINDERS: Reminder[] = [
  {
    icon: CalendarClock,
    title: "Panel interview",
    description: "Eurora Cloud Platform",
    time: "Thu 14:30 CET",
    type: "urgent",
  },
  {
    icon: Mail,
    title: "Send thank-you note",
    description: "Atlas Robotics",
    time: "Today",
    type: "normal",
  },
  {
    icon: FolderCheck,
    title: "Upload portfolio",
    description: "Nova Analytics",
    time: "Tomorrow",
    type: "normal",
  },
];

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-secondary">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-md`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: typeof RECOMMENDED_JOBS[0] }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="space-y-4">
        {/* Job title and Match badge */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-secondary">{job.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-700">{job.company}</p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <Target className="h-3 w-3" />
            {job.match} Match
          </span>
        </div>

        {/* Location and salary */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="font-semibold text-primary">{job.salary}</div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action */}
        <Button variant="outline" size="sm" className="w-full">
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ReminderItem({ reminder }: { reminder: Reminder }) {
  const Icon = reminder.icon;
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-lg ${reminder.type === "urgent" ? "bg-warning" : "bg-primary"} shadow-sm`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{reminder.title}</p>
        <p className="mt-0.5 text-xs text-slate-600">{reminder.description}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {reminder.time}
        </p>
      </div>
      {reminder.type === "urgent" && (
        <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
          Urgent
        </span>
      )}
    </div>
  );
}

export default function CandidateDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Candidate Portal
              </div>
              <h1 className="text-3xl font-bold text-secondary">Your Career Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">Track applications and discover opportunities</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="md">
                <FileText className="h-4 w-4" />
                My Resume
              </Button>
              <Button variant="primary" size="md">
                <BriefcaseBusiness className="h-4 w-4" />
                Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Application Status Metrics */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {APPLICATION_SUMMARY.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-8 lg:col-span-2">
            {/* Recommended Jobs */}
            <Section
              title="Recommended for You"
              subtitle="AI-matched opportunities based on your profile"
              icon={<Target className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              }
            >
              <div className="grid gap-6 p-6 md:grid-cols-2">
                {RECOMMENDED_JOBS.map((job) => (
                  <JobCard key={job.title} job={job} />
                ))}
              </div>
            </Section>

            {/* Recent Applications */}
            <Section
              title="Recent Applications"
              subtitle="Your latest job applications"
              icon={<BriefcaseBusiness className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              }
            >
              <div className="divide-y divide-slate-100">
                {[
                  {
                    position: "Senior Backend Engineer",
                    company: "Neptune Pay",
                    status: "Interview Scheduled",
                    date: "Applied 3 days ago",
                    statusColor: "bg-success",
                  },
                  {
                    position: "Frontend Engineer",
                    company: "Eurora Cloud",
                    status: "Under Review",
                    date: "Applied 5 days ago",
                    statusColor: "bg-info",
                  },
                  {
                    position: "DevOps Engineer",
                    company: "Atlas Robotics",
                    status: "Application Sent",
                    date: "Applied 1 week ago",
                    statusColor: "bg-warning",
                  },
                ].map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{app.position}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{app.company}</p>
                      <p className="mt-1 text-xs text-slate-500">{app.date}</p>
                    </div>
                    <span className={`rounded-full ${app.statusColor}/10 px-3 py-1 text-xs font-semibold ${app.statusColor.replace('bg-', 'text-')}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Upcoming Reminders */}
            <Section
              title="Upcoming Tasks"
              subtitle={`${REMINDERS.length} pending`}
              icon={<BellRing className="h-5 w-5" />}
            >
              <div className="p-6">
                {REMINDERS.map((reminder, idx) => (
                  <ReminderItem key={idx} reminder={reminder} />
                ))}
              </div>
            </Section>

            {/* AI Assistant */}
            <Section
              title="AI Career Assistant"
              icon={<Sparkles className="h-5 w-5" />}
            >
              <div className="space-y-4 p-6">
                <div className="rounded-lg bg-gradient-primary p-4 text-white">
                  <p className="text-sm font-semibold">Interview Prep Ready</p>
                  <p className="mt-1 text-xs text-white/90">
                    Your personalized prep pack for Eurora Cloud is ready
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 border-white/30 bg-white/10 text-white hover:bg-white/20">
                    View Now
                  </Button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Resume Optimization</p>
                  <p className="mt-1 text-xs text-slate-600">
                    3 suggestions to improve your profile strength
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary">
                    Review
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
