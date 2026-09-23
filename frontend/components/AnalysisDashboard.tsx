"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  FileCode2,
  Package,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import type {
  Issue,
  IssueFilter,
  Repository,
} from "../lib/types";

type AnalysisDashboardProps = {
  repository: Repository;
};

export default function AnalysisDashboard({
  repository,
}: AnalysisDashboardProps) {
  const [filter, setFilter] =
    useState<IssueFilter>("ALL");

  const filteredIssues = useMemo(() => {
    if (filter === "ALL") {
      return repository.issues;
    }

    return repository.issues.filter(
      (issue) => issue.severity === filter
    );
  }, [filter, repository.issues]);

  const score = calculateHealthScore(repository);

  const categoryEntries = Object.entries(
    repository.category_counts
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Repository header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <FileCode2 className="h-6 w-6 text-blue-400" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-white">
                  {repository.full_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {repository.description ||
                    "Repository analysis"}
                </p>
              </div>
            </div>
          </div>

          <a
            href={repository.html_url}
            target="_blank"
            rel="noreferrer"
            className="w-fit rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-white"
          >
            Open Repository
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <MetaBadge
            label="Language"
            value={
              repository.language || "Unknown"
            }
          />

          <MetaBadge
            label="Branch"
            value={repository.default_branch}
          />

          <MetaBadge
            label="Stars"
            value={String(repository.stars)}
          />

          <MetaBadge
            label="Forks"
            value={String(repository.forks)}
          />
        </div>
      </div>

      {/* Score cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard
          title="Repository Health"
          value={score.overall}
          subtitle="Overall analysis score"
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
        />

        <ScoreCard
          title="Security"
          value={score.security}
          subtitle="Security finding score"
          icon={
            <ShieldAlert className="h-5 w-5" />
          }
        />

        <ScoreCard
          title="Code Quality"
          value={score.quality}
          subtitle="Maintainability score"
          icon={
            <Code2 className="h-5 w-5" />
          }
        />

        <ScoreCard
          title="Dependencies"
          value={score.dependencies}
          subtitle="Dependency hygiene"
          icon={
            <Package className="h-5 w-5" />
          }
        />
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Files Scanned"
          value={repository.files_scanned}
        />

        <MetricCard
          label="Total Issues"
          value={repository.issues_found}
        />

        <MetricCard
          label="High Severity"
          value={repository.severity_counts.HIGH}
        />

        <MetricCard
          label="Dependencies"
          value={repository.dependencies.total}
        />
      </div>

      {/* Severity + categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-white">
              Severity Breakdown
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Findings grouped by severity level.
            </p>
          </div>

          <div className="space-y-4">
            <SeverityRow
              label="High"
              count={
                repository.severity_counts.HIGH
              }
              total={repository.issues_found}
              tone="red"
            />

            <SeverityRow
              label="Medium"
              count={
                repository.severity_counts.MEDIUM
              }
              total={repository.issues_found}
              tone="amber"
            />

            <SeverityRow
              label="Low"
              count={
                repository.severity_counts.LOW
              }
              total={repository.issues_found}
              tone="blue"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-white">
              Finding Categories
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Distribution of detected issue categories.
            </p>
          </div>

          {categoryEntries.length > 0 ? (
            <div className="space-y-3">
              {categoryEntries.map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">
                      {category}
                    </span>

                    <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No categories detected.
            </p>
          )}
        </section>
      </div>

      {/* Dependencies */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-3">
            <Package className="h-5 w-5 text-amber-400" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Dependency Summary
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Detected project dependencies.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DependencyCard
            label="Python"
            value={repository.dependencies.python}
          />

          <DependencyCard
            label="JavaScript"
            value={
              repository.dependencies.javascript
            }
          />

          <DependencyCard
            label="Total"
            value={repository.dependencies.total}
          />
        </div>
      </section>

      {/* Findings */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-white">
                Findings
              </h3>

              <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                {filteredIssues.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Review detected issues and ask RepoLens AI
              for explanations or fixes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
            />

            <FilterButton
              label="High"
              active={filter === "HIGH"}
              onClick={() => setFilter("HIGH")}
            />

            <FilterButton
              label="Medium"
              active={filter === "MEDIUM"}
              onClick={() => setFilter("MEDIUM")}
            />

            <FilterButton
              label="Low"
              active={filter === "LOW"}
              onClick={() => setFilter("LOW")}
            />
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
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />

              <p className="mt-3 font-medium text-white">
                No findings in this filter
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try another severity filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------
   ISSUE CARD
------------------------------------------------------- */

function IssueCard({
  issue,
}: {
  issue: Issue;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const [aiMode, setAiMode] = useState<
    "explain" | "fix" | null
  >(null);

  const [aiResponse, setAiResponse] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const askAI = async (
    mode: "explain" | "fix"
  ) => {
    setAiMode(mode);
    setLoading(true);
    setError("");
    setAiResponse("");

    try {
      const endpoint =
        mode === "explain"
          ? "http://127.0.0.1:8000/api/ai/explain"
          : "http://127.0.0.1:8000/api/ai/fix";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "AI request failed."
        );
      }

      const answer =
        data.answer ||
        data.response ||
        data.message;

      if (!answer) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      setAiResponse(answer);
      setExpanded(true);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
      {/* Main issue */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <SeverityIcon
            severity={issue.severity}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge
                severity={issue.severity}
              />

              <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-400">
                {issue.category}
              </span>

              {issue.tool && (
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-500">
                  {issue.tool}
                </span>
              )}
            </div>

            <h4 className="mt-3 text-base font-semibold text-white">
              {issue.title}
            </h4>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{issue.file}</span>

              <span>•</span>

              <span>
                Line {issue.line}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {issue.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  askAI("explain")
                }
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/5 px-3 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading &&
                aiMode === "explain" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}

                Explain with AI
              </button>

              <button
                type="button"
                onClick={() =>
                  askAI("fix")
                }
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading &&
                aiMode === "fix" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}

                Generate Fix
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpanded(!expanded)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-600 hover:text-white"
              >
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}

                {expanded
                  ? "Hide Details"
                  : "View Details"}
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        {expanded && (
          <div className="mt-5 space-y-4 border-t border-slate-800 pt-5">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />

                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Recommendation
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {issue.suggestion}
              </p>
            </div>

            {/* AI response */}
            {(loading || aiResponse || error) && (
              <div className="overflow-hidden rounded-xl border border-purple-500/20 bg-[#090e1b]">
                <div className="flex items-center justify-between border-b border-purple-500/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-purple-500/10 p-2">
                      <Bot className="h-4 w-4 text-purple-400" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        RepoLens AI
                      </p>

                      <p className="text-[11px] text-slate-500">
                        {aiMode === "fix"
                          ? "Suggested fix"
                          : "Issue explanation"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAiResponse("");
                      setError("");
                      setAiMode(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  {loading ? (
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />

                      RepoLens AI is analyzing this finding...
                    </div>
                  ) : error ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                        <p className="text-sm leading-6 text-red-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <AIFormattedResponse
                      content={aiResponse}
                    />
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

/* -------------------------------------------------------
   AI RESPONSE FORMATTER
------------------------------------------------------- */

function AIFormattedResponse({
  content,
}: {
  content: string;
}) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n");

  const elements: React.ReactNode[] = [];

  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let numberedItems: {
    number: string;
    text: string;
  }[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines
      .join(" ")
      .trim();

    if (text) {
      elements.push(
        <p
          key={`paragraph-${elements.length}`}
          className="text-sm leading-7 text-slate-300"
        >
          {formatInlineText(text)}
        </p>
      );
    }

    paragraphLines = [];
  };

  const flushLists = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="space-y-2.5 pl-5"
        >
          {listItems.map((item, index) => (
            <li
              key={index}
              className="relative text-sm leading-6 text-slate-300"
            >
              <span className="absolute -left-4 top-3 h-1.5 w-1.5 rounded-full bg-purple-400" />

              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );

      listItems = [];
    }

    if (numberedItems.length > 0) {
      elements.push(
        <ol
          key={`numbered-${elements.length}`}
          className="space-y-3"
        >
          {numberedItems.map(
            (item, index) => (
              <li
                key={index}
                className="flex gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                  {item.number}
                </span>

                <span className="pt-0.5 text-sm leading-6 text-slate-300">
                  {formatInlineText(
                    item.text
                  )}
                </span>
              </li>
            )
          )}
        </ol>
      );

      numberedItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushLists();

      return;
    }

    /* Markdown heading */
    if (/^#{1,4}\s+/.test(line)) {
      flushParagraph();
      flushLists();

      const heading = line
        .replace(/^#{1,4}\s+/, "")
        .replace(/\*\*/g, "");

      elements.push(
        <div
          key={`heading-${index}`}
          className="border-b border-slate-800 pb-2 pt-1"
        >
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
            {heading}
          </h4>
        </div>
      );

      return;
    }

    /* Bold heading */
    if (
      /^\*\*[^*]+\*\*$/.test(line)
    ) {
      flushParagraph();
      flushLists();

      const heading = line.replace(
        /^\*\*|\*\*$/g,
        ""
      );

      elements.push(
        <div
          key={`bold-heading-${index}`}
          className="border-b border-slate-800 pb-2 pt-1"
        >
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
            {heading}
          </h4>
        </div>
      );

      return;
    }

    /* Numbered item */
    const numberedMatch =
      line.match(/^(\d+)\.\s+(.*)$/);

    if (numberedMatch) {
      flushParagraph();

      numberedItems.push({
        number: numberedMatch[1],
        text: numberedMatch[2],
      });

      return;
    }

    /* Bullet item */
    const bulletMatch =
      line.match(/^[-*•]\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();

      listItems.push(
        bulletMatch[1]
      );

      return;
    }

    flushLists();

    paragraphLines.push(line);

    if (index === lines.length - 1) {
      flushParagraph();
    }
  });

  flushParagraph();
  flushLists();

  if (elements.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-300">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {elements}
    </div>
  );
}

/* -------------------------------------------------------
   INLINE FORMATTER
------------------------------------------------------- */

function formatInlineText(
  text: string
): React.ReactNode {
  const parts = text.split(
    /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  );

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="font-semibold text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("`") &&
      part.endsWith("`")
    ) {
      return (
        <code
          key={index}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-purple-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*")
    ) {
      return (
        <em
          key={index}
          className="text-slate-200"
        >
          {part.slice(1, -1)}
        </em>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

/* -------------------------------------------------------
   SCORE CALCULATION
------------------------------------------------------- */

function calculateHealthScore(
  repository: Repository
) {
  const total =
    repository.issues_found;

  const high =
    repository.severity_counts.HIGH;

  const medium =
    repository.severity_counts.MEDIUM;

  const low =
    repository.severity_counts.LOW;

  const weightedPenalty =
    high * 15 +
    medium * 6 +
    low * 2;

  const overall = clampScore(
    100 - weightedPenalty
  );

  const security =
    clampScore(100 - high * 25 - medium * 8);

  const quality =
    clampScore(100 - medium * 6 - low * 2);

  const dependencyIssues =
    repository.dependencies.total === 0
      ? 0
      : Math.max(
          0,
          repository.dependencies.total -
            repository.dependencies.total
        );

  const dependencyScore =
    total === 0
      ? 100
      : clampScore(
          100 -
            dependencyIssues * 10
        );

  return {
    overall,
    security,
    quality,
    dependencies: dependencyScore,
  };
}

function clampScore(value: number) {
  return Math.max(
    0,
    Math.min(100, Math.round(value))
  );
}

/* -------------------------------------------------------
   SMALL UI COMPONENTS
------------------------------------------------------- */

function ScoreCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
          {icon}
        </div>

        <span className="text-2xl font-bold text-white">
          {value}
        </span>
      </div>

      <h3 className="mt-5 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function DependencyCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function MetaBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs">
      <span className="text-slate-500">
        {label}:{" "}
      </span>

      <span className="text-slate-300">
        {value}
      </span>
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
  const percentage =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  const classes = {
    red: {
      bar: "bg-red-500",
      text: "text-red-400",
    },
    amber: {
      bar: "bg-amber-500",
      text: "text-amber-400",
    },
    blue: {
      bar: "bg-blue-500",
      text: "text-blue-400",
    },
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-300">
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${classes[tone].text}`}
        >
          {count}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${classes[tone].bar}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: Issue["severity"];
}) {
  const styles = {
    HIGH: "border-red-500/20 bg-red-500/10 text-red-400",
    MEDIUM:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
    LOW: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}

function SeverityIcon({
  severity,
}: {
  severity: Issue["severity"];
}) {
  if (severity === "HIGH") {
    return (
      <div className="shrink-0 rounded-xl bg-red-500/10 p-3">
        <ShieldAlert className="h-5 w-5 text-red-400" />
      </div>
    );
  }

  if (severity === "MEDIUM") {
    return (
      <div className="shrink-0 rounded-xl bg-amber-500/10 p-3">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
      </div>
    );
  }

  return (
    <div className="shrink-0 rounded-xl bg-blue-500/10 p-3">
      <Sparkles className="h-5 w-5 text-blue-400" />
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
        active
          ? "bg-blue-500 text-white"
          : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}