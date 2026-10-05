"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Package,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
  ExternalLink,
  SlidersHorizontal,
  Code,
  Layers,
  Activity,
  Award,
} from "lucide-react";

import type {
  Issue,
  IssueFilter,
  Repository,
} from "../lib/types";
import ScoreGauge, {
  ScoreExplanation,
  ScoreMethodology,
  ScoreRadarChart,
  ScoreBreakdownBar,
} from "./ScoreGauge";

type AnalysisDashboardProps = {
  repository: Repository;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://repolens-n8j1.onrender.com"
).replace(/\/$/, "");

export default function AnalysisDashboard({
  repository,
}: AnalysisDashboardProps) {
  const [filter, setFilter] = useState<IssueFilter>("ALL");

  const filteredIssues = useMemo(() => {
    if (filter === "ALL") {
      return repository.issues;
    }

    return repository.issues.filter(
      (issue) => issue.severity === filter
    );
  }, [filter, repository.issues]);

  const categoryEntries = Object.entries(
    repository.category_counts
  ).sort((a, b) => b[1] - a[1]);

  const scores = repository.scores;

  return (
    <div className="space-y-6">
      {/* Repository Hero Banner */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <FileCode2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold tracking-tight text-white font-mono">
                    {repository.full_name}
                  </h2>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                    {repository.private ? "Private" : "Public"}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-zinc-400">
                  {repository.description || "Repository static analysis & software intelligence"}
                </p>
              </div>
            </div>
          </div>

          <a
            href={repository.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-zinc-800/60">
          <MetaBadge label="Language" value={repository.language || "Multi-language"} />
          <MetaBadge label="Default Branch" value={repository.default_branch} />
          <MetaBadge label="Stars" value={repository.stars.toLocaleString()} />
          <MetaBadge label="Forks" value={repository.forks.toLocaleString()} />
          <MetaBadge label="Open Issues" value={String(repository.open_issues)} />
        </div>
      </div>

      {/* GRAPHICAL SCORES SECTION */}
      {scores ? (
        <div className="space-y-6">
          {/* Main Visual Score Card: Gauge + Radar Chart */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                  AUDIT RESULTS
                </span>
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  Repository Health & Performance Score
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                <Activity className="h-3.5 w-3.5" />
                <span>Deterministic AST Audit</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12 items-center">
              {/* Left Column: Radial Overall Score Gauge */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-800/60">
                <ScoreGauge
                  score={scores.overall}
                  title="Overall Index"
                  size="large"
                />
                <div className="w-full max-w-sm mt-4">
                  <ScoreExplanation score={scores.overall} showTitle={false} />
                </div>
              </div>

              {/* Right Column: Multi-Axis Radar Chart */}
              <div className="md:col-span-7 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between px-2 mb-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    5-Axis Repository Profile
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Target: 100/100
                  </span>
                </div>
                <ScoreRadarChart scores={scores} />
              </div>
            </div>

            {/* Score Breakdown Contribution Bar */}
            <div className="mt-6 pt-6 border-t border-zinc-800/60">
              <ScoreBreakdownBar breakdown={scores.overall.breakdown} />
            </div>
          </div>

          {/* Category Scores Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <CategoryScoreCard title="Code Quality" score={scores.code_quality} />
            <CategoryScoreCard title="Security" score={scores.security} />
            <CategoryScoreCard title="Repository Health" score={scores.repository_health} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CategoryScoreCard title="Documentation" score={scores.documentation} />
            <CategoryScoreCard title="Maintainability" score={scores.maintainability} />
          </div>

          <ScoreMethodology methodology={scores.methodology} />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 backdrop-blur-md text-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-400 mx-auto" />
          <p className="mt-3 text-sm text-zinc-300">Calculating repository score matrix...</p>
        </div>
      )}

      {/* Overview Stat Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Files Scanned" value={repository.files_scanned} subtext="Source & config files" />
        <MetricCard label="Total Issues" value={repository.issues_found} subtext="Across all categories" />
        <MetricCard label="High Severity" value={repository.severity_counts.HIGH} subtext="Requires attention" tone="red" />
        <MetricCard label="Dependencies" value={repository.dependencies.total} subtext={`Py: ${repository.dependencies.python} | JS: ${repository.dependencies.javascript}`} />
      </div>

      {/* Severity & Finding Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Severity Distribution
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {repository.issues_found} Total
            </span>
          </div>

          <div className="space-y-4">
            <SeverityRow
              label="High Severity"
              count={repository.severity_counts.HIGH}
              total={repository.issues_found}
              tone="red"
            />
            <SeverityRow
              label="Medium Severity"
              count={repository.severity_counts.MEDIUM}
              total={repository.issues_found}
              tone="amber"
            />
            <SeverityRow
              label="Low Severity"
              count={repository.severity_counts.LOW}
              total={repository.issues_found}
              tone="blue"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Categories
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {categoryEntries.length} Types
            </span>
          </div>

          {categoryEntries.length > 0 ? (
            <div className="space-y-2">
              {categoryEntries.map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3.5 py-2.5 text-xs"
                >
                  <span className="text-zinc-300 font-medium">{category}</span>
                  <span className="font-mono font-semibold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-4">No specific issue categories recorded.</p>
          )}
        </section>
      </div>

      {/* Findings Section */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Audited Findings
              </h3>
              <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-300">
                {filteredIssues.length}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Review code flaws, security alerts, and AI-assisted remediation options.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1">
            <FilterButton label="All" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
            <FilterButton label="High" active={filter === "HIGH"} onClick={() => setFilter("HIGH")} tone="red" />
            <FilterButton label="Medium" active={filter === "MEDIUM"} onClick={() => setFilter("MEDIUM")} tone="amber" />
            <FilterButton label="Low" active={filter === "LOW"} onClick={() => setFilter("LOW")} tone="blue" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue, index) => (
              <IssueCard
                key={`${issue.file}-${issue.line}-${issue.title}-${index}`}
                issue={issue}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/30">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
              <p className="mt-3 font-semibold text-white">No findings match filter</p>
              <p className="mt-1 text-xs text-zinc-400">Select another severity filter above.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryScoreCard({ title, score }: { title: string; score: any }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm flex flex-col justify-between">
      <div className="flex justify-center py-2">
        <ScoreGauge score={score} title={title} size="small" />
      </div>
      <ScoreExplanation score={score} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  tone,
}: {
  label: string;
  value: number;
  subtext?: string;
  tone?: "red" | "normal";
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 font-mono text-2xl font-bold ${tone === "red" && value > 0 ? "text-red-400" : "text-white"}`}>
        {value.toLocaleString()}
      </p>
      {subtext && <p className="mt-1 text-[11px] text-zinc-400">{subtext}</p>}
    </div>
  );
}

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-xs">
      <span className="text-zinc-400">{label}:</span>
      <span className="font-mono text-zinc-200">{value}</span>
    </div>
  );
}

function SeverityRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "red" | "amber" | "blue";
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const classes = {
    red: { bar: "bg-red-500", text: "text-red-400" },
    amber: { bar: "bg-amber-500", text: "text-amber-400" },
    blue: { bar: "bg-blue-500", text: "text-blue-400" },
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className={`font-mono font-bold ${classes[tone].text}`}>
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${classes[tone].bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "red" | "amber" | "blue";
}) {
  const toneClasses = {
    red: active ? "bg-red-500/20 text-red-300 border-red-500/40" : "",
    amber: active ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "",
    blue: active ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-xs font-medium transition border ${
        active
          ? tone && toneClasses[tone]
            ? toneClasses[tone]
            : "bg-blue-600 text-white border-blue-500"
          : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

/* -------------------------------------------------------
   ISSUE CARD
------------------------------------------------------- */

function IssueCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);
  const [aiMode, setAiMode] = useState<"explain" | "fix" | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async (mode: "explain" | "fix") => {
    setAiMode(mode);
    setLoading(true);
    setError("");
    setAiResponse("");

    try {
      const endpoint =
        mode === "explain"
          ? `${API_URL}/api/ai/explain`
          : `${API_URL}/api/ai/fix`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue }),
      });

      let data: Record<string, unknown> | null = null;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Backend returned invalid status ${response.status}`);
      }

      if (!response.ok) {
        const message =
          (typeof data?.detail === "string" ? data.detail : null) ||
          (typeof data?.message === "string" ? data.message : null) ||
          `Request failed (${response.status})`;
        throw new Error(message);
      }

      const answer =
        (typeof data?.answer === "string" ? data.answer : null) ||
        (typeof data?.response === "string" ? data.response : null) ||
        (typeof data?.message === "string" ? data.message : null);

      if (!answer) throw new Error("Empty AI response.");

      setAiResponse(answer);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  const severityStyles = {
    HIGH: "border-red-500/30 bg-red-500/10 text-red-400",
    MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    LOW: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-mono font-bold border ${severityStyles[issue.severity]}`}>
            {issue.severity}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                {issue.category}
              </span>
              {issue.tool && (
                <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                  {issue.tool}
                </span>
              )}
            </div>

            <h4 className="mt-2 text-sm font-semibold text-white">
              {issue.title}
            </h4>

            <div className="mt-1 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-blue-400">{issue.file}</span>
              <span>:</span>
              <span className="text-zinc-400">line {issue.line}</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-zinc-300">
              {issue.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => askAI("explain")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-50"
              >
                {loading && aiMode === "explain" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
                Explain Finding
              </button>

              <button
                type="button"
                onClick={() => askAI("fix")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
              >
                {loading && aiMode === "fix" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}
                Generate Fix
              </button>

              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expanded ? "Hide Details" : "Details & Code"}
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-zinc-800/80 pt-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Recommendation</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{issue.suggestion}</p>
            </div>

            {(loading || aiResponse || error) && (
              <div className="overflow-hidden rounded-lg border border-purple-500/30 bg-zinc-900/90">
                <div className="flex items-center justify-between border-b border-purple-500/20 px-4 py-2.5 bg-purple-950/30">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-semibold text-white">
                      AI Diagnostic Assistant
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiResponse("");
                      setError("");
                      setAiMode(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 text-xs">
                  {loading ? (
                    <div className="flex items-center gap-2 text-zinc-400 py-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                      Analyzing code context and generating response...
                    </div>
                  ) : error ? (
                    <div className="text-red-400 p-2">{error}</div>
                  ) : (
                    <AIFormattedResponse content={aiResponse} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AIFormattedResponse({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}
