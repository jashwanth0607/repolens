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
      setError("Please enter a GitHub repository URL.");
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
    <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-2xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">
            Connect & Analyze Repository
          </h2>

          <p className="mt-0.5 text-xs text-[#86868b]">
            Inspect public GitHub repositories for architecture,
            code quality, and security findings.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <Activity size={13} />
          Ready to scan
        </div>
      </div>

      <div className="flex border-b border-white/[0.06] px-6">
        <button
          type="button"
          className="flex items-center gap-2 border-b-2 border-[#0A84FF] py-3.5 text-xs font-semibold text-white"
        >
          <GitBranch
            size={14}
            className="text-[#0A84FF]"
          />
          GitHub Repository
        </button>

        <button
          type="button"
          disabled
          className="ml-6 flex cursor-not-allowed items-center gap-2 py-3.5 text-xs text-[#505058]"
        >
          <Upload size={14} />
          Upload Archive
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-[#86868b]">
            Soon
          </span>
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 transition focus-within:border-[#0A84FF]/50 focus-within:bg-white/[0.04]">
          <Search
            size={16}
            className="shrink-0 text-[#86868b]"
          />

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
            className="w-full bg-transparent px-3 py-4 text-xs font-mono text-white outline-none placeholder:text-[#505058]"
          />
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-red-400"
            />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-[#86868b]">
            <CheckCircle2
              size={14}
              className="text-[#30D158]"
            />
            Public GitHub repositories supported (HTTPS)
          </div>

          <button
            onClick={analyzeRepository}
            disabled={loading}
            type="button"
            className="flex items-center justify-center gap-2 rounded-full bg-[#0A84FF] px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:bg-[#0071E3] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Activity
                  size={15}
                  className="animate-spin"
                />
                Analyzing Repository...
              </>
            ) : (
              <>
                Analyze Repository
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}