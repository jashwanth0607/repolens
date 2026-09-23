import json
from pathlib import Path


class DependencyAnalyzer:

    def analyze(self, repository_path: Path) -> dict:
        issues = []

        python_dependencies = 0
        javascript_dependencies = 0

        requirements_files = list(
            repository_path.rglob("requirements.txt")
        )

        for requirements_file in requirements_files:
            count, file_issues = self._analyze_requirements(
                requirements_file,
                repository_path,
            )

            python_dependencies += count
            issues.extend(file_issues)

        package_files = list(
            repository_path.rglob("package.json")
        )

        for package_file in package_files:
            count, file_issues = self._analyze_package_json(
                package_file,
                repository_path,
            )

            javascript_dependencies += count
            issues.extend(file_issues)

        total_dependencies = (
            python_dependencies
            + javascript_dependencies
        )

        return {
            "python_dependencies": python_dependencies,
            "javascript_dependencies": javascript_dependencies,
            "total_dependencies": total_dependencies,
            "issues": issues,
        }

    def _analyze_requirements(
        self,
        file_path: Path,
        repository_path: Path,
    ) -> tuple[int, list[dict]]:
        issues = []
        count = 0

        try:
            content = file_path.read_text(
                encoding="utf-8",
                errors="ignore",
            )
        except OSError:
            return 0, []

        relative_path = self._relative_path(
            file_path,
            repository_path,
        )

        for line_number, raw_line in enumerate(
            content.splitlines(),
            start=1,
        ):
            line = raw_line.strip()

            if not line:
                continue

            if line.startswith("#"):
                continue

            if line.startswith("-"):
                continue

            dependency_name = self._extract_python_name(
                line
            )

            if not dependency_name:
                continue

            count += 1

            pinned = "==" in line

            if not pinned:
                issues.append(
                    self._issue(
                        severity="LOW",
                        category="Dependency Hygiene",
                        title="Dependency version is not pinned",
                        file_path=relative_path,
                        line_number=line_number,
                        description=(
                            f"{dependency_name} does not use an exact "
                            "version pin in requirements.txt."
                        ),
                        suggestion=(
                            "Consider pinning production dependencies "
                            "to known versions for more reproducible builds."
                        ),
                    )
                )

        return count, issues

    def _analyze_package_json(
        self,
        file_path: Path,
        repository_path: Path,
    ) -> tuple[int, list[dict]]:
        issues = []

        try:
            content = file_path.read_text(
                encoding="utf-8",
                errors="ignore",
            )

            package_data = json.loads(content)

        except (
            OSError,
            json.JSONDecodeError,
        ):
            return 0, []

        relative_path = self._relative_path(
            file_path,
            repository_path,
        )

        dependencies = package_data.get(
            "dependencies",
            {},
        )

        dev_dependencies = package_data.get(
            "devDependencies",
            {},
        )

        all_dependencies = {
            **dependencies,
            **dev_dependencies,
        }

        count = len(all_dependencies)

        for dependency_name, version in all_dependencies.items():

            if not isinstance(version, str):
                continue

            if self._is_uncontrolled_version(version):
                issues.append(
                    self._issue(
                        severity="LOW",
                        category="Dependency Hygiene",
                        title="Flexible dependency version range",
                        file_path=relative_path,
                        line_number=1,
                        description=(
                            f"{dependency_name} uses version "
                            f"'{version}', which allows a range of versions."
                        ),
                        suggestion=(
                            "Review whether a lockfile and controlled "
                            "dependency update process should be used."
                        ),
                    )
                )

        if all_dependencies:
            has_lockfile = self._has_javascript_lockfile(
                file_path.parent
            )

            if not has_lockfile:
                issues.append(
                    self._issue(
                        severity="MEDIUM",
                        category="Dependency Hygiene",
                        title="No JavaScript lockfile detected",
                        file_path=relative_path,
                        line_number=1,
                        description=(
                            "package.json contains dependencies but no "
                            "npm, Yarn, or pnpm lockfile was found nearby."
                        ),
                        suggestion=(
                            "Consider committing an appropriate lockfile "
                            "to make dependency installation more reproducible."
                        ),
                    )
                )

        return count, issues

    def _has_javascript_lockfile(
        self,
        directory: Path,
    ) -> bool:
        lockfiles = {
            "package-lock.json",
            "npm-shrinkwrap.json",
            "yarn.lock",
            "pnpm-lock.yaml",
        }

        return any(
            (directory / filename).exists()
            for filename in lockfiles
        )

    def _extract_python_name(
        self,
        line: str,
    ) -> str | None:
        separators = [
            "==",
            ">=",
            "<=",
            "~=",
            "!=",
            ">",
            "<",
            "[",
            ";",
        ]

        name = line

        for separator in separators:
            if separator in name:
                name = name.split(
                    separator,
                    1,
                )[0]

        name = name.strip()

        if not name:
            return None

        return name

    def _is_uncontrolled_version(
        self,
        version: str,
    ) -> bool:
        version = version.strip()

        return (
            version == "*"
            or version.lower() == "latest"
            or version.startswith("^")
            or version.startswith("~")
            or version.startswith(">=")
            or version.startswith(">")
            or version.startswith("<")
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
            "tool": "RepoLens Dependency Analyzer",
        }