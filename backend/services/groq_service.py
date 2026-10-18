import json
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# Load the backend .env file explicitly.
BACKEND_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)


class GroqService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if api_key:
            api_key = (
                api_key.strip()
                .strip('"')
                .strip("'")
            )

        self.api_key = api_key

        self.model = os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-20b",
        ).strip()

        self.client = None

        if self.api_key:
            self.client = Groq(
                api_key=self.api_key
            )

    def is_configured(self) -> bool:
        return bool(
            self.client is not None
            and self.api_key
        )

    def test_connection(self) -> str:
        self._check_configuration()

        try:
            response = (
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "user",
                            "content": (
                                "Reply with exactly: "
                                "RepoLens AI is working."
                            ),
                        }
                    ],
                    temperature=0,
                    max_completion_tokens=256,
                    include_reasoning=False,
                    stream=False,
                )
            )

        except Exception as error:
            raise RuntimeError(
                self._format_error(error)
            ) from error

        return self._extract_answer(response)

    def explain_issue(
        self,
        issue: dict,
    ) -> str:
        self._check_configuration()

        prompt = self._build_issue_prompt(
            issue
        )

        try:
            response = (
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are RepoLens, a senior "
                                "software engineer helping "
                                "developers understand "
                                "static-analysis findings. "
                                "Be accurate and concise. "
                                "Do not invent repository facts."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=0.2,
                    max_completion_tokens=1200,
                    include_reasoning=False,
                    stream=False,
                )
            )

        except Exception as error:
            raise RuntimeError(
                self._format_error(error)
            ) from error

        return self._extract_answer(response)

    def generate_fix(
        self,
        issue: dict,
    ) -> str:
        self._check_configuration()

        prompt = self._build_fix_prompt(
            issue
        )

        try:
            response = (
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are RepoLens, a senior "
                                "software engineer generating "
                                "safe suggested fixes for "
                                "static-analysis findings. "
                                "Do not claim that you changed "
                                "the repository."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=0.1,
                    max_completion_tokens=1600,
                    include_reasoning=False,
                    stream=False,
                )
            )

        except Exception as error:
            raise RuntimeError(
                self._format_error(error)
            ) from error

        return self._extract_answer(response)

    def chat_about_repository(
        self,
        question: str,
        repository_context: dict,
        history: list[dict] | None = None,
    ) -> str:
        self._check_configuration()

        prompt = self._build_repository_chat_prompt(
            question=question,
            repository_context=repository_context,
            history=history or [],
        )

        try:
            response = (
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are RepoLens, a senior "
                                "software architecture and code "
                                "review assistant. Answer the "
                                "developer's repository questions "
                                "using only the supplied RepoLens "
                                "analysis context. Be specific, "
                                "evidence-backed, and helpful. "
                                "If the supplied context is not "
                                "enough to know something, say what "
                                "is missing instead of inventing it. "
                                "Prefer structured answers with "
                                "priorities, rationale, and concrete "
                                "next steps."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=0.25,
                    max_completion_tokens=2400,
                    include_reasoning=False,
                    stream=False,
                )
            )

        except Exception as error:
            raise RuntimeError(
                self._format_error(error)
            ) from error

        return self._extract_answer(response)

    def _extract_answer(
        self,
        response,
    ) -> str:
        if not response.choices:
            raise RuntimeError(
                "Groq returned no choices."
            )

        choice = response.choices[0]
        message = choice.message

        content = getattr(
            message,
            "content",
            None,
        )

        if content:
            answer = content.strip()
            finish_reason = getattr(
                choice,
                "finish_reason",
                None,
            )

            if finish_reason == "length":
                answer += (
                    "\n\nNote: the model reached its response "
                    "limit before finishing. Ask a narrower "
                    "follow-up question for more detail."
                )

            return answer

        reasoning = getattr(
            message,
            "reasoning",
            None,
        )

        if reasoning:
            return (
                "The model returned reasoning but no "
                "final answer. Please try again."
            )

        raise RuntimeError(
            "Groq returned an empty response."
        )

    def _check_configuration(self):
        if not self.api_key:
            raise RuntimeError(
                "GROQ_API_KEY is missing. "
                "Add your Groq API key to backend/.env."
            )

        if not self.client:
            raise RuntimeError(
                "Groq client could not be initialized."
            )

        if not self.model:
            raise RuntimeError(
                "GROQ_MODEL is empty."
            )

    def _format_error(
        self,
        error: Exception,
    ) -> str:
        error_type = type(error).__name__

        return (
            f"Groq error ({error_type}): "
            f"{error}"
        )

    def _build_issue_prompt(
        self,
        issue: dict,
    ) -> str:
        return f"""
Explain this repository finding.

Category:
{issue.get("category", "Unknown")}

Severity:
{issue.get("severity", "Unknown")}

Title:
{issue.get("title", "Unknown")}

File:
{issue.get("file", "Unknown")}

Line:
{issue.get("line", 1)}

Description:
{issue.get("description", "")}

Existing recommendation:
{issue.get("suggestion", "")}

Use these sections:

What was detected
Why it matters
How to fix it
What to check next

Keep the response practical and concise.
"""

    def _build_fix_prompt(
        self,
        issue: dict,
    ) -> str:
        return f"""
Generate a suggested fix for this repository finding.

Category:
{issue.get("category", "Unknown")}

Severity:
{issue.get("severity", "Unknown")}

Title:
{issue.get("title", "Unknown")}

File:
{issue.get("file", "Unknown")}

Line:
{issue.get("line", 1)}

Description:
{issue.get("description", "")}

Recommendation:
{issue.get("suggestion", "")}

Provide:

1. Explanation
2. Suggested change
3. Example code when useful
4. Verification steps

Do not claim that you modified the repository.
"""

    def _build_repository_chat_prompt(
        self,
        question: str,
        repository_context: dict,
        history: list[dict],
    ) -> str:
        context_json = json.dumps(
            repository_context,
            indent=2,
            ensure_ascii=False,
        )

        clean_history = []

        for message in history[-8:]:
            role = message.get("role")
            content = message.get("content")

            if role not in {"user", "assistant"}:
                continue

            if not isinstance(content, str):
                continue

            content = content.strip()

            if not content:
                continue

            clean_history.append(
                {
                    "role": role,
                    "content": content[:2000],
                }
            )

        history_json = json.dumps(
            clean_history,
            indent=2,
            ensure_ascii=False,
        )

        return f"""
A developer is asking about a repository that RepoLens analyzed.
Use the analysis context below as your source of truth.

Repository analysis context:
{context_json}

Recent conversation history:
{history_json}

Current question:
{question}

Answer requirements:
- Answer the current question directly.
- Use concrete repository facts from the supplied context.
- Explain why your recommendations matter.
- Prioritize the most important actions when there are multiple findings.
- Include practical next steps the developer can take.
- If the context does not include source code or details needed to answer, say exactly what is missing.
- Do not claim you inspected files that are not represented in the supplied context.
"""
