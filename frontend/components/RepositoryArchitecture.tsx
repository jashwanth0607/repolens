"use client";

import {
  Folder,
  FileCode2,
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

const FILE_CATEGORIES = {
  backend: {
    extensions: [".py", ".java", ".go", ".rs", ".php", ".rb", ".kt"],
    icon: Database,
    label: "Backend Logic",
    color: "blue",
  },
  frontend: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss"],
    icon: Layout,
    label: "Frontend & UI",
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
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <p className="text-xs text-zinc-400">Architecture data not available.</p>
      </div>
    );
  }

  const fileTypesByCategory = categorizeFileTypes(architecture.file_types);

  return (
    <div className="space-y-6">
      {/* Directory Structure */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
          Top-Level Directories
        </h3>
        <p className="mt-0.5 text-xs text-zinc-400">
          Main folder structure detected in repository root
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {architecture.directories.length > 0 ? (
            architecture.directories.map((dir) => (
              <div
                key={dir}
                className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5"
              >
                <Folder className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-mono font-medium text-zinc-200">
                  {dir}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No primary subdirectories found.</p>
          )}
        </div>
      </div>

      {/* Root Files */}
      {architecture.main_files.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Root Files & Entry Points
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Manifest and configuration files at repository root
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {architecture.main_files.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5"
              >
                <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-mono font-medium text-zinc-200">
                  {file}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Type Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
          Language & File Type Distribution
        </h3>
        <p className="mt-0.5 text-xs text-zinc-400">
          Breakdown of scanned source files by extension category
        </p>

        <div className="mt-4 space-y-3">
          {Object.entries(fileTypesByCategory).map(
            ([category, data]) =>
              data.count > 0 && (
                <FileTypeCategory
                  key={category}
                  category={
                    FILE_CATEGORIES[category as keyof typeof FILE_CATEGORIES]
                  }
                  count={data.count}
                  percentage={data.percentage}
                  extensions={data.extensions}
                />
              )
          )}
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Directories"
          value={architecture.directories.length}
          icon={<Folder className="h-4 w-4 text-blue-400" />}
        />
        <SummaryCard
          label="Root Files"
          value={architecture.main_files.length}
          icon={<FileCode2 className="h-4 w-4 text-cyan-400" />}
        />
        <SummaryCard
          label="File Types"
          value={Object.keys(architecture.file_types).length}
          icon={<Code2 className="h-4 w-4 text-purple-400" />}
        />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>Repository structure indexed successfully.</span>
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
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-semibold text-white">{category.label}</p>
            <p className="text-[11px] font-mono text-zinc-400">
              {extensions.join(", ")}
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <p className="text-xs font-bold text-white">{count} files</p>
          <p className="text-[10px] text-zinc-400">{percentage.toFixed(1)}%</p>
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
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
  const total = Object.values(fileTypes).reduce((sum, count) => sum + count, 0);
  const result: Record<
    string,
    { count: number; percentage: number; extensions: string[] }
  > = {
    backend: { count: 0, percentage: 0, extensions: [] },
    frontend: { count: 0, percentage: 0, extensions: [] },
    config: { count: 0, percentage: 0, extensions: [] },
    documentation: { count: 0, percentage: 0, extensions: [] },
  };

  for (const [ext, count] of Object.entries(fileTypes)) {
    for (const [category, data] of Object.entries(FILE_CATEGORIES)) {
      if (data.extensions.includes(ext.toLowerCase())) {
        result[category].count += count;
        if (!result[category].extensions.includes(ext)) {
          result[category].extensions.push(ext);
        }
        break;
      }
    }
  }

  for (const category of Object.keys(result)) {
    if (total > 0) {
      result[category].percentage = (result[category].count / total) * 100;
    }
  }

  return result;
}
