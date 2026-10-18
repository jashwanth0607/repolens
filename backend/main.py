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
repository_scanner = RepositoryScanner()
quality_analyzer = QualityAnalyzer()
security_analyzer = SecurityAnalyzer()
dependency_analyzer = DependencyAnalyzer()
issue_scanner = IssueScanner()
scoring_service = ScoringService()


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
    """Return pre-configured bug scenarios with tests and code for one-click investigation."""
    try:
        scenarios = bug_investigator.get_sample_scenarios()
        return {
            "success": True,
            "scenarios": scenarios,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch sample scenarios: {error}",
        )


@app.post("/api/repositories/analyze")
def analyze_repository(request: RepositoryRequest):
    """
    Clone a public GitHub repository, scan files and dependencies, run quality and security checks,
    calculate multi-axis scores, and return the complete repository audit report.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Repository URL is required.")

    scanner = RepositoryScanner()
    try:
        repo_path = scanner.clone_repository(url)
        files = scanner.scan_files(repo_path)
        architecture = scanner.get_architecture(repo_path)

        # Run analyzers
        quality_issues = quality_analyzer.analyze(repo_path)
        security_issues = security_analyzer.analyze(repo_path)
        heuristic_issues = issue_scanner.scan(files)
        dependency_result = dependency_analyzer.analyze(repo_path)
        dep_issues = dependency_result.get("issues", [])

        all_issues = quality_issues + security_issues + heuristic_issues + dep_issues

        # Count severities
        severity_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        category_counts = {}

        for issue in all_issues:
            sev = issue.get("severity", "LOW")
            if sev in severity_counts:
                severity_counts[sev] += 1
            cat = issue.get("category", "General")
            category_counts[cat] = category_counts.get(cat, 0) + 1

        # Extract basic repo info from URL
        path_parts = url.rstrip("/").split("/")
        repo_name = path_parts[-1] if path_parts else "repository"
        owner = path_parts[-2] if len(path_parts) > 1 else "owner"
        full_name = f"{owner}/{repo_name}"

        repo_metadata = {
            "name": repo_name,
            "full_name": full_name,
            "description": f"Audited repository from {url}",
            "default_branch": "main",
            "stargazers_count": 0,
            "forks_count": 0,
            "open_issues_count": len(all_issues),
            "language": files[0]["extension"] if files else "Multi-language",
            "private": False,
            "html_url": url,
        }

        scores = scoring_service.calculate_scores(
            repo_metadata, all_issues, category_counts, files
        )
        scores["methodology"] = scoring_service.get_methodology()

        repository_response = {
            "name": repo_name,
            "full_name": full_name,
            "description": repo_metadata["description"],
            "default_branch": "main",
            "stars": 0,
            "forks": 0,
            "open_issues": len(all_issues),
            "language": repo_metadata["language"],
            "private": False,
            "html_url": url,
            "files_scanned": len(files),
            "issues_found": len(all_issues),
            "issues": all_issues,
            "severity_counts": severity_counts,
            "category_counts": category_counts,
            "dependencies": {
                "python": dependency_result.get("python_dependencies", 0),
                "javascript": dependency_result.get("javascript_dependencies", 0),
                "total": dependency_result.get("total_dependencies", 0),
            },
            "scores": scores,
            "architecture": architecture,
        }

        return repository_response

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Repository analysis failed: {error}")
    finally:
        scanner.cleanup()
