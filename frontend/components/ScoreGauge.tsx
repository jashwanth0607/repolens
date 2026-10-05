"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

import type {
  CategoryScore,
  OverallScore,
  RepositoryScores,
  ScoreStatus,
} from "../lib/types";
import { CheckCircle2, AlertCircle, Info, ShieldCheck, Award } from "lucide-react";

type ScoreGaugeProps = {
  score: CategoryScore | OverallScore;
  title: string;
  size?: "small" | "large";
};

// Color mapping for score ranges & status
const COLORS = {
  poor: "#EF4444", // Red - 0-39
  needsImprovement: "#F59E0B", // Amber - 40-59
  good: "#3B82F6", // Blue - 60-79
  excellent: "#10B981", // Green - 80-100
};

function getStatusColor(status: ScoreStatus): string {
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

function getGradeLetter(score: number): { letter: string; color: string; label: string } {
  if (score >= 90) return { letter: "A+", color: "#10B981", label: "Superior" };
  if (score >= 80) return { letter: "A", color: "#10B981", label: "Excellent" };
  if (score >= 70) return { letter: "B", color: "#3B82F6", label: "Good" };
  if (score >= 60) return { letter: "C", color: "#F59E0B", label: "Fair" };
  if (score >= 40) return { letter: "D", color: "#F97316", label: "Needs Work" };
  return { letter: "F", color: "#EF4444", label: "Critical" };
}

function getScoreValue(score: CategoryScore | OverallScore): number {
  return "score" in score ? score.score : 0;
}

function getScoreStatus(score: CategoryScore | OverallScore): ScoreStatus {
  return "status" in score ? score.status : "Good";
}

/* -------------------------------------------------------
   RADIAL SCORE GAUGE COMPONENT
------------------------------------------------------- */

export default function ScoreGauge({
  score,
  title,
  size = "small",
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const numericScore = getScoreValue(score);
  const status = getScoreStatus(score);
  const statusColor = getStatusColor(status);
  const grade = getGradeLetter(numericScore);

  const displayScore = numericScore === 0 ? 0 : Math.max(1, numericScore);

  useEffect(() => {
    const duration = 900;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = displayScore;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);

      setAnimatedScore(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [displayScore]);

  const filledSegments = animatedScore;
  const emptySegments = 100 - filledSegments;

  const data = [
    { name: "filled", value: filledSegments },
    { name: "empty", value: emptySegments },
  ];

  const dimensions = {
    small: {
      width: 140,
      height: 95,
      innerRadius: 48,
      outerRadius: 65,
      fontSize: "1.35rem",
      titleSize: "text-xs",
    },
    large: {
      width: 240,
      height: 150,
      innerRadius: 82,
      outerRadius: 110,
      fontSize: "2.75rem",
      titleSize: "text-base",
    },
  };

  const dim = dimensions[size];

  const getGradientStops = () => {
    if (numericScore < 40) return { start: "#EF4444", end: "#DC2626" };
    if (numericScore < 60) return { start: "#F59E0B", end: "#D97706" };
    if (numericScore < 80) return { start: "#3B82F6", end: "#2563EB" };
    return { start: "#10B981", end: "#059669" };
  };

  const gradient = getGradientStops();
  const gradientId = `gauge-gradient-${title.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="flex flex-col items-center" style={{ width: dim.width }}>
      <div className="relative" style={{ height: dim.height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            {/* Track background */}
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
                fill="rgba(255, 255, 255, 0.05)"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
              />
            </Pie>

            {/* Value Arc */}
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
              <Cell fill={`url(#${gradientId})`} stroke="transparent" />
            </Pie>

            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            </defs>
          </PieChart>
        </ResponsiveContainer>

        {/* Numeric Center Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-mono font-bold tracking-tight text-white"
              style={{ fontSize: dim.fontSize, lineHeight: 1 }}
            >
              {numericScore}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">/100</span>
          </div>
          {size === "large" && (
            <span
              className="mt-1 rounded px-2 py-0.5 text-[11px] font-mono font-bold"
              style={{ backgroundColor: `${grade.color}20`, color: grade.color }}
            >
              GRADE {grade.letter} • {grade.label.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <p className={`mt-2 font-medium text-zinc-200 tracking-tight ${dim.titleSize}`}>
        {title}
      </p>

      {/* Status Badge */}
      <div
        className="mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border"
        style={{
          backgroundColor: `${statusColor}15`,
          borderColor: `${statusColor}30`,
          color: statusColor,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
        {status}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   RADAR / SPIDER CHART FOR MULTI-AXIS SCORE ANALYSIS
------------------------------------------------------- */

export function ScoreRadarChart({ scores }: { scores: RepositoryScores }) {
  const radarData = [
    {
      category: "Code Quality",
      score: scores.code_quality.score,
      fullMark: 100,
    },
    {
      category: "Security",
      score: scores.security.score,
      fullMark: 100,
    },
    {
      category: "Health",
      score: scores.repository_health.score,
      fullMark: 100,
    },
    {
      category: "Docs",
      score: scores.documentation.score,
      fullMark: 100,
    },
    {
      category: "Maintainability",
      score: scores.maintainability.score,
      fullMark: 100,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-[260px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#a1a1aa", fontSize: 11, fontFamily: "monospace" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#71717a", fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-2.5 text-xs text-white shadow-xl backdrop-blur-md">
                    <p className="font-semibold text-zinc-300">{data.category}</p>
                    <p className="font-mono text-blue-400 font-bold mt-0.5">
                      {data.score} / 100
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------
   SCORE BREAKDOWN BAR (WEIGHT CONTRIBUTIONS)
------------------------------------------------------- */

export function ScoreBreakdownBar({ breakdown }: { breakdown: OverallScore["breakdown"] }) {
  const items = [
    { key: "code_quality", label: "Code Quality", color: "#3B82F6", data: breakdown.code_quality },
    { key: "security", label: "Security", color: "#EF4444", data: breakdown.security },
    { key: "repository_health", label: "Health", color: "#10B981", data: breakdown.repository_health },
    { key: "documentation", label: "Docs", color: "#06B6D4", data: breakdown.documentation },
    { key: "maintainability", label: "Maintainability", color: "#8B5CF6", data: breakdown.maintainability },
  ];

  const totalPoints = items.reduce((acc, item) => acc + item.data.contribution, 0);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-400">Score Weight Breakdown</span>
        <span className="font-mono text-zinc-200">{totalPoints.toFixed(1)} / 100 pts total</span>
      </div>

      {/* Visual Stacked Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 gap-0.5">
        {items.map((item) => (
          <div
            key={item.key}
            className="h-full rounded-sm transition-all hover:opacity-90 relative group"
            style={{
              width: `${(item.data.contribution / 100) * 100}%`,
              backgroundColor: item.color,
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-20 whitespace-nowrap rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-[10px] text-white font-mono shadow-lg">
              {item.label}: {item.data.contribution} pts (weight {(item.data.weight * 100).toFixed(0)}%)
            </div>
          </div>
        ))}
      </div>

      {/* Legend & Individual Contrib Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2 text-left"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-medium text-zinc-300 truncate">
                {item.label}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between font-mono text-xs">
              <span className="text-zinc-400 text-[10px]">Weight: {(item.data.weight * 100).toFixed(0)}%</span>
              <span className="font-semibold text-white">{item.data.contribution} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   SCORE EXPLANATION COMPONENT
------------------------------------------------------- */

type ScoreExplanationProps = {
  score: CategoryScore | OverallScore;
  showTitle?: boolean;
};

export function ScoreExplanation({
  score,
  showTitle = false,
}: ScoreExplanationProps) {
  const scoreWithFactors = score as CategoryScore;

  const hasPositives =
    scoreWithFactors.positive_factors && scoreWithFactors.positive_factors.length > 0;
  const hasNegatives =
    scoreWithFactors.negative_factors && scoreWithFactors.negative_factors.length > 0;

  if (!hasPositives && !hasNegatives) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3.5">
      {showTitle && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Key Audit Observations
        </p>
      )}

      {/* Positive factors */}
      {hasPositives && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Strengths
          </p>
          <ul className="space-y-1">
            {scoreWithFactors.positive_factors.map((factor, index) => (
              <li
                key={index}
                className="flex items-start gap-1.5 text-xs text-zinc-300 leading-snug"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Negative factors */}
      {hasNegatives && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Risk Factors
          </p>
          <ul className="space-y-1">
            {scoreWithFactors.negative_factors.map((factor, index) => (
              <li
                key={index}
                className="flex items-start gap-1.5 text-xs text-zinc-300 leading-snug"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   METHODOLOGY FOOTER
------------------------------------------------------- */

export function ScoreMethodology({ methodology }: { methodology: string }) {
  return (
    <div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldCheck className="h-4 w-4 text-blue-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Scoring Methodology & Evaluation Rules
        </h4>
      </div>
      <p className="text-xs leading-relaxed text-zinc-400 font-sans">
        {methodology}
      </p>
    </div>
  );
}
