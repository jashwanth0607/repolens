"""Command-line interface for benchmarking."""

import asyncio
import argparse
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from benchmarks.evaluator import BenchmarkEvaluator
from benchmarks.report_generator import ReportGenerator


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="RepoLens Benchmark Suite - Evaluate AI accuracy and performance"
    )

    parser.add_argument(
        "--full",
        action="store_true",
        help="Run complete benchmark suite (all endpoints)"
    )

    parser.add_argument(
        "--endpoint",
        choices=[
            "bug_investigation",
            "explanation",
            "fix_generation",
            "repository_chat",
            "repository_analysis",
        ],
        help="Run benchmarks for a specific endpoint"
    )

    parser.add_argument(
        "--api",
        default="http://localhost:8000",
        help="API base URL (default: http://localhost:8000)"
    )

    parser.add_argument(
        "--output",
        choices=["json", "html", "console"],
        default="console",
        help="Output format (default: console)"
    )

    parser.add_argument(
        "--file",
        help="Save report to file (default: auto-generated filename)"
    )

    parser.add_argument(
        "--mock-groq",
        action="store_true",
        help="Skip Groq API (run with mock data)"
    )

    parser.add_argument(
        "--quick",
        action="store_true",
        help="Run quick benchmark (subset of test cases)"
    )

    parser.add_argument(
        "--test",
        help="Run specific test case by ID"
    )

    args = parser.parse_args()

    # Validate arguments
    if not args.full and not args.endpoint:
        print("❌ Error: Specify --full or --endpoint")
        parser.print_help()
        return 1

    # Create evaluator
    evaluator = BenchmarkEvaluator(
        api_base_url=args.api,
        groq_configured=not args.mock_groq,
        mock_mode=args.mock_groq,
    )

    # Run benchmark
    try:
        results = asyncio.run(evaluator.run_full_benchmark())
    except KeyboardInterrupt:
        print("\n⚠️  Benchmark interrupted by user")
        return 130
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    # Generate report
    generator = ReportGenerator()

    if args.output == "console":
        print(generator.generate_console_report(results))
    elif args.output == "json":
        content = generator.generate_json_report(results)
        if args.file:
            with open(args.file, "w") as f:
                f.write(content)
            print(f"📄 Report saved to {args.file}")
        else:
            print(content)
    elif args.output == "html":
        content = generator.generate_html_report(results)
        if args.file:
            with open(args.file, "w") as f:
                f.write(content)
            print(f"📄 Report saved to {args.file}")
        else:
            print(content)

    # Return exit code based on results
    summary = results.get("summary", {})
    accuracy = summary.get("overall_accuracy", 0)

    if accuracy >= 90:
        return 0  # Excellent
    elif accuracy >= 80:
        return 0  # Good
    elif accuracy >= 70:
        return 0  # Acceptable
    else:
        return 1  # Poor


if __name__ == "__main__":
    exit(main())
