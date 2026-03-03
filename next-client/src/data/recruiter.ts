export type JobOrder = {
  id: string;
  title: string;
  client: string;
  status: "sourcing" | "interview" | "offer" | "filled" | "paused";
  openings: number;
  priority: "high" | "medium" | "low";
  location: string;
  updatedAt: string;
  tags: string[];
  applicants: number;
  salary?: string;
};

export type CandidatePipeline = {
  id: string;
  name: string;
  role: string;
  stage: string;
  nextAction: string;
  owner: string;
};

export type ClientReminder = {
  id: string;
  company: string;
  contact: string;
  topic: string;
  due: string;
  status: "pending" | "sent" | "overdue";
};

export type ReportSnapshot = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "steady";
};

export type JobBoardStatus = {
  board: string;
  posted: boolean;
  lastSync: string;
  owner: string;
};

export type JobTemplate = {
  name: string;
  department: string;
  updated: string;
  usage: string;
};

export type ApplicationStatus = "new" | "interview" | "offer" | "closed";

export type ClientDecision = {
  type: "request-offer" | "pass" | "hold";
  note?: string;           // optional note from client to recruiter
  submittedAt: string;     // display timestamp
};

export type CandidateRecord = {
  id: string;
  name: string;
  email: string;          // candidate email
  role: string;           // candidate's current/desired role (for profile)
  jobTitle: string;       // the job they applied for
  jobId: string;          // job order ID
  status: ApplicationStatus;
  appliedAt: string;
  location: string;
  availability: string;
  lastContact: string;
  recruiterNotes?: string; // visible read-only to client
  clientDecision?: ClientDecision; // set when client submits from Decisions page
  interviewMessage?: {    // only present when status === "interview"
    subject: string;
    type: "Zoom" | "Phone" | "Onsite";
    date: string;
    time: string;
    content: string;
    sentAt: string;
  };
};

