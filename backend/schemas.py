from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AssessmentRequest(BaseModel):
    engagement_details: str

class AssessmentResult(BaseModel):
    score: str
    triage: str
    explanation: str

class HumanOverride(BaseModel):
    score: str
    triage: str | None = None
    explanation: str
    reason: str


class OverrideRequest(BaseModel):
    chroma_id: str | None = None
    assessment_id: int
    original_engagement_details: str
    ai_assessment: AssessmentResult
    human_override: HumanOverride


class AssessmentResponse(BaseModel):
    assessment: AssessmentResult
    assessment_id: int
    similar_assessment: Optional[OverrideRequest] = None

class AssessmentRecord(BaseModel):
    id: int
    engagement_details: str
    score: str
    triage: str
    explanation: str
    human_override_score: Optional[str] = None
    human_override_triage: Optional[str] = None
    human_override_explanation: Optional[str] = None
    human_override_reason: Optional[str] = None
    created_at: str

class UpdateOverrideRequest(BaseModel):
    original_engagement_details: str
    ai_assessment: AssessmentResult
    human_override: HumanOverride
