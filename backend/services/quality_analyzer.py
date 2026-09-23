import ast
from pathlib import Path


MAX_FUNCTION_LINES = 80
MAX_FUNCTION_ARGUMENTS = 6
MAX_COMPLEXITY = 10
MAX_FILE_LINES = 1000


class QualityAnalyzer:
    def analyze(
        self,
        repository_path: Path,
    ) -> list[dict]:
        issues = []

        python_files = list(
            repository_path.rglob("*.py")
        )

        for file_path in python_files:
            if self._is_ignored(file_path):
                continue

            issues.extend(
                self._analyze_python_file(
                    file_path,
                    repository_path,
                )
            )

        return issues

    def _analyze_python_file(
        self,
        file_path: Path,
        repository_path: Path,
    ) -> list[dict]:
        issues = []

        try:
            source = file_path.read_text(
                encoding="utf-8",
                errors="ignore",
            )
        except OSError:
            return issues

        lines = source.splitlines()

        relative_path = self._relative_path(
            file_path,
            repository_path,
        )

        if len(lines) > MAX_FILE_LINES:
            issues.append(
                self._issue(
                    severity="LOW",
                    title="Very large Python file",
                    file_path=relative_path,
                    line_number=1,
                    description=(
                        f"This file contains {len(lines)} lines. "
                        "Large files can become difficult to maintain "
                        "and understand."
                    ),
                    suggestion=(
                        "Consider splitting the file into smaller "
                        "modules with focused responsibilities."
                    ),
                )
            )

        try:
            tree = ast.parse(
                source,
                filename=str(file_path),
            )
        except SyntaxError as error:
            issues.append(
                self._issue(
                    severity="MEDIUM",
                    title="Python syntax error",
                    file_path=relative_path,
                    line_number=error.lineno or 1,
                    description=(
                        "The Python source could not be parsed because "
                        "it contains a syntax error."
                    ),
                    suggestion=(
                        "Review the reported line and fix the syntax "
                        "before running static analysis."
                    ),
                )
            )

            return issues

        for node in ast.walk(tree):
            if not isinstance(
                node,
                (
                    ast.FunctionDef,
                    ast.AsyncFunctionDef,
                ),
            ):
                continue

            issues.extend(
                self._analyze_function(
                    node,
                    relative_path,
                )
            )

        return issues

    def _analyze_function(
        self,
        node: ast.FunctionDef | ast.AsyncFunctionDef,
        file_path: str,
    ) -> list[dict]:
        issues = []

        start_line = node.lineno

        end_line = getattr(
            node,
            "end_lineno",
            start_line,
        )

        function_lines = (
            end_line - start_line + 1
        )

        if function_lines > MAX_FUNCTION_LINES:
            issues.append(
                self._issue(
                    severity="MEDIUM",
                    title="Very long function",
                    file_path=file_path,
                    line_number=start_line,
                    description=(
                        f"Function '{node.name}' contains "
                        f"{function_lines} lines."
                    ),
                    suggestion=(
                        "Consider splitting this function into "
                        "smaller functions with clear responsibilities."
                    ),
                )
            )

        argument_count = self._argument_count(node)

        if argument_count > MAX_FUNCTION_ARGUMENTS:
            issues.append(
                self._issue(
                    severity="LOW",
                    title="Function has many parameters",
                    file_path=file_path,
                    line_number=start_line,
                    description=(
                        f"Function '{node.name}' accepts "
                        f"{argument_count} parameters."
                    ),
                    suggestion=(
                        "Consider grouping related values into an "
                        "object or data structure."
                    ),
                )
            )

        complexity = self._calculate_complexity(
            node
        )

        if complexity > MAX_COMPLEXITY:
            issues.append(
                self._issue(
                    severity="MEDIUM",
                    title="High cyclomatic complexity",
                    file_path=file_path,
                    line_number=start_line,
                    description=(
                        f"Function '{node.name}' has an estimated "
                        f"complexity of {complexity}."
                    ),
                    suggestion=(
                        "Reduce nested conditions and split complex "
                        "logic into smaller functions."
                    ),
                )
            )

        branch_count = self._branch_count(
            node
        )

        if branch_count > 8:
            issues.append(
                self._issue(
                    severity="LOW",
                    title="Excessive branching",
                    file_path=file_path,
                    line_number=start_line,
                    description=(
                        f"Function '{node.name}' contains "
                        f"{branch_count} branching statements."
                    ),
                    suggestion=(
                        "Consider simplifying conditional logic or "
                        "splitting the function."
                    ),
                )
            )

        return issues

    def _calculate_complexity(
        self,
        node: ast.AST,
    ) -> int:
        complexity = 1

        for child in ast.walk(node):
            if isinstance(
                child,
                (
                    ast.If,
                    ast.For,
                    ast.AsyncFor,
                    ast.While,
                    ast.IfExp,
                    ast.And,
                    ast.Or,
                    ast.ExceptHandler,
                    ast.Assert,
                ),
            ):
                complexity += 1

            elif isinstance(
                child,
                ast.comprehension,
            ):
                complexity += 1

        return complexity

    def _branch_count(
        self,
        node: ast.AST,
    ) -> int:
        count = 0

        for child in ast.walk(node):
            if isinstance(
                child,
                (
                    ast.If,
                    ast.For,
                    ast.AsyncFor,
                    ast.While,
                    ast.Try,
                    ast.Match,
                ),
            ):
                count += 1

        return count

    def _argument_count(
        self,
        node: ast.FunctionDef | ast.AsyncFunctionDef,
    ) -> int:
        arguments = node.args

        return (
            len(arguments.posonlyargs)
            + len(arguments.args)
            + len(arguments.kwonlyargs)
        )

    def _relative_path(
        self,
        file_path: Path,
        repository_path: Path,
    ) -> str:
        try:
            relative = file_path.relative_to(
                repository_path
            )

            return str(relative).replace(
                "\\",
                "/",
            )

        except ValueError:
            return str(file_path).replace(
                "\\",
                "/",
            )

    def _is_ignored(
        self,
        file_path: Path,
    ) -> bool:
        ignored = {
            ".git",
            "venv",
            ".venv",
            "__pycache__",
            "node_modules",
            ".next",
            "dist",
            "build",
        }

        return any(
            part in ignored
            for part in file_path.parts
        )

    def _issue(
        self,
        severity: str,
        title: str,
        file_path: str,
        line_number: int,
        description: str,
        suggestion: str,
    ) -> dict:
        return {
            "severity": severity,
            "category": "Code Quality",
            "title": title,
            "file": file_path,
            "line": line_number,
            "description": description,
            "suggestion": suggestion,
            "tool": "RepoLens AST Analyzer",
        }