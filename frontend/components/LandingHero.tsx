"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  GitBranch,
  ShieldAlert,
  Bot,
  ArrowRight,
  Bug,
  Code2,
  Package,
  BrainCircuit,
  Search,
} from "lucide-react";
import RepositoryAnalyzer from "../components/RepositoryAnalyzer";
import type { Repository } from "../lib/types";

export default function LandingHero({
  onRepositoryAnalyzed,
  onNavigate,
}: {
  onRepositoryAnalyzed: (repository: Repository) => void;
  onNavigate: (page: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pops, setPops] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const colors = ["#0A84FF", "#30D158", "#64D2FF", "#BF5AF2", "#FF9F0A", "#142233", "#1e3048"];
    let bubbles: Array<{
      x: number;
      y: number;
      r: number;
      color: string;
      vx: number;
      vy: number;
      phase: number;
      speed: number;
      scale: number;
    }> = [];

    const count = Math.min(100, Math.floor((width * height) / 10000));
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 10 + Math.random() * 26,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        scale: 1,
      });
    }

    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    };

    const onLeave = () => {
      mouseActive = false;
    };

    const onClick = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dist = Math.hypot(b.x - cx, b.y - cy);
        if (dist < b.r * b.scale + 8) {
          setPops((p) => p + 1);
          b.scale = 0;
          setTimeout(() => {
            b.x = Math.random() * width;
            b.y = height + 40;
            b.scale = 1;
          }, 350);
          break;
        }
      }
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointerdown", onClick);

    let lastTime = performance.now();
    const render = (now: number) => {
      const ts = now / 1000;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const b of bubbles) {
        b.x += b.vx + Math.sin(ts * b.speed + b.phase) * 0.3;
        b.y += b.vy + Math.cos(ts * b.speed * 0.8 + b.phase) * 0.3;

        if (mouseActive) {
          const dist = Math.hypot(b.x - mouseX, b.y - mouseY);
          if (dist < 130) {
            const force = (1 - dist / 130) * 3.5;
            b.x += ((b.x - mouseX) / (dist || 1)) * force;
            b.y += ((b.y - mouseY) / (dist || 1)) * force;
          }
        }

        if (b.x < -40) b.x = width + 40;
        if (b.x > width + 40) b.x = -40;
        if (b.y < -40) b.y = height + 40;
        if (b.y > height + 40) b.y = -40;

        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * b.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Astro Bubble Hero */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0e131f] via-[#0c0d12] to-black p-12 text-center backdrop-blur-3xl sm:p-20"
      >
        <div className="absolute inset-0 z-0 cursor-crosshair opacity-80" aria-hidden="true">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-4 py-1.5 text-xs font-semibold text-[#64D2FF]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]" />
            </span>
            RepoLens Intelligence &bull; Interactive Bubble Hero
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            See what your repository <br />
            <span className="bg-gradient-to-r from-[#0A84FF] via-[#64D2FF] to-[#BF5AF2] bg-clip-text text-transparent">
              is telling you.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#9ba7a4] sm:text-base">
            Inspect public GitHub repositories for security vulnerabilities, code complexity, dependency hygiene, and evidence-backed bug diagnostics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#scanner"
              className="inline-flex items-center gap-2 rounded-full bg-[#0A84FF] px-7 py-3 text-xs font-semibold text-white shadow-xl shadow-[#0A84FF]/25 transition hover:bg-[#0071E3] active:scale-[0.98]"
            >
              <GitBranch className="h-4 w-4" />
              Analyze Repository
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => onNavigate("Bug Diagnosis")}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-semibold text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
            >
              <Bug className="h-4 w-4 text-[#0A84FF]" />
              Launch Bug Diagnosis
            </button>
          </div>

          <div className="pt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-[#9ba7a4]">
              🫧 Interactive Bubbles: Click anywhere on the hero to pop &bull; <b>{pops} popped</b>
            </span>
          </div>
        </div>
      </div>

      {/* Actual Scanner Section */}
      <div id="scanner">
        <RepositoryAnalyzer onRepositoryAnalyzed={onRepositoryAnalyzed} />
      </div>

      {/* Feature Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl transition hover:border-white/[0.16]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
            <Bug className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-base font-semibold text-white">
            Evidence-Backed Diagnosis
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
            Combines repository code, bug reports, and test assertions to determine root causes, trace steps, and verified patches.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl transition hover:border-white/[0.16]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#30D158]/10 text-[#30D158]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-base font-semibold text-white">
            Security & Hygiene
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
            Identifies leaked tokens, injection vectors, and dependency vulnerabilities across your codebase.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl transition hover:border-white/[0.16]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BF5AF2]/10 text-[#BF5AF2]">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-base font-semibold text-white">
            Groq Intelligence
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
            Ask questions, understand complex architectural tradeoffs, and generate immediate safe code fixes.
          </p>
        </div>
      </div>
    </div>
  );
}
