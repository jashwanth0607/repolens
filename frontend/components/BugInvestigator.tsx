"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileCode,
  FlaskConical,
  GitCommit,
  Layers,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

import type {
  DiagnosisResult,
  InvestigationScenario,
  Repository,
} from "../lib/types";

type Props = {
  activeRepository?: Repository | null;
};

const DEFAULT_SCENARIOS: InvestigationScenario[] = [
  {
    id: "scenario-react-hydrate-null",
    title: "TypeError: Cannot read properties of undefined in UserProfile",
    category: "Frontend / React",
    repo_name: "repolens-app",
    bug_report: {
      title: "UserProfile crashes with TypeError when user settings are null",
      description: "When a user logs in without completed preferences, the component throws when rendering user.settings.notifications.enabled.",
      error_message: "TypeError: Cannot read properties of undefined (reading 'notifications')",
      stack_trace: "TypeError: Cannot read properties of undefined (reading 'notifications')\n    at UserProfile (frontend/components/UserProfile.tsx:42:28)\n    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486)",
      environment: "Next.js 15, React 19, TypeScript 5.4, Chrome 128",
    },
    test_context: {
      test_name: "test_renders_user_with_empty_preferences",
      test_code: "it('renders user profile without throwing when settings is null', () => {\n  const user = { id: 'usr_1', name: 'Alex Doe', settings: null };\n  expect(() => render(<UserProfile user={user} />)).not.toThrow();\n});",
      failing_assertion: "expect(() => render(<UserProfile user={user} />)).not.toThrow()",
      test_output: "FAIL: TypeError: Cannot read properties of undefined (reading 'notifications')\n  42 |  <span>{user.settings.notifications.enabled ? 'Active' : 'Muted'}</span>",
      framework: "Jest / React Testing Library",
    },
    repository_files: {
      "frontend/components/UserProfile.tsx": "export function UserProfile({ user }: { user: any }) {\n  return (\n    <div className=\"profile-card\">\n      <h3>{user.name}</h3>\n      <span>{user.settings.notifications.enabled ? 'Active' : 'Muted'}</span>\n    </div>\n  );\n}",
    },
  },
  {
    id: "scenario-python-off-by-one",
    title: "IndexError: list index out of range in RepositoryScanner",
    category: "Backend / Python",
    repo_name: "repolens-backend",
    bug_report: {
      title: "Repository file scanner crashes when batch size matches total file count",
      description: "When chunking repository files for batch analysis, an off-by-one loop boundary condition raises an IndexError on the final batch slice.",
      error_message: "IndexError: list index out of range",
      stack_trace: "Traceback (most recent call last):\n  File \"tests/test_scanner.py\", line 28, in test_chunk_files_boundary\n  File \"backend/services/repository_scanner.py\", line 114, in chunk_files\n    batch.append(files[index + offset])\nIndexError: list index out of range",
      environment: "Python 3.12, FastAPI 0.110, Linux x86_64",
    },
    test_context: {
      test_name: "test_chunk_files_boundary_exact_multiple",
      test_code: "def test_chunk_files_boundary_exact_multiple():\n    scanner = RepositoryScanner()\n    sample_files = [f'file_{i}.py' for i in range(20)]\n    batches = scanner.chunk_files(sample_files, batch_size=10)\n    assert len(batches) == 2\n    assert sum(len(b) for b in batches) == 20",
      failing_assertion: "batches = scanner.chunk_files(sample_files, batch_size=10)",
      test_output: "FAILED tests/test_scanner.py::test_chunk_files_boundary_exact_multiple - IndexError: list index out of range",
      framework: "pytest",
    },
    repository_files: {
      "backend/services/repository_scanner.py": "class RepositoryScanner:\n    def chunk_files(self, files: list, batch_size: int = 10) -> list:\n        chunks = []\n        for i in range(0, len(files), batch_size):\n            batch = []\n            for offset in range(0, batch_size + 1):\n                if i + offset < len(files):\n                    batch.append(files[i + offset])\n            chunks.append(batch)\n        return chunks",
    },
  },
  {
    id: "scenario-async-race-condition",
    title: "Race Condition: Concurrent requests trigger duplicate Git clones",
    category: "Async / Backend",
    repo_name: "repolens-backend",
    bug_report: {
      title: "Concurrent scan requests trigger duplicate Git clone operations",
      description: "Rapid successive clicks on 'Analyze' dispatch parallel requests before the analysis state lock is acquired, corrupting the temporary working directory.",
      error_message: "GitError: destination path already exists and is not an empty directory",
      stack_trace: "git.exc.GitCommandError: Cmd('git') failed due to: exit code(128)\n  stderr: 'fatal: destination path already exists'\n  File \"backend/services/repository_scanner.py\", line 45, in clone_repository",
      environment: "Python 3.12, Uvicorn, Git 2.44",
    },
    test_context: {
      test_name: "test_concurrent_clone_deduplication",
      test_code: "@pytest.mark.asyncio\nasync def test_concurrent_clone_deduplication():\n    scanner = RepositoryScanner()\n    results = await asyncio.gather(\n        scanner.safe_clone('https://github.com/org/repo'),\n        scanner.safe_clone('https://github.com/org/repo')\n    )\n    assert results[0] == results[1]\n    assert scanner.clone_count == 1",
      failing_assertion: "assert scanner.clone_count == 1",
      test_output: "FAILED tests/test_concurrency.py::test_concurrent_clone_deduplication - AssertionError: assert 2 == 1",
      framework: "pytest-asyncio",
    },
    repository_files: {
      "backend/services/repository_scanner.py": "import asyncio\n\nclass RepositoryScanner:\n    def __init__(self):\n        self.clone_count = 0\n\n    async def safe_clone(self, repo_url: str):\n        self.clone_count += 1\n        await asyncio.sleep(0.05)\n        return f\"/tmp/cloned/{hash(repo_url)}\"",
    },
  },
];

