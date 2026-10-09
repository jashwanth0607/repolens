"""Report generation for benchmark results."""

import json
from typing import Dict, Any
from datetime import datetime


class ReportGenerator:
    """Generate benchmark reports in various formats."""

    def generate_json_report(self, results: Dict[str, Any]) -> str:
        """Generate JSON report."""
        return json.dumps(results, indent=2)

    def generate_console_report(self, results: Dict[str, Any]) -> str:
        """Generate console-friendly report."""
        lines = []

        lines.append("\n" + "=" * 80)
        lines.append("REPOLENS BENCHMARK REPORT")
        lines.append("=" * 80)
        lines.append(f"\nTimestamp: {results['timestamp']}")
        lines.append(f"API: {results['api_base_url']}")
        lines.append(f"Groq Configured: {results['groq_configured']}")
        lines.append(f"Duration: {results['duration_seconds']:.1f}s")

        lines.append("\n" + "-" * 80)
        lines.append("SUMMARY")
        lines.append("-" * 80)

        summary = results["summary"]
        lines.append(f"Total Test Cases: {summary['total_test_cases']}")
        lines.append(f"  ✓ Passed: {summary['total_passed']}")
        lines.append(f"  ✗ Failed: {summary['total_failed']}")
        lines.append(f"  Overall Accuracy: {summary['overall_accuracy']:.1f}%")

        lines.append(f"\nResponse Time:")
        lines.append(f"  Mean: {summary['avg_latency_ms']:.1f}ms")
        lines.append(f"  P95:  {summary['p95_latency_ms']:.1f}ms")
        lines.append(f"  P99:  {summary['p99_latency_ms']:.1f}ms")

        lines.append("\n" + "-" * 80)
        lines.append("BY ENDPOINT")
        lines.append("-" * 80)

        for endpoint_name, endpoint_results in results.get("surfaces", {}).items():
            lines.append(f"\n{endpoint_name.upper().replace('_', ' ')}")
            lines.append(f"  Test Cases: {endpoint_results.get('test_cases', 0)}")
            lines.append(f"    ✓ Passed: {endpoint_results.get('passed', 0)}")
            lines.append(f"    ✗ Failed: {endpoint_results.get('failed', 0)}")
            lines.append(f"  Accuracy: {endpoint_results.get('accuracy', 0):.1f}%")

            latency = endpoint_results.get("latency", {})
            lines.append(f"  Latency: {latency.get('mean_ms', 0):.1f}ms (P95: {latency.get('p95_ms', 0):.1f}ms)")

            if "fix_success_rate" in endpoint_results:
                lines.append(f"  Fix Success Rate: {endpoint_results['fix_success_rate']:.1f}%")

            if "hallucination_detection_rate" in endpoint_results:
                lines.append(f"  Hallucination Detection Rate: {endpoint_results['hallucination_detection_rate']:.1f}%")

        lines.append("\n" + "-" * 80)
        lines.append("RECOMMENDATIONS")
        lines.append("-" * 80)

        recommendations = self._generate_recommendations(results)
        for i, rec in enumerate(recommendations, 1):
            lines.append(f"{i}. {rec}")

        lines.append("\n" + "=" * 80)

        return "\n".join(lines)

    def generate_html_report(self, results: Dict[str, Any]) -> str:
        """Generate HTML report."""
        summary = results["summary"]

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>RepoLens Benchmark Report</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }}
        .container {{ max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        h1 {{ color: #333; border-bottom: 3px solid #0A84FF; padding-bottom: 10px; }}
        h2 {{ color: #0A84FF; margin-top: 30px; }}
        .summary-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .summary-card {{ background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #0A84FF; }}
        .summary-card .value {{ font-size: 2em; font-weight: bold; color: #0A84FF; }}
        .summary-card .label {{ color: #666; font-size: 0.9em; margin-top: 5px; }}
        .endpoint-results {{ margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }}
        .endpoint-results h3 {{ color: #333; margin-top: 0; }}
        .metric {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }}
        .metric .label {{ font-weight: 500; }}
        .metric .value {{ text-align: right; }}
        .pass {{ color: #28a745; }}
        .fail {{ color: #dc3545; }}
        .recommendations {{ margin-top: 30px; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; }}
        .recommendations h3 {{ margin-top: 0; }}
        .recommendations li {{ margin: 8px 0; }}
        .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 RepoLens Benchmark Report</h1>

        <div class="meta">
            <p><strong>Generated:</strong> {results['timestamp']}</p>
            <p><strong>API:</strong> {results['api_base_url']}</p>
            <p><strong>Duration:</strong> {results['duration_seconds']:.1f}s</p>
        </div>

        <h2>Summary</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Total Tests</div>
                <div class="value">{summary['total_test_cases']}</div>
            </div>
            <div class="summary-card">
                <div class="label">Passed</div>
                <div class="value pass">✓ {summary['total_passed']}</div>
            </div>
            <div class="summary-card">
                <div class="label">Failed</div>
                <div class="value fail">✗ {summary['total_failed']}</div>
            </div>
            <div class="summary-card">
                <div class="label">Accuracy</div>
                <div class="value">{summary['overall_accuracy']:.1f}%</div>
            </div>
            <div class="summary-card">
                <div class="label">Avg Latency</div>
                <div class="value">{summary['avg_latency_ms']:.0f}ms</div>
            </div>
            <div class="summary-card">
                <div class="label">P95 Latency</div>
                <div class="value">{summary['p95_latency_ms']:.0f}ms</div>
            </div>
        </div>

        <h2>By Endpoint</h2>
        {self._generate_html_endpoint_results(results)}

        <div class="recommendations">
            <h3>📋 Recommendations</h3>
            <ul>
                {self._generate_html_recommendations(results)}
            </ul>
        </div>

        <div class="footer">
            <p>RepoLens Benchmark Suite • {results['timestamp']}</p>
        </div>
    </div>
</body>
</html>
        """
        return html

    def _generate_html_endpoint_results(self, results: Dict[str, Any]) -> str:
        """Generate HTML for endpoint results."""
        html = ""
        for endpoint_name, endpoint_results in results.get("surfaces", {}).items():
            endpoint_display = endpoint_name.upper().replace("_", " ")
            accuracy = endpoint_results.get("accuracy", 0)
            latency = endpoint_results.get("latency", {})

            html += f"""
        <div class="endpoint-results">
            <h3>{endpoint_display}</h3>
            <div class="metric">
                <span class="label">Test Cases</span>
                <span class="value">{endpoint_results.get('test_cases', 0)}</span>
            </div>
            <div class="metric">
                <span class="label">Passed</span>
                <span class="value pass">✓ {endpoint_results.get('passed', 0)}</span>
            </div>
            <div class="metric">
                <span class="label">Failed</span>
                <span class="value fail">✗ {endpoint_results.get('failed', 0)}</span>
            </div>
            <div class="metric">
                <span class="label">Accuracy</span>
                <span class="value">{accuracy:.1f}%</span>
            </div>
            <div class="metric">
                <span class="label">Mean Latency</span>
                <span class="value">{latency.get('mean_ms', 0):.1f}ms</span>
            </div>
            <div class="metric">
                <span class="label">P95 Latency</span>
                <span class="value">{latency.get('p95_ms', 0):.1f}ms</span>
            </div>
        </div>
            """

        return html

    def _generate_html_recommendations(self, results: Dict[str, Any]) -> str:
        """Generate HTML for recommendations."""
        recommendations = self._generate_recommendations(results)
        html = ""
        for rec in recommendations:
            html += f"<li>{rec}</li>\n"
        return html

    def _generate_recommendations(self, results: Dict[str, Any]) -> list:
        """Generate recommendations based on results."""
        recommendations = []
        summary = results["summary"]

        # Accuracy recommendations
        if summary["overall_accuracy"] < 70:
            recommendations.append(
                "⚠️  Overall accuracy is below 70%. Consider retraining or improving prompts."
            )
        elif summary["overall_accuracy"] < 80:
            recommendations.append(
                "📊 Accuracy is 70-80%. Monitor and test edge cases."
            )

        # Latency recommendations
        if summary["p99_latency_ms"] > 10000:
            recommendations.append(
                "⏱️  P99 latency exceeds 10s. Investigate timeout issues and optimize API calls."
            )
        elif summary["p99_latency_ms"] > 5000:
            recommendations.append(
                "⏱️  P99 latency is 5-10s. Consider caching or request batching."
            )

        # Per-endpoint recommendations
        surfaces = results.get("surfaces", {})

        if surfaces.get("bug_investigation", {}).get("accuracy", 100) < 75:
            recommendations.append(
                "🐛 Bug investigation accuracy is low. Review prompt engineering and ground truth."
            )

        if surfaces.get("fix_generation", {}).get("accuracy", 100) < 75:
            recommendations.append(
                "🔧 Fix generation needs improvement. Consider more specific fix examples in training."
            )

        if surfaces.get("repository_chat", {}).get("hallucination_detection_rate", 100) < 90:
            recommendations.append(
                "💬 Chat endpoint is not reliably detecting insufficient information. Add explicit guardrails."
            )

        if not recommendations:
            recommendations.append("✅ All metrics are within acceptable ranges. System is performing well.")

        return recommendations

    def save_report(self, results: Dict[str, Any], format: str = "json", filepath: str = None) -> str:
        """Save report to file. Returns filepath."""
        if not filepath:
            timestamp = results["timestamp"].replace(":", "-").replace(".", "-")
            filename = f"benchmark_report_{timestamp}.{format}"
            filepath = f"backend/benchmarks/reports/{filename}"

        # Create reports directory if needed
        import os
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        if format == "json":
            content = self.generate_json_report(results)
        elif format == "html":
            content = self.generate_html_report(results)
        else:  # console
            content = self.generate_console_report(results)

        with open(filepath, "w") as f:
            f.write(content)

        return filepath
