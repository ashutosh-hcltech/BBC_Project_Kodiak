import os
import logging
from langchain_aws import ChatBedrock
from dotenv import load_dotenv

from config import BEDROCK_MODEL_ID, BEDROCK_AWS_REGION
from vector_store import vector_store
from schemas import AssessmentRequest, AssessmentResult

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_bedrock_llm():
    """Initializes and returns the Bedrock LLM client."""
    try:
        # The credentials_profile_name can be set via an environment variable
        # or you can rely on the default AWS credential chain.
        # For this project, we assume credentials are set in the environment
        # (e.g., AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN).
        llm = ChatBedrock(
            model_id=BEDROCK_MODEL_ID,
            region_name=BEDROCK_AWS_REGION,
            credentials_profile_name="381492050009_LZ-Account-Users-AWS",
            model_kwargs={"temperature": 0.1},
        )
        logger.info("Bedrock client initialized successfully.")
        return llm
    except Exception as e:
        logger.error(f"Error initializing Bedrock client: {e}")
        # This could be due to missing credentials or permissions.
        # Ensure AWS credentials are configured correctly in your environment.
        raise

llm = get_bedrock_llm()

def parse_assessment_response(response_content: str) -> AssessmentResult:
    """Parses the raw text response from the LLM into a structured format."""
    try:
        score_line = next((line for line in response_content.split('\n') if line.startswith('**Assessment Score:**')), None)
        triage_line = next((line for line in response_content.split('\n') if line.startswith('**Triage Recommendation:**')), None)
        explanation_start = response_content.find('**Explanation:**')

        score = score_line.replace('**Assessment Score:**', '').strip() if score_line else "N/A"
        triage = triage_line.replace('**Triage Recommendation:**', '').strip() if triage_line else "N/A"
        explanation = response_content[explanation_start:].strip() if explanation_start != -1 else "No detailed explanation provided."

        return AssessmentResult(score=score, triage=triage, explanation=explanation)
    except Exception as e:
        logger.error(f"Error parsing LLM response: {e}\nRaw response: {response_content}")
        return AssessmentResult(score="Error", triage="Error", explanation=f"Failed to parse LLM response: {response_content}")


async def assess_engagement(request: AssessmentRequest) -> (AssessmentResult, dict | None):
    """
    Assesses engagement details against HMRC guidelines, using the vector store and Bedrock LLM.
    If a similar overridden case is found, it returns that result directly.
    Otherwise, it performs a new AI assessment.
    """
    engagement_details = request.engagement_details
    logger.info("Starting engagement assessment..." + engagement_details)

    # 1. Check for similar overridden engagements first
    similar_override, distance = vector_store.find_similar_override(engagement_details)
    
    if similar_override:
        logger.info("Similar override found. Skipping new AI assessment and returning stored result.")
        
        human_override_details = similar_override['human_override']
        
        # Create an AssessmentResult object from the stored human override data.
        assessment_result = AssessmentResult(
            score=human_override_details['score'],
            triage=human_override_details.get('triage') or "N/A", # Use .get for safety
            explanation=(
                f"This assessment is based on a previous human override for a similar case (L2 Distance: {distance:.2f}).\n\n"
                f"**Original Engagement:**\n> {similar_override['original_engagement_details']}\n\n"
                f"**Human Override Reason:**\n> {human_override_details['reason']}"
            )
        )
        
        # Return the result from the override and the override object itself
        return assessment_result, similar_override

    # If no similar override is found, proceed with a new AI assessment.
    logger.info("No similar override found. Proceeding with new AI assessment.")
    
    # 2. Retrieve relevant HMRC guidelines
    relevant_guidelines = vector_store.find_similar_guidelines(engagement_details, n_results=5)
    guidelines_text = "\n---\n".join(relevant_guidelines)
    logger.info(f"Retrieved {len(relevant_guidelines)} relevant guideline chunks.")

    # 3. Construct prompt for Bedrock
    system_message = (
        "You are an AI assistant specialized in HMRC IR35 (off-payroll working) rules. "
        "Your task is to assess a contingent worker engagement description based on provided HMRC guidelines."
    )

    user_message = f"""
    Here are the relevant HMRC guideline excerpts:
    ---
    {guidelines_text}
    ---

    Here are the current contingent worker engagement details:
    ---
    {engagement_details}
    ---

    Based on the HMRC guidelines, please provide:
    1.  **Risk-based Assessment Score**: "Low Risk", "Medium Risk", or "High Risk" for IR35 non-compliance.
    2.  **Triage Recommendation**: "Auto-approve", "Junior Review", or "Senior Review".
    3.  **Detailed Explanation**: Justify your score and recommendation by referencing specific aspects of the current engagement and the HMRC guidelines.

    Format your response as follows (in Markdown):
    **Assessment Score:** [Score]
    **Triage Recommendation:** [Recommendation]
    **Explanation:** [Detailed explanation]
    """

    prompt = [("system", system_message), ("user", user_message)]

    # 4. Call Bedrock API
    logger.info("Invoking Bedrock model...")
    response = llm.invoke(prompt)
    assessment_content = response.content
    logger.info("Received response from Bedrock.")

    # 5. Parse the response
    assessment_result = parse_assessment_response(assessment_content)
    
    # Return the new assessment and no similar case
    return assessment_result, None
