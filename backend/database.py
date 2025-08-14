import sqlite3
import logging
from typing import List, Optional, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = "sqlite:///./assessments.db"
DB_FILE = "assessments.db"
DDL_SCRIPT = "database_setup.sql"

def get_db_connection(db_file: str = DB_FILE):
    """Creates and returns a database connection."""
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    return conn

def create_database():
    """Creates the database and table from the DDL script."""
    try:
        with open(DDL_SCRIPT, 'r') as f:
            ddl_script = f.read()
        
        with get_db_connection() as conn:
            conn.executescript(ddl_script)
            logger.info("Database and table created successfully.")
    except FileNotFoundError:
        logger.error(f"DDL script '{DDL_SCRIPT}' not found.")
        raise
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        raise

def save_assessment(engagement_details: str, score: str, triage: str, explanation: str, db_connection=None) -> int:
    """Saves an AI assessment to the database."""
    conn = db_connection if db_connection else get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO assessments (engagement_details, score, triage, explanation)
                VALUES (?, ?, ?, ?)
                """,
                (engagement_details, score, triage, explanation)
            )
            conn.commit()
            logger.info(f"Saved assessment for engagement: {engagement_details[:50]}...")
            if cursor.lastrowid is None:
                logger.error("Failed to retrieve lastrowid after insert.")
                raise ValueError("Failed to retrieve lastrowid after insert.")
            return cursor.lastrowid
    except sqlite3.Error as e:
        logger.error(f"Failed to save assessment: {e}")
        raise

def get_assessment(assessment_id: int, db_connection=None) -> Optional[Dict[str, Any]]:
    """Retrieves a specific assessment by its ID."""
    conn = db_connection if db_connection else get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    except sqlite3.Error as e:
        logger.error(f"Failed to retrieve assessment {assessment_id}: {e}")
        raise

def get_all_assessments(db_connection=None) -> List[Dict[str, Any]]:
    """Retrieves all assessments from the database."""
    conn = db_connection if db_connection else get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM assessments ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    except sqlite3.Error as e:
        logger.error(f"Failed to retrieve all assessments: {e}")
        raise

def update_assessment_with_override(assessment_id: int, human_override_score: str, human_override_triage: str, human_override_explanation: str, human_override_reason: str, db_connection=None):
    """Updates an assessment with human override details."""
    conn = db_connection if db_connection else get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE assessments
                SET human_override_score = ?,
                    human_override_triage = ?,
                    human_override_explanation = ?,
                    human_override_reason = ?
                WHERE id = ?
                """,
                (human_override_score, human_override_triage, human_override_explanation, human_override_reason, assessment_id)
            )
            conn.commit()
            logger.info(f"Updated assessment {assessment_id} with human override.")
    except sqlite3.Error as e:
        logger.error(f"Failed to update assessment {assessment_id} with override: {e}")
        raise
