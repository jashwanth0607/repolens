import re


class IssueScanner:

    def scan(self, files: list[dict]) -> list[dict]:
        issues = []

        for file_data in files:
            file_path = file_data["path"]
            content = file_data["content"]

            lines = content.splitlines()

            for line_number, line in enumerate(
                lines,
                start=1,
            ):
                issues.extend(
                    self._check_line(
                        file_path,
                        line_number,
                        line,
                    )
                )

            issues.extend(
                self._check_file(
                    file_path,
                    content,
                    lines,
                )
            )

        return self._remove_duplicates(issues)

    def _check_line(
        self,
        file_path: str,
        line_number: int,
        line: str,
    ) -> list[dict]:
        issues = []

        stripped = line.strip()

        if not stripped:
            return issues

        # Potential hardcoded API keys
        secret_patterns = [
            r"api[_-]?key\s*=\s*['\"][^'\"]{8,}['\"]",
            r"secret\s*=\s*['\"][^'\"]{8,}['\"]",
            r"access[_-]?token\s*=\s*['\"][^'\"]{8,}['\"]",
            r"password\s*=\s*['\"][^'\"]{4,}['\"]",
        ]

        for pattern in secret_patterns:
            if re.search(
                pattern,
                line,
                re.IGNORECASE,
            ):
                issues.append(
                    self._issue(
                        severity="HIGH",
                        category="Security",
                        title="Potential hardcoded credential",
                        file_path=file_path,
                        line_number=line_number,
                        description=(
                            "A credential-like value appears to be "
                            "stored directly in source code."
                        ),
                        suggestion=(
                            "Move secrets into environment variables "
                            "or a secure secret manager."
                        ),
                    )
                )

                break

        # Dangerous eval
        if re.search(
            r"\beval\s*\(",
            line,
        ):
            issues.append(
                self._issue(
                    severity="HIGH",
                    category="Security",
                    title="Use of eval()",
                    file_path=file_path,
                    line_number=line_number,
                    description=(
                        "eval() can execute dynamically generated "
                        "code and may introduce security risks."
                    ),
                    suggestion=(
                        "Avoid eval() and use safer parsing or "
                        "explicit logic instead."
                    ),
                )
            )

        # OS command execution
        if re.search(
            r"\bos\.system\s*\(",
            line,
        ):
            issues.append(
                self._issue(
                    severity="MEDIUM",
                    category="Security",
                    title="Direct operating-system command execution",
                    file_path=file_path,
                    line_number=line_number,
                    description=(
                        "os.system() executes shell commands and "
                        "can become dangerous when input is not trusted."
                    ),
                    suggestion=(
                        "Prefer safer APIs such as subprocess.run() "
                        "with controlled arguments."
                    ),
                )
            )

        # JavaScript innerHTML
        if re.search(
            r"\.innerHTML\s*=",
            line,
        ):
            issues.append(
                self._issue(
                    severity="MEDIUM",
                    category="Security",
                    title="Direct innerHTML assignment",
                    file_path=file_path,
                    line_number=line_number,
                    description=(
                        "Direct HTML injection can introduce "
                        "cross-site scripting risks when the value "
                        "contains untrusted input."
                    ),
                    suggestion=(
                        "Prefer textContent or framework-safe rendering "
                        "when HTML is not required."
                    ),
                )
            )

        # TODO/FIXME
        if re.search(
            r"\b(TODO|FIXME)\b",
            line,
            re.IGNORECASE,
        ):
            issues.append(
                self._issue(
                    severity="LOW",
                    category="Code Quality",
                    title="Unresolved TODO/FIXME",
                    file_path=file_path,
                    line_number=line_number,
                    description=(
                        "The source contains a TODO or FIXME marker "
                        "that may represent unfinished work."
                    ),
                    suggestion=(
                        "Review the task and either implement it "
                        "or remove the outdated marker."
                    ),
                )
            )

        # Bare except in Python
        if re.match(
            r"^\s*except\s*:",
            line,
        ):
            issues.append(
                self._issue(
                    severity="MEDIUM",
                    category="Code Quality",
                    title="Bare exception handler",
                    file_path=file_path,
                    line_number=line_number,
                    description=(
                        "A bare except catches every exception and "
                        "can hide unexpected errors."
                    ),
                    suggestion=(
                        "Catch specific exception types when possible."
                    ),
                )
            )

        return issues

    def _check_file(
        self,
        file_path: str,
        content: str,
        lines: list[str],
    ) -> list[dict]:
        issues = []

        if len(lines) > 1000:
            issues.append(
                self._issue(
                    severity="LOW",
                    category="Code Quality",
                    title="Very large source file",
                    file_path=file_path,
                    line_number=1,
                    description=(
                        "This source file contains more than "
                        "1000 lines and may be difficult to maintain."
                    ),
                    suggestion=(
                        "Consider splitting the file into smaller "
                        "modules with focused responsibilities."
                    ),
                )
            )

        return issues

    def _issue(
        self,
        severity: str,
        category: str,
        title: str,
        file_path: str,
        line_number: int,
        description: str,
        suggestion: str,
    ) -> dict:
        return {
            "severity": severity,
            "category": category,
            "title": title,
            "file": file_path,
            "line": line_number,
            "description": description,
            "suggestion": suggestion,
        }

    def _remove_duplicates(
        self,
        issues: list[dict],
    ) -> list[dict]:
        seen = set()
        unique_issues = []

        for issue in issues:
            key = (
                issue["severity"],
                issue["category"],
                issue["title"],
                issue["file"],
                issue["line"],
            )

            if key in seen:
                continue

            seen.add(key)
            unique_issues.append(issue)

        return unique_issues