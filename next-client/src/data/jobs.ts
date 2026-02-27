// ─── Canonical Job type ───────────────────────────────────────────────────────
// These fields mirror the recruiter Job Order form exactly.

export type JobType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Internship"
  | "Permanent";

export type WorkArrangement = "Remote" | "Onsite" | "Hybrid";

export type Job = {
  /** URL-safe identifier used in /candidate/jobs/[slug] */
  slug: string;

  // ── Core required fields (mirrors recruiter Job Order) ──────────────────
  title: string;
  company: string;
  /** Human-readable: "Toronto, ON, Canada" or "Seattle, WA, United States" */
  location: string;
  /** ISO-style for filtering: { country: "CA" | "US", state: string, city: string } */
  locationMeta: { country: "CA" | "US"; state: string; city: string };
  status: "active" | "onhold" | "closed"; // candidates only see active
  type: JobType;
  workArrangement: WorkArrangement;

  // ── Optional fields ─────────────────────────────────────────────────────
  department?: string;
  salary?: string;
  /** Number of open seats */
  openings: number;
  /** Markdown-formatted full job description */
  description: string;

  // ── List-page meta ──────────────────────────────────────────────────────
  postedDate: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

export const JOBS: Job[] = [
  {
    slug: "senior-backend-engineer-neptune",
    title: "Senior Backend Engineer",
    company: "Neptune Pay",
    location: "Toronto, ON, Canada",
    locationMeta: { country: "CA", state: "ON", city: "Toronto" },
    status: "active",
    type: "Full-time",
    workArrangement: "Remote",
    department: "Engineering",
    salary: "$140K – $180K",
    openings: 2,
    postedDate: "2 days ago",
    description: `## About the Role

Join Neptune Pay's core platform team and build the financial infrastructure that moves money for millions of people every day. You will own critical microservices end-to-end — from design reviews to production deployments.

## Responsibilities

- Design, build, and maintain distributed backend services in **Go**
- Own service reliability objectives (SLOs) and drive incident retrospectives
- Optimize **PostgreSQL** query paths and schema migrations at scale
- Participate in on-call rotations and mentor junior engineers
- Collaborate with product and design on technical feasibility

## Requirements

- 5+ years of professional backend development experience
- Strong proficiency in **Go** (or willingness to ramp up quickly)
- Experience with event-driven architectures (Kafka, RabbitMQ, or similar)
- Solid understanding of distributed systems, CAP theorem, and eventual consistency
- Comfortable with Kubernetes and cloud-native deployments (AWS / GCP)

## Nice to Have

- Prior experience in fintech or payments domain
- Familiarity with PCI-DSS compliance requirements
- Open-source contributions

## What We Offer

- Remote-first culture with quarterly team gatherings
- Competitive salary: **$140K – $180K CAD**
- 4 weeks vacation + 5 personal days
- $2,500 annual learning & development budget
`,
  },
  {
    slug: "frontend-engineer-eurora",
    title: "Frontend Engineer",
    company: "Eurora Cloud Platform",
    location: "Toronto, ON, Canada",
    locationMeta: { country: "CA", state: "ON", city: "Toronto" },
    status: "active",
    type: "Full-time",
    workArrangement: "Hybrid",
    salary: "$120K – $160K",
    openings: 1,
    postedDate: "3 days ago",
    description: `## About the Role

Eurora is redefining how engineering teams manage cloud infrastructure. As a Frontend Engineer you will shape the control plane UI — a complex, data-dense product used by thousands of engineers daily.

## Responsibilities

- Build and maintain **Next.js / React** applications with a focus on performance and accessibility
- Own the component library and design system integration (**Tailwind CSS**)
- Partner with backend engineers to design REST and GraphQL contracts
- Write thorough unit and integration tests (Vitest, Playwright)
- Participate in design reviews and give feedback on UX decisions

## Requirements

- 3+ years building production React applications
- Strong TypeScript skills — you write type-safe code by default
- Experience with data-visualization libraries (recharts, D3, or similar)
- Comfortable with state management (Zustand, Jotai, or Redux Toolkit)
- Understanding of web performance profiling and optimization

## What We Offer

- Hybrid schedule (3 days in-office, Toronto downtown)
- Salary: **$120K – $160K CAD**
- Comprehensive health, dental, and vision
- Stock options in a Series B company
`,
  },
  {
    slug: "devops-sre-atlas",
    title: "DevOps / SRE Engineer",
    company: "Atlas Robotics",
    location: "Vancouver, BC, Canada",
    locationMeta: { country: "CA", state: "BC", city: "Vancouver" },
    status: "active",
    type: "Contract",
    workArrangement: "Hybrid",
    department: "Platform",
    salary: "$130K – $170K",
    openings: 1,
    postedDate: "5 days ago",
    description: `## About the Role

Atlas Robotics builds autonomous warehouse systems that operate 24/7. We're looking for an SRE to own platform reliability, observability, and the CI/CD pipelines that keep our robotics fleet software up to date.

## Responsibilities

- Manage and evolve **Kubernetes** clusters across multiple cloud regions
- Design and maintain CI/CD pipelines using **GitHub Actions** and ArgoCD
- Build observability stack: metrics (Prometheus / Grafana), logging (Loki), tracing (Tempo)
- Lead incident response and post-mortem culture
- Implement infrastructure-as-code with **Terraform**

## Requirements

- 4+ years in DevOps, platform engineering, or SRE roles
- Hands-on experience with Kubernetes (EKS or GKE preferred)
- Strong Terraform and infrastructure automation skills
- Solid understanding of networking: VPCs, load balancers, DNS, TLS
- Experience with Linux internals and shell scripting

## Contract Details

- **6-month contract** with strong possibility of conversion to permanent
- Hybrid in Vancouver, BC (2 days per week on-site)
- Rate: **$130K – $170K CAD annualized**
`,
  },
  {
    slug: "mobile-engineer-ios-orbit",
    title: "Mobile Engineer (iOS)",
    company: "Orbit Health",
    location: "Montréal, QC, Canada",
    locationMeta: { country: "CA", state: "QC", city: "Montréal" },
    status: "active",
    type: "Full-time",
    workArrangement: "Remote",
    openings: 3,
    postedDate: "1 week ago",
    description: `## About the Role

Orbit Health's mission is to put better health tools in the hands of patients and care teams. You'll build iOS apps used by clinicians and patients across Canada's largest hospital networks.

## Responsibilities

- Build and maintain **SwiftUI** patient-facing and clinical iOS applications
- Integrate with **HealthKit**, FHIR APIs, and hospital EHR systems
- Write security-conscious code that complies with provincial healthcare privacy laws
- Collaborate closely with UX researchers and clinical advisors
- Maintain high test coverage with XCTest and UI testing frameworks

## Requirements

- 3+ years of professional iOS development (**Swift / SwiftUI**)
- Experience shipping apps to the App Store (provide at least one example)
- Understanding of HealthKit, CareKit, or similar health frameworks
- Attention to accessibility (VoiceOver, Dynamic Type)
- Comfortable navigating PIPEDA / healthcare data requirements

## What We Offer

- Fully remote in Canada
- Salary range: to be confirmed (competitive + equity)
- 5 weeks of vacation
- Annual device budget ($3,000)
`,
  },
  {
    slug: "data-engineer-nova",
    title: "Data Engineer",
    company: "Nova Analytics",
    location: "Calgary, AB, Canada",
    locationMeta: { country: "CA", state: "AB", city: "Calgary" },
    status: "active",
    type: "Full-time",
    workArrangement: "Onsite",
    salary: "$115K – $155K",
    openings: 2,
    postedDate: "1 week ago",
    description: `## About the Role

Nova Analytics serves Fortune 500 energy and resource companies with real-time BI dashboards. We're expanding our data platform team to meet growing enterprise demand.

## Responsibilities

- Design and maintain **Airflow** DAGs and **dbt** transformation layers
- Manage data warehouse schemas and query optimization in **Snowflake**
- Build reusable data quality checks and alerting pipelines
- Partner with analytics engineers and BI developers to ship new datasets
- Document pipelines and contribute to data catalog hygiene

## Requirements

- 4+ years in data engineering or analytics engineering
- Strong SQL skills and experience with columnar data warehouses
- Hands-on **Python** for ETL scripting and Airflow operators
- Experience with dbt (models, tests, macros)
- Understanding of data modeling concepts (Kimball, Data Vault, or similar)

## What We Offer

- On-site in Calgary, AB (downtown office)
- Salary: **$115K – $155K CAD**
- RRSP matching (5%)
- Paid sabbatical after 5 years
`,
  },
  {
    slug: "fullstack-engineer-lunaris",
    title: "Full-stack Engineer",
    company: "Lunaris AI",
    location: "Ottawa, ON, Canada",
    locationMeta: { country: "CA", state: "ON", city: "Ottawa" },
    status: "active",
    type: "Permanent",
    workArrangement: "Onsite",
    salary: "$125K – $165K",
    openings: 1,
    postedDate: "2 weeks ago",
    description: `## About the Role

Lunaris AI builds workflow automation tools powered by large language models. You'll work across the full stack to ship features that make AI capabilities accessible to non-technical business users.

## Responsibilities

- Build **Next.js** frontend features and **Node.js / TypeScript** APIs
- Integrate with OpenAI, Anthropic, and internal fine-tuned models
- Design and optimize **PostgreSQL** schemas and queries
- Own features end-to-end from technical spec to deployment
- Help grow the engineering culture as an early team member

## Requirements

- 4+ years of full-stack experience (Node.js + React or Next.js)
- Strong TypeScript skills on both client and server
- Experience integrating LLM APIs (OpenAI, Anthropic, or similar)
- Solid understanding of relational database design
- Comfortable in a fast-paced startup environment with ambiguity

## What We Offer

- Permanent full-time in Ottawa, ON
- Salary: **$125K – $165K CAD** + meaningful equity
- Flexible core hours (10 AM – 3 PM ET)
- Annual team retreat
`,
  },
  {
    slug: "qa-engineer-granite",
    title: "QA Engineer",
    company: "Granite AI",
    location: "Calgary, AB, Canada",
    locationMeta: { country: "CA", state: "AB", city: "Calgary" },
    status: "active",
    type: "Part-time",
    workArrangement: "Remote",
    openings: 1,
    postedDate: "3 days ago",
    description: `## About the Role

Granite AI is building an AI-powered document processing platform. We're looking for a part-time QA Engineer to own test strategy and help us ship with confidence.

## Responsibilities

- Design and maintain **Playwright** E2E test suites covering critical user flows
- Develop and run regression, smoke, and performance test strategies
- File clear, reproducible bug reports and verify fixes
- Collaborate with developers to integrate tests into CI pipelines
- Document testing standards and onboard future QA hires

## Requirements

- 2+ years in QA or software testing roles
- Experience with **Playwright**, Cypress, or Selenium
- Understanding of API testing (REST, Postman, or similar)
- Solid grasp of testing fundamentals: boundary, equivalence, regression
- Comfortable working asynchronously

## What We Offer

- **Part-time remote** (~20 hrs/week), flexible scheduling
- Hourly rate equivalent to **$80K – $100K CAD** annualized
- Option to expand to full-time after 3 months
`,
  },
  {
    slug: "product-intern-aurora",
    title: "Product Intern – Platform",
    company: "Aurora Health",
    location: "Vancouver, BC, Canada",
    locationMeta: { country: "CA", state: "BC", city: "Vancouver" },
    status: "active",
    type: "Internship",
    workArrangement: "Hybrid",
    openings: 2,
    postedDate: "4 days ago",
    description: `## About the Role

Join Aurora Health's Platform team for a 4-month co-op term and help shape products used by clinical teams across BC. This is a hands-on internship — you'll contribute to real features from day one.

## What You'll Do

- Shadow and assist senior PMs through the full discovery-to-delivery cycle
- Conduct user interviews with clinical staff and synthesize findings
- Write product specs and user stories for upcoming features
- Track KPIs and help run A/B experiments
- Participate in sprint ceremonies and cross-functional reviews

## What We're Looking For

- Currently enrolled in a Business, CS, or HCI degree program
- Genuine curiosity about healthcare technology and user research
- Strong written and verbal communication skills
- Analytical mindset; comfortable with data and drawing conclusions
- Previous product or UX internship experience is a plus

## Details

- **4-month term** (May – August 2026)
- Hybrid in Vancouver, BC (2 days/week)
- Competitive internship stipend + transit subsidy
- Full-time return offer consideration for top performers
`,
  },
];
