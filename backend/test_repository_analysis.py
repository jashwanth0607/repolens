import unittest
from fastapi.testclient import TestClient

from main import app


class TestRepositoryAnalysisEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_analyze_repository_missing_url(self):
        response = self.client.post("/api/repositories/analyze", json={"url": "   "})
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)

    def test_analyze_repository_invalid_url(self):
        response = self.client.post(
            "/api/repositories/analyze",
            json={"url": "https://github.com/nonexistent/invalid-repo-does-not-exist-xyz-999"},
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)


if __name__ == "__main__":
    unittest.main()
