"""Ground-truth bug scenarios for benchmarking bug investigation."""

BUG_SCENARIOS = [
    {
        "id": "bug_001_react_null_deref",
        "title": "React: Cannot read properties of undefined (settings)",
        "category": "Frontend / React",
        "severity": "HIGH",
        "bug_report": {
            "title": "UserProfile crashes when user.settings is null",
            "description": "New user without completed onboarding crashes dashboard with white screen",
            "error_message": "TypeError: Cannot read properties of undefined (reading 'notifications')",
            "stack_trace": "TypeError: Cannot read properties of undefined (reading 'notifications')\n    at UserProfile (components/UserProfile.tsx:42:28)",
            "environment": "Next.js 15, React 19, TypeScript 5.4, Chrome 128"
        },
        "test_context": {
            "test_name": "test_renders_user_with_null_settings",
            "test_code": "const mockUser = { id: 'u1', name: 'Alice', settings: null }; expect(() => render(<UserProfile user={mockUser} />)).not.toThrow();",
            "failing_assertion": "expect(() => render(<UserProfile user={mockUser} />)).not.toThrow()",
            "test_output": "FAIL: TypeError: Cannot read properties of undefined",
            "framework": "Jest / React Testing Library"
        },
        "repository_files": {
            "components/UserProfile.tsx": "export function UserProfile({ user }) { return <div>{user.name}</div><span>{user.settings.notifications.enabled ? 'On' : 'Off'}</span>; }"
        },
        "ground_truth": {
            "root_cause": "Unsafe property access on nullable object without optional chaining or null guard",
            "root_cause_keywords": ["optional chaining", "null guard", "optional", "nullable", "undefined"],
            "culprit_file": "components/UserProfile.tsx",
            "culprit_line": 3,
            "culprit_line_tolerance": 2,
            "defect_type": "Null/Undefined Dereference",
            "expected_fix_approach": "Use optional chaining (?.) or add conditional guard",
            "expected_fix_keywords": ["?.", "if (", "guard", "optional"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_002_python_off_by_one",
        "title": "Python: IndexError in pagination loop",
        "category": "Backend / Python",
        "severity": "MEDIUM",
        "bug_report": {
            "title": "Repository file scanner crashes on boundary condition",
            "description": "When chunking files for batch processing, off-by-one error raises IndexError on exact boundary",
            "error_message": "IndexError: list index out of range",
            "stack_trace": "Traceback (most recent call last):\n  File \"test_scanner.py\", line 28, in test_chunk_files\n    batches = scanner.chunk_files(files, batch_size=10)\n  File \"repository_scanner.py\", line 114, in chunk_files\n    batch.append(files[index + offset])\nIndexError: list index out of range",
            "environment": "Python 3.12, FastAPI 0.110, Linux"
        },
        "test_context": {
            "test_name": "test_chunk_files_boundary",
            "test_code": "files = ['file_' + str(i) for i in range(20)]\nbatches = scanner.chunk_files(files, batch_size=10)\nassert len(batches) == 2\nassert sum(len(b) for b in batches) == 20",
            "failing_assertion": "batches = scanner.chunk_files(sample_files, batch_size=10)",
            "test_output": "FAILED: IndexError: list index out of range at line 114",
            "framework": "pytest"
        },
        "repository_files": {
            "repository_scanner.py": "def chunk_files(self, files, batch_size=10):\n    chunks = []\n    for i in range(0, len(files), batch_size):\n        batch = []\n        for offset in range(0, batch_size + 1):\n            if i + offset < len(files):\n                batch.append(files[i + offset])\n        chunks.append(batch)\n    return chunks"
        },
        "ground_truth": {
            "root_cause": "Loop boundary condition uses batch_size + 1 instead of batch_size, causing index overrun on exact multiple",
            "root_cause_keywords": ["off-by-one", "boundary", "batch_size + 1", "range", "inclusive"],
            "culprit_file": "repository_scanner.py",
            "culprit_line": 5,
            "culprit_line_tolerance": 1,
            "defect_type": "Off-by-One / Boundary Index Error",
            "expected_fix_approach": "Change range(0, batch_size + 1) to range(0, batch_size)",
            "expected_fix_keywords": ["batch_size", "range"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_003_sql_injection",
        "title": "Python: SQL Injection vulnerability",
        "category": "Backend / Security",
        "severity": "HIGH",
        "bug_report": {
            "title": "User search endpoint vulnerable to SQL injection",
            "description": "Query parameter passed directly to SQL without sanitization",
            "error_message": "sqlite3.OperationalError: near 'OR': syntax error",
            "stack_trace": "File \"app.py\", line 45, in search_users\n    result = db.execute(query)\nFile \"database.py\", line 12, in execute\n    cursor.execute(sql_string)",
            "environment": "Python 3.12, SQLite3"
        },
        "test_context": {
            "test_name": "test_sql_injection_attack",
            "test_code": "response = client.get('/search?q=admin\\' OR \\'1\\'=\\'1')\nassert response.status_code == 400",
            "failing_assertion": "assert response.status_code == 400",
            "test_output": "FAILED: Expected 400 but got 200; database returned all users",
            "framework": "pytest"
        },
        "repository_files": {
            "app.py": "@app.get('/search')\ndef search_users(q: str):\n    query = f\"SELECT * FROM users WHERE name = '{q}'\"\n    result = db.execute(query)\n    return result"
        },
        "ground_truth": {
            "root_cause": "User input concatenated directly into SQL query without parameterization",
            "root_cause_keywords": ["parameterized", "prepared statement", "SQL injection", "f-string", "concatenation"],
            "culprit_file": "app.py",
            "culprit_line": 3,
            "culprit_line_tolerance": 1,
            "defect_type": "SQL Injection / Command Injection",
            "expected_fix_approach": "Use parameterized queries with placeholders",
            "expected_fix_keywords": ["?", "placeholder", "param"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_004_race_condition",
        "title": "Python: Race condition in concurrent requests",
        "category": "Backend / Concurrency",
        "severity": "MEDIUM",
        "bug_report": {
            "title": "Simultaneous repository scans trigger duplicate clones",
            "description": "Two concurrent requests clone same repo to same path before lock acquired",
            "error_message": "GitError: destination path already exists and is not an empty directory",
            "stack_trace": "git.exc.GitCommandError: Cmd('git') failed\n  File \"repository_scanner.py\", line 45, in clone_repository\n    Repo.clone_from(url, path)",
            "environment": "Python 3.12, Uvicorn (workers=4), Git 2.44"
        },
        "test_context": {
            "test_name": "test_concurrent_clone_deduplication",
            "test_code": "results = await asyncio.gather(\n    analyzer.analyze('https://github.com/org/repo'),\n    analyzer.analyze('https://github.com/org/repo')\n)\nassert results[0] == results[1]\nassert clone_count == 1",
            "failing_assertion": "assert clone_count == 1",
            "test_output": "FAILED: clone_count was 2; duplicate clones detected",
            "framework": "pytest-asyncio"
        },
        "repository_files": {
            "repository_scanner.py": "async def analyze(self, repo_url):\n    self.clone_count += 1\n    await asyncio.sleep(0.01)\n    path = self.clone_repository(repo_url)\n    return path"
        },
        "ground_truth": {
            "root_cause": "Check-then-act pattern without atomic lock; concurrent requests both see repo doesn't exist and both initiate clone",
            "root_cause_keywords": ["race condition", "lock", "mutex", "atomic", "critical section"],
            "culprit_file": "repository_scanner.py",
            "culprit_line": 2,
            "culprit_line_tolerance": 2,
            "defect_type": "Race Condition / Missing Lock",
            "expected_fix_approach": "Wrap critical section in asyncio.Lock or use deduplication cache",
            "expected_fix_keywords": ["asyncio.Lock", "async with", "lock"],
            "confidence_expected": "Medium",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_005_unhandled_exception",
        "title": "JavaScript: Unhandled async operation exception",
        "category": "Frontend / JavaScript",
        "severity": "MEDIUM",
        "bug_report": {
            "title": "Dashboard crashes on slow API network timeout",
            "description": "Fetch promise rejection not caught; crashes entire dashboard",
            "error_message": "Uncaught (in promise) TypeError: Failed to fetch",
            "stack_trace": "at async Dashboard (Dashboard.tsx:8)",
            "environment": "Next.js 15, Chrome 128"
        },
        "test_context": {
            "test_name": "test_handles_api_timeout",
            "test_code": "const mockFetch = jest.fn().mockRejectedValueOnce(new Error('Timeout'));\nrender(<Dashboard />);\nawait waitFor(() => expect(screen.getByText('Error')).toBeInTheDocument());",
            "failing_assertion": "expect(screen.getByText('Error')).toBeInTheDocument()",
            "test_output": "FAILED: Unhandled promise rejection",
            "framework": "Jest"
        },
        "repository_files": {
            "Dashboard.tsx": "export function Dashboard() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch('/api/data').then(r => r.json()).then(setData);\n  }, []);\n  return <div>{data.value}</div>;\n}"
        },
        "ground_truth": {
            "root_cause": "Promise rejection not caught with .catch() or try/catch in async function",
            "root_cause_keywords": ["catch", "error handling", "promise", "rejection", "try/catch"],
            "culprit_file": "Dashboard.tsx",
            "culprit_line": 4,
            "culprit_line_tolerance": 2,
            "defect_type": "Unhandled Promise Rejection",
            "expected_fix_approach": "Add .catch() handler or wrap in try/catch",
            "expected_fix_keywords": [".catch(", "try", "catch"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_006_memory_leak",
        "title": "JavaScript: Event listener memory leak",
        "category": "Frontend / React",
        "severity": "LOW",
        "bug_report": {
            "title": "Component remounts cause memory leak from unremoved listeners",
            "description": "Event listener attached in useEffect not cleaned up",
            "error_message": "Warning: Memory leak detected (listener count: 42)",
            "stack_trace": "at useEffect in SearchBox.tsx:12",
            "environment": "React 19, DevTools"
        },
        "test_context": {
            "test_name": "test_cleanup_listeners_on_unmount",
            "test_code": "const { rerender, unmount } = render(<SearchBox />);\nrerender(<SearchBox />);\nrerender(<SearchBox />);\nunmount();\nassert(listenerCount === 0);",
            "failing_assertion": "assert(listenerCount === 0)",
            "test_output": "FAILED: listenerCount was 3",
            "framework": "React Testing Library"
        },
        "repository_files": {
            "SearchBox.tsx": "export function SearchBox() {\n  useEffect(() => {\n    window.addEventListener('resize', handleResize);\n  }, []);\n  return <input placeholder=\"Search\" />;\n}"
        },
        "ground_truth": {
            "root_cause": "Event listener attached without cleanup function in useEffect; not unsubscribed on unmount",
            "root_cause_keywords": ["cleanup", "removeEventListener", "useEffect", "return"],
            "culprit_file": "SearchBox.tsx",
            "culprit_line": 3,
            "culprit_line_tolerance": 1,
            "defect_type": "Resource Leak / Missing Cleanup",
            "expected_fix_approach": "Add cleanup function that removes listener",
            "expected_fix_keywords": ["removeEventListener", "return () =>"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_007_type_mismatch",
        "title": "TypeScript: Type mismatch in comparison",
        "category": "Frontend / TypeScript",
        "severity": "LOW",
        "bug_report": {
            "title": "User age comparison fails due to string vs number",
            "description": "Age from API response is string but compared as number",
            "error_message": "Comparison: '25' >= 18 returns unexpected result",
            "stack_trace": "at isAdult (utils.ts:5)",
            "environment": "TypeScript 5.4"
        },
        "test_context": {
            "test_name": "test_age_comparison_with_string",
            "test_code": "const user = { age: '25' };\nassert(isAdult(user) === true);",
            "failing_assertion": "assert(isAdult(user) === true)",
            "test_output": "FAILED: Expected true but got false",
            "framework": "Jest"
        },
        "repository_files": {
            "utils.ts": "function isAdult(user: { age: string | number }) {\n  return user.age >= 18;\n}"
        },
        "ground_truth": {
            "root_cause": "String comparison '25' >= 18 uses type coercion which may behave unexpectedly",
            "root_cause_keywords": ["type coercion", "parseInt", "Number()", "casting"],
            "culprit_file": "utils.ts",
            "culprit_line": 2,
            "culprit_line_tolerance": 1,
            "defect_type": "Type Mismatch / Coercion Bug",
            "expected_fix_approach": "Convert string to number explicitly",
            "expected_fix_keywords": ["parseInt", "Number", "Number("],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_008_async_state_update",
        "title": "React: Setting state after unmount",
        "category": "Frontend / React",
        "severity": "MEDIUM",
        "bug_report": {
            "title": "Warning: Cannot update component state after unmount",
            "description": "Async operation completes after component already unmounted",
            "error_message": "Warning: Can't perform a React state update on an unmounted component",
            "stack_trace": "at useEffect in UserProfile.tsx:18",
            "environment": "React 19, Development mode"
        },
        "test_context": {
            "test_name": "test_unmount_during_fetch",
            "test_code": "const { unmount } = render(<UserProfile userId={123} />);\nunmount();\nawait act(() => { tick_all_promises() });\nassertNoWarnings();",
            "failing_assertion": "assertNoWarnings()",
            "test_output": "FAILED: Warning: Can't perform React state update",
            "framework": "React Testing Library"
        },
        "repository_files": {
            "UserProfile.tsx": "export function UserProfile({ userId }) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch(`/api/user/${userId}`).then(r => r.json()).then(setData);\n  }, [userId]);\n  return <div>{data?.name}</div>;\n}"
        },
        "ground_truth": {
            "root_cause": "Async operation updates state after component unmounts; needs abort signal or isMounted flag",
            "root_cause_keywords": ["AbortController", "cleanup", "isMounted", "unmount"],
            "culprit_file": "UserProfile.tsx",
            "culprit_line": 4,
            "culprit_line_tolerance": 2,
            "defect_type": "Async State Update After Unmount",
            "expected_fix_approach": "Use AbortController or cleanup flag",
            "expected_fix_keywords": ["AbortController", "signal.aborted"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_009_infinite_loop",
        "title": "React: useEffect infinite loop",
        "category": "Frontend / React",
        "severity": "HIGH",
        "bug_report": {
            "title": "Dashboard CPU maxes out; page becomes unresponsive",
            "description": "useEffect missing dependency array or includes object reference",
            "error_message": "Too many renders. React limits number of renders to prevent infinite loop.",
            "stack_trace": "in useEffect at Dashboard.tsx:8",
            "environment": "React 19, Chrome DevTools showing 1000+ renders"
        },
        "test_context": {
            "test_name": "test_no_infinite_render_loop",
            "test_code": "let renderCount = 0;\nconst spy = jest.fn(() => renderCount++);\nrender(<Dashboard onDataChange={spy} />);\nawait waitFor(() => expect(renderCount).toBeLessThan(5));",
            "failing_assertion": "expect(renderCount).toBeLessThan(5)",
            "test_output": "FAILED: renderCount was 1234",
            "framework": "React Testing Library"
        },
        "repository_files": {
            "Dashboard.tsx": "export function Dashboard({ data }) {\n  useEffect(() => {\n    setData({ ...data, timestamp: Date.now() });\n  }, [data]);\n  return <div>{data.timestamp}</div>;\n}"
        },
        "ground_truth": {
            "root_cause": "useEffect updates state based on dependency that is being set by the effect, creating infinite loop",
            "root_cause_keywords": ["dependency array", "infinite loop", "setter dependency"],
            "culprit_file": "Dashboard.tsx",
            "culprit_line": 3,
            "culprit_line_tolerance": 2,
            "defect_type": "Infinite Loop / Incorrect Dependencies",
            "expected_fix_approach": "Adjust dependencies or restructure logic",
            "expected_fix_keywords": ["dependency", "[]"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
    {
        "id": "bug_010_resource_pool_exhaustion",
        "title": "Python: Connection pool exhausted",
        "category": "Backend / Database",
        "severity": "HIGH",
        "bug_report": {
            "title": "API becomes unresponsive after few requests; no connections available",
            "description": "Database connections not returned to pool after use",
            "error_message": "QueuePool limit of size 5 overflow 10 checked out exceeded",
            "stack_trace": "File \"database.py\", line 32, in get_connection\n    conn = self.pool.get(timeout=5)",
            "environment": "Python 3.12, SQLAlchemy, PostgreSQL"
        },
        "test_context": {
            "test_name": "test_connections_returned_to_pool",
            "test_code": "for i in range(20):\n    response = client.get('/api/data')\n    assert response.status_code == 200\nassert active_connections <= 5",
            "failing_assertion": "assert active_connections <= 5",
            "test_output": "FAILED: active_connections was 20",
            "framework": "pytest"
        },
        "repository_files": {
            "database.py": "def query_data(query_id):\n    conn = db_pool.connect()\n    result = conn.execute(f\"SELECT * FROM data WHERE id={query_id}\")\n    return result.fetchall()"
        },
        "ground_truth": {
            "root_cause": "Database connection obtained but not returned to pool; missing close() or context manager",
            "root_cause_keywords": ["close()", "with", "context manager", "pool", "connection"],
            "culprit_file": "database.py",
            "culprit_line": 2,
            "culprit_line_tolerance": 1,
            "defect_type": "Resource Leak / Pool Exhaustion",
            "expected_fix_approach": "Use context manager (with statement) or explicit close()",
            "expected_fix_keywords": ["with", "as", "close()"],
            "confidence_expected": "High",
            "fix_test_runnable": True,
        }
    },
]
