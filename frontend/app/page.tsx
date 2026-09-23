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
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import RepositoryAnalyzer from "../components/RepositoryAnalyzer";
import AnalysisDashboard from "../components/AnalysisDashboard";
import ReportDownloadButton from "../components/ReportDownloadButton";
import ArchitectureView from "../components/ArchitectureView";
import AIAssistant from "../components/AIAssistant";

import type { Repository } from "../lib/types";

const STORAGE_KEY = "repolens_repository";

export default function Home() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [repository, setRepository] =
    useState<Repository | null>(null);

  useEffect(() => {
    try {
      const savedRepository =
        localStorage.getItem(STORAGE_KEY);

      if (savedRepository) {
        const parsedRepository =
          JSON.parse(savedRepository) as Repository;

        setRepository(parsedRepository);
      }
    } catch (error) {
      console.error(
        "Failed to restore repository:",
        error
      );

      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      if (repository) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(repository)
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error(
        "Failed to save repository:",
        error
      );
    }
  }, [repository]);

  const handleRepositoryAnalyzed = (
    repo: Repository
  ) => {
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
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Current Repository
                </p>

                <p className="mt-1 text-sm font-medium text-slate-300">
                  {repository.full_name}
                </p>
              </div>

              <button
                type="button"
                onClick={clearRepository}
                className="w-fit rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400"
              >
                Clear Repository
              </button>
            </div>

            <AnalysisDashboard
              repository={repository}
            />
          </div>
        ) : (
          <HomeContent
            onRepositoryAnalyzed={
              handleRepositoryAnalyzed
            }
          />
        );

      case "Repositories":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Repositories
              </h2>

              <p className="mt-2 text-slate-400">
                Analyze a public GitHub repository.
              </p>
            </div>

            <RepositoryAnalyzer
              onRepositoryAnalyzed={
                handleRepositoryAnalyzed
              }
            />

            {repository && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <p className="text-sm text-slate-400">
                  Last analyzed repository
                </p>

                <h3 className="mt-1 text-lg font-semibold text-white">
                  {repository.full_name}
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePage("Dashboard")
                    }
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    View Analysis
                  </button>

                  <button
                    type="button"
                    onClick={clearRepository}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:border-red-500/40 hover:text-red-400"
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
              <h2 className="text-3xl font-bold text-white">
                Issues
              </h2>

              <p className="mt-2 text-slate-400">
                Review findings detected in your repository.
              </p>
            </div>

            {repository ? (
              <AnalysisDashboard
                repository={repository}
              />
            ) : (
              <EmptyState
                icon={
                  <ShieldAlert className="h-8 w-8" />
                }
                title="No repository analyzed"
                description="Analyze a repository first to see detected issues."
                onClick={() =>
                  setActivePage("Repositories")
                }
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "Architecture":
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                <Network className="h-3.5 w-3.5" />
                Repository architecture
              </div>

              <h2 className="text-3xl font-bold text-white">
                Architecture
              </h2>

              <p className="mt-2 max-w-2xl text-slate-400">
                Visualize how RepoLens processes your
                repository from scanning through analysis and
                AI-assisted findings.
              </p>
            </div>

            {repository ? (
              <ArchitectureView
                repository={repository}
              />
            ) : (
              <EmptyState
                icon={
                  <Network className="h-8 w-8" />
                }
                title="Architecture unavailable"
                description="Analyze a repository to visualize its architecture."
                onClick={() =>
                  setActivePage("Repositories")
                }
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "AI Assistant":
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                <Sparkles className="h-3.5 w-3.5" />
                AI code intelligence
              </div>

              <h2 className="text-3xl font-bold text-white">
                AI Assistant
              </h2>

              <p className="mt-2 max-w-2xl text-slate-400">
                Ask questions about your analyzed repository
                and get AI-powered explanations.
              </p>
            </div>

            {repository ? (
              <AIAssistant
                repository={repository}
              />
            ) : (
              <EmptyState
                icon={
                  <Bot className="h-8 w-8" />
                }
                title="AI Assistant is ready"
                description="Analyze a repository first to start chatting with RepoLens AI."
                onClick={() =>
                  setActivePage("Repositories")
                }
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
                <h2 className="text-3xl font-bold text-white">
                  Reports
                </h2>

                <p className="mt-2 text-slate-400">
                  Repository analysis summary and export.
                </p>
              </div>

              {repository && (
                <ReportDownloadButton
                  repository={repository}
                />
              )}
            </div>

            {repository ? (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-7 w-7 text-blue-400" />

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {repository.full_name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        Repository Analysis Report
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <InfoCard
                      title="Files"
                      value={String(
                        repository.files_scanned
                      )}
                    />

                    <InfoCard
                      title="Issues"
                      value={String(
                        repository.issues_found
                      )}
                    />

                    <InfoCard
                      title="High"
                      value={String(
                        repository.severity_counts.HIGH
                      )}
                    />

                    <InfoCard
                      title="Dependencies"
                      value={String(
                        repository.dependencies.total
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard
                    title="Medium Severity"
                    value={String(
                      repository.severity_counts.MEDIUM
                    )}
                  />

                  <InfoCard
                    title="Low Severity"
                    value={String(
                      repository.severity_counts.LOW
                    )}
                  />

                  <InfoCard
                    title="Language"
                    value={
                      repository.language ||
                      "Not detected"
                    }
                  />
                </div>
              </>
            ) : (
              <EmptyState
                icon={
                  <FileText className="h-8 w-8" />
                }
                title="No report available"
                description="Analyze a repository to generate its report."
                onClick={() =>
                  setActivePage("Repositories")
                }
                buttonText="Analyze Repository"
              />
            )}
          </div>
        );

      case "Tools":
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                <Wrench className="h-3.5 w-3.5" />
                Analysis toolkit
              </div>

              <h2 className="text-3xl font-bold text-white">
                Tools
              </h2>

              <p className="mt-2 max-w-2xl text-slate-400">
                RepoLens combines repository scanning,
                security checks, code quality analysis,
                dependency analysis, and AI assistance.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ToolCard
                icon={
                  <Search className="h-6 w-6" />
                }
                title="Repository Scanner"
                description="Clones and scans supported source files from the selected public repository."
                status="Available"
                onClick={() =>
                  setActivePage("Repositories")
                }
                buttonText="Open Scanner"
              />

              <ToolCard
                icon={
                  <ShieldAlert className="h-6 w-6" />
                }
                title="Security Analyzer"
                description="Checks the repository for security-related findings and suspicious patterns."
                status="Available"
                onClick={() =>
                  setActivePage(
                    repository
                      ? "Issues"
                      : "Repositories"
                  )
                }
                buttonText="View Security"
              />

              <ToolCard
                icon={
                  <Code2 className="h-6 w-6" />
                }
                title="Code Quality Analyzer"
                description="Looks for code complexity, large files, long functions, and maintainability issues."
                status="Available"
                onClick={() =>
                  setActivePage(
                    repository
                      ? "Issues"
                      : "Repositories"
                  )
                }
                buttonText="View Quality"
              />

              <ToolCard
                icon={
                  <Package className="h-6 w-6" />
                }
                title="Dependency Analyzer"
                description="Summarizes Python and JavaScript dependencies and checks dependency hygiene."
                status="Available"
                onClick={() =>
                  setActivePage(
                    repository
                      ? "Architecture"
                      : "Repositories"
                  )
                }
                buttonText="View Dependencies"
              />

              <ToolCard
                icon={
                  <BrainCircuit className="h-6 w-6" />
                }
                title="AI Assistant"
                description="Ask RepoLens AI questions about the analyzed repository and its findings."
                status="Available"
                onClick={() =>
                  setActivePage(
                    repository
                      ? "AI Assistant"
                      : "Repositories"
                  )
                }
                buttonText="Open AI"
              />

              <ToolCard
                icon={
                  <FileText className="h-6 w-6" />
                }
                title="Report Center"
                description="View and download the current repository analysis report."
                status="Available"
                onClick={() =>
                  setActivePage(
                    repository
                      ? "Reports"
                      : "Repositories"
                  )
                }
                buttonText="Open Reports"
              />
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Settings
              </h2>

              <p className="mt-2 text-slate-400">
                RepoLens configuration.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="space-y-5">
                <SettingRow
                  label="Backend"
                  value="FastAPI"
                />

                <SettingRow
                  label="AI Provider"
                  value="Groq"
                />

                <SettingRow
                  label="Repository Access"
                  value="Public GitHub"
                />

                <SettingRow
                  label="Analysis Mode"
                  value="Static Analysis"
                />

                <SettingRow
                  label="Persistence"
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
    <div className="min-h-screen bg-[#060b16] text-white">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-[#060b16]/90 px-8 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Workspace
            </p>

            <h1 className="text-lg font-semibold text-white">
              {activePage}
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-emerald-400">
              Services Online
            </span>
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
}: {
  onRepositoryAnalyzed: (
    repository: Repository
  ) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered code intelligence
        </div>

        <h2 className="text-4xl font-bold tracking-tight text-white">
          Analyze your repository
        </h2>

        <p className="mt-3 max-w-2xl text-slate-400">
          Scan a GitHub repository for security,
          quality, dependency, and maintainability
          issues.
        </p>
      </div>

      <RepositoryAnalyzer
        onRepositoryAnalyzed={
          onRepositoryAnalyzed
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <ShieldAlert className="mb-4 h-6 w-6 text-red-400" />

          <h3 className="font-semibold text-white">
            Security Analysis
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Detect credentials, unsafe functions,
            and potential vulnerabilities.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <GitBranch className="mb-4 h-6 w-6 text-blue-400" />

          <h3 className="font-semibold text-white">
            Code Quality
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Identify complexity, large files,
            and maintainability problems.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <Bot className="mb-4 h-6 w-6 text-purple-400" />

          <h3 className="font-semibold text-white">
            AI Assistance
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Ask AI to explain findings and suggest
            fixes.
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
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
      <div className="mb-4 rounded-2xl bg-slate-800 p-4 text-slate-400">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold text-white">
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  onClick: () => void;
  buttonText: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-slate-700 hover:bg-slate-900/70">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
          {icon}
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] text-emerald-400">
          {status}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white"
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
    <div className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-medium text-white">
        {value}
      </span>
    </div>
  );
}