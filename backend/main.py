from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.dependency_analyzer import DependencyAnalyzer
from services.groq_service import GroqService
from services.issue_scanner import IssueScanner
from services.quality_analyzer import QualityAnalyzer
from services.repository_scanner import RepositoryScanner
from services.scoring_service import ScoringService
from services.security_analyzer import SecurityAnalyzer
from services.bug_investigator import (
    BugInvestigator,
    InvestigationRequest,
)


app = FastAPI(
    title="RepoLens API",
    version="1.0.0",
    description=(
        "Backend for the RepoLens AI-powered "
        "repository analyzer"
    ),
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://repolens-frontend-ahlv.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepositoryRequest(BaseModel):
    url: str


class IssueAIRequest(BaseModel):
    issue: dict


class RepositoryChatRequest(BaseModel):
    question: str
    repository_context: dict
    history: list[dict] = Field(default_factory=list)


groq_service = GroqService()
bug_investigator = BugInvestigator(groq_service)


@app.get("/")
def root():
    return {
        "message": "RepoLens API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/api/ai/status")
def ai_status():
    return {
        "configured": groq_service.is_configured(),
        "model": groq_service.model,
    }


@app.get("/api/ai/test")
def ai_test():
    try:
        answer = groq_service.test_connection()

        return {
            "success": True,
            "answer": answer,
            "model": groq_service.model,
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected AI error: {error}",
        )


@app.post("/api/ai/explain")
def explain_issue(
    request: IssueAIRequest,
):
    try:
        answer = groq_service.explain_issue(
            request.issue
        )

        return {
            "success": True,
            "answer": answer,
            "model": groq_service.model,
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected AI error: {error}",
        )


@app.post("/api/ai/fix")
def generate_fix(
    request: IssueAIRequest,
):
    try:
        answer = groq_service.generate_fix(
            request.issue
        )

        return {
            "success": True,
            "answer": answer,
            "model": groq_service.model,
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected AI error: {error}",
        )


@app.post("/api/ai/chat")
def chat_about_repository(
    request: RepositoryChatRequest,
):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question is required.",
        )

    try:
        answer = groq_service.chat_about_repository(
            question=question,
            repository_context=request.repository_context,
            history=request.history,
        )

        return {
            "success": True,
            "answer": answer,
            "model": groq_service.model,
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected AI error: {error}",
        )


@app.get("/api/investigate/scenarios")
def get_investigation_scenarios():
    try:
        scenarios = bug_investigator.get_sample_scenarios()

        return {
            "success": True,
            "scenarios": scenarios,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to fetch sample scenarios: "
                f"{error}"
            ),
        )


@app.post("/api/investigate/diagnose")
def investigate_bug(
    request: InvestigationRequest,
):
    try:
        diagnosis = bug_investigator.diagnose(
            request
        )

        return {
            "success": True,
            "diagnosis": diagnosis.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Investigation failed: {error}",
        )


