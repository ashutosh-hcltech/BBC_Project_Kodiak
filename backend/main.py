import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List

import config
from data_loader import load_all_guidelines
from vector_store import vector_store, get_all_overrides, update_override, delete_override
from assessment import assess_engagement
from schemas import AssessmentRequest, AssessmentResponse, OverrideRequest, AssessmentResult, AssessmentRecord, UpdateOverrideRequest
from database import save_assessment, get_all_assessments, update_assessment_with_override

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on server startup
    logger.info("Server starting up...")
    logger.info("Loading HMRC guidelines and populating vector store...")
    
    # 1. Load guidelines from URLs
    hmrc_chunks = load_all_guidelines(config.FULL_HMRC_URLS)
    
    # 2. Populate the vector store with the guidelines
    if hmrc_chunks:
        vector_store.populate_hmrc_guidelines(hmrc_chunks)
    else:
        logger.error("No HMRC guidelines were loaded. The assessment API may not function correctly.")
    
    logger.info("Startup process complete.")
    yield
    # Code to run on server shutdown
    logger.info("Server shutting down...")

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity. For production, restrict this to your frontend's domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "HMRC Assessment API is running."}

@app.post("/assess", response_model=AssessmentResponse)
async def assess_endpoint(request: AssessmentRequest):
    """
    Receives engagement details and returns an AI-driven assessment.
    """
    if not request.engagement_details or len(request.engagement_details) < 50:
        raise HTTPException(
            status_code=400,
            detail="Engagement details must be at least 50 characters long."
        )
    try:
        assessment_result, similar_assessment = await assess_engagement(request)
        assessment_id = save_assessment(
            engagement_details=request.engagement_details,
            score=assessment_result.score,
            triage=assessment_result.triage,
            explanation=assessment_result.explanation
        )
        return AssessmentResponse(
            assessment=assessment_result,
            assessment_id=assessment_id,
            similar_assessment=similar_assessment
        )
    except Exception as e:
        logger.error(f"An error occurred during assessment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during assessment.")

@app.post("/override")
def override_endpoint(request: OverrideRequest):
    """
    Receives a human override and stores it for in-session learning and database update.
    """
    try:
        # For in-session learning
        vector_store.add_override(request)
        
        # Update the database record
        update_assessment_with_override(
            assessment_id=request.assessment_id,
            human_override_score=request.human_override.score,
            human_override_triage=request.human_override.triage,
            human_override_explanation=request.human_override.explanation,
            human_override_reason=request.human_override.reason
        )
        return {"message": "Override received and stored successfully."}
    except Exception as e:
        logger.error(f"An error occurred while storing the override: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while storing the override.")

@app.get("/assessments", response_model=List[AssessmentRecord])
def get_assessments_endpoint():
    """
    Returns all historical assessments.
    """
    try:
        assessments = get_all_assessments()
        return assessments
    except Exception as e:
        logger.error(f"An error occurred while fetching assessments: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while fetching assessments.")

@app.get("/overrides", response_model=List[OverrideRequest])
def get_overrides_endpoint():
    """
    Returns all override records.
    """
    try:
        overrides = get_all_overrides()
        return overrides
    except Exception as e:
        logger.error(f"An error occurred while fetching overrides: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while fetching overrides.")

@app.put("/overrides/{override_id}")
def update_override_endpoint(override_id: str, request: UpdateOverrideRequest):
    """
    Updates a specific override record.
    """
    try:
        update_override(override_id, request.dict())
        return {"message": f"Override {override_id} updated successfully."}
    except Exception as e:
        logger.error(f"An error occurred while updating override {override_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal error occurred while updating override {override_id}.")

@app.delete("/overrides/{override_id}")
def delete_override_endpoint(override_id: str):
    """
    Deletes a specific override record.
    """
    try:
        delete_override(override_id)
        return {"message": f"Override {override_id} deleted successfully."}
    except Exception as e:
        logger.error(f"An error occurred while deleting override {override_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal error occurred while deleting override {override_id}.")
