"use client";

import { useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Upload,
} from "lucide-react";

import type { Repository } from "../lib/types";

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
      setError(
        "Please enter a GitHub repository URL."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/repositories/analyze",
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
          data.detail ||
            "Unable to analyze repository."
        );
      }

      onRepositoryAnalyzed(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to analyze repository."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#28354a] bg-[#0f1522]">

      <div className="flex flex-col justify-between gap-4 border-b border-[#202b3d] p-5 sm:flex-row sm:items-center">

        <div>
          <h2 className="text-sm font-semibold">
            Analyze a repository
          </h2>

          <p className="mt-1 text-[11px] text-[#6e7b91]">
            Connect a public GitHub repository to begin analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#8fd2af]">
          <Activity size={14} />
          Ready to scan
        </div>

      </div>

      <div className="flex border-b border-[#202b3d] px-5">

        <button className="flex items-center gap-2 border-b-2 border-[#7265f7] py-3 text-[11px] text-white">
          <GitBranch size={15} />
          GitHub Repository
        </button>

        <button
          disabled
          className="ml-6 flex cursor-not-allowed items-center gap-2 py-3 text-[11px] text-[#4f5d71]"
        >
          <Upload size={15} />

          Upload ZIP

          <span className="rounded bg-[#172033] px-1.5 py-0.5 text-[8px]">
            Soon
          </span>
        </button>

      </div>

      <div className="p-5">

        <div className="flex items-center rounded-lg border border-[#28354a] bg-[#0a101b] px-3 focus-within:border-[#7265f7]">

          <GitBranch
            size={18}
            className="shrink-0 text-[#748198]"
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
            className="w-full bg-transparent px-3 py-4 text-xs text-white outline-none placeholder:text-[#4f5d71]"
          />

        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[10px] leading-5 text-red-300">

            <AlertTriangle
              size={14}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>
        )}

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 text-[10px] text-[#6e7b91]">

            <CheckCircle2
              size={15}
              className="text-[#39d98a]"
            />

            Public repositories supported

          </div>

          <button
            onClick={analyzeRepository}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#7265f7] px-5 py-3 text-[11px] font-semibold text-white shadow-lg shadow-[#7265f7]/20 transition hover:bg-[#8175ff] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Activity
                  size={16}
                  className="animate-spin"
                />

                Analyzing...
              </>
            ) : (
              <>
                Analyze Repository
                <ArrowRight size={16} />
              </>
            )}

          </button>

        </div>

      </div>

    </section>
  );
}