"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JOBS, type JobType, type WorkArrangement } from "@/data/jobs";
import { COUNTRIES, REGIONS, CITIES, type CountryCode } from "@/data/locations";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Users,
  ChevronDown,
  SlidersHorizontal,
  X,
  ArrowRight,
  DollarSign,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const WORK_ARRANGEMENT_OPTIONS: WorkArrangement[] = ["Remote", "Hybrid", "Onsite"];
const TYPE_OPTIONS: JobType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
  "Permanent",
];
const SORT_OPTIONS = ["Most Recent", "Most Openings"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

// ─── Work Arrangement badge colour ───────────────────────────────────────────

function arrangementStyle(arrangement: WorkArrangement) {
  switch (arrangement) {
    case "Remote":
      return "bg-success/10 text-success border border-success/20";
    case "Hybrid":
      return "bg-info/10 text-info border border-info/20";
    case "Onsite":
      return "bg-warning/10 text-warning border border-warning/20";
  }
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: (typeof JOBS)[0] }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-500 select-none">
          {job.company.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-secondary truncate">{job.title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {job.company}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${arrangementStyle(job.workArrangement)}`}>
          {job.workArrangement}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          {job.type}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <DollarSign className="h-3.5 w-3.5" />
            {job.salary}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-slate-500">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {job.openings} {job.openings === 1 ? "opening" : "openings"}
        </span>
      </div>

      {/* Description preview — strip markdown symbols for plain preview */}
      <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-2">
        {job.description.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith("•"))[0]?.replace(/\*\*/g, "") ?? ""}
      </p>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          Posted {job.postedDate}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/candidate/jobs/${job.slug}`}>
              View Details
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href={`/candidate/jobs/${job.slug}`}>Apply Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${active
        ? "border-primary bg-primary text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
        }`}
    >
      {label}
    </button>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function SelectField({
  icon: Icon,
  value,
  onChange,
  placeholder,
  children,
  disabled,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white pr-9 text-sm text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${Icon ? "pl-10" : "pl-3"}`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobSearchPage() {
  const [keyword, setKeyword] = useState("");

  // Cascading location
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | "">("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Pill filters
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [selectedArrangements, setSelectedArrangements] = useState<WorkArrangement[]>([]);

  const [sortBy, setSortBy] = useState<SortOption>("Most Recent");

  // Cascading reset helpers
  const handleCountryChange = (v: string) => {
    setSelectedCountry(v as CountryCode | "");
    setSelectedState("");
    setSelectedCity("");
  };
  const handleStateChange = (v: string) => {
    setSelectedState(v);
    setSelectedCity("");
  };

  const toggleType = (t: JobType) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleArrangement = (a: WorkArrangement) =>
    setSelectedArrangements((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const clearAll = () => {
    setKeyword("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedTypes([]);
    setSelectedArrangements([]);
  };

  const hasActiveFilters =
    keyword ||
    selectedCountry ||
    selectedState ||
    selectedCity ||
    selectedTypes.length > 0 ||
    selectedArrangements.length > 0;

  // Available states for selected country
  const availableStates = selectedCountry ? REGIONS[selectedCountry] : [];
  // Available cities for selected state
  const availableCities =
    selectedCountry && selectedState
      ? (CITIES[selectedCountry][selectedState] ?? [])
      : [];

  // Filter + sort
  const filteredJobs = useMemo(() => {
    // Only show active jobs
    let result = JOBS.filter((job) => job.status === "active").filter((job) => {
      const kw = keyword.toLowerCase();
      const matchesKeyword =
        !kw || job.title.toLowerCase().includes(kw) || job.company.toLowerCase().includes(kw);

      const matchesCountry =
        !selectedCountry || job.locationMeta.country === selectedCountry;
      const matchesState =
        !selectedState || job.locationMeta.state === selectedState;
      const matchesCity =
        !selectedCity ||
        job.locationMeta.city.toLowerCase() === selectedCity.toLowerCase();

      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
      const matchesArrangement =
        selectedArrangements.length === 0 || selectedArrangements.includes(job.workArrangement);

      return (
        matchesKeyword &&
        matchesCountry &&
        matchesState &&
        matchesCity &&
        matchesType &&
        matchesArrangement
      );
    });

    if (sortBy === "Most Openings") {
      result = [...result].sort((a, b) => b.openings - a.openings);
    }

    return result;
  }, [keyword, selectedCountry, selectedState, selectedCity, selectedTypes, selectedArrangements, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ── Search + Location ─────────────────────────────────────────── */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Keyword */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title or company..."
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Country */}
          <SelectField
            icon={MapPin}
            value={selectedCountry}
            onChange={handleCountryChange}
            placeholder="Country"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </SelectField>

          {/* Province / State */}
          <SelectField
            value={selectedState}
            onChange={handleStateChange}
            placeholder={selectedCountry ? "Province / State" : "Select country first"}
            disabled={!selectedCountry}
          >
            {availableStates.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </SelectField>

          {/* City */}
          <SelectField
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder={selectedState ? "City" : "Select province first"}
            disabled={!selectedState}
          >
            {availableCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </SelectField>
        </div>

        {/* ── Filter pills ────────────────────────────────────────────────── */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 shrink-0">
              Arrangement
            </span>
            {WORK_ARRANGEMENT_OPTIONS.map((a) => (
              <FilterPill
                key={a}
                label={a}
                active={selectedArrangements.includes(a)}
                onClick={() => toggleArrangement(a)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 shrink-0">
              Job Type
            </span>
            {TYPE_OPTIONS.map((t) => (
              <FilterPill
                key={t}
                label={t}
                active={selectedTypes.includes(t)}
                onClick={() => toggleType(t)}
              />
            ))}
          </div>
        </div>

        {/* ── Results bar ─────────────────────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-600">
              <span className="font-bold text-secondary">{filteredJobs.length}</span>{" "}
              of {JOBS.filter((j) => j.status === "active").length} positions
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-red-400 hover:text-red-500 transition"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* ── Job list ────────────────────────────────────────────────────── */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Search className="mb-4 h-10 w-10 text-slate-300" />
            <p className="text-base font-semibold text-slate-500">No jobs match your filters</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your search or clearing the filters</p>
            <Button variant="outline" size="sm" className="mt-6" onClick={clearAll}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