@app.post("/api/repositories/analyze")
def analyze_repository(
    request: RepositoryRequest,
):
    repository_url = request.url.strip()

    if not repository_url:
        raise HTTPException(
            status_code=400,
            detail="Repository URL is required.",
        )

    parsed = urlparse(repository_url)

    if parsed.scheme not in {
        "http",
        "https",
    }:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid GitHub URL.",
        )

    if parsed.netloc.lower() not in {
        "github.com",
        "www.github.com",
    }:
        raise HTTPException(
            status_code=400,
            detail="Only GitHub repository URLs are supported.",
        )

    parts = [
        part
        for part in parsed.path.strip("/").split("/")
        if part
    ]

    if len(parts) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "Use a URL such as "
                "https://github.com/user/repository"
            ),
        )

    owner = parts[0]
    repository = parts[1].removesuffix(".git")

    if not owner or not repository:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL.",
        )

    github_api_url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repository}"
    )

    github_request = Request(
        github_api_url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "RepoLens",
        },
    )

    try:
        with urlopen(
            github_request,
            timeout=10,
        ) as response:
            data = response.read().decode("utf-8")

    except HTTPError as error:
        try:
            error_body = error.read().decode("utf-8")
        except Exception:
            error_body = ""

        print(f"GitHub API error: {error.code}")
        print(f"GitHub response: {error_body}")

        if error.code == 404:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Repository not found. "
                    "Make sure it is public and the URL "
                    "is correct."
                ),
            )

        if error.code == 401:
            raise HTTPException(
                status_code=502,
                detail="GitHub authentication failed.",
            )

        if error.code == 403:
            raise HTTPException(
                status_code=502,
                detail=(
                    "GitHub API access was denied "
                    "or rate limited. "
                    f"GitHub response: "
                    f"{error_body or error.reason}"
                ),
            )

        raise HTTPException(
            status_code=502,
            detail=(
                f"GitHub API error {error.code}: "
                f"{error_body or error.reason}"
            ),
        )

    except URLError as error:
        print(f"GitHub connection error: {error}")

        raise HTTPException(
            status_code=503,
            detail="Could not connect to GitHub.",
        )

    except TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="GitHub request timed out.",
        )

    try:
        repo_data = json.loads(data)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="GitHub returned an invalid response.",
        )

    scanner = RepositoryScanner()

    try:
        print(
            f"Starting repository analysis: "
            f"{repository_url}"
        )

        repository_path = scanner.clone_repository(
            repository_url
        )

        print(
            f"Repository cloned successfully: "
            f"{repository_path}"
        )

        files = scanner.scan_files(
            repository_path
        )

        print(
            f"Files scanned: {len(files)}"
        )

        custom_issue_scanner = IssueScanner()

        custom_issues = custom_issue_scanner.scan(
            files
        )

        security_analyzer = SecurityAnalyzer()

        security_issues = security_analyzer.analyze(
            repository_path
        )

        dependency_analyzer = DependencyAnalyzer()

        dependency_result = dependency_analyzer.analyze(
            repository_path
        )

        dependency_issues = dependency_result["issues"]

        quality_analyzer = QualityAnalyzer()

        quality_issues = quality_analyzer.analyze(
            repository_path
        )

        all_issues = (
            custom_issues
            + security_issues
            + dependency_issues
            + quality_issues
        )

        all_issues = _remove_duplicate_issues(
            all_issues
        )

        severity_counts = {
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
        }

        category_counts = {}

        for issue in all_issues:
            severity = issue.get(
                "severity",
                "LOW",
            )

            if severity in severity_counts:
                severity_counts[severity] += 1

            category = issue.get(
                "category",
                "Other",
            )

            category_counts[category] = (
                category_counts.get(
                    category,
                    0,
                )
                + 1
            )

        print(
            f"Analysis completed successfully. "
            f"Issues found: {len(all_issues)}"
        )

        # Calculate scores using the scoring service
        scoring_service = ScoringService()

        scores = scoring_service.calculate_scores(
            repo_data=repo_data,
            all_issues=all_issues,
            category_counts=category_counts,
            files=files,
        )

        # Add methodology to scores
        scores["methodology"] = scoring_service.get_methodology()

        # Extract architecture information
        architecture = scanner.get_architecture(
            repository_path
        )

    except ValueError as error:
        print(
            f"Repository analysis ValueError: {error}"
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(
            f"Repository analysis failed: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Repository analysis failed: "
                f"{error}"
            ),
        )

    finally:
        scanner.cleanup()

    return {
        "name": repo_data.get("name"),
        "full_name": repo_data.get("full_name"),
        "description": repo_data.get("description"),
        "default_branch": repo_data.get(
            "default_branch"
        ),
        "stars": repo_data.get(
            "stargazers_count",
            0,
        ),
        "forks": repo_data.get(
            "forks_count",
            0,
        ),
        "open_issues": repo_data.get(
            "open_issues_count",
            0,
        ),
        "language": repo_data.get(
            "language"
        ),
        "private": repo_data.get(
            "private",
            False,
        ),
        "html_url": repo_data.get(
            "html_url"
        ),
        "files_scanned": len(files),
        "issues_found": len(all_issues),
        "issues": all_issues,
        "severity_counts": severity_counts,
        "category_counts": category_counts,
        "dependencies": {
            "python": dependency_result[
                "python_dependencies"
            ],
            "javascript": dependency_result[
                "javascript_dependencies"
            ],
            "total": dependency_result[
                "total_dependencies"
            ],
        },
        "scores": scores,
        "architecture": architecture,
    }


def _remove_duplicate_issues(
    issues: list[dict],
) -> list[dict]:
    seen = set()
    unique_issues = []

    for issue in issues:
        key = (
            issue.get("severity"),
            issue.get("category"),
            issue.get("title"),
            issue.get("file"),
            issue.get("line"),
        )

        if key in seen:
            continue

        seen.add(key)
        unique_issues.append(issue)

    return unique_issues