export const CANDIDATE_RECORDS: CandidateRecord[] = [
  {
    id: "CAN-782",
    name: "Ethan Wong",
    email: "ethan.wong@example.com",
    role: "Senior Backend Engineer (Go)",
    jobTitle: "Senior Backend Engineer (Go)",
    jobId: "JO-1043",
    status: "interview",
    appliedAt: "Feb 24, 2026",
    location: "Toronto, ON",
    availability: "2 weeks",
    lastContact: "Today",
    recruiterNotes: "Candidate submitted via portal. Strong technical background. Consider for fast-track interview.",
    interviewMessage: {
      subject: "Interview Invitation — Senior Backend Engineer (Go)",
      type: "Zoom",
      date: "Mar 6, 2026",
      time: "2:30 PM EST",
      content: "Hi Ethan, we'd love to move forward with a technical interview. Please find the Zoom link below. We'll be discussing system design and your Go experience. Looking forward to connecting!",
      sentAt: "Feb 25, 2026",
    },
  },
  {
    id: "CAN-765",
    name: "Sofia Martins",
    email: "sofia.martins@example.com",
    role: "Frontend Engineer (React/Next.js)",
    jobTitle: "Frontend Engineer (React/Next.js)",
    jobId: "JO-1038",
    status: "new",
    appliedAt: "Feb 23, 2026",
    location: "Vancouver, BC",
    availability: "Immediate",
    lastContact: "Yesterday",
  },
  {
    id: "CAN-744",
    name: "Daniel Chen",
    email: "daniel.chen@example.com",
    role: "DevOps / SRE",
    jobTitle: "DevOps / SRE",
    jobId: "JO-1027",
    status: "offer",
    appliedAt: "Feb 18, 2026",
    location: "Calgary, AB",
    availability: "6 weeks",
    lastContact: "Today",
  },
  {
    id: "CAN-739",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    role: "Data Engineer",
    jobTitle: "Data Engineer",
    jobId: "JO-0999",
    status: "closed",
    appliedAt: "Feb 15, 2026",
    location: "Montreal, QC",
    availability: "4 weeks",
    lastContact: "2 days ago",
  },
  {
    id: "CAN-736",
    name: "Lucas Tremblay",
    email: "lucas.tremblay@example.com",
    role: "Full‑stack Engineer",
    jobTitle: "Full‑stack Engineer",
    jobId: "JO-0987",
    status: "new",
    appliedAt: "Feb 22, 2026",
    location: "Ottawa, ON",
    availability: "Immediate",
    lastContact: "3 days ago",
  },
  {
    id: "CAN-729",
    name: "Amelia Zhang",
    email: "amelia.zhang@example.com",
    role: "Mobile Engineer (iOS)",
    jobTitle: "Mobile Engineer (iOS)",
    jobId: "JO-0992",
    status: "interview",
    appliedAt: "Feb 20, 2026",
    location: "Toronto, ON",
    availability: "2 weeks",
    lastContact: "Today",
    recruiterNotes: "Strong iOS portfolio. Worked on two App Store top-50 apps. Good culture fit — collaborative and curious.",
    clientDecision: {
      type: "request-offer",
      note: "Great communication skills during the interview. Please proceed with offer.",
      submittedAt: "Mar 2, 2026",
    },
    interviewMessage: {
      subject: "Interview Invitation — Mobile Engineer (iOS)",
      type: "Phone",
      date: "Mar 4, 2026",
      time: "11:00 AM EST",
      content: "Hi Amelia, thank you for applying. We'd like to schedule a phone screen to discuss your iOS background and the role in more detail.",
      sentAt: "Feb 22, 2026",
    },
  },
  {
    id: "CAN-724",
    name: "Noah Johnson",
    email: "noah.johnson@example.com",
    role: "Security Engineer",
    jobTitle: "Security Engineer",
    jobId: "JO-0981",
    status: "new",
    appliedAt: "Feb 25, 2026",
    location: "Waterloo, ON",
    availability: "4 weeks",
    lastContact: "Yesterday",
  },
  {
    id: "CAN-719",
    name: "Mia Singh",
    email: "mia.singh@example.com",
    role: "Data Scientist",
    jobTitle: "Data Scientist",
    jobId: "JO-0976",
    status: "offer",
    appliedAt: "Feb 10, 2026",
    location: "Toronto, ON",
    availability: "Immediate",
    lastContact: "Yesterday",
  },
  {
    id: "CAN-712",
    name: "Oliver Dubois",
    email: "oliver.dubois@example.com",
    role: "QA Automation Engineer",
    jobTitle: "QA Automation Engineer",
    jobId: "JO-0970",
    status: "closed",
    appliedAt: "Feb 12, 2026",
    location: "Vancouver, BC",
    availability: "3 weeks",
    lastContact: "Today",
  },
  {
    id: "CAN-705",
    name: "Sophia Park",
    email: "sophia.park@example.com",
    role: "Platform Engineer",
    jobTitle: "Platform Engineer",
    jobId: "JO-0964",
    status: "interview",
    appliedAt: "Feb 19, 2026",
    location: "Edmonton, AB",
    availability: "6 weeks",
    lastContact: "Today",
    recruiterNotes: "Impressive infrastructure background. Led Kubernetes migration at previous company. Recommend proceeding.",
    interviewMessage: {
      subject: "Interview Invitation — Platform Engineer",
      type: "Onsite",
      date: "Mar 7, 2026",
      time: "10:00 AM MST",
      content: "Hi Sophia, we're excited to invite you for an onsite interview at our Calgary office. Please bring any examples of infrastructure projects you've led.",
      sentAt: "Feb 21, 2026",
    },
  },
];

export type ClientRecord = {
  company: string;
  industry: string;
  openRoles: number;
  contact: string;
  satisfaction: string;
  lastReview: string;
};

export type ReportSchedule = {
  name: string;
  cadence: string;
  recipients: string;
  lastRun: string;
  format: string;
};

