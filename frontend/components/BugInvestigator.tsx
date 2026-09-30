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
    title:
      "TypeError: Cannot read properties of undefined in UserProfile",
    category: "Frontend / React",
    repo_name: "repolens-app",

    bug_report: {
      title:
        "UserProfile crashes with TypeError when user settings are null",
      description:
        "When a user logs in without completed preferences, the component throws when rendering user.settings.notifications.enabled.",
      error_message:
        "TypeError: Cannot read properties of undefined (reading 'notifications')",
      stack_trace:
        "TypeError: Cannot read properties of undefined (reading 'notifications')\n    at UserProfile (frontend/components/UserProfile.tsx:42:28)\n    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486)",
      environment:
        "Next.js 15, React 19, TypeScript 5.4, Chrome 128",
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
    title:
      "IndexError: list index out of range in RepositoryScanner",
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
      environment:
        "Python 3.12, FastAPI 0.110, Linux x86_64",
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
    title:
      "Race Condition: Concurrent requests trigger duplicate Git clones",
    category: "Async / Backend",
    repo_name: "repolens-backend",

    bug_report: {
      title:
        "Concurrent scan requests trigger duplicate Git clone operations",
      description:
        "Rapid successive clicks on 'Analyze' dispatch parallel requests before the analysis state lock is acquired, causing duplicate clone operations.",
      error_message:
        "GitError: destination path already exists and is not an empty directory",
      stack_trace:
        `git.exc.GitCommandError: Cmd('git') failed due to: exit code(128)
stderr: 'fatal: destination path already exists'
File "backend/services/repository_scanner.py", line 45, in clone_repository`,
      environment:
        "Python 3.12, Uvicorn, Git 2.44",
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
      failing_assertion:
        "assert scanner.clone_count == 1",
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
    activeRepository?.full_name ||
      DEFAULT_SCENARIOS[0].repo_name
  );

  const [filePath, setFilePath] = useState(
    Object.keys(
      DEFAULT_SCENARIOS[0].repository_files || {}
    )[0] || "UserProfile.tsx"
  );

  const [fileContent, setFileContent] = useState(
    Object.values(
      DEFAULT_SCENARIOS[0].repository_files || {}
    )[0] || ""
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

  const [failingAssertion, setFailingAssertion] =
    useState(
      DEFAULT_SCENARIOS[0].test_context.failing_assertion
    );

  const [testCode, setTestCode] = useState(
    DEFAULT_SCENARIOS[0].test_context.test_code
  );

  const [testOutput, setTestOutput] = useState(
    DEFAULT_SCENARIOS[0].test_context.test_output
  );

  const [isInvestigating, setIsInvestigating] =
    useState(false);

  const [diagnosis, setDiagnosis] =
    useState<DiagnosisResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "root_cause" | "culprit" | "trace" | "patch" | "regression"
  >("root_cause");

  const [copiedKey, setCopiedKey] =
    useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadScenarios() {
      try {
        const response = await fetch(
          `${API_URL}/api/investigate/scenarios`
        );

        if (!response.ok) {
          return;
        }

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

  function applyScenario(
    scenario: InvestigationScenario
  ) {
    setSelectedScenarioId(scenario.id);

    setRepoName(
      activeRepository?.full_name ||
        scenario.repo_name
    );

    setBugTitle(scenario.bug_report.title);
    setBugDescription(
      scenario.bug_report.description
    );
    setErrorMessage(
      scenario.bug_report.error_message
    );
    setStackTrace(
      scenario.bug_report.stack_trace
    );
    setEnvironment(
      scenario.bug_report.environment
    );

    setTestName(
      scenario.test_context.test_name
    );

    setFramework(
      scenario.test_context.framework
    );

    setFailingAssertion(
      scenario.test_context.failing_assertion
    );

    setTestCode(
      scenario.test_context.test_code
    );

    setTestOutput(
      scenario.test_context.test_output
    );

    if (scenario.repository_files) {
      const firstPath =
        Object.keys(
          scenario.repository_files
        )[0];

      setFilePath(
        firstPath || "main.ts"
      );

      setFileContent(
        firstPath
          ? scenario.repository_files[firstPath] || ""
          : ""
      );
    }

    setDiagnosis(null);
    setError(null);
  }

  async function handleInvestigate() {
    setIsInvestigating(true);
    setError(null);
    setDiagnosis(null);

    const payload = {
      repository_url:
        activeRepository?.html_url || undefined,

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
      const response = await fetch(
        `${API_URL}/api/investigate/diagnose`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
        throw new Error(
          "The backend returned no diagnosis."
        );
      }

      setDiagnosis(data.diagnosis);
      setActiveTab("root_cause");

      setTimeout(() => {
        document
          .getElementById("diagnosis-results")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to complete diagnosis.";

      setError(message);
    } finally {
      setIsInvestigating(false);
    }
  }

  async function copyToClipboard(
    text: string,
    key: string
  ) {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedKey(key);

      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch {
      setError(
        "Failed to copy text to clipboard."
      );
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

${diagnosis.prevention_guidelines
  .map((guideline) => `- ${guideline}`)
  .join("\n")}

## Impact Assessment

${diagnosis.impact_assessment}
`;

    const blob = new Blob([reportText], {
      type: "text/markdown",
    });

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
    id:
      | "root_cause"
      | "culprit"
      | "trace"
      | "patch"
      | "regression";
    label: string;
    icon: typeof ShieldAlert;
  }[] = [
    {
      id: "root_cause",
      label: "Root Cause",
      icon: ShieldAlert,
    },
    {
      id: "culprit",
      label: "Culprit Code",
      icon: Code2,
    },
    {
      id: "trace",
      label: "Execution Trace",
      icon: GitCommit,
    },
    {
      id: "patch",
      label: "Recommended Patch",
      icon: Zap,
    },
    {
      id: "regression",
      label: "Regression Test",
      icon: FlaskConical,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 px-3 py-1 text-xs font-medium text-[#0A84FF]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0A84FF]" />
              BugLens Diagnostic Engine
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
              Evidence-Backed Bug Diagnosis
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-[#86868b]">
              Given a repository, bug report, and available
              tests, investigate the likely cause, correlate
              stack trace frames, and generate verified
              patches with mathematical confidence.
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
            {scenarios.map((scenario) => {
              const isActive =
                selectedScenarioId === scenario.id;

              return (
                <button
                  key={scenario.id}
                  onClick={() =>
                    applyScenario(scenario)
                  }
                  type="button"
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "border border-[#0A84FF]/50 bg-[#0A84FF]/15 text-white shadow-sm"
                      : "border border-white/[0.08] bg-white/[0.02] text-[#86868b] hover:bg-white/[0.05] hover:text-[#f5f5f7]"
                  }`}
                >
                  <FlaskConical
                    className={`h-3.5 w-3.5 ${
                      isActive
                        ? "text-[#0A84FF]"
                        : "text-[#86868b]"
                    }`}
                  />

                  <span>{scenario.title}</span>

                  <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-[#86868b]">
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
        {/* Repository */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
              <FileCode className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                1. Repository & Source
              </h2>

              <p className="text-xs text-[#86868b]">
                Target file & codebase logic
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Repository / Project
              </label>

              <input
                type="text"
                value={repoName}
                onChange={(e) =>
                  setRepoName(e.target.value)
                }
                placeholder="e.g. repolens-app"
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white outline-none transition focus:border-[#0A84FF]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                File Path
              </label>

              <input
                type="text"
                value={filePath}
                onChange={(e) =>
                  setFilePath(e.target.value)
                }
                placeholder="e.g. frontend/components/UserProfile.tsx"
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-mono text-white outline-none transition focus:border-[#0A84FF]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Relevant Source Code
              </label>

              <textarea
                value={fileContent}
                onChange={(e) =>
                  setFileContent(e.target.value)
                }
                rows={12}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] outline-none placeholder:text-[#505058] focus:border-[#0A84FF]/50"
              />
            </div>
          </div>
        </div>

        {/* Bug Report */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FF453A]/10 text-[#FF453A]">
              <Bug className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                2. Bug Report
              </h2>

              <p className="text-xs text-[#86868b]">
                Failure details & runtime evidence
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Bug Title
              </label>

              <input
                type="text"
                value={bugTitle}
                onChange={(e) =>
                  setBugTitle(e.target.value)
                }
                placeholder="Describe the bug"
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white outline-none transition focus:border-[#FF453A]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Description
              </label>

              <textarea
                value={bugDescription}
                onChange={(e) =>
                  setBugDescription(e.target.value)
                }
                rows={4}
                placeholder="Explain what is happening..."
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-white outline-none transition focus:border-[#FF453A]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Error Message
              </label>

              <textarea
                value={errorMessage}
                onChange={(e) =>
                  setErrorMessage(e.target.value)
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#ffb4ae] outline-none focus:border-[#FF453A]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Stack Trace
              </label>

              <textarea
                value={stackTrace}
                onChange={(e) =>
                  setStackTrace(e.target.value)
                }
                rows={7}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] outline-none focus:border-[#FF453A]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Environment
              </label>

              <input
                type="text"
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value)
                }
                placeholder="Runtime, OS, browser, versions..."
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white outline-none focus:border-[#FF453A]/50"
              />
            </div>
          </div>
        </div>

        {/* Test Evidence */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0d12]/80 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#30D158]/10 text-[#30D158]">
              <FlaskConical className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                3. Test Evidence
              </h2>

              <p className="text-xs text-[#86868b]">
                Correlate the failing test
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Test Name
              </label>

              <input
                type="text"
                value={testName}
                onChange={(e) =>
                  setTestName(e.target.value)
                }
                placeholder="Test name"
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white outline-none focus:border-[#30D158]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Test Framework
              </label>

              <input
                type="text"
                value={framework}
                onChange={(e) =>
                  setFramework(e.target.value)
                }
                placeholder="Jest, pytest, Vitest..."
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white outline-none focus:border-[#30D158]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Failing Assertion
              </label>

              <textarea
                value={failingAssertion}
                onChange={(e) =>
                  setFailingAssertion(e.target.value)
                }
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] outline-none focus:border-[#30D158]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Test Code
              </label>

              <textarea
                value={testCode}
                onChange={(e) =>
                  setTestCode(e.target.value)
                }
                rows={8}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#d1d5db] outline-none focus:border-[#30D158]/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#86868b]">
                Test Output
              </label>

              <textarea
                value={testOutput}
                onChange={(e) =>
                  setTestOutput(e.target.value)
                }
                rows={6}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#050608] p-3 text-xs font-mono text-[#ffb4ae] outline-none focus:border-[#30D158]/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF453A]" />

            <div>
              <p className="text-sm font-semibold text-white">
                Diagnosis Request Failed
              </p>

              <p className="mt-1 text-xs leading-relaxed text-[#ffb4ae]">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Results */}
      {diagnosis && (
        <div
          id="diagnosis-results"
          className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0d12]/90 backdrop-blur-xl"
        >
          {/* Results Header */}
          <div className="border-b border-white/[0.06] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#30D158]/10 text-[#30D158]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#86868b]">
                      Investigation Complete
                    </p>

                    <h2 className="text-xl font-semibold text-white">
                      Diagnosis Result
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#a1a1a6]">
                  {diagnosis.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#86868b]">
                    Confidence
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {diagnosis.confidence_score}%
                  </p>

                  <p className="text-[10px] text-[#30D158]">
                    {diagnosis.confidence_level}
                  </p>
                </div>

                <button
                  onClick={downloadReport}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-medium text-white transition hover:bg-white/[0.08]"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
            </div>
          </div>

          {/* FIXED TABS */}
          <div className="flex overflow-x-auto border-b border-white/[0.06] px-4">
            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.id;

              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-xs font-medium transition ${
                    isActive
                      ? "border-[#0A84FF] text-white"
                      : "border-transparent text-[#86868b] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Root Cause */}
          {activeTab === "root_cause" && (
            <div className="space-y-6 p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[#FF453A]" />

                    <h3 className="text-sm font-semibold text-white">
                      Root Cause
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#c7c7cc]">
                    {diagnosis.root_cause}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#0A84FF]" />

                    <h3 className="text-sm font-semibold text-white">
                      Confidence Rationale
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#c7c7cc]">
                    {diagnosis.confidence_rationale}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white">
                  Impact Assessment
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#c7c7cc]">
                  {diagnosis.impact_assessment}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-[#30D158]" />

                  <h3 className="text-sm font-semibold text-white">
                    Test Correlation
                  </h3>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#86868b]">
                      Test
                    </p>

                    <p className="mt-1 text-sm text-white">
                      {diagnosis.test_correlation.test_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#86868b]">
                      Assertion
                    </p>

                    <p className="mt-1 break-words font-mono text-xs text-[#d1d5db]">
                      {diagnosis.test_correlation.assertion_failed}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#86868b]">
                      Expected
                    </p>

                    <p className="mt-1 text-sm text-[#30D158]">
                      {diagnosis.test_correlation.expected_behavior}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#86868b]">
                      Actual
                    </p>

                    <p className="mt-1 text-sm text-[#FF453A]">
                      {diagnosis.test_correlation.actual_behavior}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#86868b]">
                    Failure Mechanism
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#c7c7cc]">
                    {diagnosis.test_correlation.explanation}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white">
                  Prevention Guidelines
                </h3>

                <div className="mt-4 space-y-3">
                  {diagnosis.prevention_guidelines.map(
                    (guideline, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#30D158]" />

                        <p className="text-sm leading-6 text-[#c7c7cc]">
                          {guideline}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Culprit Code */}
          {activeTab === "culprit" && (
            <div className="space-y-5 p-6">
              {diagnosis.culprit_files.map(
                (file, index) => {
                  const key = `culprit-${index}`;

                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                    >
                      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <FileCode className="h-4 w-4 text-[#0A84FF]" />

                          <div>
                            <p className="font-mono text-xs text-white">
                              {file.file_path}
                            </p>

                            <p className="mt-1 text-[10px] text-[#86868b]">
                              Lines {file.line_start}-
                              {file.line_end}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              file.culprit_code,
                              key
                            )
                          }
                          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[10px] text-[#d1d5db] hover:bg-white/[0.08] sm:self-auto"
                        >
                          <Copy className="h-3.5 w-3.5" />

                          {copiedKey === key
                            ? "Copied"
                            : "Copy Code"}
                        </button>
                      </div>

                      <div className="p-4">
                        <pre className="overflow-x-auto rounded-xl bg-[#050608] p-4 text-xs leading-6 text-[#d1d5db]">
                          <code>
                            {file.culprit_code}
                          </code>
                        </pre>

                        <div className="mt-4 rounded-xl border border-[#FF453A]/20 bg-[#FF453A]/5 p-4">
                          <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF453A]" />

                            <p className="text-xs leading-6 text-[#d1d5db]">
                              {file.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* Execution Trace */}
          {activeTab === "trace" && (
            <div className="p-6">
              <div className="space-y-4">
                {diagnosis.execution_trace.map(
                  (step) => (
                    <div
                      key={step.step_number}
                      className="relative flex gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0A84FF]/30 bg-[#0A84FF]/10 text-xs font-semibold text-[#0A84FF]">
                        {step.step_number}
                      </div>

                      <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#86868b]">
                            {step.phase}
                          </span>

                          <span className="font-mono text-xs text-[#0A84FF]">
                            {step.location}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[#c7c7cc]">
                          {step.description}
                        </p>

                        {step.code_snippet && (
                          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#050608] p-4 text-xs leading-6 text-[#d1d5db]">
                            <code>
                              {step.code_snippet}
                            </code>
                          </pre>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Patch */}
          {activeTab === "patch" && (
            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-[#0A84FF]/20 bg-[#0A84FF]/5 p-5">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#0A84FF]" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#86868b]">
                      Recommended Patch
                    </p>

                    <p className="mt-1 font-mono text-sm text-white">
                      {diagnosis.patch.file_path}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#c7c7cc]">
                  {diagnosis.patch.explanation}
                </p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      diagnosis.patch.diff,
                      "patch"
                    )
                  }
                  className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111318] px-3 py-2 text-[10px] text-[#d1d5db] hover:bg-[#181a20]"
                >
                  <Copy className="h-3.5 w-3.5" />

                  {copiedKey === "patch"
                    ? "Copied"
                    : "Copy Diff"}
                </button>

                <pre className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#050608] p-5 pt-16 text-xs leading-6 text-[#d1d5db]">
                  <code>
                    {diagnosis.patch.diff}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* Regression */}
          {activeTab === "regression" && (
            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-[#30D158]/20 bg-[#30D158]/5 p-5">
                <div className="flex items-center gap-3">
                  <FlaskConical className="h-5 w-5 text-[#30D158]" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#86868b]">
                      Regression Protection
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Suggested regression test
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-6 text-[#a1a1a6]">
                  Add this test to prevent the same failure
                  from returning after the patch.
                </p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      diagnosis.regression_test,
                      "regression"
                    )
                  }
                  className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111318] px-3 py-2 text-[10px] text-[#d1d5db] hover:bg-[#181a20]"
                >
                  <Copy className="h-3.5 w-3.5" />

                  {copiedKey === "regression"
                    ? "Copied"
                    : "Copy Test"}
                </button>

                <pre className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#050608] p-5 pt-16 text-xs leading-6 text-[#d1d5db]">
                  <code>
                    {diagnosis.regression_test}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}