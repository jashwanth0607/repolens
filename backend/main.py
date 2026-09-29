import os
import json
import tempfile
import shutil
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.repository_scanner import RepositoryScanner
from services.groq_service import GroqService
from services.issue_scanner import IssueScanner
from services.quality_analyzer import QualityAnalyzer
from services.security_analyzer import SecurityAnalyzer
from services.dependency_analyzer import DependencyAnalyzer


app = FastAPI(
    title="RepoLens API",
    description="AI-powered GitHub repository analysis platform",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://repolens.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Services
# ---------------------------------------------------------

groq_service = GroqService()
issue_scanner = IssueScanner()
quality_analyzer = QualityAnalyzer()
security_analyzer = SecurityAnalyzer()
dependency_analyzer = DependencyAnalyzer()


# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------

class RepositoryRequest(BaseModel):
    url: str


class AIRequest(BaseModel):
    prompt: str


class FixRequest(BaseModel):
    issue: dict


class BugInvestigationRequest(BaseModel):
    repository_url: str
    file_path: str | None = None
    error_message: str


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "RepoLens API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ---------------------------------------------------------
# GitHub URL Validation
# ---------------------------------------------------------

def validate_github_url(repository_url: str):
    parsed = urlparse(repository_url)

    if parsed.scheme not in ["http", "https"]:
        raise HTTPException(
            status_code=400,
            detail="Repository URL must start with http:// or https://"
        )

    if parsed.netloc.lower() not in [
        "github.com",
        "www.github.com",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Only GitHub repository URLs are supported."
        )

    path_parts = [
        part for part in parsed.path.strip("/").split("/")
        if part
    ]

    if len(path_parts) < 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL."
        )

    owner = path_parts[0]
    repository = path_parts[1]

    if repository.endswith(".git"):
        repository = repository[:-4]

    if not owner or not repository:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL."
        )

    return owner, repository


# ---------------------------------------------------------
# Repository Analysis
# ---------------------------------------------------------

@app.post("/api/repositories/analyze")
def analyze_repository(request: RepositoryRequest):

    repository_url = request.url.strip()

    owner, repository = validate_github_url(repository_url)

    # -----------------------------------------------------
    # Get repository information from GitHub API
    # -----------------------------------------------------

    github_api_url = (
        f"https://api.github.com/repos/{owner}/{repository}"
    )

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "RepoLens",
    }

    github_token = os.getenv("GITHUB_TOKEN")

    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    github_request = Request(
        github_api_url,
        headers=headers,
        method="GET",
    )

    try:
        with urlopen(github_request, timeout=10) as response:
            repository_data = json.loads(
                response.read().decode("utf-8")
            )

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
                    "Make sure the repository is public "
                    "and the URL is correct."
                ),
            )

        if error.code == 401:
            raise HTTPException(
                status_code=502,
                detail=(
                    "GitHub authentication failed. "
                    "Check the GITHUB_TOKEN configured on the backend."
                ),
            )

        if error.code == 403:
            raise HTTPException(
                status_code=502,
                detail=(
                    "GitHub API access was denied or rate limited. "
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
            detail="Could not connect to GitHub."
        )

    except TimeoutError:

        raise HTTPException(
            status_code=504,
            detail="GitHub request timed out."
        )

    except Exception as error:

        print(f"Unexpected GitHub API error: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"Unexpected GitHub API error: {error}"
        )

    # -----------------------------------------------------
    # Clone repository
    # -----------------------------------------------------

    temporary_directory = tempfile.mkdtemp(
        prefix="repolens_"
    )

    try:

        scanner = RepositoryScanner()

        repository_path = scanner.clone_repository(
            repository_url,
            temporary_directory,
        )

        # -------------------------------------------------
        # Scan repository
        # -------------------------------------------------

        scan_result = scanner.scan_repository(
            repository_path
        )

        # -------------------------------------------------
        # Detect issues
        # -------------------------------------------------

        issues = issue_scanner.scan(
            repository_path
        )

        # -------------------------------------------------
        # Quality analysis
        # -------------------------------------------------

        quality_result = quality_analyzer.analyze(
            repository_path
        )

        # -------------------------------------------------
        # Security analysis
        # -------------------------------------------------

        security_result = security_analyzer.analyze(
            repository_path
        )

        # -------------------------------------------------
        # Dependency analysis
        # -------------------------------------------------

        dependency_result = dependency_analyzer.analyze(
            repository_path
        )

        # -------------------------------------------------
        # Build response
        # -------------------------------------------------

        result = {
            "full_name": repository_data.get(
                "full_name",
                f"{owner}/{repository}"
            ),
            "name": repository_data.get(
                "name",
                repository
            ),
            "description": repository_data.get(
                "description"
            ),
            "html_url": repository_data.get(
                "html_url",
                repository_url
            ),
            "language": repository_data.get(
                "language"
            ),
            "default_branch": repository_data.get(
                "default_branch",
                "main"
            ),
            "stars": repository_data.get(
                "stargazers_count",
                0
            ),
            "forks": repository_data.get(
                "forks_count",
                0
            ),
            "issues": issues,
            "issues_found": len(issues),
            "severity_counts": {
                "HIGH": sum(
                    1
                    for issue in issues
                    if str(
                        issue.get("severity", "")
                    ).upper()
                    == "HIGH"
                ),
                "MEDIUM": sum(
                    1
                    for issue in issues
                    if str(
                        issue.get("severity", "")
                    ).upper()
                    == "MEDIUM"
                ),
                "LOW": sum(
                    1
                    for issue in issues
                    if str(
                        issue.get("severity", "")
                    ).upper()
                    == "LOW"
                ),
            },
            "category_counts": {},
            "dependencies": dependency_result,
            "quality": quality_result,
            "security": security_result,
            "scan": scan_result,
        }

        # -------------------------------------------------
        # Category counts
        # -------------------------------------------------

        category_counts = {}

        for issue in issues:
            category = issue.get(
                "category",
                "Other"
            )

            category_counts[category] = (
                category_counts.get(category, 0) + 1
            )

        result["category_counts"] = category_counts

        return result

    except ValueError as error:

        print(f"Repository analysis error: {error}")

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        print(
            f"Unexpected repository analysis error: "
            f"{error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to analyze repository. "
                f"Error: {error}"
            )
        )

    finally:

        try:
            shutil.rmtree(
                temporary_directory,
                ignore_errors=True
            )
        except Exception:
            pass


