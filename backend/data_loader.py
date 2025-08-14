import requests
from bs4 import BeautifulSoup
import logging
from typing import List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_and_process_guidelines(url: str) -> List[str]:
    """Fetches content from a URL, extracts text, and chunks it."""
    try:
        # Using verify=False to bypass SSL verification issues, similar to the reference program.
        # In a production environment, it's better to handle SSL properly.
        response = requests.get(url, verify=False)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        main_content = soup.find(id='wrapper') or soup.find('article') or soup.find('body')
        if not main_content:
            logger.error(f"Could not find main content on the page: {url}")
            return []

        text_elements = main_content.find_all(['p', 'li', 'h2', 'h3', 'h4'])
        raw_text_chunks = [
            element.get_text(separator=" ", strip=True)
            for element in text_elements
            if element.get_text(separator=" ", strip=True)
        ]

        # Simple chunking strategy based on the reference implementation
        chunks = []
        current_chunk = ""
        min_chunk_length = 100

        for segment in raw_text_chunks:
            if len(current_chunk) + len(segment) < min_chunk_length * 2:
                current_chunk += " " + segment
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = segment
        if current_chunk:
            chunks.append(current_chunk.strip())

        # Filter out very short or non-alphabetic chunks
        filtered_chunks = [chunk for chunk in chunks if len(chunk) > 50 and any(char.isalpha() for char in chunk)]
        
        logger.info(f"Successfully processed and chunked content from {url}")
        return filtered_chunks

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching HMRC guidelines from {url}: {e}")
        return []
    except Exception as e:
        logger.error(f"An error occurred during content processing for {url}: {e}")
        return []

def load_all_guidelines(urls: List[str]) -> List[str]:
    """Loads and processes content from a list of URLs."""
    all_chunks = []
    logger.info("Starting to fetch all HMRC guidelines...")
    for url in urls:
        chunks = fetch_and_process_guidelines(url)
        all_chunks.extend(chunks)
    logger.info(f"Finished fetching guidelines. Total chunks: {len(all_chunks)}")
    return all_chunks
