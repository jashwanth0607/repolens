from pathlib import Path
import shutil
import tempfile

from git import Repo
from git.exc import GitCommandError


IGNORED_DIRECTORIES = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    ".next",
    "dist",
    "build",
    "coverage",
    ".idea",
    ".vscode",
}


ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".swift",
    ".kt",
    ".kts",
    ".css",
    ".scss",
    ".html",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".md",
}


class RepositoryScanner:
    def __init__(self):
        self.workspace = Path(
            tempfile.mkdtemp(prefix="repolens_")
        )

    def clone_repository(self, repository_url: str) -> Path:
        repository_path = self.workspace / "repository"

        try:
            Repo.clone_from(
                repository_url,
                repository_path,
                depth=1,
            )
        except GitCommandError as error:
            self.cleanup()

            raise ValueError(
                "Unable to clone the repository. "
                "Make sure the URL is correct and the repository is public."
            ) from error

        return repository_path

    def scan_files(self, repository_path: Path) -> list[dict]:
        files = []

        for path in repository_path.rglob("*"):
            if not path.is_file():
                continue

            if self._is_ignored(path, repository_path):
                continue

            if path.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue

            try:
                relative_path = path.relative_to(repository_path)

                content = path.read_text(
                    encoding="utf-8",
                    errors="ignore",
                )

                files.append(
                    {
                        "path": str(relative_path).replace("\\", "/"),
                        "extension": path.suffix.lower(),
                        "content": content,
                    }
                )

            except OSError:
                continue

        return files

    def cleanup(self):
        if self.workspace.exists():
            shutil.rmtree(
                self.workspace,
                ignore_errors=True,
            )

    def _is_ignored(
        self,
        path: Path,
        repository_path: Path,
    ) -> bool:
        relative_parts = path.relative_to(
            repository_path
        ).parts

        return any(
            part in IGNORED_DIRECTORIES
            for part in relative_parts
        )