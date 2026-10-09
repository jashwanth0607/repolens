"""Metric calculation utilities for benchmarking."""

import time
from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class LatencyMetrics:
    """Response time metrics."""
    min_ms: float
    max_ms: float
    mean_ms: float
    median_ms: float
    p95_ms: float
    p99_ms: float

    def __str__(self):
        return (
            f"Latency: mean={self.mean_ms:.1f}ms, p95={self.p95_ms:.1f}ms, "
            f"p99={self.p99_ms:.1f}ms (min={self.min_ms:.1f}ms, max={self.max_ms:.1f}ms)"
        )


@dataclass
class AccuracyMetrics:
    """Accuracy scoring metrics."""
    total: int
    passed: int
    failed: int
    accuracy_percent: float

    def __str__(self):
        return f"Accuracy: {self.passed}/{self.total} ({self.accuracy_percent:.1f}%)"


@dataclass
class HallucinationMetrics:
    """Hallucination detection metrics."""
    total_claims: int
    hallucinated_claims: int
    unsupported_claims: int
    hallucination_rate: float
    unsupported_claim_rate: float

    def __str__(self):
        return (
            f"Hallucination: {self.hallucination_rate:.1f}% "
            f"({self.hallucinated_claims}/{self.total_claims}), "
            f"Unsupported: {self.unsupported_claim_rate:.1f}%"
        )


def calculate_latency_metrics(latencies_ms: List[float]) -> LatencyMetrics:
    """Calculate percentile-based latency metrics."""
    if not latencies_ms:
        return LatencyMetrics(0, 0, 0, 0, 0, 0)

    sorted_latencies = sorted(latencies_ms)
    n = len(sorted_latencies)

    return LatencyMetrics(
        min_ms=min(sorted_latencies),
        max_ms=max(sorted_latencies),
        mean_ms=sum(sorted_latencies) / n,
        median_ms=sorted_latencies[n // 2],
        p95_ms=sorted_latencies[int(n * 0.95)] if n > 1 else sorted_latencies[0],
        p99_ms=sorted_latencies[int(n * 0.99)] if n > 1 else sorted_latencies[0],
    )


def calculate_accuracy_metrics(total: int, passed: int) -> AccuracyMetrics:
    """Calculate accuracy percentage."""
    accuracy = (passed / total * 100) if total > 0 else 0
    return AccuracyMetrics(
        total=total,
        passed=passed,
        failed=total - passed,
        accuracy_percent=accuracy,
    )


def calculate_hallucination_metrics(
    total_claims: int,
    hallucinated_claims: int,
    unsupported_claims: int
) -> HallucinationMetrics:
    """Calculate hallucination rate."""
    hallucination_rate = (hallucinated_claims / total_claims * 100) if total_claims > 0 else 0
    unsupported_rate = (unsupported_claims / total_claims * 100) if total_claims > 0 else 0

    return HallucinationMetrics(
        total_claims=total_claims,
        hallucinated_claims=hallucinated_claims,
        unsupported_claims=unsupported_claims,
        hallucination_rate=hallucination_rate,
        unsupported_claim_rate=unsupported_rate,
    )


def measure_latency(func, *args, **kwargs) -> tuple[Any, float]:
    """Measure function execution time. Returns (result, latency_ms)."""
    start = time.time()
    try:
        result = func(*args, **kwargs)
    finally:
        elapsed_ms = (time.time() - start) * 1000
    return result, elapsed_ms


class TimerContext:
    """Context manager for measuring execution time."""
    def __init__(self):
        self.start_time = None
        self.elapsed_ms = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, *args):
        self.elapsed_ms = (time.time() - self.start_time) * 1000
