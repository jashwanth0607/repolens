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

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://repolens-n8j1.onrender.com"
).replace(/\/+$/, "");

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
      description:
        "When a user logs in without completed preferences, the component throws when rendering user.settings.notifications.enabled.",
      error_message:
        "TypeError: Cannot read properties of undefined (reading 'notifications')",
      stack_trace:
        "TypeError: Cannot read properties of undefined (reading 'notifications')\n    at UserProfile (frontend/components/UserProfile.tsx:42:28)\n    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486)",
      environment: "Next.js 15, React 19, TypeScript 5.4, Chrome 128",
    },

    test_context: {
      test_name: "test_renders_user_with_empty_preferences",
      test_code:
        "it('renders user profile without throwing when settings is null', () => {\n  const user = { id: 'usr_1', name: 'Alex Doe', settings: null };\n  expect(() => render(<UserProfile user={user} />)).not.toThrow();\n});",
      failing_assertion:
        "expect(() => render(<UserProfile user={user} />)).not.toThrow()",
      test_output:
        "FAIL: TypeError: Cannot read properties of undefined (reading 'notifications')\n42 | <span>{user.settings.notifications.enabled ? 'Active' : 'Muted'}</span>",
      framework: "Jest / React Testing Library",
    },

    repository_files: {
      "frontend/components/UserProfile.tsx":
        `export function UserProfile({ user }: { user: any }) {
  return (
    <div className="profile-card">
      <h3>{user.name}</h3>
      <span>
        {user.settings.notifications.enabled ? "Active" : "Muted"}
      </span>
    </div>
  );
}`,
    },
  },

  {
    id: "scenario-python-off-by-one",
    title: "IndexError: list index out of range in RepositoryScanner",
    category: "Backend / Python",
    repo_name: "repolens-backend",

    bug_report: {
      title:
        "Repository file scanner crashes when batch size matches total file count",
      description:
        "When chunking repository files for batch analysis, an off-by-one loop boundary condition raises an IndexError on the final batch slice.",
      error_message: "IndexError: list index out of range",
      stack_trace:
        'Traceback (most recent call last):\n  File "tests/test_scanner.py", line 28, in test_chunk_files_boundary\n  File "backend/services/repository_scanner.py", line 114, in chunk_files\n    batch.append(files[index + offset])\nIndexError: list index out of range',
      environment: "Python 3.12, FastAPI 0.110, Linux x86_64",
    },

    test_context: {
      test_name: "test_chunk_files_boundary_exact_multiple",
      test_code:
        "def test_chunk_files_boundary_exact_multiple():\n    scanner = RepositoryScanner()\n    sample_files = [f'file_{i}.py' for i in range(20)]\n    batches = scanner.chunk_files(sample_files, batch_size=10)\n    assert len(batches) == 2\n    assert sum(len(b) for b in batches) == 20",
      failing_assertion:
        "batches = scanner.chunk_files(sample_files, batch_size=10)",
      test_output:
        "FAILED tests/test_scanner.py::test_chunk_files_boundary_exact_multiple - IndexError: list index out of range",
      framework: "pytest",
    },

    repository_files: {
      "backend/services/repository_scanner.py":
        `class RepositoryScanner:
    def chunk_files(self, files: list, batch_size: int = 10) -> list:
        chunks = []

        for i in range(0, len(files), batch_size):
            batch = []

            for offset in range(0, batch_size + 1):
                if i + offset < len(files):
                    batch.append(files[i + offset])

            chunks.append(batch)

        return chunks`,
    },
  },

  {
    id: "scenario-async-race-condition",
    title: "Race Condition: Concurrent requests trigger duplicate Git clones",
    category: "Async / Backend",
    repo_name: "repolens-backend",

    bug_report: {
      title: "Concurrent scan requests trigger duplicate Git clone operations",
      description:
        "Rapid successive clicks on 'Analyze' dispatch parallel requests before the analysis state lock is acquired, causing duplicate clone operations.",
      error_message:
        "GitError: destination path already exists and is not an empty directory",
      stack_trace:
        `git.exc.GitCommandError: Cmd('git') failed due to: exit code(128)
stderr: 'fatal: destination path already exists'
File "backend/services/repository_scanner.py", line 45, in clone_repository`,
      environment: "Python 3.12, Uvicorn, Git 2.44",
    },

    test_context: {
      test_name: "test_concurrent_clone_deduplication",
      test_code:
        `@pytest.mark.asyncio
async def test_concurrent_clone_deduplication():
    scanner = RepositoryScanner()

    results = await asyncio.gather(
        scanner.safe_clone("https://github.com/org/repo"),
        scanner.safe_clone("https://github.com/org/repo")
    )

    assert results[0] == results[1]
    assert scanner.clone_count == 1`,
      failing_assertion: "assert scanner.clone_count == 1",
      test_output:
        "FAILED tests/test_concurrency.py::test_concurrent_clone_deduplication - AssertionError: assert 2 == 1",
      framework: "pytest-asyncio",
    },

    repository_files: {
      "backend/services/repository_scanner.py":
        `import asyncio

class RepositoryScanner:
    def __init__(self):
        self.clone_count = 0

    async def safe_clone(self, repo_url: str):
        self.clone_count += 1
        await asyncio.sleep(0.05)
        return f"/tmp/cloned/{hash(repo_url)}"`,
    },
  },
];