export default function BugInvestigator({ activeRepository }: Props) {
  const [scenarios, setScenarios] = useState<InvestigationScenario[]>(DEFAULT_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEFAULT_SCENARIOS[0].id);

  // Investigation input states initialized with scenario 0
  const [repoName, setRepoName] = useState(activeRepository?.full_name || DEFAULT_SCENARIOS[0].repo_name);
  const [filePath, setFilePath] = useState(Object.keys(DEFAULT_SCENARIOS[0].repository_files || {})[0] || "UserProfile.tsx");
  const [fileContent, setFileContent] = useState(Object.values(DEFAULT_SCENARIOS[0].repository_files || {})[0] || "");

  const [bugTitle, setBugTitle] = useState(DEFAULT_SCENARIOS[0].bug_report.title);
  const [bugDescription, setBugDescription] = useState(DEFAULT_SCENARIOS[0].bug_report.description);
  const [errorMessage, setErrorMessage] = useState(DEFAULT_SCENARIOS[0].bug_report.error_message);
  const [stackTrace, setStackTrace] = useState(DEFAULT_SCENARIOS[0].bug_report.stack_trace);
  const [environment, setEnvironment] = useState(DEFAULT_SCENARIOS[0].bug_report.environment);

  const [testName, setTestName] = useState(DEFAULT_SCENARIOS[0].test_context.test_name);
  const [framework, setFramework] = useState(DEFAULT_SCENARIOS[0].test_context.framework);
  const [failingAssertion, setFailingAssertion] = useState(DEFAULT_SCENARIOS[0].test_context.failing_assertion);
  const [testCode, setTestCode] = useState(DEFAULT_SCENARIOS[0].test_context.test_code);
  const [testOutput, setTestOutput] = useState(DEFAULT_SCENARIOS[0].test_context.test_output);

  // Execution & results state
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"root_cause" | "culprit" | "trace" | "patch" | "regression">("root_cause");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch updated scenarios from backend if available
  useEffect(() => {
    let ignore = false;
    async function loadScenarios() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/investigate/scenarios");
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.scenarios && data.scenarios.length > 0) {
            setScenarios(data.scenarios);
          }
        }
      } catch {
        // Fallback default scenarios already loaded
      }
    }

    loadScenarios();
    return () => {
      ignore = true;
    };
  }, []);

  function applyScenario(scenario: InvestigationScenario) {
    setSelectedScenarioId(scenario.id);
    setRepoName(activeRepository?.full_name || scenario.repo_name);
    setBugTitle(scenario.bug_report.title);
    setBugDescription(scenario.bug_report.description);
    setErrorMessage(scenario.bug_report.error_message);
    setStackTrace(scenario.bug_report.stack_trace);
    setEnvironment(scenario.bug_report.environment);

    setTestName(scenario.test_context.test_name);
    setFramework(scenario.test_context.framework);
    setFailingAssertion(scenario.test_context.failing_assertion);
    setTestCode(scenario.test_context.test_code);
    setTestOutput(scenario.test_context.test_output);

    if (scenario.repository_files) {
      const firstPath = Object.keys(scenario.repository_files)[0];
      setFilePath(firstPath || "main.ts");
      setFileContent(scenario.repository_files[firstPath] || "");
    }
    setError(null);
  }

  async function handleInvestigate() {
    setIsInvestigating(true);
    setError(null);

    const payload = {
      repository_url: activeRepository?.html_url || undefined,
      repo_name: repoName,
      repository_files: {
        [filePath]: fileContent,
      },
      bug_report: {
        title: bugTitle,
        description: bugDescription,
        error_message: errorMessage,
        stack_trace: stackTrace,
        environment: environment,
      },
      test_context: {
        test_name: testName,
        test_code: testCode,
        failing_assertion: failingAssertion,
        test_output: testOutput,
        framework: framework,
      },
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/investigate/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Diagnosis failed");
      }

      setDiagnosis(data.diagnosis);
      setActiveTab("root_cause");

      setTimeout(() => {
        document.getElementById("diagnosis-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to complete diagnosis.";
      setError(message);
    } finally {
      setIsInvestigating(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function downloadReport() {
    if (!diagnosis) return;
    const reportText = `# RepoLens Evidence-Backed Bug Diagnosis Report
**Investigation ID:** ${diagnosis.investigation_id}
**Target:** ${repoName}
**Confidence:** ${diagnosis.confidence_score}% (${diagnosis.confidence_level})

---

## Executive Summary
${diagnosis.summary}

## Root Cause Analysis
${diagnosis.root_cause}

## Confidence Rationale
${diagnosis.confidence_rationale}

## Culprit Files & Code Evidence
${diagnosis.culprit_files
  .map(
    (f) => `
### \`${f.file_path}\` (Lines ${f.line_start}-${f.line_end})
**Faulty Logic:**
\`\`\`
${f.culprit_code}
\`\`\`
**Explanation:** ${f.explanation}
`
  )
  .join("\n")}

## Test Failure Correlation
- **Failing Test:** \`${diagnosis.test_correlation.test_name}\`
- **Assertion:** \`${diagnosis.test_correlation.assertion_failed}\`
- **Expected:** ${diagnosis.test_correlation.expected_behavior}
- **Actual:** ${diagnosis.test_correlation.actual_behavior}
- **Mechanism:** ${diagnosis.test_correlation.explanation}

## Execution Trace
${diagnosis.execution_trace
  .map((s) => `${s.step_number}. **[${s.phase}]** \`${s.location}\` — ${s.description}`)
  .join("\n")}

## Recommended Patch
\`\`\`diff
${diagnosis.patch.diff}
\`\`\`
**Patch Explanation:** ${diagnosis.patch.explanation}

## Regression Test
\`\`\`
${diagnosis.regression_test}
\`\`\`

## Prevention Guidelines
${diagnosis.prevention_guidelines.map((g) => `- ${g}`).join("\n")}

## Impact Assessment
${diagnosis.impact_assessment}
`;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnosis-${diagnosis.investigation_id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Apple-styled Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-3 py-1 text-xs font-medium text-[#0A84FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
              BugLens Diagnostic Engine
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              Evidence-Backed Bug Diagnosis
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#86868b]">
              Given a repository, bug report, and available tests, investigate the likely cause,
              correlate stack trace frames, and generate verified patches with mathematical confidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (scenarios.length > 0) {
                  applyScenario(scenarios[0]);
                }
              }}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-[#f5f5f7] transition hover:bg-white/[0.08] active:scale-[0.98]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#86868b]" />
              Reset Inputs
            </button>
            <button
              onClick={handleInvestigate}
              disabled={isInvestigating}
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#0A84FF] px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition hover:bg-[#0071E3] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInvestigating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Investigating Cause...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Diagnose Likely Cause
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Scenario Preset Switcher */}
        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#86868b]">
              Select Sample Bug Scenario
            </span>
            <span className="text-xs text-[#86868b]">
              One-click reproducible cases with verified tests
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {scenarios.map((sc) => {
              const isActive = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => applyScenario(sc)}
                  type="button"
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "border border-[#0A84FF]/50 bg-[#0A84FF]/15 text-white shadow-sm"
                      : "border border-white/[0.08] bg-white/[0.02] text-[#86868b] hover:bg-white/[0.05] hover:text-[#f5f5f7]"
                  }`}
                >
                  <FlaskConical className={`h-3.5 w-3.5 ${isActive ? "text-[#0A84FF]" : "text-[#86868b]"}`} />
                  <span>{sc.title}</span>
                  <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-[#86868b]">
                    {sc.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Triad Input Section: Repository, Bug Report, Tests */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1: Repository Context */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">1. Repository & Source</h2>
              <p className="text-xs text-[#86868b]">Target file & codebase logic</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#86868b]">Repository / Project</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g. repolens-app"
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-[#505058] outline-none focus:border-[#0A84FF]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">Target File Path</label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="path/to/file.tsx"
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#505058] outline-none focus:border-[#0A84FF]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">Source Code / Snippet</label>
              <textarea
                rows={9}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="// Paste source code around the suspected fault..."
                className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] placeholder-[#505058] outline-none focus:border-[#0A84FF]/50"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Bug Report & Stack Trace */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FF453A]/10 text-[#FF453A]">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">2. Bug Report</h2>
              <p className="text-xs text-[#86868b]">Observed failure & stack trace</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#86868b]">Bug Title / Summary</label>
              <input
                type="text"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                placeholder="e.g. Uncaught TypeError in UserProfile"
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-[#505058] outline-none focus:border-[#FF453A]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">Primary Error / Exception</label>
              <input
                type="text"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="e.g. TypeError: Cannot read properties of undefined..."
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-mono text-[#FF453A] placeholder-[#505058] outline-none focus:border-[#FF453A]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">Runtime Stack Trace / Logs</label>
              <textarea
                rows={9}
                value={stackTrace}
                onChange={(e) => setStackTrace(e.target.value)}
                placeholder="Paste runtime stack trace with file and line numbers..."
                className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] placeholder-[#505058] outline-none focus:border-[#FF453A]/50"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Available Tests */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#30D158]/10 text-[#30D158]">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">3. Available Tests</h2>
              <p className="text-xs text-[#86868b]">Test cases & failing assertions</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#86868b]">Test Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="test_case_name"
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#505058] outline-none focus:border-[#30D158]/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#86868b]">Framework</label>
                <input
                  type="text"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  placeholder="pytest, jest, vitest"
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-[#505058] outline-none focus:border-[#30D158]/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">Failing Assertion</label>
              <input
                type="text"
                value={failingAssertion}
                onChange={(e) => setFailingAssertion(e.target.value)}
                placeholder="e.g. expect(() => render(...)).not.toThrow()"
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-mono text-[#30D158] placeholder-[#505058] outline-none focus:border-[#30D158]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">Test Runner Output / Test Code</label>
              <textarea
                rows={9}
                value={testOutput || testCode}
                onChange={(e) => setTestOutput(e.target.value)}
                placeholder="Paste test runner output and assertion failure trace..."
                className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] placeholder-[#505058] outline-none focus:border-[#30D158]/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-400">Diagnosis Request Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Diagnostic Findings Presentation (Apple Design) */}
      {diagnosis && (
        <div id="diagnosis-results" className="space-y-6 pt-4">
          {/* Executive Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0d12]/90 p-8 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-mono text-[#86868b]">
                    {diagnosis.investigation_id}
                  </span>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Evidence-Backed Diagnosis Confirmed
                  </div>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
                  {diagnosis.summary}
                </h2>
                <p className="text-xs text-[#86868b]">
                  Evaluated against stack trace, code syntax, and failing assertion:{" "}
                  <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[#30D158]">
                    {diagnosis.test_correlation.assertion_failed}
                  </code>
                </p>
              </div>

              {/* Confidence Metric Gauge */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#30D158]/30 bg-[#30D158]/10 text-xl font-bold text-[#30D158]">
                  {diagnosis.confidence_score}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#86868b]">Confidence</span>
                    <span className="rounded-full bg-[#30D158]/15 px-2 py-0.5 text-[10px] font-semibold text-[#30D158]">
                      {diagnosis.confidence_level}
                    </span>
                  </div>
                  <p className="mt-1 max-w-[200px] text-[11px] leading-tight text-[#86868b]">
                    {diagnosis.confidence_rationale}
                  </p>
                </div>
              </div>
            </div>

            {/* Apple-style Segmented Navigation Control */}
            <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.06] pt-6">
              {[
                { id: "root_cause", label: "Root Cause & Evidence", icon: ShieldAlert },
                { id: "culprit", label: "Culprit Code Inspector", icon: Code2 },
                { id: "trace", label: "Execution Trace Stepper", icon: Layers },
                { id: "patch", label: "Verified Patch & Diff", icon: GitCommit },
                { id: "regression", label: "Regression Test Suite", icon: FlaskConical },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as "root_cause" | "culprit" | "trace" | "patch" | "regression"
                      )
                    }
                    type="button"
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/25"
                        : "border border-white/[0.08] bg-white/[0.02] text-[#86868b] hover:bg-white/[0.05] hover:text-[#f5f5f7]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={downloadReport}
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-[#f5f5f7] transition hover:bg-white/[0.08]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Diagnosis Report
                </button>
              </div>
            </div>
          </div>

          {/* Tab 1: Root Cause & Test Correlation */}
          {activeTab === "root_cause" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-7 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0A84FF]">
                  <Zap className="h-4 w-4" />
                  The Root Cause Flaw
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">Underlying Mechanism</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#c7c7cc]">
                  {diagnosis.root_cause}
                </p>

                <div className="mt-6 border-t border-white/[0.06] pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                    Impact & Blast Radius
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
                    {diagnosis.impact_assessment}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-7 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#30D158]">
                  <FlaskConical className="h-4 w-4" />
                  Test Failure Evidence Correlation
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  Test Invariant Breakdown
                </h3>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <span className="text-[11px] uppercase tracking-wider text-[#86868b]">Failing Test</span>
                    <p className="mt-1 font-mono text-xs font-medium text-[#f5f5f7]">
                      {diagnosis.test_correlation.test_name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <span className="text-[11px] uppercase tracking-wider text-[#86868b]">Expected</span>
                      <p className="mt-1 text-xs text-[#30D158]">
                        {diagnosis.test_correlation.expected_behavior}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <span className="text-[11px] uppercase tracking-wider text-[#86868b]">Actual (Observed)</span>
                      <p className="mt-1 text-xs text-[#FF453A]">
                        {diagnosis.test_correlation.actual_behavior}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[#86868b]">
                    {diagnosis.test_correlation.explanation}
                  </p>
                </div>
              </div>

              {/* Prevention Guidelines */}
              <div className="col-span-full rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-7 backdrop-blur-xl">
                <h3 className="text-sm font-semibold text-white">Defensive Architectural Guidelines</h3>
                <p className="text-xs text-[#86868b]">
                  Practices recommended to prevent regression of this defect class across the repository.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {diagnosis.prevention_guidelines.map((guide, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-[#f5f5f7]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0A84FF]" />
                      <span>{guide}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Culprit Code Explorer */}
          {activeTab === "culprit" && (
            <div className="space-y-6">
              {diagnosis.culprit_files.map((file, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-2 border-b border-white/[0.06] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF453A]/10 text-[#FF453A]">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            {file.file_path}
                          </span>
                          <span className="rounded-full bg-[#FF453A]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FF453A]">
                            Lines {file.line_start} - {file.line_end}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#86868b]">{file.explanation}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(file.culprit_code, `culprit-${idx}`)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#86868b] hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedKey === `culprit-${idx}` ? "Copied" : "Copy Code"}
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="rounded-2xl border border-red-500/20 bg-[#050608] p-4">
                      <pre className="overflow-x-auto text-xs font-mono leading-relaxed text-[#f87171]">
                        {file.culprit_code}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Execution Trace Stepper */}
          {activeTab === "trace" && (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-8 backdrop-blur-xl">
              <h3 className="text-base font-semibold text-white">Chronological Execution Trace</h3>
              <p className="mt-1 text-xs text-[#86868b]">
                Step-by-step reproduction path from test execution entry point to runtime failure interception.
              </p>

              <div className="mt-8 space-y-6">
                {diagnosis.execution_trace.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Connecting line */}
                    {idx < diagnosis.execution_trace.length - 1 && (
                      <div className="absolute left-4 top-10 h-full w-[1px] bg-white/[0.1]" />
                    )}

                    {/* Step badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-xs font-bold text-[#0A84FF]">
                      {step.step_number}
                    </div>

                    <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            {step.phase}
                          </span>
                          <span className="font-mono text-xs font-medium text-[#0A84FF]">
                            {step.location}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-[#d1d5db]">
                        {step.description}
                      </p>

                      {step.code_snippet && (
                        <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#050608] p-3 font-mono text-[11px] text-[#9ca3af]">
                          {step.code_snippet}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Verified Patch & Diff */}
          {activeTab === "patch" && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-xl">
                <div className="flex flex-col gap-2 border-b border-white/[0.06] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">
                        {diagnosis.patch.file_path}
                      </span>
                      <span className="rounded-full bg-[#30D158]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#30D158]">
                        Unified Diff Patch
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#86868b]">{diagnosis.patch.explanation}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(diagnosis.patch.diff, "patch-diff")}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0A84FF] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0071E3]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedKey === "patch-diff" ? "Copied Diff" : "Copy Patch"}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="rounded-2xl border border-white/[0.08] bg-[#050608] p-5">
                    <pre className="overflow-x-auto text-xs font-mono leading-6">
                      {diagnosis.patch.diff.split("\n").map((line, idx) => {
                        const isAdd = line.startsWith("+") && !line.startsWith("+++");
                        const isDel = line.startsWith("-") && !line.startsWith("---");
                        const isHeader = line.startsWith("@@") || line.startsWith("---") || line.startsWith("+++");
                        return (
                          <div
                            key={idx}
                            className={`px-2 ${
                              isAdd
                                ? "bg-emerald-500/10 text-emerald-400"
                                : isDel
                                ? "bg-red-500/10 text-red-400"
                                : isHeader
                                ? "text-cyan-400 font-semibold"
                                : "text-[#9ca3af]"
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Regression Test Suite */}
          {activeTab === "regression" && (
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-xl">
              <div className="flex flex-col gap-2 border-b border-white/[0.06] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Automated Regression Test Case</h3>
                  <p className="mt-0.5 text-xs text-[#86868b]">
                    Executable test case designed to assert the bug is permanently fixed and prevent CI regressions.
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(diagnosis.regression_test, "regression-test")}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/[0.08]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedKey === "regression-test" ? "Copied Test" : "Copy Regression Test"}
                </button>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-white/[0.08] bg-[#050608] p-5">
                  <pre className="overflow-x-auto text-xs font-mono leading-relaxed text-[#30D158]">
                    {diagnosis.regression_test}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
