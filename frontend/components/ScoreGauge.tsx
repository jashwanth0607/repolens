"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import type {
  CategoryScore,
  ScoreStatus,
} from "../lib/types";

type ScoreGaugeProps = {
  score: CategoryScore | OverallScoreType;
  title: string;
  size?: "small" | "large";
};

type OverallScoreType = {
  score: number;
  status: ScoreStatus;
};

// Color mapping for score ranges
const COLORS = {
  poor: "#EF4444", // Red - 0-39
  needsImprovement: "#F59E0B", // Amber - 40-59
  good: "#3B82F6", // Blue - 60-79
  excellent: "#10B981", // Green - 80-100
};

function getStatusColor(
  status: ScoreStatus
): string {
  switch (status) {
    case "Excellent":
      return COLORS.excellent;
    case "Good":
      return COLORS.good;
    case "Needs Improvement":
      return COLORS.needsImprovement;
    case "Poor":
      return COLORS.poor;
    default:
      return COLORS.good;
  }
}

function getStatusLabel(status: ScoreStatus): string {
  return status;
}

// Get the numeric score from either type
function getScoreValue(
  score: CategoryScore | OverallScoreType
): number {
  return "score" in score ? score.score : 0;
}

// Get the status from either type
function getScoreStatus(
  score: CategoryScore | OverallScoreType
): ScoreStatus {
  return "status" in score ? score.status : "Good";
}

export default function ScoreGauge({
  score,
  title,
  size = "small",
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] =
    useState(0);

  const numericScore = getScoreValue(score);
  const status = getScoreStatus(score);
  const statusColor = getStatusColor(status);

  // Ensure minimum 1 for visual (unless score is actually 0, show 0)
  const displayScore =
    numericScore === 0 ? 0 : Math.max(1, numericScore);

  // Animate the score on mount
  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = displayScore;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(
        startValue + (endValue - startValue) * easeProgress
      );

      setAnimatedScore(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [displayScore]);

  // Create gauge segments
  const totalSegments = 100;
  const filledSegments = animatedScore;
  const emptySegments = totalSegments - filledSegments;

  const data = [
    {
      name: "filled",
      value: filledSegments,
    },
    {
      name: "empty",
      value: emptySegments,
    },
  ];

  // Dimensions based on size
  const dimensions = {
    small: {
      width: 140,
      height: 90,
      innerRadius: 50,
      outerRadius: 70,
      fontSize: "1.5rem",
      labelSize: "0.65rem",
    },
    large: {
      width: 220,
      height: 140,
      innerRadius: 80,
      outerRadius: 110,
      fontSize: "2.5rem",
      labelSize: "0.75rem",
    },
  };

  const dim = dimensions[size];

  // Get gradient stops based on score
  const getGradientStops = () => {
    if (status === "Poor") {
      return { start: "#EF4444", end: "#B91C1C" };
    }
    if (status === "Needs Improvement") {
      return { start: "#F59E0B", end: "#D97706" };
    }
    if (status === "Good") {
      return { start: "#3B82F6", end: "#1D4ED8" };
    }
    return { start: "#10B981", end: "#059669" };
  };

  const gradient = getGradientStops();

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: dim.width }}
    >
      {/* Gauge */}
      <div
        className="relative"
        style={{ height: dim.height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Background arc (empty segments) */}
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={dim.innerRadius}
              outerRadius={dim.outerRadius}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell
                fill="rgba(255, 255, 255, 0.08)"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
              />
            </Pie>

            {/* Filled arc */}
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={180 - animatedScore * 1.8}
              innerRadius={dim.innerRadius}
              outerRadius={dim.outerRadius}
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={false}
            >
              <Cell
                fill={`url(#gradient-${title.replace(/\s/g, "")})`}
                stroke="transparent"
              />
            </Pie>

            {/* Gradient definition */}
            <defs>
              <linearGradient
                id={`gradient-${title.replace(/\s/g, "")}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            </defs>
          </PieChart>
        </ResponsiveContainer>

        {/* Center text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className="font-bold text-white"
            style={{ fontSize: dim.fontSize, lineHeight: 1 }}
          >
            {numericScore}
          </span>
          <span
            className="text-white/50"
            style={{ fontSize: "0.7rem" }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Title */}
      <p
        className="mt-2 font-semibold text-white"
        style={{ fontSize: dim.labelSize }}
      >
        {title}
      </p>

      {/* Status badge */}
      <span
        className="mt-1 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: `${statusColor}20`,
          color: statusColor,
        }}
      >
        {getStatusLabel(status)}
      </span>
    </div>
  );
}

/* -------------------------------------------------------
   SCORE EXPLANATION COMPONENT
------------------------------------------------------- */

type ScoreExplanationProps = {
  score: CategoryScore | OverallScoreType;
  showTitle?: boolean;
};

export function ScoreExplanation({
  score,
  showTitle = false,
}: ScoreExplanationProps) {
  const status = getScoreStatus(score);

  // For overall score, we need to extract breakdown info
  const hasBreakdown = "breakdown" in score;

  // Type guard for better TypeScript support
  const scoreWithBreakdown = (
    hasBreakdown ? score : null
  ) as (OverallScoreType & { breakdown: Record<string, { score: number; weight: number; contribution: number }> }) | null;

  const scoreWithFactors = score as CategoryScore | (OverallScoreType & { positive_factors?: string[]; negative_factors?: string[] });

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      {showTitle && (
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70"
        >
          Score Details
        </p>
      )}

      {/* Positive factors */}
      {scoreWithFactors.positive_factors &&
        scoreWithFactors.positive_factors.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/80">
              Positive
            </p>
            <ul className="space-y-0.5">
              {scoreWithFactors.positive_factors.map(
                (factor, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-1.5 text-xs text-slate-300"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    <span>{factor}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

      {/* Negative factors */}
      {scoreWithFactors.negative_factors &&
        scoreWithFactors.negative_factors.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400/80">
              Issues
            </p>
            <ul className="space-y-0.5">
              {scoreWithFactors.negative_factors.map(
                (factor, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-1.5 text-xs text-slate-300"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    <span>{factor}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

      {/* Breakdown for overall score */}
      {scoreWithBreakdown && (
        <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
            Score Breakdown
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(scoreWithBreakdown.breakdown).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="capitalize text-slate-400">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-slate-300">
                    {value.contribution} pts
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   METHODOLOGY FOOTER
------------------------------------------------------- */

export function ScoreMethodology({
  methodology,
}: {
  methodology: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/50">
        Scoring Methodology
      </p>
      <p className="text-xs leading-relaxed text-slate-400">
        {methodology}
      </p>
    </div>
  );
}