export default function BugInvestigator({
  activeRepository,
}: Props) {
  const [scenarios, setScenarios] =
    useState<InvestigationScenario[]>(DEFAULT_SCENARIOS);

  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>(DEFAULT_SCENARIOS[0].id);

  const [repoName, setRepoName] = useState(
    activeRepository?.full_name || DEFAULT_SCENARIOS[0].repo_name
  );

  const [filePath, setFilePath] = useState(
    Object.keys(DEFAULT_SCENARIOS[0].repository_files || {})[0] || "UserProfile.tsx"
  );

  const [fileContent, setFileContent] = useState(
    Object.values(DEFAULT_SCENARIOS[0].repository_files || {})[0] || ""
  );

  const [bugTitle, setBugTitle] = useState(
    DEFAULT_SCENARIOS[0].bug_report.title
  );

  const [bugDescription, setBugDescription] = useState(
    DEFAULT_SCENARIOS[0].bug_report.description
  );

  const [errorMessage, setErrorMessage] = useState(
    DEFAULT_SCENARIOS[0].bug_report.error_message
  );

  const [stackTrace, setStackTrace] = useState(
    DEFAULT_SCENARIOS[0].bug_report.stack_trace
  );

  const [environment, setEnvironment] = useState(
    DEFAULT_SCENARIOS[0].bug_report.environment
  );

  const [testName, setTestName] = useState(
    DEFAULT_SCENARIOS[0].test_context.test_name
  );

  const [framework, setFramework] = useState(
    DEFAULT_SCENARIOS[0].test_context.framework
  );

  const [failingAssertion, setFailingAssertion] = useState(
    DEFAULT_SCENARIOS[0].test_context.failing_assertion
  );

  const [testCode, setTestCode] = useState(
    DEFAULT_SCENARIOS[0].test_context.test_code
  );

  const [testOutput, setTestOutput] = useState(
    DEFAULT_SCENARIOS[0].test_context.test_output
  );

  const [isInvestigating, setIsInvestigating] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "root_cause" | "culprit" | "trace" | "patch" | "regression"
  >("root_cause");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadScenarios() {
      try {
        const response = await fetch(`${API_URL}/api/investigate/scenarios`);

        if (!response.ok) return;

        const data = await response.json();

        if (
          !ignore &&
          Array.isArray(data.scenarios) &&
          data.scenarios.length > 0
        ) {
          setScenarios(data.scenarios);
        }
      } catch {
        // Keep built-in scenarios.
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
      setFileContent(firstPath ? scenario.repository_files[firstPath] || "" : "");
    }

    setDiagnosis(null);
    setError(null);
  }

  async function handleInvestigate() {
    setIsInvestigating(true);
    setError(null);
    setDiagnosis(null);

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
        environment,
      },
      test_context: {
        test_name: testName,
        test_code: testCode,
        failing_assertion: failingAssertion,
        test_output: testOutput,
        framework,
      },
    };

    try {
      const response = await fetch(`${API_URL}/api/investigate/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Diagnosis failed with status ${response.status}`
        );
      }

      if (!data?.diagnosis) {
        throw new Error("The backend returned no diagnosis.");
      }

      setDiagnosis(data.diagnosis);
      setActiveTab("root_cause");

      setTimeout(() => {
        document
          .getElementById("diagnosis-results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to complete diagnosis.";

      setError(message);
    } fontally {
      setIsInvestigating(false);
    }
  }

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch {
      setError("Failed to copy text to clipboard.");
    }
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
    (file) => `### \`${file.file_path}\` (Lines ${file.line_start}-${file.line_end})

**Faulty Logic:**

\`\`\`
${file.culprit_code}
\`\`\`

**Explanation:** ${file.explanation}
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
  .map(
    (step) =>
      `${step.step_number}. **[${step.phase}]** \`${step.location}\` — ${step.description}`
  )
  .join("\n")}

