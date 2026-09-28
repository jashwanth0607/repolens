"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  FileText,
  GitBranch,
  Network,
  ShieldAlert,
  Sparkles,
  Wrench,
  Search,
  Code2,
  Package,
  BrainCircuit,
  Bug,
  ArrowRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import RepositoryAnalyzer from "../components/RepositoryAnalyzer";
import AnalysisDashboard from "../components/AnalysisDashboard";
import ReportDownloadButton from "../components/ReportDownloadButton";
import ArchitectureView from "../components/ArchitectureView";
import AIAssistant from "../components/AIAssistant";
import BugInvestigator from "../components/BugInvestigator";

import type { Repository } from "../lib/types";

const STORAGE_KEY = "repolens_repository";

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Start with the same state on the server and client.
  // localStorage is loaded only after hydration.
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
    if (!storageHydrated) {
      return;
    }

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
            <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Active Repository
                </p>

                <p className="mt-0.5 text-sm font-semibold text-white">
                  {repository.full_name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePage("Bug Diagnosis")}
                  className="rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/15 px-3.5 py-1.5 text-xs font-medium text-[#0A84FF] transition hover:bg-[#0A84FF]/25 active:scale-[0.98]"
                >
                  Diagnose Bugs
                </button>

                <button
                  type="button"
                  onClick={clearRepository}
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-[#86868b] transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.98]"
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
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Repositories
              </h2>

              <p className="mt-1 text-sm text-[#86868b]">
                Connect and inspect a public GitHub repository.
              </p>
            </div>

            <RepositoryAnalyzer
              onRepositoryAnalyzed={handleRepositoryAnalyzed}
            />

            {repository && (
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wider text-[#86868b]">
                  Last analyzed repository
                </p>

                <h3 className="mt-1 text-lg font-semibold text-white">
                  {repository.full_name}
                </h3>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePage("Dashboard")}
                    className="rounded-full bg-[#0A84FF] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#0A84FF]/20 hover:bg-[#0071E3] active:scale-[0.98]"
                  >
                    View Analysis Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage("Bug Diagnosis")}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-medium text-white hover:bg-white/[0.08] active:scale-[0.98]"
                  >
                    Investigate Bugs
                  </button>

                  <button
                    type="button"
                    onClick={clearRepository}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs text-[#86868b] hover:border-red-500/40 hover:text-red-400 active:scale-[0.98]"
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
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Findings & Issues
              </h2>

              <p className="mt-1 text-sm text-[#86868b]">
                Review security flaws, code complexity, and quality findings.
              </p>
            </div>

            {repository ? (
              <AnalysisDashboard repository={repository} />
            ) : (
              <EmptyState
                icon={<ShieldAlert className="h-8 w-8" />}
                title="No repository analyzed"
                description="Analyze a repository first to review code quality and security issues."
                onClick={() => setActivePage("Repositories")}
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "Architecture":
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#64D2FF]/30 bg-[#64D2FF]/10 px-3 py-1 text-xs font-medium text-[#64D2FF]">
                <Network className="h-3.5 w-3.5" />
                Repository architecture
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Architecture
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-[#86868b]">
                Visualize how RepoLens analyzes source structure and
                dependencies.
              </p>
            </div>

            {repository ? (
              <ArchitectureView repository={repository} />
            ) : (
              <EmptyState
                icon={<Network className="h-8 w-8" />}
                title="Architecture unavailable"
                description="Analyze a repository to generate its architectural map."
                onClick={() => setActivePage("Repositories")}
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "AI Assistant":
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#BF5AF2]/30 bg-[#BF5AF2]/10 px-3 py-1 text-xs font-medium text-[#BF5AF2]">
                <Sparkles className="h-3.5 w-3.5" />
                Groq Intelligence
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-white">
                AI Assistant
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-[#86868b]">
                Ask questions about your codebase, security findings, and
                architecture.
              </p>
            </div>

            {repository ? (
              <AIAssistant repository={repository} />
            ) : (
              <EmptyState
                icon={<Bot className="h-8 w-8" />}
                title="AI Assistant is ready"
                description="Connect a repository first to enable contextual code reasoning."
                onClick={() => setActivePage("Repositories")}
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "Reports":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Reports
                </h2>

                <p className="mt-1 text-sm text-[#86868b]">
                  Summary export and analysis audit documentation.
                </p>
              </div>

              {repository && (
                <ReportDownloadButton repository={repository} />
              )}
            </div>

            {repository ? (
              <>
                <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-8 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {repository.full_name}
                      </h3>

                      <p className="text-xs text-[#86868b]">
                        Repository Analysis & Intelligence Report
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <InfoCard
                      title="Files Scanned"
                      value={String(repository.files_scanned)}
                    />

                    <InfoCard
                      title="Issues Found"
                      value={String(repository.issues_found)}
                    />

                    <InfoCard
                      title="High Severity"
                      value={String(repository.severity_counts.HIGH)}
                    />

                    <InfoCard
                      title="Total Dependencies"
                      value={String(repository.dependencies.total)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard
                    title="Medium Severity"
                    value={String(repository.severity_counts.MEDIUM)}
                  />

                  <InfoCard
                    title="Low Severity"
                    value={String(repository.severity_counts.LOW)}
                  />

                  <InfoCard
                    title="Language"
                    value={repository.language || "Not detected"}
                  />
                </div>
              </>
            ) : (
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No report available"
                description="Analyze a repository to generate structured technical reports."
                onClick={() => setActivePage("Repositories")}
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "Tools":
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-3 py-1 text-xs font-medium text-[#0A84FF]">
                <Wrench className="h-3.5 w-3.5" />
                Analysis toolkit
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Tools & Capabilities
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-[#86868b]">
                Specialized developer tools for code investigation, security
                auditing, and quality intelligence.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ToolCard
                icon={<Bug className="h-5 w-5" />}
                title="BugLens Diagnostic Engine"
                description="Given a repository, bug report, and available tests, investigate the likely cause and generate an evidence-backed diagnosis."
                status="Active"
                onClick={() => setActivePage("Bug Diagnosis")}
                buttonText="Open Diagnostics"
                highlight
              />

              <ToolCard
                icon={<Search className="h-5 w-5" />}
                title="Repository Scanner"
                description="Clones and scans source files from public repositories with static analysis filters."
                status="Available"
                onClick={() => setActivePage("Repositories")}
                buttonText="Open Scanner"
              />

              <ToolCard
                icon={<ShieldAlert className="h-5 w-5" />}
                title="Security Analyzer"
                description="Scans for hardcoded credentials, unsafe execution vectors, and security vulnerabilities."
                status="Available"
                onClick={() =>
                  setActivePage(repository ? "Issues" : "Repositories")
                }
                buttonText="View Security"
              />

              <ToolCard
                icon={<Code2 className="h-5 w-5" />}
                title="Code Quality Analyzer"
                description="Detects complexity hot-spots, oversized modules, and maintainability concerns."
                status="Available"
                onClick={() =>
                  setActivePage(repository ? "Issues" : "Repositories")
                }
                buttonText="View Quality"
              />

              <ToolCard
                icon={<Package className="h-5 w-5" />}
                title="Dependency Analyzer"
                description="Audits software stack dependencies across Python and JavaScript ecosystems."
                status="Available"
                onClick={() =>
                  setActivePage(repository ? "Architecture" : "Repositories")
                }
                buttonText="View Dependencies"
              />

              <ToolCard
                icon={<BrainCircuit className="h-5 w-5" />}
                title="AI Assistant"
                description="Query Groq language models to explain complex findings and generate fixes."
                status="Available"
                onClick={() =>
                  setActivePage(repository ? "AI Assistant" : "Repositories")
                }
                buttonText="Open AI"
              />
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Settings & Configuration
              </h2>

              <p className="mt-1 text-sm text-[#86868b]">
                Runtime and environment parameters.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-8 backdrop-blur-xl">
              <div className="space-y-5">
                <SettingRow
                  label="Backend Architecture"
                  value="FastAPI (Python 3.14)"
                />

                <SettingRow
                  label="AI Diagnostic Model"
                  value="Groq / Llama 3 / Deterministic AST Engine"
                />

                <SettingRow
                  label="Design Language"
                  value="Apple Human Interface Guidelines (HIG)"
                />

                <SettingRow
                  label="Bug Investigation Mode"
                  value="Evidence-Backed Multi-Modal (Repo + Bug + Tests)"
                />

                <SettingRow
                  label="State Persistence"
                  value="Local Browser Storage"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-black/75 px-8 backdrop-blur-2xl">
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              {activePage}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30D158] opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30D158]" />
              </span>

              <span className="text-xs font-medium text-[#30D158]">
                Apple HIG Configured
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
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] via-[#0c0d12]/50 to-transparent p-10 backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-3.5 py-1 text-xs font-medium text-[#0A84FF]">
          <Sparkles className="h-3.5 w-3.5" />
          Apple Human Interface Guidelines & Code Intelligence
        </div>

        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white lg:text-5xl">
          Software intelligence, <br />
          <span className="bg-gradient-to-r from-[#0A84FF] via-[#BF5AF2] to-[#64D2FF] bg-clip-text text-transparent">
            elevated by evidence.
          </span>
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#86868b]">
          Analyze GitHub repositories, isolate security and quality defects,
          and investigate bugs with failing test correlation to pinpoint root
          causes.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate("Bug Diagnosis")}
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#0A84FF] px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:bg-[#0071E3] active:scale-[0.98]"
          >
            <Bug className="h-4 w-4" />
            Launch Bug Diagnosis
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onNavigate("Repositories")}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-[#f5f5f7] transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <GitBranch className="h-4 w-4 text-[#86868b]" />
            Scan Repository
          </button>
        </div>
      </div>

      <RepositoryAnalyzer
        onRepositoryAnalyzed={onRepositoryAnalyzed}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF453A]/10 text-[#FF453A]">
            <Bug className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-white">
            Evidence-Backed Diagnosis
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-[#86868b]">
            Combines repository code, bug reports, and test assertions to
            determine root causes, trace steps, and verified patches.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-white">
            Security & Hygiene
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-[#86868b]">
            Identifies leaked tokens, injection vectors, and dependency
            vulnerabilities across your codebase.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#BF5AF2]/10 text-[#BF5AF2]">
            <Bot className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-white">
            Groq Intelligence
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-[#86868b]">
            Ask questions, understand complex architectural tradeoffs, and
            generate immediate safe code fixes.
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
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-8 text-center backdrop-blur-xl">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#86868b]">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#86868b]">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 rounded-full bg-[#0A84FF] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0A84FF]/25 hover:bg-[#0071E3] active:scale-[0.98]"
      >
        {buttonText}
      </button>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
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
      className={`rounded-3xl border p-6 transition-all backdrop-blur-xl ${
        highlight
          ? "border-[#0A84FF]/40 bg-[#0A84FF]/5 hover:border-[#0A84FF]/60"
          : "border-white/[0.08] bg-[#0c0d12]/80 hover:border-white/[0.14] hover:bg-[#0c0d12]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            highlight
              ? "bg-[#0A84FF]/20 text-[#0A84FF]"
              : "bg-white/[0.04] text-[#86868b]"
          }`}
        >
          {icon}
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
          {status}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1.5 min-h-[50px] text-xs leading-relaxed text-[#86868b]">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={`mt-5 w-full rounded-full py-2.5 text-xs font-semibold transition active:scale-[0.98] ${
          highlight
            ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/20 hover:bg-[#0071E3]"
            : "border border-white/10 bg-white/[0.03] text-[#f5f5f7] hover:bg-white/[0.08]"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-[#86868b]">
        {label}
      </span>

      <span className="font-mono text-xs font-medium text-white">
        {value}
      </span>
    </div>
  );
}