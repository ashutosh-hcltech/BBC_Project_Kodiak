from sentence_transformers import SentenceTransformer
import chromadb
import logging
import json
import uuid
from typing import List, Tuple

from config import EMBEDDING_MODEL_NAME, CHROMA_DB_PATH, HMRC_COLLECTION_NAME, OVERRIDE_COLLECTION_NAME
from schemas import OverrideRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.model = self._load_embedding_model()
        self.client = self._get_chroma_client()
        self.hmrc_collection = self._get_or_create_collection(HMRC_COLLECTION_NAME)
        self.override_collection = self._get_or_create_collection(OVERRIDE_COLLECTION_NAME)

    def _load_embedding_model(self):
        try:
            logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
            model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            logger.info("Embedding model loaded successfully.")
            return model
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise

    def _get_chroma_client(self):
        try:
            logger.info(f"Initializing ChromaDB client with persistent storage at: {CHROMA_DB_PATH}")
            client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
            logger.info("ChromaDB client initialized successfully.")
            return client
        except Exception as e:
            logger.error(f"Error initializing ChromaDB client: {e}")
            raise

    def _get_or_create_collection(self, name: str):
        try:
            logger.info(f"Getting or creating ChromaDB collection: {name}")
            collection = self.client.get_or_create_collection(name=name)
            logger.info(f"Collection '{name}' ready. Current count: {collection.count()}")
            return collection
        except Exception as e:
            logger.error(f"Error getting or creating collection '{name}': {e}")
            raise

    def populate_hmrc_guidelines(self, hmrc_chunks: List[str]):
        if not hmrc_chunks:
            logger.warning("HMRC guideline chunks are empty. Skipping population.")
            return

        if self.hmrc_collection.count() > 0:
            logger.info("HMRC guidelines collection is already populated. Skipping.")
            return

        try:
            logger.info(f"Populating HMRC guidelines collection with {len(hmrc_chunks)} chunks...")
            embeddings = self.model.encode(hmrc_chunks, show_progress_bar=True)
            ids = [f"hmrc_{i}" for i in range(len(hmrc_chunks))]
            
            self.hmrc_collection.add(
                embeddings=embeddings.tolist(),
                documents=hmrc_chunks,
                ids=ids
            )
            logger.info(f"HMRC collection populated successfully. Total items: {self.hmrc_collection.count()}")
        except Exception as e:
            logger.error(f"Failed to populate HMRC guidelines collection: {e}")
            raise

    def add_override(self, override_data: OverrideRequest):
        try:
            engagement_text = override_data.original_engagement_details
            logger.info("Adding new override to vector store...")
            
            embedding = self.model.encode([engagement_text]).tolist()[0]
            
            # Generate a truly unique ID
            new_id = f"override_{uuid.uuid4()}"

            # Serialize the full override object to store in metadata
            metadata = {"override_details": override_data.json()}

            self.override_collection.add(
                embeddings=[embedding],
                documents=[engagement_text],
                ids=[new_id],
                metadatas=[metadata]
            )
            
            logger.info(f"Successfully added override with ID: {new_id}")
        except Exception as e:
            logger.error(f"Failed to add override to vector store: {e}")
            raise

    def find_similar_guidelines(self, text: str, n_results: int = 5) -> List[str]:
        embedding = self.model.encode([text]).tolist()[0]
        results = self.hmrc_collection.query(
            query_embeddings=[embedding],
            n_results=n_results
        )
        return results['documents'][0] if results['documents'] else []

    def find_similar_override(self, text: str, threshold: float = 0.5) -> Tuple[dict, float] | Tuple[None, None]:
        
        if self.override_collection.count() == 0:
            logger.info("Override collection is empty. No similar cases to find.")
            return None, None

        embedding = self.model.encode([text]).tolist()[0]
        results = self.override_collection.query(
            query_embeddings=[embedding],
            n_results=1,
            include=["metadatas", "distances"] 
        )
        
        logger.info(f"ChromaDB query results for similarity: {results}")

        if results['distances'] and results['distances'][0] and results['distances'][0][0] < threshold:
            distance = results['distances'][0][0]
            metadata = results['metadatas'][0][0]
            
            if metadata and "override_details" in metadata:
                # Deserialize the JSON string from metadata back into a Python dict
                similar_override_data = json.loads(metadata["override_details"])
                logger.info(f"Found similar override at distance {distance:.2f}")
                return similar_override_data, distance
            else:
                logger.warning("Found a similar case, but its metadata was missing the 'override_details' key.")
        
        return None, None

# Singleton instance
vector_store = VectorStore()

def get_all_overrides() -> List[dict]:
    """Retrieves all override records from the vector store."""
    logger.info("Fetching all override records...")
    results = vector_store.override_collection.get(include=["metadatas"])
    
    all_overrides = []
    for i, metadata in enumerate(results.get('metadatas', [])):
        if metadata and 'override_details' in metadata:
            override_data = json.loads(metadata['override_details'])
            # Add the ChromaDB ID to the record
            override_data['chroma_id'] = results['ids'][i]
            all_overrides.append(override_data)
            
    logger.info(f"Found {len(all_overrides)} override records.")
    return all_overrides

def update_override(override_id: str, override_data: dict):
    """Updates a specific override record in the vector store."""
    logger.info(f"Updating override record with ID: {override_id}")
    
    # We need to update the document and its metadata.
    # ChromaDB's update/upsert works on IDs.
    engagement_text = override_data.get('original_engagement_details')
    if not engagement_text:
        raise ValueError("original_engagement_details is required to update an override.")

    embedding = vector_store.model.encode([engagement_text]).tolist()[0]
    metadata = {"override_details": json.dumps(override_data)}

    vector_store.override_collection.update(
        ids=[override_id],
        embeddings=[embedding],
        documents=[engagement_text],
        metadatas=[metadata]
    )
    logger.info(f"Successfully updated override: {override_id}")

def delete_override(override_id: str):
    """Deletes a specific override record from the vector store."""
    logger.info(f"Deleting override record with ID: {override_id}")
    vector_store.override_collection.delete(ids=[override_id])
    logger.info(f"Successfully deleted override: {override_id}")
