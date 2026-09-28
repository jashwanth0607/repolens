"use client";

import { Download } from "lucide-react";
import type { Repository } from "../lib/types";

type ReportDownloadButtonProps = {
  repository: Repository;
};

export default function ReportDownloadButton({
  repository,
}: ReportDownloadButtonProps) {
  const downloadReport = () => {
    const report = {
      generated_at: new Date().toISOString(),

      repository: {
        name: repository.name,
        full_name: repository.full_name,
        description: repository.description,
        default_branch: repository.default_branch,
        language: repository.language,
        private: repository.private,
        stars: repository.stars,
        forks: repository.forks,
        open_issues: repository.open_issues,
        url: repository.html_url,
      },

      summary: {
        files_scanned: repository.files_scanned,
        issues_found: repository.issues_found,
        severity_counts: repository.severity_counts,
        category_counts: repository.category_counts,
      },

      dependencies: repository.dependencies,

      issues: repository.issues,
    };

    const json = JSON.stringify(report, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${repository.name}-repolens-report.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={downloadReport}
      className="inline-flex items-center gap-2 rounded-full bg-[#0A84FF] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0A84FF]/25 transition hover:bg-[#0071E3] active:scale-[0.98]"
    >
      <Download className="h-3.5 w-3.5" />
      Download JSON Report
    </button>
  );
}