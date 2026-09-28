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
        icon={<GitBranch className="h-5 w-5" />}
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
        icon={<Search className="h-5 w-5" />}
        title="Repository Scanner"
        description="Reads supported source files and prepares them for static analysis."
        meta={`${repository.files_scanned} files scanned`}
        accent="cyan"
      />

      <FlowArrow />

      {/* Analyzer layer */}
      <div>
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
            Analysis Pipeline
          </p>

          <h3 className="mt-0.5 text-base font-semibold text-white">
            Parallel Static Analyzers
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AnalyzerCard
            icon={<ShieldAlert className="h-5 w-5" />}
            title="Security"
            description="Security pattern detection, secret scanning, and AST inspection."
            count={securityIssues}
            accent="red"
          />

          <AnalyzerCard
            icon={<Code2 className="h-5 w-5" />}
            title="Code Quality"
            description="Complexity, maintainability, and code structure checks."
            count={qualityIssues}
            accent="purple"
          />

          <AnalyzerCard
            icon={<Package className="h-5 w-5" />}
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
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Findings Engine"
        description="Combines analyzer results and groups detected issues by severity and category."
        meta={`${repository.issues_found} total findings`}
        accent="amber"
      />

      <FlowArrow />

      {/* AI */}
      <ArchitectureNode
        icon={<Bot className="h-5 w-5" />}
        title="RepoLens Intelligence"
        description="Explains findings and generates verified patches using Groq models and heuristic diagnostic correlation."
        meta="Explain • Verified patches • Diagnostic correlation"
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
          label="Total Findings"
          value={repository.issues_found}
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />

        <p className="text-xs text-emerald-300">
          Repository analysis pipeline completed successfully. Ready for bug diagnosis and export.
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
    blue: "border-[#0A84FF]/30 bg-[#0A84FF]/5 text-[#0A84FF]",
    cyan: "border-[#64D2FF]/30 bg-[#64D2FF]/5 text-[#64D2FF]",
    amber: "border-[#FF9F0A]/30 bg-[#FF9F0A]/5 text-[#FF9F0A]",
    purple: "border-[#BF5AF2]/30 bg-[#BF5AF2]/5 text-[#BF5AF2]",
  };

  return (
    <div
      className={`rounded-3xl border p-6 backdrop-blur-xl ${accentClasses[accent]}`}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-current/20 bg-black/40 p-3">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
            {description}
          </p>

          <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-mono text-white">
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
      icon: "bg-[#FF453A]/10 text-[#FF453A]",
      border: "hover:border-[#FF453A]/30",
    },
    purple: {
      icon: "bg-[#BF5AF2]/10 text-[#BF5AF2]",
      border: "hover:border-[#BF5AF2]/30",
    },
    amber: {
      icon: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
      border: "hover:border-[#FF9F0A]/30",
    },
  };

  return (
    <div
      className={`rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl transition ${classes[accent].border}`}
    >
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${classes[accent].icon}`}
      >
        {icon}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-white">
          {title}
        </h4>

        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs font-mono text-white">
          {count}
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
        {description}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center text-[#505058]">
        <div className="h-5 w-px bg-white/10" />
        <ArrowDown className="h-4 w-4 text-[#86868b]" />
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
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}