export const JOB_ORDERS: JobOrder[] = [
  {
    id: "JO-1043",
    title: "Senior Backend Engineer (Go)",
    client: "Maple Fintech",
    status: "interview",
    openings: 1,
    priority: "high",
    location: "Hybrid · Toronto",
    updatedAt: "2 hours ago",
    tags: ["Go", "PostgreSQL", "Kubernetes"],
    applicants: 18,
  },
  {
    id: "JO-1038",
    title: "Frontend Engineer (React/Next.js)",
    client: "Aurora Health",
    status: "sourcing",
    openings: 2,
    priority: "medium",
    location: "Hybrid · Vancouver",
    updatedAt: "5 hours ago",
    tags: ["React", "TypeScript", "Tailwind"],
    applicants: 24,
  },
  {
    id: "JO-1027",
    title: "DevOps / SRE",
    client: "Granite AI",
    status: "offer",
    openings: 1,
    priority: "high",
    location: "Hybrid · Calgary",
    updatedAt: "Yesterday",
    tags: ["Kubernetes", "AWS", "Terraform"],
    applicants: 9,
  },
  {
    id: "JO-0999",
    title: "Data Engineer",
    client: "Polar Analytics",
    status: "filled",
    openings: 1,
    priority: "low",
    location: "Onsite · Montreal",
    updatedAt: "2 days ago",
    tags: ["Python", "Airflow", "dbt"],
    applicants: 32,
  },
  {
    id: "JO-0992",
    title: "Mobile Engineer (iOS)",
    client: "Lighthouse Mobility",
    status: "sourcing",
    openings: 1,
    priority: "medium",
    location: "Remote · Ottawa",
    updatedAt: "Today",
    tags: ["Swift", "SwiftUI", "CI/CD"],
    applicants: 7,
  },
  {
    id: "JO-0987",
    title: "Full‑stack Engineer",
    client: "Cedar Labs",
    status: "interview",
    openings: 2,
    priority: "high",
    location: "Remote · Canada",
    updatedAt: "Today",
    tags: ["Next.js", "Node.js", "Prisma"],
    applicants: 21,
  },
  {
    id: "JO-0981",
    title: "Security Engineer",
    client: "Borealis Security",
    status: "sourcing",
    openings: 1,
    priority: "high",
    location: "Waterloo",
    updatedAt: "Yesterday",
    tags: ["AppSec", "Threat Modeling", "AWS"],
    applicants: 11,
  },
  {
    id: "JO-0976",
    title: "Data Scientist",
    client: "Maple Cloud",
    status: "interview",
    openings: 1,
    priority: "medium",
    location: "Toronto",
    updatedAt: "3 days ago",
    tags: ["Python", "Pandas", "ML"],
    applicants: 14,
  },
  {
    id: "JO-0970",
    title: "QA Automation Engineer",
    client: "Cascadia DevTools",
    status: "sourcing",
    openings: 1,
    priority: "medium",
    location: "Vancouver",
    updatedAt: "2 days ago",
    tags: ["Cypress", "Playwright", "CI"],
    applicants: 8,
  },
  {
    id: "JO-0964",
    title: "Platform Engineer",
    client: "Prairie Systems",
    status: "offer",
    openings: 1,
    priority: "high",
    location: "Edmonton",
    updatedAt: "Today",
    tags: ["Kubernetes", "Terraform", "Networking"],
    applicants: 12,
  },
];

export const PIPELINE: CandidatePipeline[] = [
  {
    id: "CAN-782",
    name: "Ethan Wong",
    role: "Senior Backend Engineer (Go)",
    stage: "Client Interview",
    nextAction: "System design prep · Fri",
    owner: "S. Patel",
  },
  {
    id: "CAN-765",
    name: "Sofia Martins",
    role: "Frontend Engineer (React)",
    stage: "Recruiter Review",
    nextAction: "Schedule screening · Wed 10:00",
    owner: "J. Chen",
  },
  {
    id: "CAN-744",
    name: "Daniel Chen",
    role: "DevOps / SRE",
    stage: "Offer Negotiation",
    nextAction: "Send revised comp sheet to client",
    owner: "A. Moore",
  },
  {
    id: "CAN-739",
    name: "Priya Nair",
    role: "Data Engineer",
    stage: "Client Feedback",
    nextAction: "Follow up with Polar Analytics",
    owner: "S. Patel",
  },
];

