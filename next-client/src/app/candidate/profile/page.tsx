import { Button } from "@/components/ui/button";
import { Section } from "@/components/recruiter/cards";
import {
  FileText,
  MapPin,
  PenSquare,
  Sparkles,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  Upload,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const EXPERIENCES = [
  {
    role: "Senior Backend Engineer (Go)",
    company: "Maple Fintech",
    duration: "2021 – Present",
    location: "Toronto, Canada",
    highlights: [
      "Designed event-driven microservices on Kubernetes (EKS), 99.95% uptime",
      "Optimized PostgreSQL query paths, cutting P95 latency by 42%",
      "Led team of 5 engineers in migration to cloud-native architecture",
    ],
  },
  {
    role: "Full‑stack Engineer (Next.js)",
    company: "Aurora Health",
    duration: "2018 – 2021",
    location: "Vancouver, Canada",
    highlights: [
      "Shipped clinician portal (Next.js/Node) used by 2k+ MAUs",
      "Built CI/CD with GitHub Actions & Terraform, lead times −35%",
      "Implemented real-time collaboration features using WebSockets",
    ],
  },
];

const EDUCATION = [
  {
    school: "University of Toronto",
    degree: "B.Sc. Computer Science",
    year: "2016",
    gpa: "3.9/4.0",
  },
  {
    school: "University of British Columbia",
    degree: "M.Eng. Software Engineering",
    year: "2018",
    gpa: "4.0/4.0",
  },
];

const SKILLS = [
  { name: "Go / gRPC", level: "Expert", years: "5+" },
  { name: "PostgreSQL", level: "Advanced", years: "4+" },
  { name: "Kubernetes / Terraform", level: "Advanced", years: "3+" },
  { name: "TypeScript / React", level: "Advanced", years: "4+" },
  { name: "AWS (EKS, SQS, RDS)", level: "Advanced", years: "3+" },
  { name: "Observability (Prometheus/Grafana)", level: "Intermediate", years: "2+" },
];

export default function ProfilePage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100">

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-8 lg:col-span-2">
            {/* Work Experience */}
            <Section
              title="Work Experience"
              icon={<Briefcase className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm">
                  <PenSquare className="h-4 w-4" />
                  Add Role
                </Button>
              }
            >
              <div className="space-y-6 p-6">
                {EXPERIENCES.map((exp, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-lg border border-slate-200 bg-white p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            {exp.duration}
                          </span>
                          <span className="text-xs text-slate-500">• {exp.location}</span>
                        </div>
                        <h3 className="text-lg font-bold text-secondary">{exp.role}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-700">{exp.company}</p>
                        <ul className="mt-4 space-y-2">
                          {exp.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button className="rounded-lg border border-slate-200 p-2 text-slate-400 opacity-0 transition hover:text-primary group-hover:opacity-100">
                        <PenSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Education */}
            <Section
              title="Education"
              icon={<GraduationCap className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm">
                  <PenSquare className="h-4 w-4" />
                  Add Education
                </Button>
              }
            >
              <div className="space-y-4 p-6">
                {EDUCATION.map((edu, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary">{edu.school}</h3>
                      <p className="mt-1 text-sm text-slate-700">{edu.degree}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span>Graduated {edu.year}</span>
                        <span>•</span>
                        <span className="font-semibold text-success">GPA: {edu.gpa}</span>
                      </div>
                    </div>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400 opacity-0 transition hover:text-primary group-hover:opacity-100">
                      <PenSquare className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Skills & Expertise */}
            <Section
              title="Skills & Expertise"
              icon={<Award className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm">
                  <PenSquare className="h-4 w-4" />
                  Manage Skills
                </Button>
              }
            >
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {SKILLS.map((skill, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-secondary">{skill.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {skill.level}
                          </span>
                          <span className="text-xs text-slate-500">{skill.years} experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Profile Strength */}
            <Section title="Profile Strength" icon={<TrendingUp className="h-5 w-5" />}>
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-gradient-success p-6">
                    <span className="text-4xl font-bold text-white">95%</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-secondary">Excellent Profile</p>
                  <p className="mt-1 text-xs text-slate-600">Your profile is highly competitive</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Resume uploaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Work experience added</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Skills verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                    <span>Add portfolio projects</span>
                  </div>
                </div>

                <Button variant="primary" size="sm" className="mt-6 w-full">
                  Complete Profile
                </Button>
              </div>
            </Section>

            {/* Preferences */}
            <Section title="Career Preferences" icon={<Target className="h-5 w-5" />}>
              <div className="space-y-4 p-6">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Hybrid · Toronto / Remote Canada</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                    <Target className="h-4 w-4 text-primary" />
                    Compensation
                  </div>
                  <p className="mt-2 text-sm text-slate-600">CA$170k – CA$190k</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Role Type
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Senior / Lead Engineer</p>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <PenSquare className="h-4 w-4" />
                  Edit Preferences
                </Button>
              </div>
            </Section>

            {/* AI Insights */}
            <Section title="AI Profile Insights" icon={<Sparkles className="h-5 w-5" />}>
              <div className="p-6">
                <div className="rounded-lg bg-gradient-primary p-4 text-white">
                  <p className="text-sm font-semibold">Resume Optimized</p>
                  <p className="mt-1 text-xs text-white/90">
                    14 key accomplishments identified and highlighted
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs">
                    <span className="text-slate-600">Impact suggestions</span>
                    <span className="font-semibold text-primary">6 applied</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs">
                    <span className="text-slate-600">Skills enriched</span>
                    <span className="font-semibold text-primary">12 added</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs">
                    <span className="text-slate-600">Profile strength</span>
                    <span className="font-semibold text-success">+15%</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View All Suggestions
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
