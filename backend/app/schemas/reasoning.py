from pydantic import BaseModel
from typing import List, Dict


class ReasoningResult(BaseModel):
    """

    It serves as a filter that separates evidence-backed claims from
    unsupported ones. This structure ensures that the Generation Layer
    only communicates facts that have been explicitly 'approved' by the
    Validator.
    """

    supported_claims: List[str]
    rejected_claims: List[str]
    confidence_level: str  # like low high or med
    support_ratio: float = 0.0
    evidence_map: Dict[str, List[str]]
