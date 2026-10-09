"""Grading logic for benchmark test cases."""

import re
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher


class HallucinationDetector:
    """Detects hallucinated claims in AI responses."""

    HALLUCINATION_PATTERNS = [
        r"I (?:found|discovered|detected).*in (?:your|the) (?:repository|project|codebase)",
        r"(?:the )?file (?:uses|implements|contains)",
        r"(?:the )?function (?:\w+)\(",
        r"you (?:should|must|need to|have to)",
        r"this (?:typically|usually|often|generally|commonly)",
        r"based on (?:my analysis|my understanding|what I see)",
        r"I (?:can see|can tell|notice|observe) that",
        r"(?:the )?library (?:provides|implements|has)",
        r"(?:your )?database (?:uses|implements|has)",
        r"(?:your )?(?:application|system|architecture) uses",
    ]

    def __init__(self):
        self.compiled_patterns = [re.compile(p, re.IGNORECASE) for p in self.HALLUCINATION_PATTERNS]

    def detect_hallucinations(
        self,
        response: str,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Detect hallucinated claims in response.

        Returns list of hallucination findings:
        [
            {"claim": "...", "pattern": "...", "confidence": 0.85},
            ...
        ]
        """
        findings = []

        # Check for pattern matches
        for pattern in self.compiled_patterns:
            matches = pattern.finditer(response)
            for match in matches:
                claim = match.group(0)
                # Verify claim against context
                if not self._is_supported_by_context(claim, context):
                    findings.append({
                        "claim": claim,
                        "pattern": pattern.pattern,
                        "confidence": 0.85,
                        "type": "pattern_match"
                    })

        return findings

    def _is_supported_by_context(self, claim: str, context: Dict[str, Any]) -> bool:
        """Check if claim can be verified against provided context."""
        # Extract key terms from claim
        terms = re.findall(r'\b\w+\b', claim.lower())

        # Check against files
        if "file" in terms:
            context_files = context.get("files", [])
            if context_files:
                # Look for file references in claim
                for file_term in terms:
                    if any(file_term in f.lower() for f in context_files):
                        return True
                return False

        # Check against functions/methods
        if any(t in terms for t in ["function", "method", "implements", "uses"]):
            context_code = context.get("file_content", {})
            if context_code:
                context_str = str(context_code).lower()
                for term in terms:
                    if term not in context_str and len(term) > 3:
                        return False

        return True


class BugDiagnosisGrader:
    """Grader for bug investigation/diagnosis accuracy."""

    def grade_diagnosis(
        self,
        diagnosis: Dict[str, Any],
        ground_truth: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Grade a bug diagnosis against ground truth.

        Returns scoring dict with:
        - root_cause_match (0.0-1.0)
        - culprit_file_correct (bool)
        - culprit_line_close (bool)
        - confidence_appropriate (bool)
        - overall_score (0.0-1.0)
        """
        scores = {}

        # Grade root cause
        root_cause = diagnosis.get("root_cause", "")
        expected_keywords = ground_truth.get("root_cause_keywords", [])
        scores["root_cause_match"] = self._keyword_match_score(
            root_cause, expected_keywords
        )

        # Grade culprit file
        culprit_file = diagnosis.get("culprit_files", [{}])[0].get("file_path", "")
        expected_file = ground_truth.get("culprit_file", "")
        scores["culprit_file_correct"] = (
            culprit_file.endswith(expected_file) or
            expected_file.endswith(culprit_file)
        )

        # Grade line number (with tolerance)
        culprit_line = diagnosis.get("culprit_files", [{}])[0].get("line_start", 0)
        expected_line = ground_truth.get("culprit_line", 0)
        tolerance = ground_truth.get("culprit_line_tolerance", 2)
        scores["culprit_line_close"] = abs(culprit_line - expected_line) <= tolerance

        # Grade confidence calibration
        diagnosed_confidence = diagnosis.get("confidence_level", "").lower()
        expected_confidence = ground_truth.get("confidence_expected", "").lower()
        scores["confidence_appropriate"] = diagnosed_confidence == expected_confidence

        # Overall score: weighted average
        scores["overall_score"] = (
            scores["root_cause_match"] * 0.40 +
            (1.0 if scores["culprit_file_correct"] else 0.0) * 0.30 +
            (1.0 if scores["culprit_line_close"] else 0.0) * 0.20 +
            (1.0 if scores["confidence_appropriate"] else 0.0) * 0.10
        )

        return scores

    def _keyword_match_score(self, text: str, keywords: List[str]) -> float:
        """Score how many keywords appear in text."""
        if not keywords:
            return 1.0

        text_lower = text.lower()
        matches = sum(1 for kw in keywords if kw.lower() in text_lower)
        return matches / len(keywords)


class ExplanationGrader:
    """Grader for issue explanation quality."""

    def grade_explanation(
        self,
        explanation: str,
        test_case: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Grade an issue explanation.

        Returns scoring dict with:
        - keyword_coverage (0.0-1.0)
        - specificity (0.0-1.0)
        - anti_keyword_absence (0.0-1.0)
        - hallucination_free (bool)
        - overall_score (0.0-1.0)
        """
        scores = {}

        # Check for expected keywords
        expected_keywords = test_case.get("expected_answer_keywords", [])
        scores["keyword_coverage"] = self._keyword_coverage_score(
            explanation, expected_keywords
        )

        # Check for anti-keywords
        anti_keywords = test_case.get("expected_answer_anti_keywords", [])
        scores["anti_keyword_absence"] = 1.0 - self._keyword_coverage_score(
            explanation, anti_keywords
        )

        # Check specificity (no generic advice)
        scores["specificity"] = self._specificity_score(explanation)

        # Check for hallucinations
        hallucination_markers = test_case.get("hallucination_markers", [])
        hallucination_free = not any(
            marker.lower() in explanation.lower()
            for marker in hallucination_markers
        )
        scores["hallucination_free"] = hallucination_free

        # Overall score
        scores["overall_score"] = (
            scores["keyword_coverage"] * 0.40 +
            scores["anti_keyword_absence"] * 0.25 +
            scores["specificity"] * 0.20 +
            (1.0 if hallucination_free else 0.0) * 0.15
        )

        return scores

    def _keyword_coverage_score(self, text: str, keywords: List[str]) -> float:
        """Calculate what fraction of keywords appear in text."""
        if not keywords:
            return 1.0

        text_lower = text.lower()
        matches = sum(1 for kw in keywords if kw.lower() in text_lower)
        return matches / len(keywords)

    def _specificity_score(self, text: str) -> float:
        """Estimate how specific vs. generic the explanation is."""
        generic_phrases = [
            "typically", "usually", "often", "generally", "commonly",
            "it depends", "it may", "could be", "might be", "often involves"
        ]

        # Count generic phrases
        text_lower = text.lower()
        generic_count = sum(1 for phrase in generic_phrases if phrase in text_lower)

        # Longer, more detailed explanations are more specific
        word_count = len(text.split())

        # Score: fewer generic phrases and longer = higher score
        specificity = 1.0 - (generic_count * 0.1)  # -10% per generic phrase
        specificity = min(1.0, max(0.0, specificity))
        specificity = (specificity + min(1.0, word_count / 100)) / 2  # Average with length

        return specificity


class FixGrader:
    """Grader for fix generation quality."""

    def grade_fix(
        self,
        fix_response: str,
        test_case: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Grade a fix suggestion.

        Returns scoring dict with:
        - addresses_root_cause (0.0-1.0)
        - syntax_valid (bool)
        - keyword_coverage (0.0-1.0)
        - overall_score (0.0-1.0)
        """
        scores = {}

        # Check if fix addresses root cause
        expected_keywords = test_case.get("expected_fix_keywords", [])
        scores["addresses_root_cause"] = self._keyword_coverage_score(
            fix_response, expected_keywords
        )

        # Check syntax validity (basic: look for matching braces)
        scores["syntax_valid"] = self._check_syntax_validity(fix_response)

        # Check for hallucinated imports/functions
        scores["no_hallucination"] = not self._has_fabricated_imports(fix_response)

        # Overall score
        scores["overall_score"] = (
            scores["addresses_root_cause"] * 0.50 +
            (1.0 if scores["syntax_valid"] else 0.0) * 0.30 +
            (1.0 if scores["no_hallucination"] else 0.0) * 0.20
        )

        return scores

    def _keyword_coverage_score(self, text: str, keywords: List[str]) -> float:
        """Calculate what fraction of keywords appear in text."""
        if not keywords:
            return 1.0

        text_lower = text.lower()
        matches = sum(1 for kw in keywords if kw.lower() in text_lower)
        return matches / len(keywords)

    def _check_syntax_validity(self, code: str) -> bool:
        """Basic check for matching braces/parens."""
        braces = {"(": ")", "{": "}", "[": "]"}
        stack = []

        for char in code:
            if char in braces:
                stack.append(char)
            elif char in braces.values():
                if not stack or braces[stack[-1]] != char:
                    return False
                stack.pop()

        return len(stack) == 0

    def _has_fabricated_imports(self, code: str) -> bool:
        """Check for imports that don't exist."""
        # Common nonexistent packages to catch
        fake_imports = [
            "import magic_module",
            "from imaginary_lib import",
            "import super_util",
        ]

        return any(fake in code.lower() for fake in fake_imports)


class RepositoryChatGrader:
    """Grader for repository chat accuracy."""

    def grade_chat_response(
        self,
        response: str,
        test_case: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Grade a chat response.

        Returns scoring dict with:
        - answer_relevant (0.0-1.0)
        - correctly_detects_insufficient_info (bool)
        - hallucination_free (bool)
        - overall_score (0.0-1.0)
        """
        scores = {}

        # Check relevance to question
        question = test_case.get("question", "")
        scores["answer_relevant"] = self._relevance_score(response, question)

        # For insufficient-info cases, check if response correctly says "I don't know"
        if test_case.get("correct_response_pattern"):
            patterns = test_case.get("correct_response_pattern", [])
            correct_response = any(
                pattern.lower() in response.lower()
                for pattern in patterns
            )
            scores["correctly_detects_insufficient_info"] = correct_response
        else:
            scores["correctly_detects_insufficient_info"] = True  # Not applicable

        # Check for hallucinations
        hallucination_patterns = test_case.get("hallucination_patterns", [])
        has_hallucination = any(
            pattern.lower() in response.lower()
            for pattern in hallucination_patterns
        )
        scores["hallucination_free"] = not has_hallucination

        # Overall score
        scores["overall_score"] = (
            scores["answer_relevant"] * 0.40 +
            (1.0 if scores["correctly_detects_insufficient_info"] else 0.0) * 0.35 +
            (1.0 if scores["hallucination_free"] else 0.0) * 0.25
        )

        return scores

    def _relevance_score(self, response: str, question: str) -> float:
        """Calculate semantic relevance of response to question."""
        # Extract key terms from question
        q_terms = set(re.findall(r'\b\w{3,}\b', question.lower()))
        r_terms = set(re.findall(r'\b\w{3,}\b', response.lower()))

        # Overlap = relevance
        if not q_terms:
            return 1.0

        overlap = len(q_terms & r_terms)
        return min(1.0, overlap / len(q_terms))
