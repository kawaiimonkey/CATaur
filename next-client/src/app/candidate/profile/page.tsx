"use client";

import { GuestGate } from "@/components/candidate/guest-gate";
import { useState, useEffect } from "react";
import { request } from "@/lib/request";
import { COUNTRIES, REGIONS, CITIES, type CountryCode } from "@/data/locations";
import { Button } from "@/components/ui/button";
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
  Plus,
} from "lucide-react";

// ─── Mock data ─────────────────────────────────────────────────────────────────

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
  { school: "University of Toronto", degree: "B.Sc. Computer Science", year: "2016" },
  { school: "University of British Columbia", degree: "M.Eng. Software Engineering", year: "2018" },
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
  { name: "Prometheus", level: "Intermediate" },
];

const RECOMMENDED_SKILLS = ["Docker", "Node.js", "GraphQL", "Python", "CI/CD", "Redis", "Kafka"];

// ─── Reusable modal shell ──────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-2xl",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-lg border border-[var(--border-light)] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-6 py-4">
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border-light)] bg-[#F9FAFB] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Form helpers ──────────────────────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#374151]">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] transition focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20";

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-light)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[#1D4ED8]">{icon}</span>
          <span className="text-sm font-medium text-[#111827]">{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [step, setStep] = useState<"empty" | "basic-info" | "uploading" | "parsing" | "complete">(
    "basic-info"
  );
  const [showToast, setShowToast] = useState(true);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [resumeUploadState, setResumeUploadState] = useState<
    "hidden" | "selecting" | "parsing" | "overwrite-prompt"
  >("hidden");

  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  // New state to hold parsed resume data before applying
  const [latestParsedResume, setLatestParsedResume] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleStartAuto = () => setStep("basic-info");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoadingProfile(false);
        return;
      }
      try {
        const res = await request("/candidate/profile");
        setProfileData(res);
        if (res && res.data) {
          const user = res.data;
          setLocCountry((user.country as CountryCode) || "");
          setLocRegion(user.province || "");
          setLocCity(user.city || "");
          if (user.nickname || user.phone || user.firstName) {
            setStep("complete");
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const [locCountry, setLocCountry] = useState<CountryCode | "">("");
  const [locRegion, setLocRegion] = useState("");
  const [locCity, setLocCity] = useState("");

  const handleCountryChange = (code: CountryCode | "") => {
    setLocCountry(code);
    setLocRegion("");
    setLocCity("");
  };
  const handleRegionChange = (code: string) => {
    setLocRegion(code);
    setLocCity("");
  };
  const handleSaveBasicInfo = async () => {
    const firstName = (document.getElementById("basic_fname") as HTMLInputElement)?.value || "";
    const lastName = (document.getElementById("basic_lname") as HTMLInputElement)?.value || "";
    
    // Note: The backend UpdateUserProfileDto only accepts: nickname, avatarUrl, bio.
    // We will combine firstName and lastName into nickname to successfully save it.
    const nickname = [firstName, lastName].filter(Boolean).join(" ");
    
    try {
      await request("/candidate/profile", {
        method: "PUT",
        json: {
          nickname,
        }
      });
      
      localStorage.setItem("candidateProfileBasic", "1");
      if (!localStorage.getItem("candidateName")) {
        localStorage.setItem("candidateName", nickname || "Candidate");
      }
      setStep("uploading");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.doc,.txt,.rtf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await processResumeUpload(file, "onboarding");
    };
    input.click();
  };

  const handleReuploadSimulate = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.doc,.txt,.rtf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setResumeUploadState("parsing");
      await processResumeUpload(file, "update");
    };
    input.click();
  };

  const processResumeUpload = async (file: File, flow: "onboarding" | "update") => {
    try {
      if (flow === "onboarding") setStep("parsing");
      setParseError(null);

      // 1. Get upload URL & signature
      const sigRes = await request(`/files/upload-url?filename=${encodeURIComponent(file.name)}`);
      const { uploadUrl, params } = sigRes as any;

      // 2. Upload file to file-service
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadUrlWithParams = `${uploadUrl}?filename=${encodeURIComponent(params.filename)}&expires=${params.expires}&signature=${params.signature}`;
      
      const uploadRes = await fetch(`/api${uploadUrlWithParams}`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      
      if (!uploadRes.ok) throw new Error("File upload failed");
      const uploadedData = await uploadRes.json();

      // 3. Parse Resume
      const parseRes = await request("/candidate/resume/parse", {
        method: "POST",
        json: { resumeUrl: uploadedData.url }
      });
      
      setLatestParsedResume(parseRes);

      if (flow === "onboarding") {
        await applyResumeData(parseRes.id, "overwrite");
        setStep("complete");
        setShowToast(true);
        localStorage.setItem("candidateProfileResume", "1");
      } else {
        setResumeUploadState("overwrite-prompt");
      }

    } catch (err: any) {
      console.error(err);
      setParseError(err.message || "Failed to process resume");
      if (flow === "onboarding") setStep("uploading");
      else setResumeUploadState("hidden");
    }
  };

  const applyResumeData = async (parserId: string, applyMode: "overwrite" | "merge") => {
    try {
      const res = await request("/candidate/resume/apply", {
        method: "POST",
        json: { parserId, applyMode }
      });
      // Update local profile UI with applied data
      if (res && (res as any).candidate) {
         setProfileData({ ...profileData, data: { ...profileData?.data, candidate: (res as any).candidate }});
         // Refetch full profile to get all relations (experiences/skills) if implemented
         const fullProfile = await request("/candidate/profile");
         setProfileData(fullProfile);
      }
      return res;
    } catch (err) {
      console.error("Failed to apply resume", err);
      throw err;
    }
  };

  const handleFillManually = () => {
    localStorage.setItem("candidateProfileBasic", "1");
    localStorage.setItem("candidateProfileResume", "1");
    if (!localStorage.getItem("candidateName")) {
      localStorage.setItem("candidateName", "Alex");
    }
    setStep("complete");
    setShowToast(false);
  };

  const handleApplyOverwrite = async () => {
    if (!latestParsedResume?.id) return;
    try {
      await applyResumeData(latestParsedResume.id, "overwrite");
      setResumeUploadState("hidden");
      alert("Profile overwritten with new parsed data from the resume.");
    } catch (err) {
      alert("Failed to apply parsed data.");
    }
  };

  const handleKeepManual = async () => {
    if (!latestParsedResume?.id) return;
    try {
      // Just apply the resume file itself without overwriting profile fields (if possible, or just dismiss)
      // The current backend apply API overwrites fields. If we just want to keep the file, we could just ignore applying
      // But let's call apply with merge if we only want to fill empty fields, or just dismiss if we want strict manual keeping
      await applyResumeData(latestParsedResume.id, "merge");
      setResumeUploadState("hidden");
      alert("New resume file attached. Existing profile data was kept intact where present.");
    } catch(err) {
      alert("Failed to apply resume.");
    }
  };

  return (
    <GuestGate>
      <div className="mx-auto max-w-7xl px-6 py-8 pb-12">
        {isLoadingProfile ? (
           <div className="flex min-h-[60vh] flex-col items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-[#1D4ED8]" />
             <p className="mt-4 text-sm text-[#6B7280]">Loading profile...</p>
           </div>
        ) : (
          <>

        {/* ── Onboarding: Empty State ─────────────────────────────────────────── */}
        {step === "empty" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] bg-white p-12 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-[#EFF6FF]">
              <Sparkles className="h-7 w-7 text-[#1D4ED8]" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#111827]">Build your profile</h2>
            <p className="mb-7 max-w-md text-sm text-[#6B7280]">
              Your profile is currently empty. Upload your resume and let our AI automatically
              extract your experience, education, and skills in seconds.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button size="lg" className="gap-2" onClick={handleStartAuto}>
                <Upload className="h-4 w-4" />
                Upload Resume &amp; Auto-fill
              </Button>
              <button
                onClick={handleFillManually}
                className="text-sm text-[#6B7280] hover:text-[#1D4ED8] hover:underline underline-offset-2 transition"
              >
                Skip and fill manually
              </button>
            </div>
          </div>
        )}

        {/* ── Onboarding: Step 1 Basic Info ────────────────────────────────────── */}
        {step === "basic-info" && (
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-[var(--border-light)] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--border-light)] px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EFF6FF]">
                <UserCircle className="h-5 w-5 text-[#1D4ED8]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#111827]">Basic Information</h2>
                <p className="text-xs text-[#6B7280]">Let&apos;s start with your contact details.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="First Name">
                  <input id="basic_fname" type="text" className={inputCls} placeholder="John" defaultValue={profileData?.data?.firstName || ""} />
                </FormField>
                <FormField label="Last Name">
                  <input id="basic_lname" type="text" className={inputCls} placeholder="Doe" defaultValue={profileData?.data?.lastName || ""} />
                </FormField>
                <FormField label="Email Address">
                  <input type="email" className={inputCls} placeholder="john@example.com" defaultValue={profileData?.data?.email || localStorage.getItem("candidateEmail") || "you@example.com"} disabled />
                </FormField>
                <FormField label="Phone Number">
                  <input id="basic_phone" type="tel" className={inputCls} placeholder="+1 (416) 555-0198" defaultValue={profileData?.data?.phone || ""} />
                </FormField>
                <FormField label="Country">
                  <select
                    value={locCountry}
                    onChange={(e) => handleCountryChange(e.target.value as CountryCode | "")}
                    className={inputCls}
                  >
                    <option value="">Select country…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Province / State">
                  <select
                    value={locRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    disabled={!locCountry}
                    className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">Select province/state…</option>
                    {locCountry && REGIONS[locCountry].map((r) => (
                      <option key={r.code} value={r.code}>{r.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="City">
                  <div className="sm:col-span-2">
                    <select
                      value={locCity}
                      onChange={(e) => setLocCity(e.target.value)}
                      disabled={!locRegion}
                      className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select city…</option>
                      {locCountry && locRegion && (CITIES[locCountry][locRegion] ?? []).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </FormField>
                <FormField label="LinkedIn Profile URL">
                  <div className="sm:col-span-2">
                    <input id="basic_linkedin" type="url" className={inputCls} placeholder="https://linkedin.com/in/..." defaultValue={profileData?.data?.linkedinUrl || ""} />
                  </div>
                </FormField>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--border-light)] bg-[#F9FAFB] px-6 py-4">
              <Button onClick={handleSaveBasicInfo} className="gap-1.5">
                Continue to Resume
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Onboarding: Step 2 Upload ─────────────────────────────────────────── */}
        {step === "uploading" && (
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-[var(--border-light)] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--border-light)] px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EFF6FF]">
                <FileText className="h-5 w-5 text-[#1D4ED8]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#111827]">Upload Resume</h2>
                <p className="text-xs text-[#6B7280]">We&apos;ll use AI to extract your experience and skills.</p>
              </div>
            </div>
            <div className="p-6">
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-14 transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF]/30"
                onClick={handleSimulateUpload}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-white border border-[var(--border-light)]">
                  <Upload className="h-6 w-6 text-[#1D4ED8]" />
                </div>
                <h3 className="text-sm font-semibold text-[#111827]">Click to browse or drag and drop</h3>
                <p className="mt-1 text-xs text-[#6B7280]">PDF, DOCX, or RTF (Max 5MB)</p>
              </div>
            </div>
            <div className="flex justify-between gap-2 border-t border-[var(--border-light)] bg-[#F9FAFB] px-6 py-4">
              <Button variant="outline" onClick={() => setStep("basic-info")}>Back</Button>
              <Button variant="outline" onClick={handleFillManually} className="text-[#6B7280]">
                Skip this step
              </Button>
            </div>
          </div>
        )}

        {/* ── Onboarding: Step 3 Parsing ───────────────────────────────────────── */}
        {step === "parsing" && (
          <div className="mx-auto mt-20 max-w-sm rounded-lg border border-[var(--border-light)] bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#1D4ED8]" />
            <h2 className="text-lg font-semibold text-[#111827]">Analyzing your resume...</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Our AI is extracting your work experience, education, and skills. This will take just a moment.
            </p>
            {parseError && (
              <p className="mt-4 text-sm text-red-600 font-medium">Error: {parseError}</p>
            )}
            <div className="mx-auto mt-6 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full animate-pulse rounded-full bg-[#1D4ED8]" />
            </div>
          </div>
        )}

        {/* ── Complete Profile View ────────────────────────────────────────────── */}
        {step === "complete" && (
          <div className="animate-fade-in">
            {/* Success toast */}
            {showToast && (
              <div className="mb-5 flex items-start justify-between rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#166534]" />
                  <div>
                    <p className="text-sm font-semibold text-[#166534]">Profile drafted successfully!</p>
                    <p className="mt-0.5 text-xs text-[#166534]/80">
                      We&apos;ve extracted your information using AI. Please review the sections below to ensure accuracy.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="rounded p-1 text-[#166534] hover:bg-[#BBF7D0]/50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Identity Card */}
            <div className="mb-6 rounded-lg border border-[var(--border-light)] bg-white p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-[#111827]">{profileData?.data?.firstName || "John"} {profileData?.data?.lastName || "Doe"}</h1>
                  <p className="mt-0.5 text-sm font-medium text-[#374151]">Senior Backend Engineer (Go)</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#374151]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#6B7280]" />
                      {profileData?.data?.email || "johndoe@example.com"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#6B7280]" />
                      {profileData?.data?.phone || "+1 (416) 555-0198"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#6B7280]" />
                      {profileData?.data?.city ? `${profileData?.data?.city}, ${profileData?.data?.province}` : "Toronto, ON, Canada"}
                    </div>
                    <a href="#" className="flex items-center gap-1.5 text-[#1D4ED8] hover:underline underline-offset-2">
                      <Linkedin className="h-3.5 w-3.5" />
                      linkedin.com/in/johndoe
                    </a>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 self-start" onClick={() => setIsEditProfileOpen(true)}>
                  <PenSquare className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Main — 2 cols */}
              <div className="space-y-5 lg:col-span-2">

                {/* Work Experience */}
                <SectionCard
                  title="Work Experience"
                  icon={<Briefcase className="h-4 w-4" />}
                  action={
                    <button
                      onClick={() => setIsAddRoleOpen(true)}
                      className="flex items-center gap-1 rounded border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <Plus className="h-3 w-3" />
                      Add Role
                    </button>
                  }
                >
                  <div className="divide-y divide-[var(--border-light)]">
                    {EXPERIENCES.map((exp, idx) => (
                      <div key={idx} className="group px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-[#111827]">{exp.role}</h3>
                              <span className="rounded border border-[var(--border-light)] bg-[#F9FAFB] px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                                {exp.duration}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs font-medium text-[#374151]">{exp.company}</p>
                            <ul className="mt-3 space-y-1.5">
                              {exp.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#166534]" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            className="rounded border border-[var(--border-light)] p-1.5 text-[#6B7280] opacity-0 transition hover:text-[#1D4ED8] group-hover:opacity-100"
                            onClick={() => setIsAddRoleOpen(true)}
                          >
                            <PenSquare className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Education */}
                <SectionCard
                  title="Education"
                  icon={<GraduationCap className="h-4 w-4" />}
                  action={
                    <button
                      onClick={() => setIsAddEducationOpen(true)}
                      className="flex items-center gap-1 rounded border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <Plus className="h-3 w-3" />
                      Add Education
                    </button>
                  }
                >
                  <div className="divide-y divide-[var(--border-light)]">
                    {EDUCATION.map((edu, idx) => (
                      <div key={idx} className="group flex items-start justify-between px-5 py-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-[#111827]">{edu.school}</h3>
                          <p className="mt-0.5 text-xs text-[#374151]">{edu.degree}</p>
                          <p className="mt-1 text-xs text-[#6B7280]">Graduated {edu.year}</p>
                        </div>
                        <button
                          className="rounded border border-[var(--border-light)] p-1.5 text-[#6B7280] opacity-0 transition hover:text-[#1D4ED8] group-hover:opacity-100"
                          onClick={() => setIsAddEducationOpen(true)}
                        >
                          <PenSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Skills */}
                <SectionCard
                  title="Skills & Expertise"
                  icon={<Award className="h-4 w-4" />}
                  action={
                    <button
                      onClick={() => setIsManageSkillsOpen(true)}
                      className="flex items-center gap-1 rounded border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <PenSquare className="h-3 w-3" />
                      Manage
                    </button>
                  }
                >
                  <div className="flex flex-wrap gap-2 p-5">
                    {SKILLS.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${skill.level === "Expert"
                            ? "bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                            : "bg-[#F3F4F6] text-[#374151] dark:bg-[#374151] dark:text-[#E5E7EB]"
                          }`}
                      >
                        {skill.name}
                        <span
                          className={`text-[10px] ${skill.level === "Expert"
                              ? "text-[#60A5FA] dark:text-[#BFDBFE]"
                              : "text-[#9CA3AF] dark:text-[#9CA3AF]"
                            }`}
                        >
                          {skill.level}
                        </span>
                      </span>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* Sidebar — 1 col */}
              <div className="space-y-5">
                {/* Resume */}
                <SectionCard title="Resume" icon={<FileText className="h-4 w-4" />}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 rounded border border-[var(--border-light)] bg-[#F9FAFB] p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FEE2E2]">
                        <File className="h-4 w-4 text-[#DC2626]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">John_Doe_Resume_2026.pdf</p>
                        <p className="text-[10px] text-[#6B7280]">Updated 2 days ago · 1.2 MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setResumeUploadState("selecting")}
                      className="flex w-full items-center justify-center gap-1.5 rounded border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload New Resume
                    </button>
                  </div>
                </SectionCard>

                {/* Preferences */}
                <SectionCard
                  title="Career Preferences"
                  icon={<Target className="h-4 w-4" />}
                  action={
                    <button
                      onClick={() => setIsEditPreferencesOpen(true)}
                      className="flex items-center gap-1 rounded border border-[#D1D5DB] bg-[#F9FAFB] px-2.5 py-1 text-xs text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <PenSquare className="h-3 w-3" />
                      Edit
                    </button>
                  }
                >
                  <div className="divide-y divide-[var(--border-light)]">
                    {[
                      { icon: <Target className="h-3.5 w-3.5" />, label: "Compensation", value: "CA$170k – CA$190k" },
                      { icon: <Briefcase className="h-3.5 w-3.5" />, label: "Role Type", value: "Senior / Lead Engineer" },
                      { icon: <MapPin className="h-3.5 w-3.5" />, label: "Willing to Relocate", value: "Yes, open to US and EU" },
                    ].map((item, i) => (
                      <div key={i} className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#111827]">
                          <span className="text-[#6B7280]">{item.icon}</span>
                          {item.label}
                        </div>
                        <p className="mt-1 text-xs text-[#374151]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════════════════ */}

        {/* 1. Edit Basic Profile */}
        {step === "complete" && isEditProfileOpen && (
          <Modal
            title="Edit Basic Information"
            onClose={() => setIsEditProfileOpen(false)}
            footer={
              <>
                <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  const fn = (document.getElementById("edit_fname") as HTMLInputElement)?.value;
                  const ln = (document.getElementById("edit_lname") as HTMLInputElement)?.value;
                  const ph = (document.getElementById("edit_phone") as HTMLInputElement)?.value;
                  const li = (document.getElementById("edit_linkedin") as HTMLInputElement)?.value;
                  try {
                    const res = await request("/candidate/profile", {
                      method: "PUT",
                      json: {
                        firstName: fn,
                        lastName: ln,
                        phone: ph,
                        linkedinUrl: li,
                        country: locCountry,
                        province: locRegion,
                        city: locCity,
                      }
                    });
                    setProfileData(res);
                  } catch(e) {}
                  setIsEditProfileOpen(false);
                }}>Save Changes</Button>
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First Name">
                <input id="edit_fname" type="text" className={inputCls} defaultValue={profileData?.data?.firstName || "John"} />
              </FormField>
              <FormField label="Last Name">
                <input id="edit_lname" type="text" className={inputCls} defaultValue={profileData?.data?.lastName || "Doe"} />
              </FormField>
              <FormField label="Email Address">
                <input type="email" className={inputCls} defaultValue={profileData?.data?.email || "johndoe@example.com"} disabled />
              </FormField>
              <FormField label="Phone Number">
                <input id="edit_phone" type="tel" className={inputCls} defaultValue={profileData?.data?.phone || "+1 (416) 555-0198"} />
              </FormField>
              <FormField label="Country">
                <select value={locCountry} onChange={(e) => handleCountryChange(e.target.value as CountryCode | "")} className={inputCls}>
                  <option value="">Select country…</option>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Province / State">
                <select value={locRegion} onChange={(e) => handleRegionChange(e.target.value)} disabled={!locCountry} className={`${inputCls} disabled:opacity-50`}>
                  <option value="">Select province/state…</option>
                  {locCountry && REGIONS[locCountry].map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                </select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="City">
                  <select value={locCity} onChange={(e) => setLocCity(e.target.value)} disabled={!locRegion} className={`${inputCls} disabled:opacity-50`}>
                    <option value="">Select city…</option>
                    {locCountry && locRegion && (CITIES[locCountry][locRegion] ?? []).map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="LinkedIn Profile URL">
                  <input id="edit_linkedin" type="url" className={inputCls} defaultValue={profileData?.data?.linkedinUrl || "https://linkedin.com/in/johndoe"} />
                </FormField>
              </div>
            </div>
          </Modal>
        )}

        {/* 2. Re-Upload Resume Flow */}
        {step === "complete" && resumeUploadState !== "hidden" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            {/* Step 1: Selecting */}
            {resumeUploadState === "selecting" && (
              <div className="w-full max-w-lg overflow-hidden rounded-lg border border-[var(--border-light)] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between border-b border-[var(--border-light)] px-6 py-4">
                  <h3 className="text-base font-semibold text-[#111827]">Upload New Resume</h3>
                  <button onClick={() => setResumeUploadState("hidden")} className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6">
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-12 transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF]/20"
                    onClick={handleReuploadSimulate}
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-white border border-[var(--border-light)]">
                      <Upload className="h-5 w-5 text-[#1D4ED8]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#111827]">Click to browse</h3>
                    <p className="mt-1 text-xs text-[#6B7280]">Upload an updated PDF or DOCX</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Parsing */}
            {resumeUploadState === "parsing" && (
              <div className="w-full max-w-sm rounded-lg border border-[var(--border-light)] bg-white p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-[#1D4ED8]" />
                <h3 className="text-base font-semibold text-[#111827]">Analyzing Update...</h3>
                <p className="mt-2 text-xs text-[#6B7280]">Uploading and extracting your latest experience...</p>
                {parseError && (
                  <p className="mt-4 text-xs text-red-600 font-medium">Error: {parseError}</p>
                )}
              </div>
            )}

            {/* Step 3: Overwrite Confirmation */}
            {resumeUploadState === "overwrite-prompt" && (
              <div className="w-full max-w-lg overflow-hidden rounded-lg border border-[var(--border-light)] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="border-b border-[var(--border-light)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#FFFBEB]">
                      <AlertTriangle className="h-5 w-5 text-[#92400E]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#111827]">New Resume Processed</h3>
                      <p className="text-xs text-[#6B7280]">Choose how to apply the new data</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-sm text-[#374151]">
                    We found new data in your uploaded resume. Do you want our AI to automatically overwrite your current profile sections, or just attach the file?
                  </p>
                  <div className="space-y-2.5">
                    <button
                      onClick={handleApplyOverwrite}
                      className="flex w-full items-start gap-3 rounded border-2 border-[#1D4ED8] bg-[#EFF6FF] p-4 text-left transition hover:bg-[#DBEAFE] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1D4ED8]">
                        <RotateCcw className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Update module contents</p>
                        <p className="mt-0.5 text-xs text-[#374151]">
                          Replace my current Work Experience, Education, and Skills with the data from this new file.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={handleKeepManual}
                      className="flex w-full items-start gap-3 rounded border border-[var(--border-light)] bg-white p-4 text-left transition hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#D1D5DB]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
                        <FileText className="h-4 w-4 text-[#374151]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">Keep my current profile data</p>
                        <p className="mt-0.5 text-xs text-[#374151]">
                          Just attach the new file for recruiters to download. Leave my manually edited modules exactly as they are.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex justify-center border-t border-[var(--border-light)] bg-[#F9FAFB] px-6 py-4">
                  <Button variant="outline" onClick={() => setResumeUploadState("hidden")}>Cancel Upload</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Add/Edit Role Modal */}
        {step === "complete" && isAddRoleOpen && (
          <Modal
            title="Add Work Experience"
            onClose={() => setIsAddRoleOpen(false)}
            footer={
              <>
                <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddRoleOpen(false)}>Save Role</Button>
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Job Title">
                  <input type="text" className={inputCls} placeholder="e.g. Senior Software Engineer" />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Company Name">
                  <input type="text" className={inputCls} placeholder="e.g. Acme Corp" />
                </FormField>
              </div>
              <FormField label="Start Date">
                <input type="month" className={inputCls} />
              </FormField>
              <FormField label="End Date">
                <input type="month" className={inputCls} />
                <div className="mt-1.5 flex items-center gap-2">
                  <input type="checkbox" id="currentRole" className="rounded border-[#D1D5DB]" />
                  <label htmlFor="currentRole" className="text-xs text-[#374151]">I currently work here</label>
                </div>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Description / Highlights">
                  <textarea
                    rows={5}
                    className={inputCls}
                    placeholder={"• Led the development of...\n• Increased conversion rate by..."}
                  />
                  <p className="mt-1 text-xs text-[#6B7280]">Use bullet points for better readability.</p>
                </FormField>
              </div>
            </div>
          </Modal>
        )}

        {/* 4. Add/Edit Education Modal */}
        {step === "complete" && isAddEducationOpen && (
          <Modal
            title="Add Education"
            maxWidth="max-w-xl"
            onClose={() => setIsAddEducationOpen(false)}
            footer={
              <>
                <Button variant="outline" onClick={() => setIsAddEducationOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddEducationOpen(false)}>Save Education</Button>
              </>
            }
          >
            <div className="grid gap-4">
              <FormField label="School / University">
                <input type="text" className={inputCls} placeholder="e.g. Stanford University" />
              </FormField>
              <FormField label="Degree or Certificate (Optional)">
                <input type="text" className={inputCls} placeholder="e.g. BSc, High School Diploma, Certificate" />
              </FormField>
              <FormField label="Field of Study (Optional)">
                <input type="text" className={inputCls} placeholder="e.g. Computer Science" />
              </FormField>
              <FormField label="Graduation Year (Optional)">
                <input type="number" className={inputCls} placeholder="e.g. 2020" min={1970} max={2030} />
              </FormField>
            </div>
          </Modal>
        )}

        {/* 5. Manage Skills Modal */}
        {step === "complete" && isManageSkillsOpen && (
          <Modal
            title="Manage Skills"
            maxWidth="max-w-xl"
            onClose={() => setIsManageSkillsOpen(false)}
            footer={
              <>
                <Button variant="outline" onClick={() => setIsManageSkillsOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsManageSkillsOpen(false)}>Save Skills</Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-xs text-[#6B7280]">Your current skills:</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill, i) => (
                  <span
                    key={i}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${skill.level === "Expert"
                        ? "bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                        : "bg-[#F3F4F6] text-[#374151] dark:bg-[#374151] dark:text-[#E5E7EB]"
                      }`}
                  >
                    {skill.name}
                    <span
                      className={`text-[10px] ${skill.level === "Expert"
                          ? "text-[#60A5FA] dark:text-[#BFDBFE]"
                          : "text-[#9CA3AF] dark:text-[#9CA3AF]"
                        }`}
                    >
                      {skill.level}
                    </span>
                    <button className={`transition ${skill.level === "Expert"
                        ? "text-[#93C5FD] hover:text-[#1D4ED8] dark:hover:text-[#EFF6FF]"
                        : "text-[#9CA3AF] hover:text-[#4B5563] dark:hover:text-[#F3F4F6]"
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="border-t border-[var(--border-light)] pt-4">
                <p className="mb-2 text-xs text-[#6B7280]">Suggested skills to add:</p>
                <div className="flex flex-wrap gap-2">
                  {RECOMMENDED_SKILLS.map((skill, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-1 rounded border border-dashed border-[#D1D5DB] px-2.5 py-1 text-xs text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <Plus className="h-3 w-3" />
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--border-light)] pt-4">
                <FormField label="Add a custom skill">
                  <div className="flex gap-2">
                    <input type="text" className={`flex-1 ${inputCls}`} placeholder="e.g. Rust" />
                    <select className={`w-36 ${inputCls}`}>
                      <option value="Expert">Expert</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Beginner">Beginner</option>
                    </select>
                    <button className="flex items-center gap-1 rounded border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#1E40AF]">
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                </FormField>
              </div>
            </div>
          </Modal>
        )}

        {/* 6. Edit Preferences Modal */}
        {step === "complete" && isEditPreferencesOpen && (
          <Modal
            title="Edit Career Preferences"
            maxWidth="max-w-xl"
            onClose={() => setIsEditPreferencesOpen(false)}
            footer={
              <>
                <Button variant="outline" onClick={() => setIsEditPreferencesOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsEditPreferencesOpen(false)}>Save Preferences</Button>
              </>
            }
          >
            <div className="grid gap-4">
              <FormField label="Minimum Expected Salary (Annual)">
                <input type="text" className={inputCls} placeholder="e.g. CA$150,000" defaultValue="CA$170,000" />
              </FormField>
              <FormField label="Maximum Expected Salary (Annual)">
                <input type="text" className={inputCls} placeholder="e.g. CA$200,000" defaultValue="CA$190,000" />
              </FormField>
              <FormField label="Preferred Role Type">
                <input type="text" className={inputCls} placeholder="e.g. Senior Engineer, Tech Lead" defaultValue="Senior / Lead Engineer" />
              </FormField>
              <FormField label="Work Arrangement Preference">
                <select className={inputCls} defaultValue="Any">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Onsite</option>
                  <option>Any</option>
                </select>
              </FormField>
              <FormField label="Open to Relocation">
                <select className={inputCls} defaultValue="yes_us_eu">
                  <option value="no">No</option>
                  <option value="yes_ca">Yes, within Canada</option>
                  <option value="yes_us_eu">Yes, open to US and EU</option>
                  <option value="yes_anywhere">Yes, open to anywhere</option>
                </select>
              </FormField>
            </div>
          </Modal>
        )}
          </>
        )}
      </div>
    </GuestGate>
  );
}