## Recommended Patch

**File:** \`${diagnosis.patch.file_path}\`

${diagnosis.patch.explanation}

\`\`\`diff
${diagnosis.patch.diff}
\`\`\`

## Regression Test

\`\`\`
${diagnosis.regression_test}
\`\`\`

## Prevention Guidelines

${diagnosis.prevention_guidelines.map((guideline) => `- ${guideline}`).join("\n")}

## Impact Assessment

${diagnosis.impact_assessment}
`;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `diagnosis-${diagnosis.investigation_id}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const tabs: {
    id: "root_cause" | "culprit" | "trace" | "patch" | "regression";
    label: string;
    icon: typeof ShieldAlert;
  }[] = [
    { id: "root_cause", label: "Root Cause", icon: ShieldAlert },
    { id: "culprit", label: "Culprit Code", icon: Code2 },
    { id: "trace", label: "Execution Trace", icon: GitCommit },
    { id: "patch", label: "Recommended Patch", icon: Zap },
    { id: "regression", label: "Regression Test", icon: FlaskConical },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs font-mono font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              BugLens Diagnostic Engine
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              Evidence-Backed Bug Diagnosis
            </h1>

            <p className="max-w-2xl text-xs text-zinc-400 leading-relaxed">
              Input repository files, bug reports, and test assertions to isolate exact failure points, correlate stack traces, and generate verified patches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (scenarios.length > 0) applyScenario(scenarios[0]);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 active:scale-[0.98]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
              Reset Inputs
            </button>

            <button
              onClick={handleInvestigate}
              disabled={isInvestigating}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition active:scale-[0.98] disabled:opacity-50"
            >
              {isInvestigating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Investigating Cause...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Diagnose Root Cause
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-800/80 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              SAMPLE REPRODUCIBLE SCENARIOS
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Click to populate test cases
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {scenarios.map((scenario) => {
              const isActive = selectedScenarioId === scenario.id;

              return (
                <button
                  key={scenario.id}
                  onClick={() => applyScenario(scenario)}
                  type="button"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <FlaskConical className={`h-3.5 w-3.5 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                  <span>{scenario.title}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                    {scenario.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel 1: Repository */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
            <FileCode className="h-4 w-4 text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              1. Repository & Source Logic
            </h2>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="font-medium text-zinc-400">Target Repository</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-white outline-none focus:border-blue-500/60"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-400">File Path</label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-white outline-none focus:border-blue-500/60"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-400">Relevant Code Snippet</label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={11}
                className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-zinc-300 outline-none focus:border-blue-500/60"
              />
            </div>
          </div>
        </div>

        {/* Panel 2: Bug Report */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
            <Bug className="h-4 w-4 text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              2. Bug Report & Trace
            </h2>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="font-medium text-zinc-400">Bug Title</label>
              <input
                type="text"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-red-500/60"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-400">Description</label>
              <textarea
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 outline-none focus:border-red-500/60"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-400">Error Message</label>
              <textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                rows={2}
                className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-red-400 outline-none focus:border-red-500/60"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-400">Stack Trace</label>
              <textarea
                value={stackTrace}
                onChange={(e) => setStackTrace(e.target.value)}
                rows={4}
                className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-zinc-400 outline-none focus:border-red-500/60"
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Test Context */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              3. Failing Test Evidence
            </h2>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="font-medium text-zinc-400">Test Name & Framework</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-white outline-none focus:border-emerald-500/60"
                />
                <input
                  type="text"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-white outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-zinc-400">Failing Assertion</label>
              <textarea
                value={failingAssertion}
                onChange={(e) => setFailingAssertion(e.target.value)}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-zinc-300 outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="font-medium text-zinc-400">Test Source Code</label>
              <textarea
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                rows={7}
                className="mt-1.5 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-zinc-300 outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Diagnosis Output Results */}
      {diagnosis && (
        <div id="diagnosis-results" className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md overflow-hidden">
          <div className="border-b border-zinc-800/80 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-400">
                    Confidence: {diagnosis.confidence_score}% ({diagnosis.confidence_level})
                  </span>
                  <span className="text-xs font-mono text-zinc-400">ID: {diagnosis.investigation_id}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold font-mono text-white">
                  Diagnostic Report Summary
                </h2>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed max-w-3xl">
                  {diagnosis.summary}
                </p>
              </div>

              <button
                onClick={downloadReport}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 shrink-0 self-start sm:self-auto"
              >
                <Download className="h-4 w-4" />
                Download Report (.md)
              </button>
            </div>
          </div>

          {/* Diagnosis Tabs */}
          <div className="flex overflow-x-auto border-b border-zinc-800/80 px-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-mono font-medium transition ${
                    isActive
                      ? "border-blue-500 text-white"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 text-xs leading-relaxed text-zinc-300">
            {activeTab === "root_cause" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                  <h3 className="font-semibold text-white mb-1.5 text-sm">Root Cause</h3>
                  <p>{diagnosis.root_cause}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                  <h3 className="font-semibold text-white mb-1.5 text-sm">Confidence Rationale</h3>
                  <p>{diagnosis.confidence_rationale}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
                  <h3 className="font-semibold text-white mb-1.5 text-sm">Impact Assessment</h3>
                  <p>{diagnosis.impact_assessment}</p>
                </div>
              </div>
            )}

            {activeTab === "culprit" && (
              <div className="space-y-4">
                {diagnosis.culprit_files.map((file, index) => (
                  <div key={index} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-blue-400 font-semibold">{file.file_path} (lines {file.line_start}-{file.line_end})</span>
                      <button
                        onClick={() => copyToClipboard(file.culprit_code, `culprit-${index}`)}
                        className="text-[10px] font-mono border border-zinc-700 bg-zinc-800 px-2 py-1 rounded text-zinc-300 hover:text-white"
                      >
                        {copiedKey === `culprit-${index}` ? "Copied" : "Copy Code"}
                      </button>
                    </div>
                    <pre className="p-3 bg-zinc-900/90 rounded border border-zinc-800 font-mono text-zinc-200 overflow-x-auto my-2">
                      <code>{file.culprit_code}</code>
                    </pre>
                    <p className="text-zinc-400 mt-2">{file.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "trace" && (
              <div className="space-y-3">
                {diagnosis.execution_trace.map((step) => (
                  <div key={step.step_number} className="flex gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 font-mono text-xs font-bold text-blue-400">
                      {step.step_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-zinc-400 uppercase">[{step.phase}]</span>
                        <span className="text-blue-400">{step.location}</span>
                      </div>
                      <p className="mt-1 text-zinc-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "patch" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <span className="font-mono font-bold text-white text-sm">Target File: {diagnosis.patch.file_path}</span>
                  <p className="mt-1 text-zinc-300">{diagnosis.patch.explanation}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(diagnosis.patch.diff, "patch")}
                    className="absolute right-3 top-3 border border-zinc-700 bg-zinc-800 px-2 py-1 rounded text-[10px] font-mono text-zinc-300"
                  >
                    {copiedKey === "patch" ? "Copied" : "Copy Diff"}
                  </button>
                  <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-zinc-200 overflow-x-auto pt-10">
                    <code>{diagnosis.patch.diff}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "regression" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h3 className="font-semibold text-white mb-1 text-sm">Suggested Regression Test</h3>
                  <p className="text-zinc-400">Add this automated assertion to prevent re-introduction of this defect.</p>
                </div>
                <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-zinc-200 overflow-x-auto">
                  <code>{diagnosis.regression_test}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
