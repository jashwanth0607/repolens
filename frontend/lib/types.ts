export type Issue = {
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  file: string;
  line: number;
  description: string;
  suggestion: string;
  tool?: string;
};

export type ScoreStatus =
  | "Poor"
  | "Needs Improvement"
  | "Good"
  | "Excellent";

export type ScoreExplanation = {
  positive_factors: string[];
  negative_factors: string[];
};

export type CategoryScore = {
  score: number;
  status: ScoreStatus;
  positive_factors: string[];
  negative_factors: string[];
};

export type OverallScore = {
  score: number;
  status: ScoreStatus;
  breakdown: {
    code_quality: {
      score: number;
      weight: number;
      contribution: number;
    };
    security: {
      score: number;
      weight: number;
      contribution: number;
    };
    repository_health: {
      score: number;
      weight: number;
      contribution: number;
    };
    documentation: {
      score: number;
      weight: number;
      contribution: number;
    };
    maintainability: {
      score: number;
      weight: number;
      contribution: number;
    };
  };
};

export type RepositoryScores = {
  overall: OverallScore;
  code_quality: CategoryScore;
  security: CategoryScore;
  repository_health: CategoryScore;
  documentation: CategoryScore;
  maintainability: CategoryScore;
  methodology: string;
};

export type Repository = {
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  stars: number;
  forks: number;
  open_issues: number;
  language: string | null;
  private: boolean;
  html_url: string;
  files_scanned: number;
  issues_found: number;
  issues: Issue[];

  severity_counts: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };

  category_counts: Record<string, number>;

  dependencies: {
    python: number;
    javascript: number;
    total: number;
  };

  scores?: RepositoryScores;

  architecture?: {
    directories: string[];
    main_files: string[];
    file_types: Record<string, number>;
  };
};

export type IssueFilter =
  | "ALL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type BugReport = {
  title: string;
  description: string;
  error_message: string;
  stack_trace: string;
  environment: string;
};

export type TestContext = {
  test_name: string;
  test_code: string;
  failing_assertion: string;
  test_output: string;
  framework: string;
};

export type CulpritFile = {
  file_path: string;
  line_start: number;
  line_end: number;
  culprit_code: string;
  explanation: string;
  symbol_name?: string;
};

export type TraceStep = {
  step_number: number;
  phase: string;
  location: string;
  description: string;
  code_snippet?: string;
};

export type TestCorrelation = {
  test_name: string;
  assertion_failed: string;
  expected_behavior: string;
  actual_behavior: string;
  trigger_input: string;
  explanation: string;
};

export type PatchSuggestion = {
  file_path: string;
  diff: string;
  explanation: string;
  before_code: string;
  after_code: string;
};

export type DiagnosisResult = {
  investigation_id: string;
  summary: string;
  root_cause: string;
  confidence_score: number;
  confidence_level: "High" | "Medium" | "Low";
  confidence_rationale: string;
  culprit_files: CulpritFile[];
  test_correlation: TestCorrelation;
  execution_trace: TraceStep[];
  patch: PatchSuggestion;
  regression_test: string;
  prevention_guidelines: string[];
  impact_assessment: string;
};

export type InvestigationScenario = {
  id: string;
  title: string;
  category: string;
  repo_name: string;
  bug_report: BugReport;
  test_context: TestContext;
  repository_files?: Record<string, string>;
};