# ---------------------------------------------------------
# AI Test
# ---------------------------------------------------------

@app.post("/api/ai/test")
def test_ai(request: AIRequest):

    try:

        response = groq_service.generate_response(
            request.prompt
        )

        if not response:
            raise HTTPException(
                status_code=503,
                detail="Groq returned an empty response."
            )

        return {
            "response": response
        }

    except HTTPException:
        raise

    except Exception as error:

        print(f"AI test error: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"AI request failed: {error}"
        )


# ---------------------------------------------------------
# AI Explain Issue
# ---------------------------------------------------------

@app.post("/api/ai/explain")
def explain_issue(request: AIRequest):

    try:

        response = groq_service.generate_response(
            request.prompt
        )

        if not response:
            raise HTTPException(
                status_code=503,
                detail="Groq returned an empty response."
            )

        return {
            "explanation": response
        }

    except HTTPException:
        raise

    except Exception as error:

        print(f"AI explanation error: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"AI explanation failed: {error}"
        )


# ---------------------------------------------------------
# AI Fix Issue
# ---------------------------------------------------------

@app.post("/api/ai/fix")
def fix_issue(request: FixRequest):

    try:

        issue = request.issue

        prompt = f"""
You are a senior software engineer.

Analyze the following repository issue and suggest a
clear and practical fix.

Issue:
{json.dumps(issue, indent=2)}

Provide:

1. What the issue means
2. Why it happens
3. How to fix it
4. Example corrected code if applicable

Keep the explanation beginner-friendly.
"""

        response = groq_service.generate_response(
            prompt
        )

        if not response:
            raise HTTPException(
                status_code=503,
                detail="Groq returned an empty response."
            )

        return {
            "fix": response
        }

    except HTTPException:
        raise

    except Exception as error:

        print(f"AI fix error: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"AI fix failed: {error}"
        )


# ---------------------------------------------------------
# Bug Investigation
# ---------------------------------------------------------

@app.post("/api/bug-investigator")
def investigate_bug(
    request: BugInvestigationRequest
):

    try:

        prompt = f"""
You are a software debugging assistant.

Repository:
{request.repository_url}

File:
{request.file_path or "Not specified"}

Error:
{request.error_message}

Analyze the error and provide:

1. Root cause
2. Why it happens
3. Step-by-step fix
4. Corrected code if possible
5. Prevention tips

Keep the explanation simple and practical.
"""

        response = groq_service.generate_response(
            prompt
        )

        if not response:
            raise HTTPException(
                status_code=503,
                detail="Groq returned an empty response."
            )

        return {
            "analysis": response
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            f"Bug investigation error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Bug investigation failed: {error}"
            )
        )


# ---------------------------------------------------------
# Repository Information
# ---------------------------------------------------------

@app.get("/api/repositories/info")
def repository_info(url: str):

    owner, repository = validate_github_url(url)

    github_api_url = (
        f"https://api.github.com/repos/{owner}/{repository}"
    )

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "RepoLens",
    }

    github_token = os.getenv("GITHUB_TOKEN")

    if github_token:
        headers["Authorization"] = (
            f"Bearer {github_token}"
        )

    github_request = Request(
        github_api_url,
        headers=headers,
        method="GET",
    )

    try:

        with urlopen(
            github_request,
            timeout=10
        ) as response:

            data = json.loads(
                response.read().decode("utf-8")
            )

        return {
            "name": data.get("name"),
            "full_name": data.get("full_name"),
            "description": data.get("description"),
            "html_url": data.get("html_url"),
            "language": data.get("language"),
            "default_branch": data.get(
                "default_branch"
            ),
            "stars": data.get(
                "stargazers_count",
                0
            ),
            "forks": data.get(
                "forks_count",
                0
            ),
        }

    except HTTPError as error:

        try:
            error_body = error.read().decode(
                "utf-8"
            )
        except Exception:
            error_body = ""

        print(
            f"GitHub info API error: "
            f"{error.code}"
        )
        print(
            f"GitHub response: "
            f"{error_body}"
        )

        if error.code == 404:
            raise HTTPException(
                status_code=404,
                detail="Repository not found."
            )

        raise HTTPException(
            status_code=502,
            detail=(
                f"GitHub API error {error.code}: "
                f"{error_body or error.reason}"
            )
        )

    except URLError as error:

        raise HTTPException(
            status_code=503,
            detail=(
                f"Could not connect to GitHub: "
                f"{error}"
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )