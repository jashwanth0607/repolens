"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  FileText,
  GitBranch,
  Network,
  ShieldAlert,
  Wrench,
  Search,
  Code2,
  Package,
  BrainCircuit,
  Bug,
  ArrowRight,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import RepositoryAnalyzer from "../components/RepositoryAnalyzer";
import AnalysisDashboard from "../components/AnalysisDashboard";
import ReportDownloadButton from "../components/ReportDownloadButton";
import RepositoryArchitecture from "../components/RepositoryArchitecture";
import AIAssistant from "../components/AIAssistant";
import BugInvestigator from "../components/BugInvestigator";

import type { Repository } from "../lib/types";

const STORAGE_KEY = "repolens_repository";

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [repository, setRepository] = useState<Repository | null>(null);
  const [storageHydrated, setStorageHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRepository(JSON.parse(saved) as Repository);
      }
    } catch (error) {
      console.error("Failed to load stored repository:", error);
    } finally {
      setStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;

    try {
      if (repository) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(repository));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save repository:", error);
    }
  }, [repository, storageHydrated]);

  const handleRepositoryAnalyzed = (repo: Repository) => {
    setRepository(repo);
    setActivePage("Dashboard");
  };

  const clearRepository = () => {
    setRepository(null);
    setActivePage("Dashboard");
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return repository ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
                <div>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    ACTIVE REPOSITORY
                  </p>
                  <p className="font-mono text-sm font-bold text-white">
                    {repository.full_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePage("Bug Diagnosis")}
                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20 active:scale-[0.98]"
                >
                  Diagnose Bugs
                </button>

                <button
                  type="button"
                  onClick={clearRepository}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.98]"
                >
                  Clear Repo
                </button>
              </div>
            </div>

            <AnalysisDashboard repository={repository} />
          </div>
        ) : (
          <HomeContent
            onRepositoryAnalyzed={handleRepositoryAnalyzed}
            onNavigate={setActivePage}
          />
        );

      case "Bug Diagnosis":
        return <BugInvestigator activeRepository={repository} />;

      case "Repositories":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                Repositories
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Connect and inspect a public GitHub repository for automated analysis.
              </p>
            </div>

            <RepositoryAnalyzer
              onRepositoryAnalyzed={handleRepositoryAnalyzed}
            />

            {repository && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Last analyzed repository
                </p>
                <h3 className="mt-1 text-lg font-bold font-mono text-white">
                  {repository.full_name}
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePage("Dashboard")}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 active:scale-[0.98]"
                  >
                    View Analysis Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage("Bug Diagnosis")}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 active:scale-[0.98]"
                  >
                    Investigate Bugs
                  </button>

                  <button
                    type="button"
                    onClick={clearRepository}
                    className="rounded-lg border border-zinc-800 px-3.5 py-2 text-xs text-zinc-400 hover:border-red-500/30 hover:text-red-400 active:scale-[0.98]"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "Issues":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                Findings & Security Flaws
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Review security vulnerabilities, code complexity, and quality findings.
              </p>
            </div>

            {repository ? (
              <AnalysisDashboard repository={repository} />
            ) : (
              <EmptyState
                icon={<ShieldAlert className="h-8 w-8 text-amber-400" />}
                title="No active repository"
                description="Scan a repository to view security vulnerabilities and code quality findings."
                onClick={() => setActivePage("Repositories")}
                buttonText="Connect Repository"
              />
            )}
          </div>
        );

      case "Architecture":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                Architecture & Composition
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Directory organization, main file structures, and file type distributions.
              </p>
            </div>

            {repository ? (
              <RepositoryArchitecture repository={repository} />
            ) : (
              <EmptyState
                icon={<Network className="h-8 w-8 text-blue-400" />}
                title="Architecture Unavailable"
                description="Analyze a repository to view structural and architectural insights."
                onClick={() => setActivePage("Repositories")}
                buttonText="Connect Repository"
              />
            )}
          </div>
        );

      case "AI Assistant":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                AI Diagnostic Assistant
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Query LLMs regarding codebase context, security issues, and fix strategies.
              </p>
            </div>

            {repository ? (
              <AIAssistant repository={repository} />
            ) : (
              <EmptyState
                icon={<Bot className="h-8 w-8 text-purple-400" />}
                title="AI Assistant Standby"
                description="Connect a repository to enable repository-specific AI context reasoning."
                onClick={() => setActivePage("Repositories")}
                buttonText="Connect Repository"
              />
            )}
          </div>
        );

      case "Reports":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                  Audit Documentation & Reports
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Export structured technical reports and analysis summaries.
                </p>
              </div>

              {repository && <ReportDownloadButton repository={repository} />}
            </div>

            {repository ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-mono text-white">
                        {repository.full_name}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Repository Technical Audit Report
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <InfoCard title="Files Scanned" value={String(repository.files_scanned)} />
                    <InfoCard title="Issues Found" value={String(repository.issues_found)} />
                    <InfoCard title="High Severity" value={String(repository.severity_counts.HIGH)} />
                    <InfoCard title="Total Dependencies" value={String(repository.dependencies.total)} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard title="Medium Severity" value={String(repository.severity_counts.MEDIUM)} />
                  <InfoCard title="Low Severity" value={String(repository.severity_counts.LOW)} />
                  <InfoCard title="Language" value={repository.language || "Multi-language"} />
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-zinc-400" />}
                title="No Report Generated"
                description="Scan a repository to generate technical markdown reports."
                onClick={() => setActivePage("Repositories")}
                buttonText="Connect Repository"
              />
            )}
          </div>
        );

      case "Tools":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                Analysis Tooling
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Developer tools for code auditing, bug investigation, and security analysis.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ToolCard
                icon={<Bug className="h-5 w-5" />}
                title="BugLens Diagnostic Engine"
                description="Correlates failing tests, stack traces, and source code to produce evidence-backed diagnoses and patches."
                status="Active"
                onClick={() => setActivePage("Bug Diagnosis")}
                buttonText="Launch Diagnostics"
                highlight
              />

              <ToolCard
                icon={<Search className="h-5 w-5" />}
                title="Repository Scanner"
                description="Performs static analysis on source files from public GitHub repositories."
                status="Active"
                onClick={() => setActivePage("Repositories")}
                buttonText="Open Scanner"
              />

              <ToolCard
                icon={<ShieldAlert className="h-5 w-5" />}
                title="Security Auditor"
                description="Scans for hardcoded credentials, unsafe executions, and security vulnerabilities."
                status="Active"
                onClick={() => setActivePage(repository ? "Issues" : "Repositories")}
                buttonText="View Security"
              />

              <ToolCard
                icon={<Code2 className="h-5 w-5" />}
                title="Code Quality Analyzer"
                description="Measures complexity hot-spots, module sizes, and maintainability concerns."
                status="Active"
                onClick={() => setActivePage(repository ? "Issues" : "Repositories")}
                buttonText="View Quality"
              />

              <ToolCard
                icon={<Package className="h-5 w-5" />}
                title="Dependency Inspector"
                description="Audits package manifests across Python and JavaScript ecosystems."
                status="Active"
                onClick={() => setActivePage(repository ? "Architecture" : "Repositories")}
                buttonText="View Dependencies"
              />

              <ToolCard
                icon={<BrainCircuit className="h-5 w-5" />}
                title="AI Assistant"
                description="Contextually queries language models for code explanations and fixes."
                status="Active"
                onClick={() => setActivePage(repository ? "AI Assistant" : "Repositories")}
                buttonText="Launch AI"
              />
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
                System Parameters & Configuration
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Runtime environment parameters and analysis engines.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div className="space-y-4">
                <SettingRow label="Backend API Architecture" value="FastAPI / Python 3.12" />
                <SettingRow label="Static Analysis Engine" value="AST Parser & Heuristic Rule Engine" />
                <SettingRow label="AI Language Model" value="Groq / Llama 3 API" />
                <SettingRow label="Bug Diagnosis Mode" value="Evidence-Backed Multi-Modal Correlation" />
                <SettingRow label="State Storage" value="Browser Local Storage" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span>RepoLens</span>
            <span>/</span>
            <span className="text-white font-semibold">{activePage}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                System Ready
              </span>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-8 py-8">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

