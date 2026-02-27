"use client";

import { useState } from "react";
import { COUNTRIES, REGIONS, CITIES, type CountryCode } from "@/data/locations";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/recruiter/cards";
import {
  FileText,
  MapPin,
  PenSquare,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  Upload,
  CheckCircle2,
  File,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  UserCircle,
  ArrowRight,
  Loader2,
  X,
  AlertTriangle,
  RotateCcw,
  Plus
} from "lucide-react";

const EXPERIENCES = [
  {
    role: "Senior Backend Engineer (Go)",
    company: "Maple Fintech",
    duration: "2021 – Present",
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
  },
  {
    school: "University of British Columbia",
    degree: "M.Eng. Software Engineering",
    year: "2018",
  },
];

const SKILLS = [
  { name: "Go", level: "Expert" },
  { name: "gRPC", level: "Expert" },
  { name: "PostgreSQL", level: "Intermediate" },
  { name: "Kubernetes", level: "Intermediate" },
  { name: "Terraform", level: "Intermediate" },
  { name: "TypeScript", level: "Expert" },
  { name: "React", level: "Intermediate" },
  { name: "AWS", level: "Intermediate" },
  { name: "Prometheus", level: "Intermediate" }
];

// Reusable mock recommended skills for the Manage Skills modal
const RECOMMENDED_SKILLS = [
  "Docker", "Node.js", "GraphQL", "Python", "CI/CD", "Redis", "Kafka"
];

