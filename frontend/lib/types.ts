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
};

export type IssueFilter =
  | "ALL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";