"""
Scoring Service for RepoLens Repository Analysis

Provides transparent, category-based scoring for repositories.
All scores are calculated based on actual analysis findings.
"""

from pathlib import Path
from typing import Any


# Scoring category weights for overall score calculation
SCORE_WEIGHTS = {
    "code_quality": 0.25,
    "security": 0.30,
    "repository_health": 0.20,
    "documentation": 0.15,
    "maintainability": 0.10,
}

# Severity multipliers per category
SEVERITY_MULTIPLIERS = {
    "Code Quality": {
        "HIGH": 20,
        "MEDIUM": 8,
        "LOW": 3,
    },
    "Security": {
        "HIGH": 25,
        "MEDIUM": 10,
        "LOW": 2,
    },
    "Dependency Hygiene": {
        "HIGH": 15,
        "MEDIUM": 5,
        "LOW": 1,
    },
}


class ScoringService:
    """Calculates repository scores based on analysis findings."""

    def calculate_scores(
        self,
        repo_data: dict[str, Any],
        all_issues: list[dict],
        category_counts: dict[str, int],
        files: list[dict],
    ) -> dict[str, Any]:
        """
        Calculate all repository scores.

        Args:
            repo_data: Repository metadata from GitHub API
            all_issues: List of all detected issues
            category_counts: Count of issues per category
            files: List of scanned file dictionaries with 'path' key

        Returns:
            Dictionary containing all scores and explanations
        """
        # Calculate individual category scores
        code_quality = self._calculate_code_quality(
            all_issues
        )
        security = self._calculate_security(all_issues)
        repository_health = self._calculate_repository_health(
            repo_data, all_issues
        )
        documentation = self._calculate_documentation(files)
        maintainability = self._calculate_maintainability(
            all_issues
        )

        # Calculate overall score as weighted average
        overall = self._calculate_overall_score(
            code_quality,
            security,
            repository_health,
            documentation,
            maintainability,
        )

        return {
            "overall": overall,
            "code_quality": code_quality,
            "security": security,
            "repository_health": repository_health,
            "documentation": documentation,
            "maintainability": maintainability,
        }

    def _calculate_code_quality(
        self, issues: list[dict]
    ) -> dict[str, Any]:
        """Calculate code quality score based on 'Code Quality' category issues."""
        return self._calculate_category_score(issues, "Code Quality")

    def _calculate_security(
        self, issues: list[dict]
    ) -> dict[str, Any]:
        """Calculate security score based on 'Security' category issues."""
        return self._calculate_category_score(issues, "Security")

    def _calculate_category_score(
        self, issues: list[dict], category: str
    ) -> dict[str, Any]:
        """
        Calculate a score for a specific category.

        Args:
            issues: List of all issues
            category: Category to calculate score for

        Returns:
            Dict with score, status, and explanation factors
        """
        category_issues = [
            i for i in issues if i.get("category") == category
        ]

        high_count = sum(
            1 for i in category_issues if i.get("severity") == "HIGH"
        )
        medium_count = sum(
            1 for i in category_issues if i.get("severity") == "MEDIUM"
        )
        low_count = sum(
            1 for i in category_issues if i.get("severity") == "LOW"
        )

        multipliers = SEVERITY_MULTIPLIERS.get(category, {})

        deduction = (
            high_count * multipliers.get("HIGH", 15)
            + medium_count * multipliers.get("MEDIUM", 8)
            + low_count * multipliers.get("LOW", 3)
        )

        score = max(0, min(100, 100 - deduction))

        # Generate explanation factors
        positive_factors: list[str] = []
        negative_factors: list[str] = []

        if high_count == 0:
            positive_factors.append(
                f"No high-severity {category.lower()} issues"
            )
        else:
            negative_factors.append(
                f"{high_count} high-severity {category.lower()} issue(s) found"
            )

        if medium_count > 0:
            negative_factors.append(
                f"{medium_count} medium-severity {category.lower()} issue(s)"
            )

        if low_count > 0:
            negative_factors.append(
                f"{low_count} low-severity {category.lower()} issue(s)"
            )

        if len(category_issues) == 0:
            positive_factors.append(
                f"No {category.lower()} issues detected"
            )

        status = self._get_status(score)

        return {
            "score": score,
            "status": status,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
        }

    def _calculate_repository_health(
        self, repo_data: dict[str, Any], issues: list[dict]
    ) -> dict[str, Any]:
        """
        Calculate repository health score based on activity indicators.
        """
        positive_factors: list[str] = []
        negative_factors: list[str] = []

        stars = repo_data.get("stargazers_count", 0)
        forks = repo_data.get("forks_count", 0)
        open_issues = repo_data.get("open_issues_count", 0)
        files_scanned = len(issues)  # Approximate based on issues

        # Base score
        score = 100

        # Issue density penalty
        if files_scanned > 0:
            density = len(issues) / files_scanned
            if density > 0.1:
                deduction = 30
            elif density > 0.05:
                deduction = 20
            elif density > 0.02:
                deduction = 10
            else:
                deduction = 0
                positive_factors.append(
                    "Low issue density relative to codebase"
                )
            score -= deduction

        # Community activity indicators
        if stars > 100:
            positive_factors.append(f"Active community ({stars} stars)")
        elif stars > 0:
            positive_factors.append(f"Some community interest ({stars} stars)")

        if forks > 10:
            positive_factors.append(f"Forked {forks} times")

        # Open issues concern
        if open_issues > 50:
            negative_factors.append(
                f"Many open issues ({open_issues}) may need attention"
            )
        elif open_issues > 0:
            negative_factors.append(
                f"{open_issues} open issue(s) on GitHub"
            )

        score = max(0, min(100, score))
        status = self._get_status(score)

        return {
            "score": score,
            "status": status,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
        }

    def _calculate_documentation(
        self, files: list[dict]
    ) -> dict[str, Any]:
        """
        Calculate documentation score based on presence of doc files.
        """
        positive_factors: list[str] = []
        negative_factors: list[str] = []

        # Check for documentation files
        has_readme = False
        has_contributing = False
        md_file_count = 0

        for file_data in files:
            path = file_data.get("path", "").lower()

            if "readme" in path:
                has_readme = True
                md_file_count += 1
            elif "contributing" in path:
                has_contributing = True
                md_file_count += 1
            elif path.endswith((".md", ".markdown", ".rst", ".txt")):
                md_file_count += 1

        # Base score is 50 (neutral - we don't deeply analyze doc quality)
        score = 50

        if has_readme:
            score += 30
            positive_factors.append("README documentation found")
        else:
            negative_factors.append("No README documentation detected")

        if has_contributing:
            score += 10
            positive_factors.append("CONTRIBUTING guidelines found")

        if md_file_count > 2:
            score += 10
            positive_factors.append(
                f"{md_file_count} documentation files present"
            )

        score = min(100, score)
        status = self._get_status(score)

        return {
            "score": score,
            "status": status,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
        }

    def _calculate_maintainability(
        self, issues: list[dict]
    ) -> dict[str, Any]:
        """
        Calculate maintainability score based on code complexity indicators.
        """
        positive_factors: list[str] = []
        negative_factors: list[str] = []

        # Count issues that affect maintainability
        quality_issues = [
            i for i in issues if i.get("category") == "Code Quality"
        ]
        dependency_issues = [
            i
            for i in issues
            if i.get("category") == "Dependency Hygiene"
        ]

        high_quality = sum(
            1 for i in quality_issues if i.get("severity") == "HIGH"
        )
        medium_quality = sum(
            1 for i in quality_issues if i.get("severity") == "MEDIUM"
        )
        low_quality = sum(
            1 for i in quality_issues if i.get("severity") == "LOW"
        )

        high_dep = sum(
            1 for i in dependency_issues if i.get("severity") == "HIGH"
        )
        medium_dep = sum(
            1 for i in dependency_issues if i.get("severity") == "MEDIUM"
        )
        low_dep = sum(
            1 for i in dependency_issues if i.get("severity") == "LOW"
        )

        # Base score
        score = 100

        # Deduct for quality issues
        deduction = high_quality * 10 + medium_quality * 5 + low_quality * 2
        score -= deduction

        # Deduct for dependency issues
        dep_deduction = (
            high_dep * 5 + medium_dep * 2 + low_dep * 1
        )
        score -= dep_deduction

        # Add positive factors
        if high_quality == 0 and medium_quality == 0:
            positive_factors.append(
                "No complex code issues detected"
            )

        if len(dependency_issues) == 0:
            positive_factors.append("Dependencies are well-managed")

        # Add negative factors
        if high_quality > 0:
            negative_factors.append(
                f"{high_quality} high-complexity code issue(s)"
            )
        if medium_quality > 0:
            negative_factors.append(
                f"{medium_quality} moderate complexity concern(s)"
            )

        score = max(0, min(100, score))
        status = self._get_status(score)

        return {
            "score": score,
            "status": status,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
        }

    def _calculate_overall_score(
        self,
        code_quality: dict[str, Any],
        security: dict[str, Any],
        repository_health: dict[str, Any],
        documentation: dict[str, Any],
        maintainability: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Calculate overall repository score as weighted average.
        """
        weighted_sum = (
            code_quality["score"] * SCORE_WEIGHTS["code_quality"]
            + security["score"] * SCORE_WEIGHTS["security"]
            + repository_health["score"]
            * SCORE_WEIGHTS["repository_health"]
            + documentation["score"] * SCORE_WEIGHTS["documentation"]
            + maintainability["score"]
            * SCORE_WEIGHTS["maintainability"]
        )

        return {
            "score": max(0, min(100, round(weighted_sum))),
            "status": self._get_status(weighted_sum),
            "breakdown": {
                "code_quality": {
                    "score": code_quality["score"],
                    "weight": SCORE_WEIGHTS["code_quality"],
                    "contribution": round(
                        code_quality["score"]
                        * SCORE_WEIGHTS["code_quality"]
                    ),
                },
                "security": {
                    "score": security["score"],
                    "weight": SCORE_WEIGHTS["security"],
                    "contribution": round(
                        security["score"] * SCORE_WEIGHTS["security"]
                    ),
                },
                "repository_health": {
                    "score": repository_health["score"],
                    "weight": SCORE_WEIGHTS["repository_health"],
                    "contribution": round(
                        repository_health["score"]
                        * SCORE_WEIGHTS["repository_health"]
                    ),
                },
                "documentation": {
                    "score": documentation["score"],
                    "weight": SCORE_WEIGHTS["documentation"],
                    "contribution": round(
                        documentation["score"]
                        * SCORE_WEIGHTS["documentation"]
                    ),
                },
                "maintainability": {
                    "score": maintainability["score"],
                    "weight": SCORE_WEIGHTS["maintainability"],
                    "contribution": round(
                        maintainability["score"]
                        * SCORE_WEIGHTS["maintainability"]
                    ),
                },
            },
        }

    def _get_status(self, score: float) -> str:
        """
        Convert numeric score to status label.

        Args:
            score: Numeric score from 0-100

        Returns:
            Status label: Poor, Needs Improvement, Good, or Excellent
        """
        if score >= 80:
            return "Excellent"
        if score >= 60:
            return "Good"
        if score >= 40:
            return "Needs Improvement"
        return "Poor"

    def get_methodology(self) -> str:
        """Return a description of how scores are calculated."""
        return (
            "Overall score = 25% Code Quality + 30% Security + 20% "
            "Repository Health + 15% Documentation + 10% Maintainability. "
            "Category scores are calculated by deducting points based on "
            "issue severity and count within each category. See individual "
            "scores for details."
        )