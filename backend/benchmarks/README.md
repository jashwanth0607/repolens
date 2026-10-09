# RepoLens Benchmarking System

Automated benchmarking suite for evaluating RepoLens AI accuracy, hallucination rates, and response times.

## Overview

This benchmark framework tests five critical AI surfaces:

1. **Bug Investigation** (`POST /api/investigate/diagnose`) — Root-cause detection
2. **Explanation** (`POST /api/ai/explain`) — Issue explanation quality
3. **Fix Generation** (`POST /api/ai/fix`) — Code fix suggestions
4. **Repository Chat** (`POST /api/ai/chat`) — Conversational Q&A accuracy
5. **Repository Analysis** (`POST /api/repositories/analyze`) — Static analysis accuracy

## Metrics

- **Accuracy**: Percentage of correct answers matching ground truth
- **Hallucination Rate**: Percentage of claims unsupported by provided context
- **Unsupported Claims**: Statements not grounded in analysis context
- **Fix Success**: Percentage of generated fixes that pass automated tests
- **Response Latency**: Average, P95, P99 response times

## Running Benchmarks

### Full benchmark suite

```bash
python -m backend.benchmarks.cli --full
```

### Specific endpoint

```bash
python -m backend.benchmarks.cli --endpoint bug_investigation
python -m backend.benchmarks.cli --endpoint explanation
python -m backend.benchmarks.cli --endpoint fix_generation
python -m backend.benchmarks.cli --endpoint repository_chat
python -m backend.benchmarks.cli --endpoint repository_analysis
```

### Output formats

```bash
# JSON report
python -m backend.benchmarks.cli --full --output json --file report.json

# HTML report
python -m backend.benchmarks.cli --full --output html --file report.html

# Console (default)
python -m backend.benchmarks.cli --full --output console
```

### Configuration

```bash
# Skip slow tests
python -m backend.benchmarks.cli --full --quick

# Test without Groq (use mocks)
python -m backend.benchmarks.cli --full --mock-groq

# Specific test case
python -m backend.benchmarks.cli --test bug_001_react_null_deref
```

## Test Dataset

Ground-truth test cases are in `fixtures/`:

- `bug_scenarios.py` — 18 realistic bug cases with expected diagnoses
- `test_repos.py` — Synthetic repository code snippets
- `hallucination_traps.py` — 8 cases testing insufficient-info detection
- `expected_answers.py` — Ground-truth answers and grading rubrics

## Report Output

Benchmark runs generate a report with:

```json
{
  "timestamp": "2026-10-07T04:36:12Z",
  "groq_model": "openai/gpt-oss-20b",
  "duration_seconds": 342,
  "summary": {
    "total_test_cases": 65,
    "passed_cases": 58,
    "failed_cases": 7,
    "overall_accuracy": "89.2%",
    "hallucination_rate": "3.8%",
    "avg_response_time_ms": 2847
  },
  "by_endpoint": { ... },
  "hallucinations_detected": [ ... ],
  "recommendations": [ ... ]
}
```

## Architecture

```
benchmarks/
├── __init__.py
├── README.md (this file)
├── fixtures/
│   ├── __init__.py
│   ├── bug_scenarios.py           # 18 bug cases
│   ├── test_repos.py              # Synthetic repos
│   ├── hallucination_traps.py     # 8 hallucination cases
│   └── expected_answers.py        # Ground truth + rubrics
├── graders.py                      # Grading logic
├── metrics.py                      # Metric calculations
├── evaluator.py                    # Main orchestrator
├── report_generator.py             # Report output
└── cli.py                          # Command-line interface
```

## Interpreting Results

### Accuracy Score

- **>90%**: Excellent — model reliably answers questions correctly
- **80-90%**: Good — acceptable for production with caveats
- **70-80%**: Needs work — consider retraining or prompt engineering
- **<70%**: Poor — not ready for production use

### Hallucination Rate

- **<5%**: Excellent — rare unsupported claims
- **5-10%**: Acceptable — monitor for patterns
- **10-20%**: Concerning — model is inventing details
- **>20%**: Dangerous — high false-claim rate

### Response Latency

- **P50 <2s**: Fast
- **P95 <5s**: Acceptable
- **P99 <10s**: Slow but tolerable
- **>10s**: Timeout risk

## Development

### Adding Test Cases

1. Create a new case dict in `fixtures/bug_scenarios.py` or `hallucination_traps.py`
2. Fill in `ground_truth` field with expected answer
3. Run benchmarks: `python -m backend.benchmarks.cli --test case_id`
4. Review results in report

### Extending Metrics

Edit `metrics.py` to add new metric calculations. Update `graders.py` to implement grading logic.

## Notes

- Benchmarks call production endpoints; ensure Groq API key is configured
- Some tests may timeout if API is slow
- Results are sensitive to Groq model version and temperature settings
- Hallucination detection uses heuristic patterns — not 100% accurate
