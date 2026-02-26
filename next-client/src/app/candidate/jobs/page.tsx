import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Target,
  Filter,
  Star,
  Building2,
  TrendingUp,
} from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "Senior Backend Engineer (Go)",
    company: "Neptune Pay",
    logo: "🏦",
    location: "Remote · Canada",
    type: "Full-time",
    salary: "$140K - $180K",
    match: "93%",
    posted: "2 days ago",
    tags: ["Go", "PostgreSQL", "Microservices", "Kubernetes"],
    description: "Build scalable payment infrastructure serving millions of transactions daily.",
  },
  {
    id: 2,
    title: "Frontend Engineer (React/Next.js)",
    company: "Eurora Cloud Platform",
    logo: "☁️",
    location: "Hybrid · Toronto",
    type: "Full-time",
    salary: "$120K - $160K",
    match: "90%",
    posted: "3 days ago",
    tags: ["TypeScript", "React", "Next.js", "Tailwind"],
    description: "Shape the future of cloud infrastructure with modern web technologies.",
  },
  {
    id: 3,
    title: "DevOps / SRE Engineer",
    company: "Atlas Robotics",
    logo: "🤖",
    location: "Hybrid · Vancouver",
    type: "Full-time",
    salary: "$130K - $170K",
    match: "88%",
    posted: "5 days ago",
    tags: ["Kubernetes", "AWS", "Terraform", "Python"],
    description: "Ensure reliability and scalability of autonomous robotics platform.",
  },
  {
    id: 4,
    title: "Mobile Engineer (iOS)",
    company: "Orbit Health",
    logo: "🏥",
    location: "Remote · Montreal",
    type: "Full-time",
    salary: "$110K - $150K",
    match: "86%",
    posted: "1 week ago",
    tags: ["Swift", "SwiftUI", "CI/CD", "HealthKit"],
    description: "Build healthcare apps that improve patient outcomes and doctor workflows.",
  },
  {
    id: 5,
    title: "Data Engineer",
    company: "Nova Analytics",
    logo: "📊",
    location: "Hybrid · Calgary",
    type: "Full-time",
    salary: "$115K - $155K",
    match: "85%",
    posted: "1 week ago",
    tags: ["Python", "Airflow", "dbt", "Snowflake"],
    description: "Design and maintain data pipelines powering business intelligence.",
  },
  {
    id: 6,
    title: "Full-stack Engineer",
    company: "Lunaris AI",
    logo: "🌙",
    location: "On-site · Ottawa",
    type: "Full-time",
    salary: "$125K - $165K",
    match: "84%",
    posted: "2 weeks ago",
    tags: ["Next.js", "Node.js", "Prisma", "OpenAI"],
    description: "Build AI-powered applications that transform how businesses operate.",
  },
];

function JobCard({ job }: { job: typeof JOBS[0] }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Match badge */}
      <div className="absolute right-4 top-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          <Target className="h-3 w-3" />
          {job.match} Match
        </span>
      </div>

      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
          {job.logo}
        </div>

        {/* Job details */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-secondary">{job.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">
            <Building2 className="h-4 w-4" />
            {job.company}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {job.type}
            </div>
            <div className="flex items-center gap-1 font-semibold text-primary">
              <DollarSign className="h-4 w-4" />
              {job.salary}
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-600">{job.description}</p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              Posted {job.posted}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4" />
                Save
              </Button>
              <Button variant="primary" size="sm">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100">

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 placeholder-slate-500 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative w-64">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Location"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 placeholder-slate-500 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="primary" size="md" className="h-12 px-8">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Results header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-secondary">{JOBS.length} jobs</span> matched to your profile
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Best Match</option>
              <option>Most Recent</option>
              <option>Salary (High to Low)</option>
              <option>Salary (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Job listings */}
        <div className="space-y-4">
          {JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            <TrendingUp className="h-4 w-4" />
            Load More Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}
