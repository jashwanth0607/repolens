"use client";

import {
  GitBranch,
  Search,
  ShieldAlert,
  Code2,
  Package,
  AlertTriangle,
  Bot,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

import type { Repository } from "../lib/types";

type ArchitectureViewProps = {
  repository: Repository;
};

export default function ArchitectureView({
  repository,
}: ArchitectureViewProps) {
  const securityIssues =
    repository.category_counts["Security"] || 0;

  const qualityIssues =
    repository.category_counts["Code Quality"] || 0;

  return (
    <div className="space-y-6">
      {/* Repository */}
      <ArchitectureNode
        icon={<GitBranch className="h-6 w-6" />}
        title={repository.full_name}
        description={
          repository.description ||
          "Analyzed GitHub repository"
        }
        meta={`${repository.language || "Unknown language"} • ${repository.default_branch}`}
        accent="blue"
      />

      <FlowArrow />

      {/* Scanner */}
      <ArchitectureNode
        icon={<Search className="h-6 w-6" />}
        title="Repository Scanner"
        description="Reads supported source files and prepares them for static analysis."
        meta={`${repository.files_scanned} files scanned`}
        accent="cyan"
      />

      <FlowArrow />

      {/* Analyzer layer */}
      <div>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Analysis Layer
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Parallel analyzers
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AnalyzerCard
            icon={<ShieldAlert className="h-6 w-6" />}
            title="Security"
            description="Security pattern detection and security scanning."
            count={securityIssues}
            accent="red"
          />

          <AnalyzerCard
            icon={<Code2 className="h-6 w-6" />}
            title="Code Quality"
            description="Complexity, maintainability, and code structure checks."
            count={qualityIssues}
            accent="purple"
          />

          <AnalyzerCard
            icon={<Package className="h-6 w-6" />}
            title="Dependencies"
            description="Dependency inventory and dependency hygiene analysis."
            count={repository.dependencies.total}
            accent="amber"
          />
        </div>
      </div>

      <FlowArrow />

      {/* Findings */}
      <ArchitectureNode
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Findings Engine"
        description="Combines analyzer results and groups detected issues by severity and category."
        meta={`${repository.issues_found} total findings`}
        accent="amber"
      />

      <FlowArrow />

      {/* AI */}
      <ArchitectureNode
        icon={<Bot className="h-6 w-6" />}
        title="RepoLens AI"
        description="Explains findings and generates suggested fixes using the configured AI service."
        meta="Explain • Fix suggestions"
        accent="purple"
      />

      {/* Summary */}
      <div className="grid gap-4 pt-2 md:grid-cols-4">
        <SummaryCard
          label="High"
          value={repository.severity_counts.HIGH}
        />

        <SummaryCard
          label="Medium"
          value={repository.severity_counts.MEDIUM}
        />

        <SummaryCard
          label="Low"
          value={repository.severity_counts.LOW}
        />

        <SummaryCard
          label="Total"
          value={repository.issues_found}
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />

        <p className="text-sm text-emerald-300">
          Repository analysis pipeline completed successfully.
        </p>
      </div>
    </div>
  );
}

function ArchitectureNode({
  icon,
  title,
  description,
  meta,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  accent: "blue" | "cyan" | "amber" | "purple";
}) {
  const accentClasses = {
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    purple:
      "border-purple-500/30 bg-purple-500/5 text-purple-400",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${accentClasses[accent]}`}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl border border-current/20 bg-slate-950/40 p-3">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </p>

          <div className="mt-3 inline-flex rounded-full border border-slate-700 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
            {meta}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzerCard({
  icon,
  title,
  description,
  count,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  accent: "red" | "purple" | "amber";
}) {
  const classes = {
    red: {
      icon: "bg-red-500/10 text-red-400",
      border: "hover:border-red-500/30",
    },
    purple: {
      icon: "bg-purple-500/10 text-purple-400",
      border: "hover:border-purple-500/30",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-400",
      border: "hover:border-amber-500/30",
    },
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition ${classes[accent].border}`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${classes[accent].icon}`}
      >
        {icon}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold text-white">
          {title}
        </h4>

        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
          {count}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center text-slate-600">
        <div className="h-6 w-px bg-slate-700" />
        <ArrowDown className="h-5 w-5" />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}