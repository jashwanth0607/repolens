"use client";

import { Download } from "lucide-react";
import type { Issue, Repository } from "../lib/types";

type ReportDownloadButtonProps = {
  repository: Repository;
};

type PdfLine = {
  text: string;
  size: number;
  x: number;
  y: number;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;
const LINE_HEIGHT = 15;
const MAX_TEXT_WIDTH = 92;

export default function ReportDownloadButton({
  repository,
}: ReportDownloadButtonProps) {
  const downloadReport = () => {
    const generatedAt = new Date();
    const pdf = createReportPdf(repository, generatedAt);
    const blob = new Blob([pdf], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${repository.name}-repolens-report.pdf`;

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
      Download PDF Report
    </button>
  );
}

function createReportPdf(repository: Repository, generatedAt: Date) {
  const pages: PdfLine[][] = [[]];
  let currentPage = 0;
  let y = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    pages.push([]);
    currentPage += 1;
    y = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (height: number) => {
    if (y - height < MARGIN) {
      newPage();
    }
  };

  const addLine = (text: string, size = 10, indent = 0) => {
    ensureSpace(LINE_HEIGHT);
    pages[currentPage].push({
      text: normalizePdfText(text),
      size,
      x: MARGIN + indent,
      y,
    });
    y -= LINE_HEIGHT;
  };

  const addGap = (height = 8) => {
    ensureSpace(height);
    y -= height;
  };

  const addWrapped = (text: string, size = 10, indent = 0) => {
    const lines = wrapText(text, MAX_TEXT_WIDTH - Math.floor(indent / 6));
    for (const line of lines) {
      addLine(line, size, indent);
    }
  };

  const addHeading = (text: string) => {
    addGap(8);
    addLine(text, 14);
    addLine("-".repeat(78), 8);
  };

  const addKeyValues = (items: Array<[string, string | number | null | undefined]>) => {
    for (const [label, value] of items) {
      addWrapped(`${label}: ${formatValue(value)}`);
    }
  };

  addLine("RepoLens Repository Analysis Report", 20);
  addLine(`Generated: ${generatedAt.toLocaleString()}`, 10);
  addLine(`Repository: ${repository.full_name}`, 12);

  addHeading("Repository Overview");
  addKeyValues([
    ["Description", repository.description || "No description available"],
    ["URL", repository.html_url],
    ["Language", repository.language || "Multi-language"],
    ["Default branch", repository.default_branch],
    ["Visibility", repository.private ? "Private" : "Public"],
    ["Stars", repository.stars],
    ["Forks", repository.forks],
    ["Open issues", repository.open_issues],
  ]);

  addHeading("Analysis Summary");
  addKeyValues([
    ["Files scanned", repository.files_scanned],
    ["Issues found", repository.issues_found],
    ["High severity", repository.severity_counts.HIGH],
    ["Medium severity", repository.severity_counts.MEDIUM],
    ["Low severity", repository.severity_counts.LOW],
    ["Total dependencies", repository.dependencies.total],
    ["Python dependencies", repository.dependencies.python],
    ["JavaScript dependencies", repository.dependencies.javascript],
  ]);

  if (repository.scores) {
    addHeading("Score Summary");
    addKeyValues([
      ["Overall score", `${repository.scores.overall.score}/100 (${repository.scores.overall.status})`],
      ["Code quality", `${repository.scores.code_quality.score}/100 (${repository.scores.code_quality.status})`],
      ["Security", `${repository.scores.security.score}/100 (${repository.scores.security.status})`],
      ["Repository health", `${repository.scores.repository_health.score}/100 (${repository.scores.repository_health.status})`],
      ["Documentation", `${repository.scores.documentation.score}/100 (${repository.scores.documentation.status})`],
      ["Maintainability", `${repository.scores.maintainability.score}/100 (${repository.scores.maintainability.status})`],
    ]);
    addWrapped(`Methodology: ${repository.scores.methodology}`);
  }

  addHeading("Finding Categories");
  const categoryEntries = Object.entries(repository.category_counts).sort(
    (a, b) => b[1] - a[1]
  );
  if (categoryEntries.length === 0) {
    addLine("No finding categories recorded.");
  } else {
    categoryEntries.forEach(([category, count]) => {
      addLine(`${category}: ${count}`);
    });
  }

  if (repository.architecture) {
    addHeading("Architecture Summary");
    addWrapped(
      `Top-level directories: ${repository.architecture.directories.join(", ") || "None recorded"}`
    );
    addWrapped(
      `Main files: ${repository.architecture.main_files.join(", ") || "None recorded"}`
    );
    const fileTypes = Object.entries(repository.architecture.file_types)
      .map(([extension, count]) => `${extension}: ${count}`)
      .join(", ");
    addWrapped(`File types: ${fileTypes || "None recorded"}`);
  }

  addHeading("Findings");
  if (repository.issues.length === 0) {
    addLine("No issues were reported by the analysis.");
  } else {
    repository.issues.forEach((issue, index) => {
      addIssue(issue, index + 1, addLine, addWrapped, addGap);
    });
  }

  return buildPdf(pages);
}

function addIssue(
  issue: Issue,
  index: number,
  addLine: (text: string, size?: number, indent?: number) => void,
  addWrapped: (text: string, size?: number, indent?: number) => void,
  addGap: (height?: number) => void
) {
  addGap(8);
  addWrapped(
    `${index}. [${issue.severity}] ${issue.title}`,
    11
  );
  addWrapped(`Category: ${issue.category}`, 10, 12);
  addWrapped(`Location: ${issue.file}: line ${issue.line}`, 10, 12);
  if (issue.tool) {
    addWrapped(`Tool: ${issue.tool}`, 10, 12);
  }
  addWrapped(`Description: ${issue.description}`, 10, 12);
  addWrapped(`Recommendation: ${issue.suggestion}`, 10, 12);
  addLine("", 10);
}

function buildPdf(pages: PdfLine[][]) {
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  const fontObjectNumber = 3;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "";
  objects[fontObjectNumber] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let nextObjectNumber = 4;

  for (const page of pages) {
    const content = renderPageContent(page);
    const contentObjectNumber = nextObjectNumber;
    nextObjectNumber += 1;
    const pageObjectNumber = nextObjectNumber;
    nextObjectNumber += 1;

    objects[contentObjectNumber] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[pageObjectNumber] = [
      "<< /Type /Page",
      "/Parent 2 0 R",
      `/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]`,
      `/Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >>`,
      `/Contents ${contentObjectNumber} 0 R`,
      ">>",
    ].join(" ");

    pageObjectNumbers.push(pageObjectNumber);
  }

  objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers
    .map((objectNumber) => `${objectNumber} 0 R`)
    .join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    const object = objects[objectNumber];
    if (!object) continue;
    offsets[objectNumber] = pdf.length;
    pdf += `${objectNumber} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    pdf += `${String(offsets[objectNumber] || 0).padStart(10, "0")} 00000 n \n`;
  }

  pdf += [
    "trailer",
    `<< /Size ${objects.length} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  return pdf;
}

function renderPageContent(lines: PdfLine[]) {
  return lines
    .map(
      (line) =>
        `BT /F1 ${line.size} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj ET`
    )
    .join("\n");
}

function wrapText(text: string, maxLength: number) {
  const words = normalizePdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word.length > maxLength ? `${word.slice(0, maxLength - 1)}…` : word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function normalizePdfText(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return String(value);
}
