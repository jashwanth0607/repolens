"use client";

import {
  Folder,
  FileCode2,
  Package,
  Code2,
  Database,
  Settings,
  Layout,
  CheckCircle2,
} from "lucide-react";

import type { Repository } from "../lib/types";

type RepositoryArchitectureProps = {
  repository: Repository;
};

// Map file extensions to icons and categories
const FILE_CATEGORIES = {
  backend: {
    extensions: [".py", ".java", ".go", ".rs", ".php", ".rb", ".kt"],
    icon: Database,
    label: "Backend",
    color: "blue",
  },
  frontend: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss"],
    icon: Layout,
    label: "Frontend",
    color: "purple",
  },
  config: {
    extensions: [".json", ".yaml", ".yml", ".xml", ".toml", ".ini"],
    icon: Settings,
    label: "Configuration",
    color: "amber",
  },
  documentation: {
    extensions: [".md", ".txt", ".rst"],
    icon: FileCode2,
    label: "Documentation",
    color: "cyan",
  },
};

export default function RepositoryArchitecture({
  repository,
}: RepositoryArchitectureProps) {
  const architecture = repository.architecture;

  if (!architecture) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
        <p className="text-xs text-[#86868b]">
          Architecture data not available
        </p>
      </div>
    );
  }

  const fileTypesByCategory = categorizeFileTypes(
    architecture.file_types
  );

  return (
    <div className="space-y-6">
      {/* Directory Structure */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
        <h3 className="text-base font-semibold text-white">
          Directory Structure
        </h3>

        <p className="mt-1 text-xs text-[#86868b]">
          Top-level directories in the repository
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {architecture.directories.length > 0 ? (
            architecture.directories.map((dir) => (
              <div
                key={dir}
                className="flex items-center gap-2 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-3 py-1.5"
              >
                <Folder className="h-3.5 w-3.5 text-[#0A84FF]" />
                <span className="text-xs font-mono text-white">
                  {dir}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#86868b]">
              No main directories detected
            </p>
          )}
        </div>
      </div>

      {/* Root Files */}
      {architecture.main_files.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">
            Root Files
          </h3>

          <p className="mt-1 text-xs text-[#86868b]">
            Important files at the repository root
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {architecture.main_files.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 rounded-full border border-[#64D2FF]/30 bg-[#64D2FF]/10 px-3 py-1.5"
              >
                <FileCode2 className="h-3.5 w-3.5 text-[#64D2FF]" />
                <span className="text-xs font-mono text-white">
                  {file}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Type Breakdown */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
        <h3 className="text-base font-semibold text-white">
          File Types
        </h3>

        <p className="mt-1 text-xs text-[#86868b]">
          Distribution of file types by category
        </p>

        <div className="mt-6 space-y-4">
          {Object.entries(fileTypesByCategory).map(
            ([category, data]) =>
              data.count > 0 && (
                <FileTypeCategory
                  key={category}
                  category={
                    FILE_CATEGORIES[
                      category as keyof typeof FILE_CATEGORIES
                    ]
                  }
                  count={data.count}
                  percentage={data.percentage}
                  extensions={data.extensions}
                />
              )
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Directories"
          value={architecture.directories.length}
          icon={
            <Folder className="h-4 w-4 text-[#0A84FF]" />
          }
        />

        <SummaryCard
          label="Root Files"
          value={architecture.main_files.length}
          icon={
            <FileCode2 className="h-4 w-4 text-[#64D2FF]" />
          }
        />

        <SummaryCard
          label="File Types"
          value={Object.keys(
            architecture.file_types
          ).length}
          icon={
            <Code2 className="h-4 w-4 text-[#BF5AF2]" />
          }
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />

        <p className="text-xs text-emerald-300">
          Repository structure analyzed successfully.
        </p>
      </div>
    </div>
  );
}

function FileTypeCategory({
  category,
  count,
  percentage,
  extensions,
}: {
  category: (typeof FILE_CATEGORIES)[keyof typeof FILE_CATEGORIES];
  count: number;
  percentage: number;
  extensions: string[];
}) {
  const Icon = category.icon;
  const colorClasses: Record<string, string> = {
    blue: "bg-[#0A84FF]/20 border-[#0A84FF]/30",
    purple: "bg-[#BF5AF2]/20 border-[#BF5AF2]/30",
    amber: "bg-[#FF9F0A]/20 border-[#FF9F0A]/30",
    cyan: "bg-[#64D2FF]/20 border-[#64D2FF]/30",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorClasses[category.color] || ""}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              {category.label}
            </p>

            <p className="mt-0.5 text-xs text-[#86868b]">
              {extensions.join(", ")}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-white">
            {count}
          </p>

          <p className="text-xs text-[#86868b]">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12]/80 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function categorizeFileTypes(
  fileTypes: Record<string, number>
): Record<
  string,
  {
    count: number;
    percentage: number;
    extensions: string[];
  }
> {
  const total = Object.values(fileTypes).reduce(
    (sum, count) => sum + count,
    0
  );
  const result: Record<
    string,
    { count: number; percentage: number; extensions: string[] }
  > = {
    backend: { count: 0, percentage: 0, extensions: [] },
    frontend: { count: 0, percentage: 0, extensions: [] },
    config: { count: 0, percentage: 0, extensions: [] },
    documentation: {
      count: 0,
      percentage: 0,
      extensions: [],
    },
  };

  for (const [ext, count] of Object.entries(fileTypes)) {
    for (const [category, data] of Object.entries(
      FILE_CATEGORIES
    )) {
      if (
        data.extensions.includes(ext.toLowerCase())
      ) {
        result[category].count += count;
        result[category].extensions.push(ext);
        break;
      }
    }
  }

  for (const category of Object.keys(result)) {
    if (total > 0) {
      result[category].percentage =
        (result[category].count / total) * 100;
    }
  }

  return result;
}
