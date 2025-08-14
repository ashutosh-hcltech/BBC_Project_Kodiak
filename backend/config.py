# Configuration for the HMRC Assessment Backend

HMRC_GUIDANCE_URL = "https://www.gov.uk/guidance/"

HMRC_URL_PATHS = [
    "understanding-off-payroll-working-ir35",
    "employment-status-employment-intermediaries",
    "check-employment-status-for-tax",
    "off-payroll-working-for-clients",
    "off-payroll-working-for-intermediaries-and-contractors-providing-services-to-small-clients-in-the-private-sector",
    "off-payroll-working-for-intermediaries-and-contractors-providing-services-to-the-public-sector-or-medium-and-large-clients-in-the-private-sector",
    "off-payroll-working-for-agencies",
    "fee-payer-responsibilities-under-the-off-payroll-working-rules"
]

FULL_HMRC_URLS = [HMRC_GUIDANCE_URL + path for path in HMRC_URL_PATHS]

# Embedding Model
EMBEDDING_MODEL_NAME = 'all-MiniLM-L6-v2'

# ChromaDB
CHROMA_DB_PATH = "./chroma_db"
HMRC_COLLECTION_NAME = "hmrc_guidelines"
OVERRIDE_COLLECTION_NAME = "overridden_engagements"

# Bedrock
BEDROCK_MODEL_ID = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
BEDROCK_AWS_REGION = 'us-east-1'