function HomeContent({
  onRepositoryAnalyzed,
  onNavigate,
}: {
  onRepositoryAnalyzed: (repository: Repository) => void;
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur-sm">
        <div className="inline-flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400">
          <Terminal className="h-3.5 w-3.5" />
          Static Analysis & Bug Diagnostic Platform
        </div>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white font-mono sm:text-4xl">
          Automated Repository Code Audit & Diagnostics
        </h2>

        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-400">
          Inspect public GitHub repositories, detect security flaws and maintainability issues, and diagnose bugs using evidence-backed failing test correlation.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate("Bug Diagnosis")}
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition active:scale-[0.98]"
          >
            <Bug className="h-4 w-4" />
            Launch Bug Diagnostics
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onNavigate("Repositories")}
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 active:scale-[0.98]"
          >
            <GitBranch className="h-4 w-4 text-zinc-400" />
            Connect GitHub Repo
          </button>
        </div>
      </div>

      <RepositoryAnalyzer onRepositoryAnalyzed={onRepositoryAnalyzed} />

      {/* Feature Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            <Bug className="h-5 w-5" />
          </div>

          <h3 className="mt-3 text-sm font-bold text-white font-mono">
            Evidence-Backed Diagnosis
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Combines source code, stack trace logs, and test assertions to isolate root causes and suggest verified patches.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <h3 className="mt-3 text-sm font-bold text-white font-mono">
            Security & Static Analysis
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Detects hardcoded secrets, injection risks, code complexity, and maintainability concerns.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <Bot className="h-5 w-5" />
          </div>

          <h3 className="mt-3 text-sm font-bold text-white font-mono">
            LLM Code Explanation
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Interactively query findings, architectural trade-offs, and receive structured refactoring steps.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  onClick,
  buttonText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  buttonText: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
        {icon}
      </div>

      <h3 className="text-base font-bold text-white font-mono">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-zinc-400">{description}</p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 active:scale-[0.98]"
      >
        {buttonText}
      </button>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </p>
      <p className="mt-1 font-mono text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function ToolCard({
  icon,
  title,
  description,
  status,
  onClick,
  buttonText,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  onClick: () => void;
  buttonText: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
        highlight
          ? "border-blue-500/40 bg-blue-500/5"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
      }`}
    >
      <div>
        <div className="flex items-start justify-between">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              highlight
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            {icon}
          </div>

          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-400">
            {status}
          </span>
        </div>

        <h3 className="mt-4 text-sm font-bold text-white font-mono">{title}</h3>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`mt-5 w-full rounded-lg py-2 text-xs font-semibold transition active:scale-[0.98] ${
          highlight
            ? "bg-blue-600 text-white hover:bg-blue-500 shadow"
            : "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="font-mono text-xs font-semibold text-white">{value}</span>
    </div>
  );
}
