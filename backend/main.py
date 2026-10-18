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


@app.post("/api/investigate/diagnose")
def investigate_bug(
    request: InvestigationRequest,
):
    """
    Given a repository context, bug report, and available tests,
    investigate the likely cause and provide an evidence-backed diagnosis.
    """
    try:
        diagnosis = bug_investigator.diagnose(request)

        return {
            "success": True,
            "diagnosis": diagnosis.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Investigation failed: {error}",
        )
