import unittest
from fastapi.testclient import TestClient

from main import app
from services.bug_investigator import (
    BugInvestigator,
    InvestigationRequest,
    BugReport,
    TestContext,
)


class TestBugInvestigator(unittest.TestCase):
    def setUp(self):
        self.investigator = BugInvestigator()
        self.client = TestClient(app)

    def test_get_sample_scenarios(self):
        scenarios = self.investigator.get_sample_scenarios()
        self.assertIsInstance(scenarios, list)
        self.assertGreaterEqual(len(scenarios), 3)

        first = scenarios[0]
        self.assertIn("id", first)
        self.assertIn("bug_report", first)
        self.assertIn("test_context", first)
        self.assertIn("repository_files", first)

    def test_diagnose_react_null_property(self):
        scenarios = self.investigator.get_sample_scenarios()
        scenario = scenarios[0]

        req = InvestigationRequest(
            repo_name=scenario["repo_name"],
            repository_files=scenario["repository_files"],
            bug_report=BugReport(**scenario["bug_report"]),
            test_context=TestContext(**scenario["test_context"]),
        )

        diagnosis = self.investigator.diagnose(req)

        self.assertTrue(diagnosis.investigation_id.startswith("inv-"))
        self.assertGreaterEqual(diagnosis.confidence_score, 80)
        self.assertIn(diagnosis.confidence_level, ["High", "Medium"])
        self.assertGreaterEqual(len(diagnosis.culprit_files), 1)
        self.assertGreaterEqual(len(diagnosis.execution_trace), 2)
        self.assertIsNotNone(diagnosis.patch.diff)
        self.assertIn("UserProfile", diagnosis.culprit_files[0].file_path)

    def test_diagnose_python_off_by_one(self):
        scenarios = self.investigator.get_sample_scenarios()
        scenario = scenarios[1]

        req = InvestigationRequest(
            repo_name=scenario["repo_name"],
            repository_files=scenario["repository_files"],
            bug_report=BugReport(**scenario["bug_report"]),
            test_context=TestContext(**scenario["test_context"]),
        )

        diagnosis = self.investigator.diagnose(req)

        self.assertGreaterEqual(diagnosis.confidence_score, 80)
        self.assertIn("repository_scanner.py", diagnosis.culprit_files[0].file_path)
        self.assertIn("batch_size", diagnosis.patch.before_code)

    def test_api_scenarios_endpoint(self):
        response = self.client.get("/api/investigate/scenarios")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(len(data["scenarios"]), 3)

    def test_api_diagnose_endpoint(self):
        scenarios = self.investigator.get_sample_scenarios()
        scenario = scenarios[0]

        payload = {
            "repo_name": scenario["repo_name"],
            "repository_files": scenario["repository_files"],
            "bug_report": scenario["bug_report"],
            "test_context": scenario["test_context"],
        }

        response = self.client.post("/api/investigate/diagnose", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("diagnosis", data)
        self.assertIn("confidence_score", data["diagnosis"])


if __name__ == "__main__":
    unittest.main()
