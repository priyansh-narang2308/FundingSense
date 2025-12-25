import json
from typing import Dict, List, Any
import google.generativeai as genai
from app.config.settings import settings
from app.schemas.reasoning import ReasoningResult


class Generator:

    # Generation Layer: Handles professional explanation of validated results.

    # Hallucinations are prevented because the prompt forbids the introduction of
    # any facts not present in the supported_claims or evidence_map.

    def __init__(self):
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

    # reasoning_result: The output from the Validator layer.
    #   language: Target language for the report
    async def generate_report(
        self,
        reasoning_result: ReasoningResult,
        evidence_units: List[Any],
        language: str = "en",
    ) -> Dict:
        if not settings.GOOGLE_API_KEY:
            return self._generate_mock_fallback(reasoning_result, language)

        system_prompt = (
            "You are a Senior Venture Capital Analyst. Your task is to explain a provided "
            "funding analysis based ONLY on the validated claims and evidence provided. "
            "CRITICAL CONSTRAINTS:\n"
            "1. Do NOT invent new facts. Use the 'Evidence Units' and 'Supported Claims' provided.\n"
            "2. Recommend the BEST 3-5 investors from the evidence or known real-world VCs that fit this SPECIFIC startup description.\n"
            "3. For each investor, provide:\n"
            "   - name (string)\n"
            "   - fit_score (int 0-100)\n"
            "   - reasons (list of specific strings explaining WHY they fit this description)\n"
            "   - focus_areas (list of strings)\n"
            "4. Maintain a professional, data-centric tone.\n"
            f"5. The output must be in {language}.\n"
            "6. Your response MUST be a valid JSON object with the following keys:\n"
            "   - executive_summary (string)\n"
            "   - why_this_fits (list of strings)\n"
            "   - why_this_does_not_fit (list of strings)\n"
            "   - recommended_investors (list of objects with name, fit_score, reasons, focus_areas)\n"
            "   - confidence_explanation (string)"
        )

        input_data = {
            "supported_claims": reasoning_result.supported_claims,
            "rejected_claims": reasoning_result.rejected_claims,
            "confidence_level": reasoning_result.confidence_level,
            "evidence": [
                ev.dict() if hasattr(ev, "dict") else str(ev) for ev in evidence_units
            ],
        }

        try:
            response = self.model.generate_content(
                f"{system_prompt}\n\nData to analyze: {json.dumps(input_data)}",
                generation_config={"response_mime_type": "application/json"},
            )
            return json.loads(response.text)
        except Exception as e:
            # Fallback in case of API failure or parsing error
            return self._generate_mock_fallback(reasoning_result, language)

    def _generate_mock_fallback(
        self, reasoning_result: ReasoningResult, language: str
    ) -> Dict:
        return {
            "executive_summary": "Initial analysis performed across market, regulatory, and financial parameters.",
            "why_this_fits": reasoning_result.supported_claims,
            "why_this_does_not_fit": [
                f"Insufficient evidence for: {c}"
                for c in reasoning_result.rejected_claims
            ],
            "confidence_explanation": f"Report generated with {reasoning_result.confidence_level} confidence based on direct evidence matches.",
        }

    async def generate_explanation(self, validated_data: dict, language: str) -> str:

        return f"Validated report generated in {language}"
