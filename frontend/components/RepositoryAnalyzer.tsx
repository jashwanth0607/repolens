"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Upload,
  Search,
} from "lucide-react";

import type { Repository } from "../lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://repolens-n8j1.onrender.com";

type Props = {
  onRepositoryAnalyzed: (repository: Repository) => void;
};

export default function RepositoryAnalyzer({
  onRepositoryAnalyzed,
}: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeRepository() {
    const value = url.trim();

    setError("");

    if (!value) {
      setError("Please enter a valid public GitHub repository URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/repositories/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze repository."
        );
      }

      onRepositoryAnalyzed(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze repository."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white font-mono">
            Connect & Analyze Repository
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            Scan public GitHub repositories for architecture, code quality, and security flaws.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
          <Activity size={13} />
          <span>Scanner Ready</span>
        </div>
      </div>

      <div className="flex border-b border-zinc-800/80 px-5">
        <button
          type="button"
          className="flex items-center gap-2 border-b-2 border-blue-500 py-3 text-xs font-semibold text-white font-mono"
        >
          <GitBranch size={14} className="text-blue-400" />
          <span>GitHub Repository</span>
        </button>

        <button
          type="button"
          disabled
          className="ml-6 flex cursor-not-allowed items-center gap-2 py-3 text-xs text-zinc-600 font-mono"
        >
          <Upload size={14} />
          <span>Archive Upload</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">
            Upcoming
          </span>
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 transition focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30">
          <Search size={16} className="shrink-0 text-zinc-500" />

          <input
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                analyzeRepository();
              }
            }}
            placeholder="https://github.com/username/repository"
            className="w-full bg-transparent px-3 py-3.5 text-xs font-mono text-white outline-none placeholder:text-zinc-600"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Supports public GitHub HTTPS repository URLs</span>
          </div>

          <button
            onClick={analyzeRepository}
            disabled={loading}
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Activity size={15} className="animate-spin text-white" />
                Analyzing Target Repository...
              </>
            ) : (
              <>
                <span>Analyze Repository</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