export const CLIENT_REMINDERS: ClientReminder[] = [
  {
    id: "REM-201",
    company: "Eurora Cloud",
    contact: "Liam Carter",
    topic: "Panel feedback pending",
    due: "Today 17:00",
    status: "pending",
  },
  {
    id: "REM-199",
    company: "Nimbus Data Fabric",
    contact: "Amelia Fischer",
    topic: "Send shortlist deck",
    due: "Tomorrow",
    status: "sent",
  },
  {
    id: "REM-195",
    company: "Solis Energy",
    contact: "Hannah Wright",
    topic: "Renew satisfaction pulse",
    due: "Overdue",
    status: "overdue",
  },
];

export const REPORTS: ReportSnapshot[] = [
  { label: "Active job orders", value: "12", delta: "+2 this week", trend: "up" },
  { label: "Interviews scheduled", value: "9", delta: "-1 vs last week", trend: "down" },
  { label: "Average time-to-fill", value: "37 days", delta: "Improved 4 days", trend: "up" },
  { label: "Client NPS", value: "67", delta: "+3 rolling 30d", trend: "up" },
];

export const JOB_BOARD_STATUS: JobBoardStatus[] = [
  { board: "LinkedIn", posted: true, lastSync: "Today 09:12", owner: "Marketing" },
  { board: "Indeed", posted: true, lastSync: "Yesterday 18:45", owner: "Sourcing" },
  { board: "AngelList", posted: false, lastSync: "Disabled", owner: "N/A" },
  { board: "WeWorkRemotely", posted: true, lastSync: "Today 07:30", owner: "Marketing" },
];

export const JOB_TEMPLATES: JobTemplate[] = [
  { name: "Enterprise AE", department: "Sales", updated: "3 days ago", usage: "16" },
  { name: "Head of Marketing", department: "Marketing", updated: "1 week ago", usage: "9" },
  { name: "Customer Success Director", department: "Success", updated: "Yesterday", usage: "11" },
];




export const CLIENTS: ClientRecord[] = [
  { company: "Maple Fintech", industry: "Payments", openRoles: 3, contact: "Liam Carter", satisfaction: "High", lastReview: "This week" },
  { company: "Aurora Health", industry: "Health Tech", openRoles: 2, contact: "Amelia Fischer", satisfaction: "Medium", lastReview: "Last week" },
  { company: "Granite AI", industry: "AI Infrastructure", openRoles: 2, contact: "Hannah Wright", satisfaction: "High", lastReview: "2 weeks ago" },
  { company: "Polar Analytics", industry: "Data Platform", openRoles: 1, contact: "Carlos Mendes", satisfaction: "Watch", lastReview: "Yesterday" },
  { company: "Lighthouse Mobility", industry: "Mobility", openRoles: 2, contact: "Nora Patel", satisfaction: "High", lastReview: "This week" },
  { company: "Cedar Labs", industry: "Developer Tools", openRoles: 3, contact: "Jason Lee", satisfaction: "Medium", lastReview: "Yesterday" },
  { company: "Maple Cloud", industry: "Cloud", openRoles: 1, contact: "Emma Brown", satisfaction: "Watch", lastReview: "2 weeks ago" },
  { company: "Borealis Security", industry: "Security", openRoles: 2, contact: "Raj Mehta", satisfaction: "High", lastReview: "This week" },
  { company: "Cascadia DevTools", industry: "Testing", openRoles: 1, contact: "Alice Ng", satisfaction: "High", lastReview: "Today" },
  { company: "Prairie Systems", industry: "Platform", openRoles: 2, contact: "Michael Green", satisfaction: "Medium", lastReview: "3 days ago" },
];

export const REPORT_SCHEDULES: ReportSchedule[] = [
  {
    name: "Weekly pipeline summary",
    cadence: "Weekly · Monday 08:00",
    recipients: "Allan, Sara, Finance",
    lastRun: "This Monday",
    format: "PDF",
  },
  {
    name: "Client NPS survey",
    cadence: "Monthly · First Friday",
    recipients: "Client partners",
    lastRun: "2 weeks ago",
    format: "CSV",
  },
  {
    name: "Sourcing velocity",
    cadence: "Bi-weekly",
    recipients: "Sourcing leads",
    lastRun: "Last Friday",
    format: "Dashboard",
  },
];