export default function ProfilePage() {
  const [step, setStep] = useState<'empty' | 'basic-info' | 'uploading' | 'parsing' | 'complete'>('empty');
  const [showToast, setShowToast] = useState(true);

  // States for Modals (Only active when step === 'complete')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [resumeUploadState, setResumeUploadState] = useState<'hidden' | 'selecting' | 'parsing' | 'overwrite-prompt'>('hidden');

  // States for module editing modals
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState(false);

  // Onboarding Handlers
  const handleStartAuto = () => setStep('basic-info');

  // Cascading location state
  const [locCountry, setLocCountry] = useState<CountryCode | ''>('');
  const [locRegion, setLocRegion] = useState('');
  const [locCity, setLocCity] = useState('');

  const handleCountryChange = (code: CountryCode | '') => {
    setLocCountry(code);
    setLocRegion('');
    setLocCity('');
  };
  const handleRegionChange = (code: string) => {
    setLocRegion(code);
    setLocCity('');
  };
  const handleSaveBasicInfo = () => {
    localStorage.setItem('candidateProfileBasic', '1');
    // TODO: read actual name from form input; using placeholder for now
    if (!localStorage.getItem('candidateName')) {
      localStorage.setItem('candidateName', 'Alex');
    }
    setStep('uploading');
  };
  const handleSimulateUpload = () => {
    setStep('parsing');
    setTimeout(() => {
      setStep('complete');
      setShowToast(true);
      localStorage.setItem('candidateProfileResume', '1');
    }, 2500); // 2.5 second fake AI parsing
  };
  const handleFillManually = () => {
    localStorage.setItem('candidateProfileBasic', '1');
    localStorage.setItem('candidateProfileResume', '1');
    if (!localStorage.getItem('candidateName')) {
      localStorage.setItem('candidateName', 'Alex');
    }
    setStep('complete');
    setShowToast(false);
  };

  // Re-upload Flow Handlers
  const handleReuploadSimulate = () => {
    setResumeUploadState('parsing');
    setTimeout(() => {
      setResumeUploadState('overwrite-prompt');
    }, 2000); // 2 second fake parse for re-upload
  };

  const handleApplyOverwrite = () => {
    setResumeUploadState('hidden');
    alert("Profile overwritten with new parsed data from the resume.");
  };

  const handleKeepManual = () => {
    setResumeUploadState('hidden');
    alert("New resume file attached, but existing profile data was kept intact.");
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen pb-12 relative">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Onboarding Flow: Empty State */}
        {step === 'empty' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-secondary">Welcome to CATaur</h2>
            <p className="mb-8 max-w-md text-slate-600">
              Your profile is currently empty. Upload your resume and let our AI automatically extract your experience, education, and skills in seconds.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-md" onClick={handleStartAuto}>
                <Upload className="mr-2 h-5 w-5" />
                Upload Resume & Auto-fill
              </Button>
              <button
                onClick={handleFillManually}
                className="text-sm font-medium text-slate-500 hover:text-primary hover:underline"
              >
                Skip and fill manually
              </button>
            </div>
          </div>
        )}

        {/* Onboarding Flow: Step 1 Basic Info */}
        {step === 'basic-info' && (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary">Basic Information</h2>
                <p className="text-slate-600">Let's start with your contact details.</p>
              </div>
            </div>

            {/* Mock Form */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="John" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Last Name</label>
                <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Doe" defaultValue="Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="john@example.com" defaultValue="johndoe@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <input type="tel" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+1 (416) 555-0198" defaultValue="+1 (416) 555-0198" />
              </div>
              {/* Location cascading dropdowns */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Country</label>
                <select
                  value={locCountry}
                  onChange={(e) => handleCountryChange(e.target.value as CountryCode | '')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Province / State</label>
                <select
                  value={locRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  disabled={!locCountry}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Select province/state…</option>
                  {locCountry && REGIONS[locCountry].map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">City</label>
                <select
                  value={locCity}
                  onChange={(e) => setLocCity(e.target.value)}
                  disabled={!locRegion}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Select city…</option>
                  {locCountry && locRegion && (CITIES[locCountry][locRegion] ?? []).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">LinkedIn Profile URL</label>
                <input type="url" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://linkedin.com/in/..." defaultValue="linkedin.com/in/johndoe" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStep('empty')}>Cancel</Button>
              <Button onClick={handleSaveBasicInfo}>
                Continue to Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Onboarding Flow: Step 2 Uploading */}
        {step === 'uploading' && (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary">Upload Resume</h2>
                <p className="text-slate-600">We'll use AI to extract your experience and skills.</p>
              </div>
            </div>

            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-16 transition hover:border-primary hover:bg-primary/5"
              onClick={handleSimulateUpload}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Click to browse or drag and drop</h3>
              <p className="mt-2 text-sm text-slate-500">PDF, DOCX, or RTF (Max 5MB)</p>
            </div>

            <div className="mt-8 flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep('basic-info')}>Back</Button>
              <Button variant="ghost" onClick={handleFillManually} className="text-slate-500">Skip this step</Button>
            </div>
          </div>
        )}

        {/* Onboarding Flow: Step 3 Parsing Simulation */}
        {step === 'parsing' && (
          <div className="mx-auto mt-20 max-w-md rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg">
            <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold text-secondary">Analyzing your resume...</h2>
            <p className="mt-3 text-sm text-slate-600">Our AI is extracting your work experience, education, and skills. This will just take a moment.</p>

            <div className="mx-auto mt-8 h-2 w-full overflow-hidden rounded-full bg-slate-100 relative">
              <div className="absolute top-0 left-0 h-full w-full animate-[pulse_1s_ease-in-out_infinite] bg-primary rounded-full origin-left" />
            </div>
          </div>
        )}

        {/* Normal Profile View (Complete) */}
        {step === 'complete' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Show success toast if coming from AI parsing */}
            {showToast && (
              <div className="mb-6 flex items-start justify-between rounded-lg border border-[#00BFA5]/30 bg-[#00BFA5]/10 p-4 text-[#00897B] shadow-sm">
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#00BFA5]" />
                  <div>
                    <h4 className="font-semibold">Profile drafted successfully!</h4>
                    <p className="mt-1 text-sm opacity-90">We've extracted your information using AI. Please review the sections below to ensure accuracy and make any manual adjustments before applying for jobs.</p>
                  </div>
                </div>
                <button onClick={() => setShowToast(false)} className="rounded-md p-1 hover:bg-[#00BFA5]/20">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Basic Info Identity Card */}
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-secondary">John Doe</h1>
                  <p className="mt-1 text-lg font-medium text-slate-600">Senior Backend Engineer (Go)</p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      johndoe@example.com
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      +1 (416) 555-0198
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Toronto, ON, Canada
                    </div>
                    <a href="#" className="flex items-center gap-2 text-[#0A66C2] hover:underline">
                      <Linkedin className="h-4 w-4" />
                      linkedin.com/in/johndoe
                    </a>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => setIsEditProfileOpen(true)}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="icon" className="md:hidden absolute top-4 right-4" onClick={() => setIsEditProfileOpen(true)}>
                  <PenSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content - 2 columns */}
              <div className="space-y-8 lg:col-span-2">
                {/* Work Experience */}
                <Section
                  title="Work Experience"
                  icon={<Briefcase className="h-5 w-5" />}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setIsAddRoleOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
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
                          <button
                            className="rounded-lg border border-slate-200 p-2 text-slate-400 opacity-0 transition hover:text-primary group-hover:opacity-100"
                            onClick={() => setIsAddRoleOpen(true)}
                          >
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
                    <Button variant="ghost" size="sm" onClick={() => setIsAddEducationOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
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
                          <div className="mt-2 text-xs text-slate-500">
                            <span>Graduated {edu.year}</span>
                          </div>
                        </div>
                        <button
                          className="rounded-lg border border-slate-200 p-2 text-slate-400 opacity-0 transition hover:text-primary group-hover:opacity-100"
                          onClick={() => setIsAddEducationOpen(true)}
                        >
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
                    <Button variant="ghost" size="sm" onClick={() => setIsManageSkillsOpen(true)}>
                      <PenSquare className="h-4 w-4 mr-1" />
                      Manage Skills
                    </Button>
                  }
                >
                  <div className="flex flex-wrap gap-2 p-6">
                    {SKILLS.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 flex items-center gap-2"
                      >
                        {skill.name}
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{skill.level}</span>
                      </span>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Sidebar - 1 column */}
              <div className="space-y-8">
                {/* Resume Upload */}
                <Section title="Resume" icon={<FileText className="h-5 w-5" />}>
                  <div className="space-y-4 p-6">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                          <File className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">John_Doe_Resume_2026.pdf</p>
                          <p className="text-xs text-slate-500">Updated 2 days ago • 1.2 MB</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full text-primary" onClick={() => setResumeUploadState('selecting')}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Resume
                    </Button>
                  </div>
                </Section>

                {/* Preferences */}
                <Section title="Career Preferences" icon={<Target className="h-5 w-5" />}>
                  <div className="space-y-4 p-6">
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

                    <div className="rounded-lg bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                        <MapPin className="h-4 w-4 text-primary" />
                        Willing to Relocate
                      </div>
                      <p className="mt-2 text-sm text-slate-600">Yes, open to US and EU</p>
                    </div>

                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditPreferencesOpen(true)}>
                      <PenSquare className="h-4 w-4 mr-2" />
                      Edit Preferences
                    </Button>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            MODALS OVERLAYS 
            ========================================= */}

        {/* 1. Edit Basic Profile Modal */}
        {step === 'complete' && isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden outline-none">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-xl font-bold text-secondary">Edit Basic Information</h3>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <input type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="johndoe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input type="tel" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="+1 (416) 555-0198" />
                  </div>
                  {/* Location — Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Country</label>
                    <select
                      value={locCountry}
                      onChange={(e) => handleCountryChange(e.target.value as CountryCode | '')}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Location — Province / State */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Province / State</label>
                    <select
                      value={locRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      disabled={!locCountry}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">Select province/state…</option>
                      {locCountry && REGIONS[locCountry].map((r) => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Location — City (spans 2 cols) */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <select
                      value={locCity}
                      onChange={(e) => setLocCity(e.target.value)}
                      disabled={!locRegion}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">Select city…</option>
                      {locCountry && locRegion && (CITIES[locCountry][locRegion] ?? []).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">LinkedIn Profile URL</label>
                    <input type="url" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="https://linkedin.com/in/johndoe" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsEditProfileOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Re-Upload Resume Flow Modals */}
        {step === 'complete' && resumeUploadState !== 'hidden' && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            {/* Step 1: Selecting */}
            {resumeUploadState === 'selecting' && (
              <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                  <h3 className="text-xl font-bold text-secondary">Upload New Resume</h3>
                  <button onClick={() => setResumeUploadState('hidden')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-8">
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 transition hover:border-primary hover:bg-primary/5"
                    onClick={handleReuploadSimulate}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Click to browse</h3>
                    <p className="mt-2 text-sm text-slate-500">Upload an updated PDF or DOCX</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Parsing New Resume */}
            {resumeUploadState === 'parsing' && (
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 text-center">
                <Loader2 className="mx-auto mb-6 h-10 w-10 animate-spin text-primary" />
                <h3 className="text-xl font-bold text-secondary">Analyzing Update...</h3>
                <p className="mt-3 text-sm text-slate-600">Extracting your latest experience...</p>
              </div>
            )}

            {/* Step 3: Overwrite Confirmation Prompt */}
            {resumeUploadState === 'overwrite-prompt' && (
              <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <h3 className="text-center text-2xl font-bold text-slate-900">New Resume Processed</h3>
                  <p className="mx-auto mt-3 max-w-md text-center text-slate-600">
                    We found new data in your uploaded resume. Do you want our AI to automatically overwrite your current profile sections, or just attach the file?
                  </p>

                  <div className="mt-8 space-y-4">
                    <button
                      onClick={handleApplyOverwrite}
                      className="w-full flex items-start gap-4 rounded-xl border-2 border-primary bg-primary/5 p-4 text-left transition hover:bg-primary/10 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <RotateCcw className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Update module contents</h4>
                        <p className="mt-1 text-sm text-slate-600">Replace my current Work Experience, Education, and Skills with the data from this new file.</p>
                      </div>
                    </button>

                    <button
                      onClick={handleKeepManual}
                      className="w-full flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Keep my current profile data</h4>
                        <p className="mt-1 text-sm text-slate-600">Just attach the new file for recruiters to download. Leave my manually edited modules exactly as they are.</p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-center">
                  <Button variant="ghost" onClick={() => setResumeUploadState('hidden')}>Cancel Upload</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Add/Edit Role Modal */}
        {step === 'complete' && isAddRoleOpen && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden outline-none flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
                <h3 className="text-xl font-bold text-secondary">Add Work Experience</h3>
                <button
                  onClick={() => setIsAddRoleOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Job Title</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Company Name</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input type="month" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <input type="month" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    <div className="mt-1 flex items-center gap-2">
                      <input type="checkbox" id="currentRole" className="rounded border-slate-300 text-primary focus:ring-primary" />
                      <label htmlFor="currentRole" className="text-xs text-slate-600">I currently work here</label>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Description / Highlights</label>
                    <textarea
                      rows={5}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="• Led the development of...\n• Increased conversion rate by..."
                    />
                    <p className="text-xs text-slate-500">Use bullet points for better readability.</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddRoleOpen(false)}>Save Role</Button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Add/Edit Education Modal */}
        {step === 'complete' && isAddEducationOpen && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden outline-none">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-xl font-bold text-secondary">Add Education</h3>
                <button
                  onClick={() => setIsAddEducationOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">School / University</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Stanford University" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Degree or Certificate (Optional)</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. BSc, High School Diploma, Certificate" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Field of Study</label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Computer Science" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Start Year</label>
                      <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="YYYY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Graduation Year</label>
                      <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="YYYY (or expected)" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddEducationOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddEducationOpen(false)}>Save Education</Button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Manage Skills Modal */}
        {step === 'complete' && isManageSkillsOpen && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden outline-none">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-secondary">Manage Skills</h3>
                  <p className="text-xs text-slate-500 mt-1">Showcase your top technical and soft skills.</p>
                </div>
                <button
                  onClick={() => setIsManageSkillsOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {/* Current Skills list */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Your Skills</label>
                  <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 min-h-[100px]">
                    {SKILLS.map((skill, idx) => (
                      <div
                        key={idx}
                        className="group flex flex-col items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm relative overflow-hidden"
                      >
                        <div className="flex items-center gap-1 w-full justify-between">
                          <span>{skill.name}</span>
                          <button className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <select className="text-[10px] w-full bg-transparent outline-none text-slate-500 uppercase tracking-wider font-semibold cursor-pointer appearance-none">
                          <option value="Expert" selected={skill.level === "Expert"}>Expert</option>
                          <option value="Intermediate" selected={skill.level === "Intermediate"}>Intermediate</option>
                          <option value="Beginner" selected={skill.level === "Beginner"}>Beginner</option>
                        </select>
                      </div>
                    ))}
                    {/* Input to add new */}
                    <input
                      type="text"
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-slate-400 py-1"
                      placeholder="Type a skill and press Enter..."
                    />
                  </div>
                </div>

                {/* Suggested/Recommended */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Suggested based on your profile</label>
                  <div className="flex flex-wrap gap-2">
                    {RECOMMENDED_SKILLS.map((skill, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-1 rounded-full border border-dashed border-primary/30 bg-primary/5 px-3 py-1 text-sm text-primary transition hover:bg-primary/10 hover:border-primary"
                      >
                        <Plus className="h-3 w-3" />
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button onClick={() => setIsManageSkillsOpen(false)}>Done</Button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Edit Preferences Modal */}
        {step === 'complete' && isEditPreferencesOpen && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden outline-none">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-xl font-bold text-secondary">Career Preferences</h3>
                <button
                  onClick={() => setIsEditPreferencesOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Target Compensation
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Minimum</label>
                        <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="CA$170k" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Maximum</label>
                        <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="CA$190k" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Preferred Role Types
                    </label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="Senior / Lead Engineer" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Relocation Preferences
                    </label>
                    <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="Yes, open to US and EU" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditPreferencesOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsEditPreferencesOpen(false)}>Save Preferences</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
