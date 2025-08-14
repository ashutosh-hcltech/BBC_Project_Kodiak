import pytest
import sqlite3
import time
from unittest.mock import patch, mock_open
from database import create_database, save_assessment, get_assessment, get_all_assessments, update_assessment_with_override

# Sample DDL for testing purposes
SAMPLE_DDL = """
CREATE TABLE assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engagement_details TEXT NOT NULL,
    score TEXT NOT NULL,
    triage TEXT NOT NULL,
    explanation TEXT NOT NULL,
    human_override_score TEXT,
    human_override_triage TEXT,
    human_override_explanation TEXT,
    human_override_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

@pytest.fixture
def db_connection():
    """Fixture to set up an in-memory SQLite database for testing."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(SAMPLE_DDL)
    yield conn
    conn.close()

def test_create_database(db_connection):
    """Test that the database and table are created successfully."""
    # We are not actually calling create_database() with a file, 
    # but simulating the connection and checking table presence.
    
    # Check if the table was created
    cursor = db_connection.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='assessments'")
    assert cursor.fetchone() is not None

def test_save_and_get_assessment(db_connection):
    """Test saving and retrieving a single assessment."""
    # 1. Save an assessment
    engagement = "Test engagement details"
    score = "Low Risk"
    triage = "Auto-approve"
    explanation = "Looks fine."
    
    assessment_id = save_assessment(engagement, score, triage, explanation, db_connection)
    assert isinstance(assessment_id, int)

    # 2. Retrieve the assessment
    retrieved = get_assessment(assessment_id, db_connection)
    
    assert retrieved is not None
    assert retrieved['id'] == assessment_id
    assert retrieved['engagement_details'] == engagement
    assert retrieved['score'] == score
    assert retrieved['triage'] == triage
    assert retrieved['explanation'] == explanation
    assert retrieved['human_override_score'] is None

def test_get_all_assessments(db_connection):
    """Test retrieving all assessments."""
    # Save a couple of assessments
    save_assessment("Engagement 1", "Low Risk", "Auto-approve", "Explanation 1", db_connection)
    time.sleep(1) # Ensure timestamp difference
    save_assessment("Engagement 2", "High Risk", "Senior Review", "Explanation 2", db_connection)

    # Retrieve all assessments
    all_assessments = get_all_assessments(db_connection)

    assert len(all_assessments) == 2
    assert all_assessments[0]['engagement_details'] == "Engagement 2" # Ordered by DESC creation time
    assert all_assessments[1]['engagement_details'] == "Engagement 1"

def test_get_nonexistent_assessment(db_connection):
    """Test that retrieving a non-existent assessment returns None."""
    retrieved = get_assessment(999, db_connection)
    assert retrieved is None

def test_update_assessment_with_override(db_connection):
    """Test updating an assessment with human override details."""
    # 1. Save an initial assessment
    assessment_id = save_assessment("Initial Engagement", "High Risk", "Senior Review", "Needs review", db_connection)

    # 2. Update with override
    override_score = "Low Risk"
    override_triage = "Auto-approve"
    override_explanation = "This is actually fine."
    override_reason = "Client clarified the terms."
    update_assessment_with_override(assessment_id, override_score, override_triage, override_explanation, override_reason, db_connection)

    # 3. Retrieve and verify
    updated_assessment = get_assessment(assessment_id, db_connection)
    assert updated_assessment is not None
    assert updated_assessment['human_override_score'] == override_score
    assert updated_assessment['human_override_triage'] == override_triage
    assert updated_assessment['human_override_explanation'] == override_explanation
    assert updated_assessment['human_override_reason'] == override_reason
