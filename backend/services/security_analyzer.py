import json
import subprocess
from pathlib import Path


class SecurityAnalyzer:

    def analyze(self, repository_path: Path) -> list[dict]:
        python_files = list(repository_path.rglob("*.py"))

        if not python_files:
            return []

        issues = []

        try:
            result = subprocess.run(
                [
                    "bandit",
                    "-r",
                    str(repository_path),
                    "-f",
                    "json",
                    "-q",
                ],
                capture_output=True,
                text=True,
                timeout=60,
                shell=False,
            )

        except FileNotFoundError:
            return [
                {
                    "severity": "LOW",
                    "category": "Security Tool",
                    "title": "Bandit is not installed",
                    "file": "",
                    "line": 1,
                    "description": (
                        "The Bandit security analyzer could not be "
                        "started on the server."
                    ),
                    "suggestion": (
                        "Install Bandit inside the RepoLens backend "
                        "virtual environment."
                    ),
                }
            ]

        except subprocess.TimeoutExpired:
            return [
                {
                    "severity": "MEDIUM",
                    "category": "Security Tool",
                    "title": "Security scan timed out",
                    "file": "",
                    "line": 1,
                    "description": (
                        "The Python security scan exceeded the "
                        "allowed analysis time."
                    ),
                    "suggestion": (
                        "Analyze the repository again or investigate "
                        "very large Python source trees."
                    ),
                }
            ]

        except OSError:
            return [
                {
                    "severity": "MEDIUM",
                    "category": "Security Tool",
                    "title": "Security scanner could not start",
                    "file": "",
                    "line": 1,
                    "description": (
                        "RepoLens could not start the Bandit "
                        "security analyzer."
                    ),
                    "suggestion": (
                        "Verify the backend virtual environment "
                        "and Bandit installation."
                    ),
                }
            ]

        raw_output = result.stdout.strip()

        if not raw_output:
            return issues

        try:
            report = json.loads(raw_output)

        except json.JSONDecodeError:
            return issues

        for finding in report.get("results", []):
            issue = self._convert_finding(
                finding,
                repository_path,
            )

            if issue:
                issues.append(issue)

        return issues

    def _convert_finding(
        self,
        finding: dict,
        repository_path: Path,
    ) -> dict | None:
        filename = finding.get("filename")

        if not filename:
            return None

        try:
            absolute_path = Path(filename)

            if not absolute_path.is_absolute():
                absolute_path = (
                    repository_path / absolute_path
                )

            relative_path = absolute_path.relative_to(
                repository_path
            )

            display_path = str(relative_path).replace(
                "\\",
                "/",
            )

        except ValueError:
            display_path = str(filename).replace(
                "\\",
                "/",
            )

        severity = (
            finding.get("issue_severity") or "LOW"
        ).upper()

        if severity not in {
            "HIGH",
            "MEDIUM",
            "LOW",
        }:
            severity = "LOW"

        issue_text = (
            finding.get("issue_text")
            or "Potential security issue detected."
        )

        more_info = finding.get(
            "more_info",
            "",
        )

        suggestion = (
            "Review this finding and apply the recommended "
            "secure coding practice."
        )

        if more_info:
            suggestion = (
                f"Review the Bandit guidance: {more_info}"
            )

        return {
            "severity": severity,
            "category": "Security",
            "title": issue_text,
            "file": display_path,
            "line": finding.get(
                "line_number",
                1,
            ),
            "description": issue_text,
            "suggestion": suggestion,
            "tool": "Bandit",
            "test_id": finding.get(
                "test_id",
                "",
            ),
            "confidence": finding.get(
                "issue_confidence",
                "UNKNOWN",
            ),
        }